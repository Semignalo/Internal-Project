import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) { }

  async create(createTaskDto: CreateTaskDto) {
    const { assigneeIds, ...data } = createTaskDto;
    const task = await this.prisma.task.create({
      data: {
        ...(data as any),
        assignees: assigneeIds ? {
          create: assigneeIds.map(userId => ({ userId }))
        } : undefined
      },
      include: { assignees: { include: { user: true } }, attachments: true }
    });
    await this.recalculateProgress(task.divisionId);
    return task;
  }

  findAll() {
    return this.prisma.task.findMany({
      include: {
        division: { include: { project: true } },
        assignees: { include: { user: true } },
        subtasks: true,
        attachments: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        division: { include: { project: true } },
        assignees: { include: { user: true } },
        subtasks: true,
        attachments: true
      },
    });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const { assigneeIds, ...data } = updateTaskDto as any;

    if (assigneeIds !== undefined) {
      await this.prisma.taskAssignee.deleteMany({
        where: { taskId: id }
      });
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        ...data,
        ...(assigneeIds !== undefined ? {
          assignees: {
            create: assigneeIds.map((userId: string) => ({ userId }))
          }
        } : {})
      },
      include: {
        division: { include: { project: true } },
        assignees: { include: { user: true } },
        subtasks: true,
        attachments: true
      }
    });
    await this.recalculateProgress(task.divisionId);
    return task;
  }

  async remove(id: string) {
    const task = await this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.recalculateProgress(task.divisionId);
    return task;
  }

  createSubtask(taskId: string, title: string) {
    return this.prisma.subtask.create({
      data: {
        title,
        taskId
      }
    });
  }

  toggleSubtask(subtaskId: string, isDone: boolean) {
    return this.prisma.subtask.update({
      where: { id: subtaskId },
      data: { isDone }
    });
  }

  removeSubtask(subtaskId: string) {
    return this.prisma.subtask.delete({
      where: { id: subtaskId }
    });
  }

  async recalculateProgress(divisionId: string) {
    // 1. Hitung total Task di Divisi (yang tidak dihapus)
    const tasks = await this.prisma.task.findMany({
      where: { divisionId, deletedAt: null }
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;

    // Progres divisi adalah 0 sampai 100
    const divisionProgress = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

    // 2. Update overallProgress Divisi
    const division = await this.prisma.division.update({
      where: { id: divisionId },
      data: { overallProgress: divisionProgress }
    });

    // 3. Kalkulasi ulang overallProgress Project (dengan bobot divisi)
    const projectId = division.projectId;
    const allDivisions = await this.prisma.division.findMany({
      where: { projectId, deletedAt: null }
    });

    const totalWeight = allDivisions.reduce((sum, div) => sum + div.progressWeight, 0);
    const normalizedProjectProgress = totalWeight === 0 ? 0 :
      allDivisions.reduce((sum, div) => sum + (div.overallProgress * div.progressWeight), 0) / totalWeight;

    // 4. Update overallProgress Project
    await this.prisma.project.update({
      where: { id: projectId },
      data: { overallProgress: normalizedProjectProgress }
    });
  }

  async uploadAttachments(taskId: string, files: any[]) {
    const attachments = await Promise.all(
      files.map((file) =>
        this.prisma.attachment.create({
          data: {
            taskId,
            fileName: file.originalname,
            fileUrl: `/uploads/${file.filename}`,
            fileSize: file.size,
            mimeType: file.mimetype,
          },
        }),
      ),
    );
    return attachments;
  }

  async removeAttachment(attachmentId: string) {
    return this.prisma.attachment.delete({
      where: { id: attachmentId },
    });
  }
}
