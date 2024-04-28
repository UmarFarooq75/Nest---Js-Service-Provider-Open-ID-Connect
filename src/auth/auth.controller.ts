// auth/auth.controller.ts
import { Controller, Get, Request, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { LoginGuard } from './login.guard';
import { Issuer } from 'openid-client';

@Controller()
export class AuthController {
  @UseGuards(LoginGuard)
  @Get('/login')
  login() {}

  @Get('/user')
  user(@Request() req) {
    return req.user;
  }

  @UseGuards(LoginGuard)
  @Get('/callback')
  loginCallback(@Res() res: Response) {
    res.redirect('/');
  }

  @Get('/logout')
  async logout(@Request() req, @Res() res: Response) {
    const id_token = req.user ? req.user.id_token : undefined;

    // Instead of using req.logout(), you can manually clear the session
    // and perform any cleanup actions needed
    const TrustIssuer = await Issuer.discover(
      `${process.env.OAUTH2_CLIENT_PROVIDER_OIDC_ISSUER}/.well-known/openid-configuration`,
    );
    const end_session_endpoint = TrustIssuer.metadata.end_session_endpoint;

    // For example, if you're using express-session for session management:
    req.session.destroy((error: any) => {
      if (error) {
        console.error('Error destroying session:', error);
        // Handle error appropriately, e.g., return an error response
        return res.status(500).send('Error logging out');
      }

      // After session is destroyed, perform logout redirect
      const end_session_endpoint = TrustIssuer.metadata.end_session_endpoint;
      if (end_session_endpoint) {
        res.redirect(
          end_session_endpoint +
            '?post_logout_redirect_uri=' +
            process.env
              .OAUTH2_CLIENT_REGISTRATION_LOGIN_POST_LOGOUT_REDIRECT_URI +
            (id_token ? '&id_token_hint=' + id_token : ''),
        );
      } else {
        res.redirect('/');
      }
    });
  }
}
