import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  // Method to validate user
  async validateUser(user: any): Promise<any> {
    // Here you would typically perform user validation logic
    // For demonstration purposes, let's assume we just return the user object
    return user;
  }
}
