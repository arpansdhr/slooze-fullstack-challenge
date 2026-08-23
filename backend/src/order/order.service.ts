import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async createOrder(user: any, restaurantId: number, items: { menuItemId: number; qty: number }[]) {
    const restaurant = await this.prisma.restaurant.findUnique({ where: { id: restaurantId }, include: { menus: true } });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (restaurant.country !== user.country) {
      throw new ForbiddenException('Relational access denied, cannot order outside country');
    }

    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await this.prisma.menuItem.findMany({ where: { id: { in: menuItemIds }, restaurantId } });

    if (menuItems.length !== items.length) {
      throw new NotFoundException('One or more menu items not found in this restaurant');
    }

    const orderItems = items.map((i) => {
      const menu = menuItems.find((m: any) => m.id === i.menuItemId);
      if (!menu) throw new NotFoundException('Menu item not found');
      return {
        menuItemId: i.menuItemId,
        qty: i.qty,
        lineTotal: menu.price * i.qty,
      };
    });

    const total = orderItems.reduce((t, item) => t + item.lineTotal, 0);

    return this.prisma.order.create({
      data: {
        userId: user.id,
        restaurantId,
        country: user.country,
        total,
        status: 'PENDING',
        items: {
          create: orderItems,
        },
      },
      include: { items: true, restaurant: true },
    });
  }

  async getOrders(user: any) {
    // Members can only see their own orders, admins and managers can see all orders in their country
    const whereClause = user.role === 'MEMBER'
      ? { userId: user.id }
      : { country: user.country };

    return this.prisma.order.findMany({
      where: whereClause,
      include: { items: true, restaurant: true },
    });
  }

  async checkoutOrder(user: any, orderId: number, paymentMethodId: number) {
    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      throw new ForbiddenException('Only Admin and Manager can checkout orders');
    }

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    if (order.country !== user.country) {
      throw new ForbiddenException('Relational access denied');
    }

    if (order.status !== 'PENDING') {
      throw new ForbiddenException('Order is not pending');
    }

    const paymentMethod = await this.prisma.paymentMethod.findUnique({ where: { id: paymentMethodId } });
    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    // Managers can only checkout with the default payment method; admins may use any of their own methods
    if (user.role === 'MANAGER' && !paymentMethod.isDefault) {
      throw new ForbiddenException('Managers can only checkout with the default payment method');
    }

    if (user.role === 'ADMIN' && paymentMethod.userId !== user.id) {
      throw new ForbiddenException('Invalid payment method');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID', paymentMethodId },
      include: { items: true, restaurant: true },
    });
  }

  async cancelOrder(user: any, orderId: number) {
    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      throw new ForbiddenException('Only Admin and Manager can cancel orders');
    }
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    if (order.country !== user.country) {
      throw new ForbiddenException('Relational access denied');
    }

    if (order.status === 'CANCELED') {
      throw new ForbiddenException('Order is already canceled');
    }

    return this.prisma.order.update({ where: { id: orderId }, data: { status: 'CANCELED' } });
  }
}
