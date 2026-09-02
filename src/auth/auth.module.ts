/**
 * PilotGov Role-Based Authentication & Authorization Module
 * --------------------------------------------------------
 * Roles:
 *  - OFFICER : Government department officer (posts needs, advances pilots).
 *  - STARTUP : Verified/registered startup/vendor (requests/applies for pilots).
 *  - CITIZEN : Public citizen / observer (browse open needs and public dashboards).
 *
 * Route Protection Overview:
 *  - POST  /auth/register    -> Public (Register new user with assigned Role)
 *  - POST  /auth/login       -> Public (Authenticate user and issue JWT)
 *  - POST  /identify/needs   -> @Roles(Role.OFFICER)
 *  - GET   /identify/needs   -> Public (Open needs directory)
 *  - POST  /pilot/request    -> @Roles(Role.STARTUP)
 *  - PATCH /pilot/advance    -> @Roles(Role.OFFICER)
 *  - GET   /pilot/pipeline   -> Public (Pipeline board tracker)
 *  - Scale & Procure routes  -> Unguarded (out of scope for this task)
 */

import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'pilotgov_jwt_secret_dev_key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard],
  exports: [AuthService, JwtAuthGuard, RolesGuard, PassportModule, JwtModule],
})
export class AuthModule {}
