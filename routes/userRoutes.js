import express from "express";
import User from "../models/UserModel.js";

const userRoutes = express.Router()

userRoutes.get("/users", async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.json(error);
    }
});

userRoutes.post("/users", async (req, res) => {
    try {
        const newUser = req.body;
        const todo = await User.create(newUser);
        res.json(todo);
    } catch (error) {
        res.json(error);
    }
});

export default userRoutes;