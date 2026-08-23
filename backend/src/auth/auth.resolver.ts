import { Args, Mutation, Query, Resolver, ObjectType, Field, Int } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UseGuards } from '@nestjs/common';
import { gqlAuthGuard } from './gql-auth.guard';
import { CurrentUser } from './current-user.decorator';

@ObjectType()
export class UserType {
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

@ObjectType()
export class LoginResponse {
  @Field()
  access_token!: string;

  @Field(() => UserType)
  user!: UserType;
}

@Resolver(() => UserType)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginResponse)
  login(@Args('email') email: string, @Args('password') password: string) {
    return this.authService.login(email, password);
  }

  @Query(() => UserType)
  @UseGuards(gqlAuthGuard)
  me(@CurrentUser() user: any) {
    return user;
  }
}
