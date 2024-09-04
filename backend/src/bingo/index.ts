import { v4 as uuid } from "uuid";
import dayjs from "dayjs";

import {
  getSocket,
  BINGO_NUMBER_DRAWN,
} from "../helpers/socketManager";
import { getUser, transferToUser } from "../helpers";
import { getDatabaseCollection } from "../helpers/dbManager";
import { sendMessageToGameChannel } from "../helpers/channelMessages";
import { BINGO_ID } from "../helpers/constants";

import { BingoRound, BingoState } from "./types";

const CARD_PRICE = process.env.NODE_ENV === "development" ? 0.02 : 5;
// const ROUND_TIME = process.env.NODE_ENV === "development" ? 5000 : 40000;
const TIME_PER_NUMBER = process.env.NODE_ENV === "development" ? 1000 : 5000;

let numbersDrawInterval;

const getCurrentRound = async () => {
  const collection = await getDatabaseCollection("bingo");

  const currentRound = await collection.findOne<BingoRound>({
    status: { $ne: "finished" },
  });

  return currentRound;
};

export const scheduleNextRound = async () => {
  const currentRound = await getCurrentRound();

  if (!currentRound) {
    createNextRound();
    return;
  }

  const startTimestamp = dayjs(currentRound.startTimestamp);
  const now = dayjs();

  const timeUntilNextRound = startTimestamp.diff(now);

  if (timeUntilNextRound <= 0) {
    createNextRound();
    return;
  }

  setTimeout(() => {
    createNextRound();
  }, timeUntilNextRound);
}



export const createNextRound = async () => {
  const collection = await getDatabaseCollection("bingo");

  const currentRound = await getCurrentRound();

  if (currentRound) {
    sendMessageToGameChannel({ gameId: BINGO_ID, message: `Ya hay una ronda de bingo abierta` });
    return;
  }

  const today = dayjs();
  const todayAt10pm = dayjs().hour(22).minute(0).second(0)

  const thisMonday = dayjs().startOf('week').add(1, 'day').hour(22).minute(0).second(0)
  const thisThursday = dayjs().startOf('week').add(4, 'day').hour(22).minute(0).second(0)

  let nextBingoDate;

  if (today.isBefore) {

  } else if (today.isAfter(thisThursday)) {
    const nextMonday = thisMonday.add(1, 'week');
    nextBingoDate = nextMonday;
  } else if (today.isAfter(thisMonday)) {
    nextBingoDate = thisThursday;
  }

  const newRound: BingoRound = {
    id: uuid(),
    numbersDrawn: [],
    users: {},
    startTimestamp: nextBingoDate.toISOString(),
    status: "inscriptionsOpen",
    currentPrize: 0,
  };

  await collection.insertOne(newRound);

  sendMessageToGameChannel({ gameId: BINGO_ID, message: `El próximo bingo es el ${'asd'}` });

  return newRound;
}

export const addBingoPlayer = async (userId: number) => {
  const collection = await getDatabaseCollection("bingo");

  const currentRound = await getCurrentRound();

  if (!currentRound) {
    sendMessageToGameChannel({ gameId: BINGO_ID, message: `No hay ronda de bingo abierta`, to: userId });
    transferToUser(userId, CARD_PRICE);
    return;
  }

  if (currentRound.status !== "inscriptionsOpen") {
    sendMessageToGameChannel({ gameId: BINGO_ID, message: `Las inscripciones ya están cerradas`, to: userId });
    transferToUser(userId, CARD_PRICE);
    return;
  }

  if (currentRound.users[userId]) {
    sendMessageToGameChannel({ gameId: BINGO_ID, message: `Ya estás inscripto en el bingo`, to: userId });
    transferToUser(userId, CARD_PRICE);
    return;
  }

  const cardNumbers = [];

  for (let i = 0; i < 15; i++) {
    let number;

    do {
      number = Math.floor(Math.random() * 50);
    } while (cardNumbers.includes(number));

    cardNumbers.push(number);
  }

  cardNumbers.sort((a, b) => a - b);

  const card = {
    id: uuid(),
    numbers: cardNumbers,
  };

  currentRound.users[userId] = { card };

  const newPrize = currentRound.currentPrize + (CARD_PRICE / 2);

  await collection.updateOne({ id: currentRound.id }, { $set: { users: currentRound.users, currentPrize: newPrize } });
  const user = await getUser(userId);

  sendMessageToGameChannel({ gameId: BINGO_ID, message: `@${user.username} ya tiene su cartón para el próximo bingo!` });
}

export const startBingoRound = async () => {
  const collection = await getDatabaseCollection("bingo");

  const currentRound = await getCurrentRound();

  if (!currentRound) {
    sendMessageToGameChannel({ gameId: BINGO_ID, message: `No hay ronda de bingo abierta` });
    return;
  }

  currentRound.status = "started";

  await collection.updateOne({ id: currentRound.id }, { $set: { status: "started" } });

  sendMessageToGameChannel({ gameId: BINGO_ID, message: `¡Comenzó el bingo!` });

  numbersDrawInterval = setInterval(drawNumber, TIME_PER_NUMBER);
}

const drawNumber = async () => {
  const collection = await getDatabaseCollection("bingo");

  const currentRound = await getCurrentRound();

  if (!currentRound) {
    sendMessageToGameChannel({ gameId: BINGO_ID, message: `No hay ronda de bingo abierta` });
    return;
  }

  if (currentRound.status !== "started") {
    sendMessageToGameChannel({ gameId: BINGO_ID, message: `El bingo aún no ha comenzado` });
    return;
  }

  const numbersDrawn = currentRound.numbersDrawn;

  let number;

  do {
    number = Math.floor(Math.random() * 50);
  } while (numbersDrawn.includes(number));

  numbersDrawn.push(number);

  await collection.updateOne({ id: currentRound.id }, { $set: { numbersDrawn } });
  const socket = getSocket();

  socket.emit(BINGO_NUMBER_DRAWN, {
    numbersDrawn,
  });

  sendMessageToGameChannel({ gameId: BINGO_ID, message: `Salio el ${number}` });

  if(numbersDrawn.length === 50) {
    clearInterval(numbersDrawInterval);
    sendMessageToGameChannel({ gameId: BINGO_ID, message: `¡Se acabaron los números!` });
  }
}

export const declareBingo = async (userId: number) => {
  const currentRound = await getCurrentRound();

  console.log('DECLARING BINGO', currentRound);

  if (!currentRound) {
    sendMessageToGameChannel({ gameId: BINGO_ID, message: `No hay ronda de bingo abierta`, to: userId });
    return;
  }

  if (currentRound.status !== "started") {
    sendMessageToGameChannel({ gameId: BINGO_ID, message: `El bingo aún no ha comenzado`, to: userId });
    return;
  }

  if (!currentRound.users[userId]) {
    sendMessageToGameChannel({ gameId: BINGO_ID, message: `No estás inscripto en el bingo`, to: userId });
    return;
  }

  const card = currentRound.users[userId].card;

  const numbersDrawn = currentRound.numbersDrawn;

  const numbersMatched = card.numbers.filter((number) => numbersDrawn.includes(number));

  if (numbersMatched.length === 15) {
    clearInterval(numbersDrawInterval);
    finishBingoRound(userId); 
  } else {
    const user = await getUser(userId);
    sendMessageToGameChannel({ gameId: BINGO_ID, message: `No tenés todos los números, @${user.username}. No mientas.` });
  }
}

const finishBingoRound = async (winnerId: number) => {
  const collection = await getDatabaseCollection("bingo");

  const currentRound = await getCurrentRound();

  if (!currentRound) {
    sendMessageToGameChannel({ gameId: BINGO_ID, message: `No hay ronda de bingo abierta` });
    return;
  }

  if (currentRound.status !== "started") {
    sendMessageToGameChannel({ gameId: BINGO_ID, message: `El bingo aún no ha comenzado` });
    return;
  }

  await collection.updateOne({ id: currentRound.id }, { $set: { status: "finished" } });

  await transferToUser(winnerId, currentRound.currentPrize);
  const user = await getUser(winnerId);
  sendMessageToGameChannel({ gameId: BINGO_ID, message: `BINGO! @${user.username} ganó el premio de ${currentRound.currentPrize}!` });

  createNextRound();
}

export const getBingoStatus: () => Promise<
  BingoState
> = async () => {
  const currentRound = await getCurrentRound();

  return { ...currentRound, currentRoundId: currentRound.id };
};