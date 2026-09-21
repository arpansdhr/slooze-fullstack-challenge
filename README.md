# Food Ordering App 🍱

Full-stack app made using NestJS, GraphQL for backend, Prisma Studio for database and Next.js for frontend implementing RBAC + ReBAC by country.

## Backend setup 

1. `cd backend`
2. `npm install`
3. `npx prisma db push`
4. `npx prisma generate`
5. `npx prisma migrate dev --name init`
6. `npm run prisma:seed`
7. `npm run start:dev`

GraphQL endpoint: `http://localhost:4000/graphql`

## Frontend setup

1. `cd frontend`
2. `npm install`
3. `npm run dev`

App URL: `http://localhost:3000`

## Seeded Users
- `admin.india@example.com` (ADMIN, INDIA)
- `manager.india@example.com` (MANAGER, INDIA)
- `member.india@example.com` (MEMBER, INDIA)
- `member2.india@example.com` (MEMBER2, INDIA)
- `admin.america@example.com` (ADMIN, AMERICA)
- `manager.america@example.com` (MANAGER, AMERICA)
- `member.america@example.com` (MEMBER, AMERICA)

Password for all: `Pa$$w0rd`

## View Database
1. `npx prisma studio`

Prisma Studio URL: `http://localhost:5555`

## Permissions
- View restaurants + menus: all roles
- Add order: all roles
- Checkout/cancel: Admin, Manager
- Manage payment method: Admin only
- ReBAC: country scope enforced in backend resolvers
