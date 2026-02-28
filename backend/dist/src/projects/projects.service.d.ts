import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class ProjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createProjectDto: CreateProjectDto): import("@prisma/client").Prisma.Prisma__ProjectClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        manager: {
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
        divisions: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            overallProgress: number;
            progressWeight: number;
            projectId: string;
        }[];
    } & {
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
    })[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__ProjectClient<({
        manager: {
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
        divisions: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            overallProgress: number;
            progressWeight: number;
            projectId: string;
        }[];
    } & {
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
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateProjectDto: UpdateProjectDto): import("@prisma/client").Prisma.Prisma__ProjectClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__ProjectClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
