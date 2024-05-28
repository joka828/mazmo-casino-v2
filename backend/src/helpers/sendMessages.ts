import axios from "axios";
import { CASINO_PROD_CHANNEL_ID, MAZMO_API_URL } from "./constants";

export const sendMessageToChannel: (
  message: { rawContent: string; type?: string; toUserId?: string },
  channelCredentials: { key: string; id: string }
) => Promise<unknown> = (message, channelCredentials) => {
  if (!channelCredentials) {
    return new Promise((resolve, reject) => {
      console.error("ERROR: NO CHANNEL SET");
      resolve({ data: "ERROR: NO CHANNEL SET" });
    });
  }

  return axios({
    url: `${MAZMO_API_URL}/chat/channels/${channelCredentials.id}/messages`,
    method: "POST",
    headers: { "Bot-Key": channelCredentials.key },
    data: message,
  }).catch((e) => {
    // If 504, retry. That messages api ain't helping right now.
    if (e.response && e.response.status === 504) {
      return axios({
        url: `${MAZMO_API_URL}/chat/channels/${channelCredentials.id}/messages`,
        method: "POST",
        headers: { "Bot-Key": channelCredentials.key },
        data: message,
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
  const noticeData = userId ? { toUserId: userId, type: "NOTICE" } : {};

  sendMessageToChannel(
    { rawContent: helpMessage, ...noticeData },
    channelCredentials
  );
};

export const printNonCasinoWelcome = (userId, channelCredentials) => {
  const helpMessage = `:mazmo:**Bienvenide a este bello canal!**:mazmo:
      Si querés jugar jueguitos por sades, apostar, y participar de sorteos de sades, unite al %${CASINO_PROD_CHANNEL_ID}:moneybag::moneybag:
      :money_mouth_face:Te espero por allí para jugar!:money_mouth_face:
      \n\nCualquier pregunta o sugerencia del casino podés no escribirle a [Joka](https://mazmo.net/@joka)
    `;
  const noticeData = { toUserId: userId, type: "NOTICE" };

  sendMessageToChannel(
    { rawContent: helpMessage, ...noticeData },
    channelCredentials
  );
};
