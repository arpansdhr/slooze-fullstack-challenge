import { Resolver, Query, ObjectType, Field, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { gqlAuthGuard } from '../auth/gql-auth.guard';
import { UserService } from './user.service';

@ObjectType()
class UserGraphType {
  @Field(() => Int)
  id!: number;

  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field()
  role!: string;

  @Field()
  country!: string;
}

@Resolver(() => UserGraphType)
export class UserResolver {
  constructor(private userService: UserService) { }

  @Query(() => [UserGraphType])
  @UseGuards(gqlAuthGuard)
  users() {
    return this.userService.findAll();
  }
}
