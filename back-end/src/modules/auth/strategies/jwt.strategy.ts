import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: number;
  username: string;
  email: string;
  is_admin: boolean;
}

export interface JwtUser {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtUser> {
    return {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
      is_admin: payload.is_admin,
    };
  }
}
