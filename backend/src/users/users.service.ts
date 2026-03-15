import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto) {
    // Check if a soft-deleted user with the same email exists
    const existingDeleted = await this.prisma.user.findFirst({
      where: {
        email: createUserDto.email,
        deletedAt: { not: null },
      },
    });

    if (existingDeleted) {
      // Restore the deleted user with the new data
      return this.prisma.user.update({
        where: { id: existingDeleted.id },
        data: {
          ...(createUserDto as any),
          deletedAt: null,
          createdAt: new Date(),
        },
      });
    }

    return this.prisma.user.create({ data: createUserDto as any });
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginUserDto.email }
    });

    if (!user || user.password !== loginUserDto.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  findAll() {
    return this.prisma.user.findMany({
      include: {
        _count: {
          select: {
            taskAssignments: { where: { task: { status: { not: 'COMPLETED' } } } },
            projectsManaged: { where: { status: { not: 'DONE' } } },
          }
        },
        taskAssignments: {
          where: { task: { status: { not: 'COMPLETED' } } },
          include: { task: true }
        }
      }
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto as any,
    });
  }

  remove(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
