import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async addPaymentMethod(user: any, label: string, details: string, isDefault = false) {
    // Only admins may add payment methods
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only Admin can add or modify payment methods');
    }

    if (isDefault) {
      await this.prisma.paymentMethod.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
    }

    return this.prisma.paymentMethod.create({
      data: { userId: user.id, label, details, isDefault },
    });
  }

  async updatePaymentMethod(user: any, paymentId: number, label: string, details: string) {
    // Only admins may update payment methods
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only Admin can add or modify payment methods');
    }

    const method = await this.prisma.paymentMethod.findUnique({ where: { id: paymentId } });
    if (!method || method.userId !== user.id) {
      throw new NotFoundException('Payment method not found');
    }

    return this.prisma.paymentMethod.update({
      where: { id: paymentId },
      data: { label, details },
    });
  }

  async setDefaultPaymentMethod(user: any, paymentId: number) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only Admin can set the default payment method');
    }

    const method = await this.prisma.paymentMethod.findUnique({ where: { id: paymentId } });
    if (!method || method.userId !== user.id) {
      throw new NotFoundException('Payment method not found');
    }

    await this.prisma.paymentMethod.updateMany({ where: { isDefault: true }, data: { isDefault: false } });

    return this.prisma.paymentMethod.update({
      where: { id: paymentId },
      data: { isDefault: true },
    });
  }

  async listPaymentMethods(user: any) {
    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      throw new ForbiddenException('Only Admin and Manager can access payment methods');
    }

    // Admins see their own payment methods, managers see all payment methods
    const whereClause = user.role === 'ADMIN' ? { userId: user.id } : {};

    return this.prisma.paymentMethod.findMany({ where: whereClause });
  }
}
