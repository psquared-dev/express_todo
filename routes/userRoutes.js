import express from "express";
import User from "../models/UserModel.js";

const userRoutes = express.Router();

userRoutes.post("/users/login", async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password);
		res.json(user);
	} catch (error) {
		res.status(400).json(error.message);
	}
});

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
		res.status(400).json(error.message);
	}
});

userRoutes.get("/users/:id", async (req, res) => {
	try {
		const user = await User.findById(req.params.id);

		if (!user) {
			return res.sendStatus(404);
		}

		return res.json(user);
	} catch (error) {
		return res.json(error);
	}
});

userRoutes.put("/users/:id", async (req, res) => {
	try {
		const update = req.body;
		console.log(update);

		const updates = Object.keys(update);
		const allowedUpdates = ["username", "email", "password"];
		const isValidOperation = updates.every((u) => allowedUpdates.includes(u));

		if (!isValidOperation) {
			return res.status(400).json({ error: "Invalid Updates" });
		}

		const user = await User.findById(req.params.id);

		updates.forEach((update) => {
			user[update] = req.body[update];
		});

		await user.save();

		// const user = await User.findByIdAndUpdate(req.params.id, update, {
		// 	new: true,
		// 	runValidators: true,
		// });

		if (!user) {
			return res.sendStatus(404);
		}

		return res.json(user);
	} catch (error) {
		return res.json(error.message);
	}
});

userRoutes.delete("/users/:id", async (req, res) => {
	try {
		const user = await User.findByIdAndDelete(req.params.id);

		if (!user) {
			return res.sendStatus(404);
		}

		return res.json(user);
	} catch (error) {
		return res.status(500).json(error);
	}
});

export default userRoutes;
