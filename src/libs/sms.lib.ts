import { AuthType, Infobip } from '@infobip-api/sdk';

export async function sendSms(payload: any): Promise<any> {
  const { phoneNumber, message } = payload;
  const infobip = new Infobip({
    baseUrl: process.env.INFOBIP_BASE_URL,
    apiKey: process.env.INFOBIP_API_KEY,
    authType: AuthType.ApiKey,
  });

  const response = await infobip.channels.sms.send({
    messages: [
      {
        destinations: [
          {
            to: `+225${phoneNumber}`,
          },
        ],
        from: 'Djonanko CI',
        text: message,
      },
    ],
  });

  return response;
}
