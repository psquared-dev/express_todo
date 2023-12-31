import express from "express";
import Todo from "../models/TodoModel.js";
import auth from "../middleware/auth.js";

const todoRoutes = express.Router();

todoRoutes.get("/todos", auth, async (req, res) => {
	try {
		const match = {};
		const sort = {};

		if (req.query.completed) {
			match.completed = req.query.completed === "true";
		}

		if (req.query.sortBy) {
			const parts = req.query.sortBy.split(":");
			sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
		}

		await req.user.populate({
			path: "todos",
			match,
			options: {
				limit: Number.parseInt(req.query.limit),
				skip: Number.parseInt(req.query.skip),
				sort,
			},
		});

		res.json(req.user.todos);
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
