import { Injectable } from '@nestjs/common';
import { Expo } from 'expo-server-sdk';

@Injectable()
export class NotificationsService {
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
}
