import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from 'src/auth/auth.controller';
import { LoginGuard } from 'src/auth/login.guard';

describe('AuthController', () => {
  let authController: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [LoginGuard],
    }).compile();

    authController = module.get(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Reset mock usage
  });

  describe('login', () => {
    it('should return undefined', () => {
      const result = authController.login();
      expect(result).toBeUndefined();
    });
  });

  describe('user', () => {
    it('should return user information', () => {
      const mockRequest = { user: { name: 'John' } };
      const result = authController.user(mockRequest);
      expect(result).toEqual({ name: 'John' });
    });
  });

  describe('loginCallback', () => {
    it('should redirect to /', () => {
      const mockResponse: any = {
        redirect: jest.fn(),
      };
      authController.loginCallback(mockResponse);
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
        'http://end-session.com?post_logout_redirect_uri=your_redirect_uri&id_token_hint=123',
      );
    });

    it('should handle errors during session destroy', async () => {
      const mockRequest = {
        user: { id_token: '123' },
        session: { destroy: jest.fn((cb) => cb('error')) },
      };
      const mockResponse: any = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

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

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith('Error logging out');
    });

    it('should redirect to / if end session endpoint is not available', async () => {
      const mockRequest = {
        user: { id_token: '123' },
        session: { destroy: jest.fn() },
      };
      const mockResponse: any = { redirect: jest.fn() };

      // Mock Issuer.discover
      const mockDiscover = jest.fn().mockResolvedValue({ metadata: {} });
      jest.mock('openid-client', () => ({
        Issuer: {
          discover: mockDiscover,
        },
      }));

      await authController.logout(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith('/');
    });
  });
});
