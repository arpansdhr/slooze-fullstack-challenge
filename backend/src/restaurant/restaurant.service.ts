import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RestaurantService {
  constructor(private prisma: PrismaService) {}

  findAll(country?: string) {
    const where = country ? { country } : {};
    return this.prisma.restaurant.findMany({
      where,
      include: { menus: true },
    });
  }
}
