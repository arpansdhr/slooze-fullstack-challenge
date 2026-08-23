import { Resolver, Query, Mutation, Args, Int, ObjectType, Field } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { gqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PaymentService } from './payment.service';

@ObjectType()
class PaymentMethodType {
  @Field(() => Int)
  id!: number;

  @Field(() => Int)
  userId!: number;

  @Field()
  label!: string;

  @Field()
  details!: string;

  @Field()
  isDefault!: boolean;
}

@Resolver(() => PaymentMethodType)
export class PaymentResolver {
  constructor(private paymentService: PaymentService) {}

  @Query(() => [PaymentMethodType])
  @UseGuards(gqlAuthGuard)
  paymentMethods(@CurrentUser() user: any) {
    return this.paymentService.listPaymentMethods(user);
  }

  @Mutation(() => PaymentMethodType)
  @UseGuards(gqlAuthGuard)
  addPaymentMethod(
    @CurrentUser() user: any,
    @Args('label') label: string,
    @Args('details') details: string,
    @Args('isDefault', { type: () => Boolean, nullable: true }) isDefault?: boolean,
  ) {
    return this.paymentService.addPaymentMethod(user, label, details, !!isDefault);
  }

  @Mutation(() => PaymentMethodType)
  @UseGuards(gqlAuthGuard)
  updatePaymentMethod(
    @CurrentUser() user: any,
    @Args('paymentId', { type: () => Int }) paymentId: number,
    @Args('label') label: string,
    @Args('details') details: string,
  ) {
    return this.paymentService.updatePaymentMethod(user, paymentId, label, details);
  }

  @Mutation(() => PaymentMethodType)
  @UseGuards(gqlAuthGuard)
  setDefaultPaymentMethod(
    @CurrentUser() user: any,
    @Args('paymentId', { type: () => Int }) paymentId: number,
  ) {
    return this.paymentService.setDefaultPaymentMethod(user, paymentId);
  }
}
