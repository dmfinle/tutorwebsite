"use strict";
const conversationsController = require("../controllers/conversationsController");
const express = require("express");
const router = express.Router();

router.post("/", conversationsController.newConvo);

router.get("/:userId", conversationsController.getConvo);

module.exports = router;
