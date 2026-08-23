import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { jwtConstants } from './constants';
import { gqlAuthGuard } from './gql-auth.guard';
import { AuthResolver } from './auth.resolver';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({ secret: jwtConstants.secret, signOptions: { expiresIn: '12h' } }),
  ],
  providers: [AuthService, JwtStrategy, gqlAuthGuard, AuthResolver],
  exports: [AuthService],
})
export class AuthModule {}
