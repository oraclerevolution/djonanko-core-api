import { Injectable } from '@nestjs/common';
import { Expo } from 'expo-server-sdk';
import { UserService } from 'src/user/user.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly usersService: UserService) {}
  private expo = new Expo({
    accessToken: process.env.EXPO_ACCESS_TOKEN,
    useFcmV1: false,
  });

  async sendNotification(token: string, title: string, body: string) {
    //Vérifier si le token est valide
    if (!Expo.isExpoPushToken(token)) {
      console.error('Invalid Expo push token');
      return;
    }

    const message = {
      to: token,
      sound: 'default' as const,
      title: title,
      body: body,
      data: { withSome: 'data' },
    };

    try {
      console.log('message', message);
      await this.expo.sendPushNotificationsAsync([message]);
    } catch (error) {
      console.error('Error send notification: ', error);
    }
  }

  async sendNotificationsChunk(title: string, body: string) {
    //retrieve all users token
    const usersTokens: string[] =
      await this.usersService.getAllUsersPushTokens();
    //create the messages that you want to send to clients
    const messages = [];
    for (const pushToken of usersTokens) {
      //each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

      // Check that all your push tokens appear to be valid Expo push tokens
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
      }

      //construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
      messages.push({
        to: pushToken,
        sound: 'default' as const,
        title: title,
        body: body,
        data: { withSome: 'data' },
      });
    }

    const chunks = this.expo.chunkPushNotifications(messages);
    const tickets = [];
    (async () => {
      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          console.log('ticketChunk', ticketChunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error(error);
        }
      }
    })();
  }
}
