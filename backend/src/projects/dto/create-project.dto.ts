import { IsString, IsNotEmpty, IsDateString, IsUUID, IsOptional } from 'class-validator';

export class CreateProjectDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    clientName: string;

    @IsString()
    @IsNotEmpty()
    projectType: string;

    @IsDateString()
    startDate: string;

    @IsDateString()
    deadline: string;

    @IsString()
    @IsOptional()
    status?: string;

    @IsUUID()
    managerId: string;
}
