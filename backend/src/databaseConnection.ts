import { MongoClient } from "mongodb";

// export const CONNECTION_STRING = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

export const CONNECTION_STRING = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/?retryWrites=true&w=majority&appName=casino-cluster-dev`;

// console.log(CONNECTION_STRING);
const client = new MongoClient(CONNECTION_STRING);

export const connectToDb = async () => {
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
