import { Resolver, Query, Args, ObjectType, Field, Int } from '@nestjs/graphql';
import { RestaurantService } from './restaurant.service';
import { UseGuards } from '@nestjs/common';
import { gqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ObjectType()
class MenuItemType {
  @Field(() => Int)
  id!: number;

  @Field()
  name!: string;

  @Field()
  price!: number;
}

@ObjectType()
class RestaurantType {
  @Field(() => Int)
  id!: number;

  @Field()
  name!: string;

  @Field()
  country!: string;

  @Field(() => [MenuItemType])
  menus!: MenuItemType[];
}

@Resolver(() => RestaurantType)
export class RestaurantResolver {
  constructor(private restaurantService: RestaurantService) {}

  @Query(() => [RestaurantType])
  restaurants(@Args('country', { nullable: true }) country?: string) {
    const scope = country || 'india'; // default for testing
    return this.restaurantService.findAll(scope);
  }
}
