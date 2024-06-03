import { MongoClient } from "mongodb";

export const CONNECTION_STRING = `mongodb${
  process.env.DB_HOST === "localhost" ? "" : "+srv"
}://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${
  process.env.DB_NAME
}?authSource=${process.env.DB_NAME}&retryWrites=true&w=majority`;

const client = new MongoClient(CONNECTION_STRING);

export const connectToDb = async () => {
  console.log("Connecting to the database");
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
    await client.db(process.env.DB_NAME).command({ ping: 1 });
    return true;
  } catch (error) {
    console.error("Error pinging the database", error);
    return false;
  }
};

export const getDatabaseClient = () => {
  return client;
};

export const getDatabaseCollection = async (collectionName: string) => {
  const db = client.db(process.env.DB_NAME);
  return db.collection(collectionName);
};
