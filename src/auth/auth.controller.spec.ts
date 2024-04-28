import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { LoginGuard } from './login.guard';
import { AuthService } from './auth.service'; // Import AuthService

describe('AuthController', () => {
  let authController: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [LoginGuard, AuthService],
    }).compile();

    authController = module.get(AuthController);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  // Other test cases...

  describe('loginCallback', () => {
    it('should set user data in cookies and redirect', async () => {
      const mockRequest: any = { user: { id_token: '123' } };
      const mockResponse: any = {
        cookie: jest.fn(),
        redirect: jest.fn(),
      };

      // Mock the AuthService's validateUser method
      const mockUserData = {
        id_token: '',
        access_token: '',
        refresh_token: '',
        userinfo: '',
      };
      jest
        .spyOn(authController['authService'], 'validateUser')
        .mockResolvedValue(mockUserData);

      await authController.loginCallback(mockResponse, mockRequest);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'userData',
        mockUserData,
        { maxAge: 900000, httpOnly: true },
      );
      expect(mockResponse.redirect).toHaveBeenCalledWith('/');
    });
  });
  describe('logout', () => {
    it('should destroy session and redirect to end session endpoint', async () => {
      const mockRequest: any = {
        user: { id_token: '123' },
        session: { destroy: jest.fn() },
      };
      const mockResponse: any = { redirect: jest.fn() };

      // Mock Issuer.discover
      const mockDiscover = jest.fn().mockResolvedValue({
        metadata: { end_session_endpoint: 'http://end-session.com' },
      });
      jest.mock('openid-client', () => ({
        Issuer: {
          discover: mockDiscover,
        },
      }));

      await authController.logout(mockRequest, mockResponse);

      expect(mockRequest.session.destroy).toHaveBeenCalled();
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        'http://end-session.com?post_logout_redirect_uri=' +
          process.env
            .OAUTH2_CLIENT_REGISTRATION_LOGIN_POST_LOGOUT_REDIRECT_URI +
          '&id_token_hint=123',
      );
    });
  });
});
