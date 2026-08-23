import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  const password = 'Pa$$w0rd';

  await prisma.user.createMany({
    data: [
      { name: 'Admin India', email: 'admin.india@example.com', password, role: 'ADMIN', country: 'INDIA' },
      { name: 'Admin America', email: 'admin.america@example.com', password, role: 'ADMIN', country: 'AMERICA' },
      { name: 'Manager India', email: 'manager.india@example.com', password, role: 'MANAGER', country: 'INDIA' },
      { name: 'Manager America', email: 'manager.america@example.com', password, role: 'MANAGER', country: 'AMERICA' },
      { name: 'Member India', email: 'member.india@example.com', password, role: 'MEMBER', country: 'INDIA' },
      { name: 'Member2 India', email: 'member2.india@example.com', password, role: 'MEMBER', country: 'INDIA' },
      { name: 'Member America', email: 'member.america@example.com', password, role: 'MEMBER', country: 'AMERICA' },
    ],
  });

  const restaurants = await prisma.restaurant.createMany({
    data: [
      { name: 'Tandoori Express', country: 'INDIA' },
      { name: 'Masala Point', country: 'INDIA' },
      { name: 'BBQ House', country: 'AMERICA' },
      { name: 'Burger Ranch', country: 'AMERICA' },
    ],
  });

  const [tandoori, masala, bbq, burger] = await prisma.restaurant.findMany({});

  await prisma.menuItem.createMany({ data: [
    { name: 'Butter Chicken', price: 11.5, restaurantId: tandoori.id },
    { name: 'Paneer Tikka', price: 9.0, restaurantId: tandoori.id },
    { name: 'Dosa', price: 7.0, restaurantId: masala.id },
    { name: 'Chicken Biryani', price: 12.0, restaurantId: masala.id },
    { name: 'Ribeye Steak', price: 22.0, restaurantId: bbq.id },
    { name: 'Pulled Pork', price: 15.0, restaurantId: bbq.id },
    { name: 'Cheeseburger', price: 10.0, restaurantId: burger.id },
    { name: 'Fries', price: 4.5, restaurantId: burger.id },
  ]});
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});