import axios from "axios";
import { CASINO_PROD_CHANNEL_ID, MAZMO_API_URL } from "./constants";
import { getDatabaseCollection } from "./dbManager";

export interface ChannelCredentials {
  id: string;
  key: string;
}

export interface SadesAskData {
  amount: number;
  fixed?: boolean;
  transferData?: Record<string, unknown>;
}

export const getChannelCredentials: (
  gameId: string
) => Promise<ChannelCredentials> = async (gameId: string) => {
  const collection = await getDatabaseCollection("chat-credentials");

  const channelCredentials = await collection.findOne<ChannelCredentials>({
    gameId,
  });

  return channelCredentials;
};

export const setChannelCredentials = async ({
  gameId,
  id,
  key,
}: {
  gameId: string;
  id: string;
  key: string;
}) => {
  const collection = await getDatabaseCollection("chat-credentials");

  await collection.updateOne(
    { gameId },
    { $set: { key, id } },
    { upsert: true }
  );
};

export const sendMessageToGameChannel = async ({
  message,
  to,
  gameId,
  sadesAsk,
}: {
  message: string;
  to?: number;
  gameId: string;
  sadesAsk?: SadesAskData;
}) => {
  const channelCredentials = await getChannelCredentials(gameId);

  if (!channelCredentials) {
    console.error("ERROR: NO CHANNEL SET");
    return;
  }

  await sendMessageToChannel({ message, to, channelCredentials, sadesAsk });
};

export const sendMessageToChannel = async ({
  message,
  to,
  channelCredentials,
  sadesAsk,
}: {
  message: string;
  to?: number;
  channelCredentials: ChannelCredentials;
  sadesAsk?: SadesAskData;
}) => {
  if (!channelCredentials) {
    return new Promise((resolve, reject) => {
      console.error("ERROR: NO CHANNEL SET");
      resolve({ data: "ERROR: NO CHANNEL SET" });
    });
  }

  const messageData = {
    rawContent: message,
    ...(to ? { toUserId: to, type: "NOTICE" } : {}),
    ...(sadesAsk ? { transferData: {}, sadesAsk } : {}),
  };
  return axios({
    url: `${MAZMO_API_URL}/chat/channels/${channelCredentials.id}/messages`,
    method: "POST",
    headers: { "Bot-Key": channelCredentials.key },
    data: messageData,
  }).catch((e) => {
    // If 504, retry. That messages api ain't helping right now.
    if (e.response && e.response.status === 504) {
      return axios({
        url: `${MAZMO_API_URL}/chat/channels/${channelCredentials.id}/messages`,
        method: "POST",
        headers: { "Bot-Key": channelCredentials.key },
        data: messageData,
      });
    }

    throw new Error(e);
  });
};

export const printCasinoHelp = (userId, channelCredentials) => {
  const helpMessage = `:money_mouth_face::money_mouth_face::mazmo:**Bienvenide al casino de mazmo!**:mazmo::money_mouth_face::money_mouth_face:
      Acá vas a poder timbear todo lo que quieras hasta tener que vender fotos para ganarte de vuelta esos sades!\n\nEstos son los juegos disponibles:
      - **La ruleta!** ("**/ruleta ayuda**" para aprender a jugar).
      - **Blackjack** Proximamente!.
      - **Sorteos** Proximamente vuelven los sorteos!
      \n\nCualquier inconveniente y sugerencias podés no escribirle a [Joka](https://mazmo.net/@joka)`;

  sendMessageToChannel({
    message: helpMessage,
    to: userId,
    channelCredentials,
  });
};

export const printNonCasinoWelcome = (userId, channelCredentials) => {
  const helpMessage = `:mazmo:**Bienvenide a este bello canal!**:mazmo:
      Si querés jugar jueguitos por sades, apostar, y participar de sorteos de sades, unite al %${CASINO_PROD_CHANNEL_ID}:moneybag::moneybag:
      :money_mouth_face:Te espero por allí para jugar!:money_mouth_face:
      \n\nCualquier pregunta o sugerencia del casino podés no escribirle a [Joka](https://mazmo.net/@joka)
    `;

  sendMessageToChannel({
    message: helpMessage,
    to: userId,
    channelCredentials,
  });
};
