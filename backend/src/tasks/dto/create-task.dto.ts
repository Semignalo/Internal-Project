import { IsString, IsNotEmpty, IsUUID, IsOptional, IsDateString, IsEnum } from 'class-validator';

enum Priority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
}

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(Priority)
    @IsOptional()
    priority?: Priority;

    @IsDateString()
    @IsOptional()
    deadline?: string;

    @IsString()
    @IsOptional()
    status?: string;

    @IsUUID()
    divisionId: string;

    @IsUUID()
    @IsOptional()
    dependencyId?: string;

    @IsOptional()
    assigneeIds?: string[];
}
