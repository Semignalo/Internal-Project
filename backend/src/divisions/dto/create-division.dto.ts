import { IsString, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreateDivisionDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    progressWeight: number;

    @IsUUID()
    projectId: string;
}
