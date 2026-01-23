import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class InternalAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const key = req.headers['x-internal-key'];

    if (key !== process.env.INTERNAL_SYNC_KEY) {
      throw new UnauthorizedException('Invalid internal key');
    }

    next();
  }
}
