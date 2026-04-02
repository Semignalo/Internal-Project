import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) { }

  async getDashboardData() {
    const now = new Date();
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay());
    startOfThisWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    // --- Metrics ---
    const activeProjectsCount = await this.prisma.project.count({
      where: { status: { not: 'DONE' }, deletedAt: null },
    });

    const activeProjectsLastWeekCount = await this.prisma.project.count({
      where: {
        status: { not: 'DONE' },
        deletedAt: null,
        createdAt: { lt: startOfThisWeek }
      },
    });

    const pendingTasksCount = await this.prisma.task.count({
      where: { status: { in: ['INTERNAL_REVIEW', 'CLIENT_REVIEW'] }, deletedAt: null },
    });

    const pendingTasksLastWeekCount = await this.prisma.task.count({
      where: {
        status: { in: ['INTERNAL_REVIEW', 'CLIENT_REVIEW'] },
        deletedAt: null,
        createdAt: { lt: startOfThisWeek }
      },
    });

    const revisionsCount = await this.prisma.task.count({
      where: { status: 'REVISION', deletedAt: null },
    });

    const revisionsLastWeekCount = await this.prisma.task.count({
      where: {
        status: 'REVISION',
        deletedAt: null,
        createdAt: { lt: startOfThisWeek }
      },
    });

    // Velocity = % of non-deleted tasks yang sudah COMPLETED atau APPROVED atau DONE
    const totalTasks = await this.prisma.task.count({ where: { deletedAt: null } });
    const completedTasks = await this.prisma.task.count({
      where: { status: { in: ['COMPLETED', 'APPROVED', 'DONE'] }, deletedAt: null },
    });
    const velocity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Velocity last month (tasks completed before start of this week)
    const totalTasksLastMonth = await this.prisma.task.count({
      where: { deletedAt: null, createdAt: { lt: startOfLastWeek } },
    });
    const completedLastMonth = await this.prisma.task.count({
      where: {
        status: { in: ['COMPLETED', 'APPROVED', 'DONE'] },
        deletedAt: null,
        createdAt: { lt: startOfLastWeek }
      },
    });
    const velocityLastMonth = totalTasksLastMonth > 0
      ? Math.round((completedLastMonth / totalTasksLastMonth) * 100)
      : 0;

    // --- Active Projects (with manager name) ---
    const activeProjects = await this.prisma.project.findMany({
      where: { status: { not: 'DONE' }, deletedAt: null },
      orderBy: { overallProgress: 'desc' },
      take: 5,
      include: { manager: { select: { name: true } } }
    });

    // --- Team Workload ---
    const teamWorkload = await this.prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        workloadLevel: true,
        _count: {
          select: {
            taskAssignments: {
              where: {
                task: { status: { notIn: ['COMPLETED', 'APPROVED', 'DONE'] }, deletedAt: null }
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' },
      take: 6,
    });

    // --- Upcoming Deadlines (next 7 days) ---
    const in7Days = new Date(now);
    in7Days.setDate(now.getDate() + 7);

    const upcomingDeadlines = await this.prisma.task.findMany({
      where: {
        deadline: { gte: now, lte: in7Days },
        status: { notIn: ['COMPLETED', 'APPROVED', 'DONE'] },
        deletedAt: null,
      },
      orderBy: { deadline: 'asc' },
      take: 5,
      select: {
        id: true,
        title: true,
        deadline: true,
        priority: true,
        status: true,
        assignees: { select: { user: { select: { name: true } } } },
        division: { select: { name: true, project: { select: { name: true } } } },
      }
    });

    // --- Overdue Tasks ---
    const overdueTasks = await this.prisma.task.findMany({
      where: {
        deadline: { lt: now },
        status: { notIn: ['COMPLETED', 'APPROVED', 'DONE'] },
        deletedAt: null,
      },
      orderBy: { deadline: 'asc' },
      take: 5,
      select: {
        id: true,
        title: true,
        deadline: true,
        priority: true,
        status: true,
        assignees: { select: { user: { select: { name: true } } } },
        division: { select: { name: true, project: { select: { name: true } } } },
      }
    });

    // --- Recent Activity ---
    const recentActivity = await this.prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        user: { select: { name: true } },
        project: { select: { name: true } },
      }
    });

    return {
      metrics: {
        activeProjects: activeProjectsCount,
        activeProjectsTrend: activeProjectsCount - activeProjectsLastWeekCount,
        pendingTasks: pendingTasksCount,
        pendingTasksTrend: pendingTasksCount - pendingTasksLastWeekCount,
        revisions: revisionsCount,
        revisionsTrend: revisionsCount - revisionsLastWeekCount,
        velocity,
        velocityTrend: velocity - velocityLastMonth,
      },
      activeProjects,
      teamWorkload: teamWorkload.map(u => ({
        id: u.id,
        name: u.name,
        level: u.workloadLevel,
        tasks: u._count.taskAssignments
      })),
      upcomingDeadlines,
      overdueTasks,
      recentActivity: recentActivity.map(a => ({
        id: a.id,
        action: a.action,
        resourceId: a.resourceId,
        userName: a.user.name,
        projectName: a.project?.name || null,
        createdAt: a.createdAt,
      })),
    };
  }

  async getNotifications(userId?: string) {
    const now = new Date();
    const in3Days = new Date(now);
    in3Days.setDate(now.getDate() + 3);

    const notifications: any[] = [];

    // 1. Tasks approaching deadline (≤ 3 days) assigned to user (or all if no userId)
    const whereDeadline: any = {
      deadline: { gte: now, lte: in3Days },
      status: { notIn: ['COMPLETED', 'APPROVED', 'DONE'] },
      deletedAt: null,
    };
    if (userId) {
      whereDeadline.assignees = { some: { userId } };
    }

    const urgentTasks = await this.prisma.task.findMany({
      where: whereDeadline,
      orderBy: { deadline: 'asc' },
      take: 5,
      select: {
        id: true,
        title: true,
        deadline: true,
        priority: true,
        division: { select: { project: { select: { name: true } } } },
      }
    });

    urgentTasks.forEach(t => {
      const daysLeft = Math.ceil((new Date(t.deadline!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      notifications.push({
        id: `deadline-${t.id}`,
        type: 'DEADLINE',
        title: 'Deadline Approaching',
        message: `"${t.title}" due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
        project: t.division?.project?.name || null,
        taskId: t.id,
        createdAt: t.deadline,
        priority: t.priority,
      });
    });

    // 2. Overdue tasks
    const whereOverdue: any = {
      deadline: { lt: now },
      status: { notIn: ['COMPLETED', 'APPROVED', 'DONE'] },
      deletedAt: null,
    };
    if (userId) {
      whereOverdue.assignees = { some: { userId } };
    }

    const overdueTasks = await this.prisma.task.findMany({
      where: whereOverdue,
      orderBy: { deadline: 'asc' },
      take: 5,
      select: {
        id: true,
        title: true,
        deadline: true,
        division: { select: { project: { select: { name: true } } } },
      }
    });

    overdueTasks.forEach(t => {
      const daysOver = Math.floor((now.getTime() - new Date(t.deadline!).getTime()) / (1000 * 60 * 60 * 24));
      notifications.push({
        id: `overdue-${t.id}`,
        type: 'OVERDUE',
        title: 'Task Overdue',
        message: `"${t.title}" overdue by ${daysOver} day${daysOver !== 1 ? 's' : ''}`,
        project: t.division?.project?.name || null,
        taskId: t.id,
        createdAt: t.deadline,
        priority: 'URGENT',
      });
    });

    // 3. Tasks pending review
    const pendingReview = await this.prisma.task.findMany({
      where: {
        status: { in: ['INTERNAL_REVIEW', 'CLIENT_REVIEW'] },
        deletedAt: null,
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
        division: { select: { project: { select: { name: true } } } },
      }
    });

    pendingReview.forEach(t => {
      notifications.push({
        id: `review-${t.id}`,
        type: 'REVIEW',
        title: 'Awaiting Review',
        message: `"${t.title}" is waiting for ${t.status === 'CLIENT_REVIEW' ? 'client' : 'internal'} review`,
        project: t.division?.project?.name || null,
        taskId: t.id,
        createdAt: t.updatedAt,
        priority: 'MEDIUM',
      });
    });

    // 4. Tasks with revision requested
    const revisionTasks = await this.prisma.task.findMany({
      where: {
        status: 'REVISION',
        deletedAt: null,
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        revisionCount: true,
        updatedAt: true,
        division: { select: { project: { select: { name: true } } } },
      }
    });

    revisionTasks.forEach(t => {
      notifications.push({
        id: `revision-${t.id}`,
        type: 'REVISION',
        title: 'Revision Requested',
        message: `"${t.title}" needs revision (×${t.revisionCount})`,
        project: t.division?.project?.name || null,
        taskId: t.id,
        createdAt: t.updatedAt,
        priority: 'HIGH',
      });
    });

    // Sort by severity then date
    const priorityOrder = { OVERDUE: 0, REVISION: 1, DEADLINE: 2, REVIEW: 3 };
    notifications.sort((a, b) =>
      (priorityOrder[a.type as keyof typeof priorityOrder] ?? 9) -
      (priorityOrder[b.type as keyof typeof priorityOrder] ?? 9)
    );

    return {
      count: notifications.length,
      notifications: notifications.slice(0, 20),
    };
  }

  async getTeamPerformanceReport(startDateStr: string, endDateStr: string) {
    const startDate = startDateStr ? new Date(startDateStr) : new Date(new Date().setDate(1)); // default: start of month
    const endDate = endDateStr ? new Date(endDateStr) : new Date();

    // include the whole end day
    endDate.setHours(23, 59, 59, 999);

    const now = new Date();

    // Fetch all active users
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true, role: true, workloadLevel: true },
    });

    const report = await Promise.all(users.map(async (user) => {
      // Tasks assigned to user created within date range
      const assignedTasks = await this.prisma.task.findMany({
        where: {
          deletedAt: null,
          createdAt: { gte: startDate, lte: endDate },
          assignees: { some: { userId: user.id } },
        },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          deadline: true,
          revisionCount: true,
          createdAt: true,
          updatedAt: true,
          division: { select: { name: true, project: { select: { name: true } } } },
        },
      });

      const totalAssigned = assignedTasks.length;
      const completedTasks = assignedTasks.filter(t =>
        ['COMPLETED', 'APPROVED', 'DONE'].includes(t.status)
      );
      const inProgressTasks = assignedTasks.filter(t =>
        ['TODO', 'IN_PROGRESS', 'PLANNING', 'REVISION', 'INTERNAL_REVIEW', 'CLIENT_REVIEW'].includes(t.status)
      );
      const overdueTasks = assignedTasks.filter(t =>
        t.deadline && new Date(t.deadline) < now &&
        !['COMPLETED', 'APPROVED', 'DONE'].includes(t.status)
      );

      const completionRate = totalAssigned > 0
        ? Math.round((completedTasks.length / totalAssigned) * 100)
        : 0;

      // Avg days to complete (from createdAt to updatedAt for completed tasks)
      let avgDaysToComplete: number | null = null;
      if (completedTasks.length > 0) {
        const totalDays = completedTasks.reduce((sum, t) => {
          const days = (new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0);
        avgDaysToComplete = Math.round(totalDays / completedTasks.length);
      }

      const totalRevisions = assignedTasks.reduce((sum, t) => sum + (t.revisionCount || 0), 0);

      // Unique projects involved
      const projectNames = [...new Set(
        assignedTasks
          .map(t => t.division?.project?.name)
          .filter(Boolean)
      )];

      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        workloadLevel: user.workloadLevel,
        totalAssigned,
        completed: completedTasks.length,
        inProgress: inProgressTasks.length,
        overdue: overdueTasks.length,
        completionRate,
        avgDaysToComplete,
        totalRevisions,
        projects: projectNames,
        tasks: assignedTasks.map(t => ({
          id: t.id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          deadline: t.deadline,
          revisionCount: t.revisionCount,
          project: t.division?.project?.name || null,
          division: t.division?.name || null,
        })),
      };
    }));

    // Team summary
    const totalTasksInPeriod = report.reduce((s, u) => s + u.totalAssigned, 0);
    const totalCompleted = report.reduce((s, u) => s + u.completed, 0);
    const totalOverdue = report.reduce((s, u) => s + u.overdue, 0);
    const teamCompletionRate = totalTasksInPeriod > 0
      ? Math.round((totalCompleted / totalTasksInPeriod) * 100)
      : 0;
    const topPerformer = report.reduce((best, u) =>
      u.completionRate > (best?.completionRate ?? -1) ? u : best, report[0] || null
    );

    return {
      dateRange: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
      summary: {
        totalMembers: users.length,
        totalTasksInPeriod,
        totalCompleted,
        totalOverdue,
        teamCompletionRate,
        topPerformer: topPerformer ? { name: topPerformer.name, completionRate: topPerformer.completionRate } : null,
      },
      members: report,
    };
  }
}
