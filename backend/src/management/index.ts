import bodyParser from "body-parser";
import { Router } from "express";
import { adminAuthMiddleware, AuthRequest } from "../helpers/jwtAuth";
import { getDatabaseCollection } from "../helpers/dbManager";
import { CASINO_STATUS_UPDATED, getSocket } from "../helpers/socketManager";

const router = Router();

router.use(adminAuthMiddleware);

export const getCasinoStatus = async () => {
  const collection = await getDatabaseCollection("casino");

  const casinoStatus = await collection.findOne({
    name: "statusInfo",
  });

  return casinoStatus;
};

router.get("/", async (req: AuthRequest, res) => {
  const statusData = await getCasinoStatus();
  res.status(200);
  res.send({ claims: req.claims, statusData });
});

router.post("/maintenance", async (req, res) => {
  console.log("Maintenance request", req.body);
  const collection = await getDatabaseCollection("casino");

  const newStatus = req.body.maintenance ? "maintenance" : "active";

  await collection.updateOne(
    {
      name: "statusInfo",
    },
    { $set: { status: newStatus } },
    { upsert: true }
  );

  const socket = getSocket();

  socket.emit(CASINO_STATUS_UPDATED, { status: newStatus });

  res.status(200);
  res.send("OK");
});

export default router;
