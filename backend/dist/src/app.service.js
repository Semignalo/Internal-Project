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
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma/prisma.service");
let AppService = class AppService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
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
                velocity: 94,
            },
            activeProjects,
            teamWorkload: teamWorkload.map(u => ({
                name: u.name,
                level: u.workloadLevel,
                tasks: u._count.taskAssignments
            })),
        };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppService);
//# sourceMappingURL=app.service.js.map