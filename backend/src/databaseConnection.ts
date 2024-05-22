import { MongoClient } from "mongodb";

export const CONNECTION_STRING = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(CONNECTION_STRING);

export const connectToDb = async () => {
  console.log(CONNECTION_STRING);
  try {
    await client.connect();
    console.log("Connected to the database");
    return client;
  } catch (error) {
    console.error("Error connecting to the database", error);
    return null;
  }
};

export const getIsDatabaseConnected = async () => {
  try {
    await client.db("admin").command({ ping: 1 });
    return true;
  } catch (error) {
    console.error("Error pinging the database", error);
    return false;
  }
};

export const getDatabaseClient = () => {
  return client;
};
