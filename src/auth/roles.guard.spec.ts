import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (user?: any): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow access if no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    const context = createMockContext({ role: Role.CITIZEN });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.OFFICER]);
    const context = createMockContext({ role: Role.OFFICER });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user has different role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.OFFICER]);
    const context = createMockContext({ role: Role.STARTUP });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user is not attached to request', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.OFFICER]);
    const context = createMockContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
