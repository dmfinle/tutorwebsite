"use strict";
import { getUsers, getUserById } from "../controllers/userController.js";
import express from "express";
const router = express.Router();

//express router method to create route for getting all users
router.get("/", getUsers);

//get users by id
router.get("/:id", getUserById);

export default router;
