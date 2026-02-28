import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) { }

  async getDashboardData() {
    const activeProjectsCount = await this.prisma.project.count({
      where: { status: { not: 'DONE' }, deletedAt: null },
    });

    const pendingTasksCount = await this.prisma.task.count({
      where: { status: { in: ['INTERNAL_REVIEW', 'CLIENT_REVIEW'] }, deletedAt: null },
    });

    const revisionsCount = await this.prisma.task.count({
      where: { status: 'REVISION', deletedAt: null },
    });

    const activeProjects = await this.prisma.project.findMany({
      where: { status: { not: 'DONE' }, deletedAt: null },
      orderBy: { overallProgress: 'desc' },
      take: 5,
    });

    const teamWorkload = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        workloadLevel: true,
        _count: {
          select: {
            taskAssignments: {
              where: {
                task: { status: { not: 'COMPLETED' }, deletedAt: null }
              }
            }
          }
        }
      },
      take: 4,
    });

    return {
      metrics: {
        activeProjects: activeProjectsCount,
        pendingTasks: pendingTasksCount,
        revisions: revisionsCount,
        velocity: 94, // Mocked for now
      },
      activeProjects,
      teamWorkload: teamWorkload.map(u => ({
        name: u.name,
        level: u.workloadLevel,
        tasks: u._count.taskAssignments
      })),
    };
  }
}
