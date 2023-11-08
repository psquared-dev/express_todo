import express from "express";
import Todo from "../models/TodoModel.js";

const todoRoutes = express.Router();

todoRoutes.get("/todos", async (req, res) => {
	try {
		const todos = await Todo.find({});
		res.json(todos);
	} catch (error) {
		res.json(error);
	}
});

todoRoutes.get("/todos/:id", async (req, res) => {
	try {
		const todo = await Todo.findById(req.params.id);
		if (!todo) {
			return res.sendStatus(404);
		}
		res.json(todo);
	} catch (error) {
		res.status(500).json(error);
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

todoRoutes.put("/todos/:id", async (req, res) => {
	try {
		const update = req.body;

		// what fields can be updated?
		const updates = Object.keys(update);
		const allowedUpdates = ["text", "completed"];
		const isValidOperation = updates.every((u) => allowedUpdates.includes(u));

		if (!isValidOperation) {
			return res.status(400).json({ error: "Invalid Updates" });
		}

		const todo = await Todo.findByIdAndUpdate(req.params.id, update, {
			new: true,
			runValidators: true,
		});
		if (!todo) {
			return res.sendStatus(404);
		}

		res.json(todo);
	} catch (error) {
		res.status(500).send(error);
	}
});

todoRoutes.delete("/todos/:id", async (req, res) => {
	try {
		const todo = await Todo.findByIdAndDelete(req.params.id);
		if (!todo) {
			return res.sendStatus(404);
		}

		res.json(todo);
	} catch (error) {
		res.status(500).send(error);
	}
});

export default todoRoutes;
