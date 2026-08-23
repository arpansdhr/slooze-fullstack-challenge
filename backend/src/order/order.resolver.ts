import { Resolver, Query, Mutation, Args, Int, ObjectType, Field, InputType } from '@nestjs/graphql';
import { OrderService } from './order.service';
import { UseGuards } from '@nestjs/common';
import { gqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@InputType()
class OrderItemInput {
  @Field(() => Int)
  menuItemId!: number;

  @Field(() => Int)
  qty!: number;
}

@ObjectType()
class OrderItemType {
  @Field(() => Int)
  id!: number;

  @Field(() => Int)
  menuItemId!: number;

  @Field(() => Int)
  qty!: number;

  @Field()
  lineTotal!: number;
}

@ObjectType()
class OrderType {
  @Field(() => Int)
  id!: number;

  @Field(() => Int)
  userId!: number;

  @Field(() => Int)
  restaurantId!: number;

  @Field(() => Int, { nullable: true })
  paymentMethodId?: number;

  @Field()
  total!: number;

  @Field()
  status!: string;

  @Field()
  country!: string;

  @Field(() => [OrderItemType])
  items!: OrderItemType[];
}

@Resolver(() => OrderType)
export class OrderResolver {
  constructor(private orderService: OrderService) {}

  @Query(() => [OrderType])
  @UseGuards(gqlAuthGuard)
  orders(@CurrentUser() user: any) {
    return this.orderService.getOrders(user);
  }

  @Mutation(() => OrderType)
  @UseGuards(gqlAuthGuard)
  createOrder(
    @CurrentUser() user: any,
    @Args('restaurantId', { type: () => Int }) restaurantId: number,
    @Args({ name: 'items', type: () => [OrderItemInput] }) items: OrderItemInput[],
  ) {
    return this.orderService.createOrder(user, restaurantId, items);
  }

  @Mutation(() => OrderType)
  @UseGuards(gqlAuthGuard)
  checkoutOrder(
    @CurrentUser() user: any,
    @Args('orderId', { type: () => Int }) orderId: number,
    @Args('paymentMethodId', { type: () => Int }) paymentMethodId: number,
  ) {
    return this.orderService.checkoutOrder(user, orderId, paymentMethodId);
  }

  @Mutation(() => OrderType)
  @UseGuards(gqlAuthGuard)
  cancelOrder(@CurrentUser() user: any, @Args('orderId', { type: () => Int }) orderId: number) {
    return this.orderService.cancelOrder(user, orderId);
  }
}
