import { Injectable } from '@nestjs/common';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DivisionsService {
  constructor(private prisma: PrismaService) { }

  create(createDivisionDto: CreateDivisionDto) {
    return this.prisma.division.create({ data: createDivisionDto as any });
  }

  findAll() {
    return this.prisma.division.findMany({
      include: { project: true, tasks: true },
    });
  }

  findOne(id: string) {
    return this.prisma.division.findUnique({
      where: { id },
      include: { project: true, tasks: true },
    });
  }

  update(id: string, updateDivisionDto: UpdateDivisionDto) {
    return this.prisma.division.update({
      where: { id },
      data: updateDivisionDto as any,
    });
  }

  remove(id: string) {
    return this.prisma.division.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
