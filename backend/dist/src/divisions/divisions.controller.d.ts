import { DivisionsService } from './divisions.service';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';
export declare class DivisionsController {
    private readonly divisionsService;
    constructor(divisionsService: DivisionsService);
    create(createDivisionDto: CreateDivisionDto): import("@prisma/client").Prisma.Prisma__DivisionClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        overallProgress: number;
        progressWeight: number;
        projectId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
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
        tasks: {
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
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        overallProgress: number;
        progressWeight: number;
        projectId: string;
    })[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__DivisionClient<({
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
        tasks: {
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
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        overallProgress: number;
        progressWeight: number;
        projectId: string;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateDivisionDto: UpdateDivisionDto): import("@prisma/client").Prisma.Prisma__DivisionClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        overallProgress: number;
        progressWeight: number;
        projectId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__DivisionClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        overallProgress: number;
        progressWeight: number;
        projectId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
