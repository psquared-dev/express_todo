import express from "express";
import Todo from "../models/TodoModel.js";

const todoRoutes = express.Router()

todoRoutes.get("/todos", async (req, res) => {
    try {
        const todos = await Todo.find({});
        res.json(todos);
    } catch (error) {
        res.json(error);
    }
});

todoRoutes.post("/todos", async (req, res) => {
    try {
        const newTodo = req.body;
        const todo = await Todo.create(newTodo);
        res.json(todo);
    } catch (error) {
        res.json(error);
    }
});

export default todoRoutes;