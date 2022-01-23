"use strict";
const messagesController = require("../controllers/messagesController");
const express = require("express");
const router = express.Router();

router.post("/", messagesController.newMessage);
router.get("/:conversationId", messagesController.getMessage);

module.exports = router;
