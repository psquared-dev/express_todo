import express from "express";
import User from "../models/UserModel.js";
import auth from "../middleware/auth.js";
import multer from "multer";
import sharp from "sharp";

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

const upload = multer({
	limits: {
		fileSize: 1_000_000,
	},
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
			cb(new Error("Please upload an image"));
		}

		cb(undefined, true);
	},
});

userRoutes.post(
	"/users/me/avatar",
	auth,
	upload.single("upload"),
	async (req, res) => {
		const buffer = await sharp(req.file.buffer)
			.resize({
				width: 250,
				height: 250,
			})
			.png()
			.toBuffer();
		req.user.avatar = buffer;
		await req.user.save();
		res.send("");
	},
	(error, req, res, next) => {
		res.status(400).json(error.message);
	}
);

userRoutes.delete("/users/me/avatar", auth, async (req, res) => {
	req.user.avatar = undefined;
	req.user.save();
	res.send();
});

userRoutes.get("/users/:id/avatar", async (req, res) => {
	try {
		console.log(req.params.id);
		const user = await User.findById(req.params.id);

		if (!user || !user.avatar) {
			throw new Error("");
		}

		res.set("content-type", "image/png");
		res.send(user.avatar);
	} catch (error) {
		res.sendStatus(404);
	}
});

export default userRoutes;
