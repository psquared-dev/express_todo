import express from "express";
import User from "../models/UserModel.js";
import auth from "../middleware/auth.js";

const userRoutes = express.Router();

userRoutes.post("/users/login", async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password);
		const token = await user.generateAuthToken();
		res.json({ user, token });
	} catch (error) {
		res.status(400).json(error.message);
	}
});

userRoutes.post("/users/logout", auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter((token) => {
			return token.token !== req.token;
		});
		await req.user.save();
		res.json();
	} catch (error) {
		res.status(500).json();
	}
});

userRoutes.post("/users/logoutAll", auth, async (req, res) => {
	try {
		req.user.tokens = [];
		await req.user.save();
		res.json();
	} catch (error) {
		res.status(500).json(error.message);
	}
});

userRoutes.get("/users/me", auth, async (req, res) => {
	res.json(req.user);
});

userRoutes.post("/users", async (req, res) => {
	try {
		const newUser = await User.create(req.body);
		const token = await newUser.generateAuthToken();
		res.status(201).json({ newUser, token });
	} catch (error) {
		res.status(400).json(error.message);
	}
});

// userRoutes.get("/users/:id", async (req, res) => {
// 	try {
// 		const user = await User.findById(req.params.id);

// 		if (!user) {
// 			return res.sendStatus(404);
// 		}

// 		return res.json(user);
// 	} catch (error) {
// 		return res.json(error);
// 	}
// });

userRoutes.put("/users/me", auth, async (req, res) => {
	try {
		const update = req.body;

		const updates = Object.keys(update);
		const allowedUpdates = ["username", "email", "password"];
		const isValidOperation = updates.every((u) => allowedUpdates.includes(u));

		if (!isValidOperation) {
			return res.status(400).json({ error: "Invalid Updates" });
		}

		// const user = await User.findById(req.params.id);

		updates.forEach((update) => {
			req.user[update] = req.body[update];
		});

		await req.user.save();

		return res.json(req.user);
	} catch (error) {
		return res.json(error.message);
	}
});

userRoutes.delete("/users/me", auth, async (req, res) => {
	try {
		await req.user.deleteOne();
		return res.json(req.user);
	} catch (error) {
		return res.status(500).json(error.message);
	}
});

export default userRoutes;
