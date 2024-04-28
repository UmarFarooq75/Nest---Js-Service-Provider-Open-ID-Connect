import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('getHello', () => {
    it('should return a greeting message with user information', () => {
      // Mock the request object with user information
      const mockRequest: any = {
        user: {
          userinfo: {
            name: 'John Doe',
            email: 'john@example.com',
            picture: 'http://example.com/picture.jpg',
          },
        },
      };

      // Call the getHello method with the mock request object
      const result = appController.getHello(mockRequest);

      // Assert that the result contains the expected greeting message
      expect(result).toContain('Hello, John Doe!');
      expect(result).toContain(
        '<img src="http://example.com/picture.jpg" alt="User Picture" />',
      );
      expect(result).toContain('<a href="/logout">Logout</a>');
    });

    it('should return a greeting message with login link when no user information is provided', () => {
      // Mock the request object without user information
      const mockRequest: any = {};

      // Call the getHello method with the mock request object
      const result = appController.getHello(mockRequest);

      // Assert that the result contains the expected greeting message with login link
      expect(result).toContain('Welcome! <a href="/login">Login</a>');
    });
  });

  // Add more test cases as needed
});
