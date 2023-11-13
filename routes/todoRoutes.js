import express from "express";
import Todo from "../models/TodoModel.js";
import auth from "../middleware/auth.js";

const todoRoutes = express.Router();

todoRoutes.get("/todos", auth, async (req, res) => {
	try {
		const todos = await Todo.find({ owner: req.user._id });
		// console.log(todos);
		res.json(todos);
	} catch (error) {
		res.json(error.message);
	}
});

todoRoutes.get("/todos/:id", auth, async (req, res) => {
	try {
		const todo = await Todo.findOne({ _id: req.params.id, owner: req.user._id });
		// const todo = await Todo.findById(req.params.id);
		if (!todo) {
			return res.sendStatus(404);
		}
		res.json(todo);
	} catch (error) {
		res.status(500).json(error.message);
	}
});

todoRoutes.post("/todos", auth, async (req, res) => {
	const newTodo = new Todo({
		...req.body,
		owner: req.user._id,
	});

	try {
		await newTodo.save();
		res.status(201).json(newTodo);
	} catch (error) {
		res.json(error.message);
	}
});

todoRoutes.put("/todos/:id", auth, async (req, res) => {
	try {
		const update = req.body;

		// what fields can be updated?
		const updates = Object.keys(update);
		const allowedUpdates = ["text", "completed"];
		const isValidOperation = updates.every((u) => allowedUpdates.includes(u));

		if (!isValidOperation) {
			return res.status(400).json({ error: "Invalid Updates" });
		}

		const todo = await Todo.findOne({ _id: req.params.id, owner: req.user._id });

		if (!todo) {
			return res.sendStatus(404);
		}

		updates.forEach((u) => {
			todo[u] = req.body[u];
		});

		await todo.save();

		res.json(todo);
	} catch (error) {
		res.status(500).send(error);
	}
});

todoRoutes.delete("/todos/:id", auth, async (req, res) => {
	try {
		const todo = await Todo.findOneAndDelete({
			_id: req.params.id,
			owner: req.user._id,
		});
		// const todo = await Todo.findByIdAndDelete(req.params.id);

		if (!todo) {
			return res.sendStatus(404);
		}

		res.json(todo);
	} catch (error) {
		res.status(500).send(error);
	}
});

export default todoRoutes;
