import { PrismaService } from './prisma/prisma.service';
export declare class AppService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardData(): Promise<{
        metrics: {
            activeProjects: number;
            pendingTasks: number;
            revisions: number;
            velocity: number;
        };
        activeProjects: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            clientName: string;
            projectType: string;
            startDate: Date;
            deadline: Date;
            status: string;
            overallProgress: number;
            managerId: string;
        }[];
        teamWorkload: {
            name: string;
            level: string;
            tasks: number;
        }[];
    }>;
}
