import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getDashboard(): Promise<{
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
