import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

const auth = async (req, res, next) => {
	try {
		const token = req.header("Authorization").replace("Bearer ", "");
		const decoded = jwt.verify(token, "a_secret_key");
		const user = await User.findOne({ _id: decoded._id, "tokens.token": token });

		if (!user) {
			throw new Error("");
		}

		req.token = token;
		req.user = user;
		next();
	} catch (error) {
		return res.status(401).send({ error: "Please authenticate" });
	}
};

export default auth;
