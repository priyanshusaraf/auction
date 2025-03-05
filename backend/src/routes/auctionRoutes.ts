const express = require("express");
import { placeBid, getAuctionStatus } from "../controllers/auctionController";

const router = express.Router();

router.post("/bid", placeBid);
router.get("/status", getAuctionStatus);

export default router;
