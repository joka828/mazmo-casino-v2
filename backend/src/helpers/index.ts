import axios from "axios";
import { MAZMO_API_URL } from "./constants";

export const getCasinoBalance = async () => {
  const {
    data: { balance },
  } = await axios({
    url: `${MAZMO_API_URL}/bank/boxes/balance`,
    method: "GET",
    params: { botSecret: process.env.MAZMO_BOT_SECRET },
  });

  return balance;
};

export const transferToUser = (
  userId: string,
  amount: number,
  concept?: string
) => {
  return axios({
    url: `${MAZMO_API_URL}/bank/transactions`,
    method: "POST",
    params: { botSecret: process.env.MAZMO_BOT_SECRET },
    data: {
      to: { type: "USER", id: parseInt(userId, 10) },
      concept,
      amount,
      data: {},
    },
  });
};

export const getBotTransactions = async () => {
  const {
    data: { pages: page },
  } = await axios({
    url: `${MAZMO_API_URL}/bank/transactions`,
    method: "GET",
    params: { botSecret: process.env.MAZMO_BOT_SECRET, page: 1 },
  });

  const {
    data: { documents },
  } = await axios({
    url: `${MAZMO_API_URL}/bank/transactions`,
    method: "GET",
    params: { botSecret: process.env.MAZMO_BOT_SECRET, page },
  });

  return documents;
};

export const getUserByTag = async (userTag) => {
  const { data: user } = await axios.get(`${MAZMO_API_URL}/users/${userTag}`);
  return user;
};

export const getUser = async (userId) => {
  const { data: users } = await axios.get(
    `${MAZMO_API_URL}/users?ids=${userId}`
  );
  return users[userId];
};

export const getUsers = async (userIds) => {
  const { data: users } = await axios.get(
    `${MAZMO_API_URL}/users?ids=${userIds.join(",")}`
  );
  return users;
};

export const delay = (miliseconds) =>
  new Promise(function (resolve) {
    setTimeout(resolve, miliseconds);
  });
