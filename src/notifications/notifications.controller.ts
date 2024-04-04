import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { FullAuthGuard } from 'src/full-auth-guard/full-auth-guard.guard';

@UseGuards(FullAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('/send-notification')
  async sendNotification(
    @Body() payload: { token: string; title: string; body: string },
  ) {
    return this.notificationsService.sendNotification(
      payload.token,
      payload.title,
      payload.body,
    );
  }

  @Post('/send-notification-chunk')
  async sendNotificationsChunk(
    @Body() payload: { title: string; body: string },
  ) {
    return this.notificationsService.sendNotificationsChunk(
      payload.title,
      payload.body,
    );
  }
}
