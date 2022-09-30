import {
  Injectable,
  NestMiddleware,
  RawBodyRequest,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { timingSafeEqual, createHmac } from 'crypto';

@Injectable()
export class SlackVerificationMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  private verifySlackRequest(req: RawBodyRequest<Request>): boolean {
    const slackSigningSecret = this.configService.get('SLACK_SIGNING_SECRET');

    const timestamp = parseInt(
      req.headers['x-slack-request-timestamp'].toString(),
      10,
    );
    const signature = req.headers['x-slack-signature'].toString();
    const [version, hash] = signature.split('=');

    // Ensure request is within 5 minutes of current time
    if (timestamp < Date.now() / 1000 - 5 * 60) {
      return false;
    }

    const hmac = createHmac('sha256', slackSigningSecret);
    hmac.update(`${version}:${timestamp}:${req.rawBody}`);

    // check that the request signature matches expected value
    return timingSafeEqual(Buffer.from(hash, 'hex'), hmac.digest());
  }

  use(req: Request, res: Response, next: () => void) {
    if (this.verifySlackRequest(req)) {
      if (
        req.body?.channel_id &&
        req.body?.channel_id ===
          this.configService.get('RESERVATION_CHANNEL_ID')
      ) {
        next();
      } else if (!req.body?.channel_id) {
        next();
      } else {
        res.send("Are you sure you're in the right channel?");
      }
      return;
    }
    throw new UnauthorizedException('Invalid Slack request signature');
  }
}
