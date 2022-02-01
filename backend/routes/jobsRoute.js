"use strict";
const jobsController = require("../controllers/jobsController");
const express = require("express");
const router = express.Router();

router.post("/", jobsController.newJob);
router.get("/:userId", jobsController.getJobs);
router.patch("/:id", jobsController.patchJobs);

module.exports = router;
