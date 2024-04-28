import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { LoginGuard } from './login.guard';
import { AuthService } from './auth.service'; // Import AuthService
import * as dotenv from 'dotenv';
dotenv.config();

describe('logout', () => {
  it('should destroy session and redirect to end session endpoint', async () => {
    // Mock request and response objects
    const mockRequest: any = {
      user: { id_token: '123' },
      session: { destroy: jest.fn((callback) => callback()) }, // Mock destroy function
    };
    const mockResponse: any = { redirect: jest.fn() };

    // Mock Issuer.discover
    const mockDiscover = jest.fn().mockResolvedValue({
      metadata: { end_session_endpoint: 'http://end-session.com' },
    });
    jest.mock('openid-client', () => ({
      Issuer: { discover: mockDiscover },
    }));

    // Import AuthController after mocking Issuer.discover
    const { AuthController } = require('./auth.controller');

    // Instantiate AuthController
    const authController = new AuthController(new AuthService());

    // Call logout method
    await authController.logout(mockRequest, mockResponse);

    // Assert session.destroy was called
    expect(mockRequest.session.destroy).toHaveBeenCalled();

    // Assert redirect was called with the correct URL
    expect(mockResponse.redirect).toHaveBeenCalledWith(
      'http://end-session.com?post_logout_redirect_uri=http://localhost:3000&id_token_hint=123',
    );
  });
});
