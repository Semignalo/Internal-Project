"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TasksService = class TasksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTaskDto) {
        const { assigneeIds, ...data } = createTaskDto;
        const task = await this.prisma.task.create({
            data: {
                ...data,
                assignees: assigneeIds ? {
                    create: assigneeIds.map(userId => ({ userId }))
                } : undefined
            },
            include: { assignees: { include: { user: true } } }
        });
        await this.recalculateProgress(task.divisionId);
        return task;
    }
    findAll() {
        return this.prisma.task.findMany({
            include: {
                division: { include: { project: true } },
                assignees: { include: { user: true } },
                subtasks: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    findOne(id) {
        return this.prisma.task.findUnique({
            where: { id },
            include: {
                division: { include: { project: true } },
                assignees: { include: { user: true } },
                subtasks: true
            },
        });
    }
    async update(id, updateTaskDto) {
        const { assigneeIds, ...data } = updateTaskDto;
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
                        create: assigneeIds.map((userId) => ({ userId }))
                    }
                } : {})
            },
            include: {
                division: { include: { project: true } },
                assignees: { include: { user: true } },
                subtasks: true
            }
        });
        await this.recalculateProgress(task.divisionId);
        return task;
    }
    async remove(id) {
        const task = await this.prisma.task.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        await this.recalculateProgress(task.divisionId);
        return task;
    }
    createSubtask(taskId, title) {
        return this.prisma.subtask.create({
            data: {
                title,
                taskId
            }
        });
    }
    toggleSubtask(subtaskId, isDone) {
        return this.prisma.subtask.update({
            where: { id: subtaskId },
            data: { isDone }
        });
    }
    removeSubtask(subtaskId) {
        return this.prisma.subtask.delete({
            where: { id: subtaskId }
        });
    }
    async recalculateProgress(divisionId) {
        const tasks = await this.prisma.task.findMany({
            where: { divisionId, deletedAt: null }
        });
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
        const divisionProgress = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
        const division = await this.prisma.division.update({
            where: { id: divisionId },
            data: { overallProgress: divisionProgress }
        });
        const projectId = division.projectId;
        const allDivisions = await this.prisma.division.findMany({
            where: { projectId, deletedAt: null }
        });
        const totalWeight = allDivisions.reduce((sum, div) => sum + div.progressWeight, 0);
        const normalizedProjectProgress = totalWeight === 0 ? 0 :
            allDivisions.reduce((sum, div) => sum + (div.overallProgress * div.progressWeight), 0) / totalWeight;
        await this.prisma.project.update({
            where: { id: projectId },
            data: { overallProgress: normalizedProjectProgress }
        });
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map