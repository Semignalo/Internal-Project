import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(createTaskDto: CreateTaskDto): Promise<{
        assignees: ({
            user: {
                id: string;
                name: string;
                email: string;
                password: string;
                role: string;
                workloadLevel: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
            };
        } & {
            userId: string;
            taskId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deadline: Date | null;
        status: string;
        title: string;
        description: string | null;
        priority: string;
        revisionCount: number;
        approvalState: boolean;
        divisionId: string;
        dependencyId: string | null;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        division: {
            project: {
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
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            overallProgress: number;
            progressWeight: number;
            projectId: string;
        };
        assignees: ({
            user: {
                id: string;
                name: string;
                email: string;
                password: string;
                role: string;
                workloadLevel: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
            };
        } & {
            userId: string;
            taskId: string;
        })[];
        subtasks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            taskId: string;
            isDone: boolean;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deadline: Date | null;
        status: string;
        title: string;
        description: string | null;
        priority: string;
        revisionCount: number;
        approvalState: boolean;
        divisionId: string;
        dependencyId: string | null;
    })[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__TaskClient<({
        division: {
            project: {
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
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            overallProgress: number;
            progressWeight: number;
            projectId: string;
        };
        assignees: ({
            user: {
                id: string;
                name: string;
                email: string;
                password: string;
                role: string;
                workloadLevel: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
            };
        } & {
            userId: string;
            taskId: string;
        })[];
        subtasks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            taskId: string;
            isDone: boolean;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deadline: Date | null;
        status: string;
        title: string;
        description: string | null;
        priority: string;
        revisionCount: number;
        approvalState: boolean;
        divisionId: string;
        dependencyId: string | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateTaskDto: UpdateTaskDto): Promise<{
        division: {
            project: {
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
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            overallProgress: number;
            progressWeight: number;
            projectId: string;
        };
        assignees: ({
            user: {
                id: string;
                name: string;
                email: string;
                password: string;
                role: string;
                workloadLevel: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
            };
        } & {
            userId: string;
            taskId: string;
        })[];
        subtasks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            taskId: string;
            isDone: boolean;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deadline: Date | null;
        status: string;
        title: string;
        description: string | null;
        priority: string;
        revisionCount: number;
        approvalState: boolean;
        divisionId: string;
        dependencyId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deadline: Date | null;
        status: string;
        title: string;
        description: string | null;
        priority: string;
        revisionCount: number;
        approvalState: boolean;
        divisionId: string;
        dependencyId: string | null;
    }>;
    createSubtask(id: string, title: string): import("@prisma/client").Prisma.Prisma__SubtaskClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        taskId: string;
        isDone: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    toggleSubtask(subtaskId: string, isDone: boolean): import("@prisma/client").Prisma.Prisma__SubtaskClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        taskId: string;
        isDone: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    removeSubtask(subtaskId: string): import("@prisma/client").Prisma.Prisma__SubtaskClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        taskId: string;
        isDone: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
