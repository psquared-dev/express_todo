import mongoose from "mongoose";
import validator from "validator";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import Todo from "./TodoModel.js";

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			require: true,
			trim: true,
		},
		email: {
			type: String,
			require: true,
			unique: true,
			trim: true,
			lowercase: true,
			validate(value) {
				if (!validator.isEmail(value)) {
					throw new Error("Invalid Email");
				}
			},
		},
		password: {
			type: String,
			required: true,
			trim: true,
			minlength: 5,
			validate(value) {
				if (value.toLowerCase().includes("password")) {
					throw new Error(`Password Can't contain "password"`);
				}
			},
		},
		tokens: [
			{
				token: {
					type: String,
					required: true,
				},
			},
		],
		avatar: {
			type: Buffer,
		},
	},
	{
		timestamps: true,
	}
);

userSchema.statics.findByCredentials = async function (email, password) {
	const user = await User.findOne({ email });

	if (!user) {
		throw new Error("Unable to login");
	}

	const isMatch = await bcryptjs.compare(password, user.password);

	if (!isMatch) {
		throw new Error("Unable to login");
	}

	return user;
};

userSchema.virtual("todos", {
	ref: "Todo",
	localField: "_id",
	foreignField: "owner",
});

// accessed by model instance
userSchema.methods.generateAuthToken = async function () {
	// this;
	const token = jwt.sign({ _id: this._id.toString() }, "a_secret_key");
	this.tokens = this.tokens.concat({ token });
	await this.save();

	return token;
};

userSchema.methods.toJSON = function () {
	const userObject = this.toObject();

	delete userObject.password;
	delete userObject.tokens;

	// console.log({ userObject });
	return userObject;
};

// delete task associated with the user
userSchema.pre(
	"deleteOne",
	{ document: true, query: false },
	async function (next) {
		const user = this;
		await Todo.deleteMany({ owner: user._id });
		next();
	}
);

// accessed by model class
// hash the plain text password
userSchema.pre("save", async function (next) {
	// this.password;

	if (this.isModified("password")) {
		this.password = await bcryptjs.hash(this.password, 8);
	}

	next();
});

const User = mongoose.model("User", userSchema);

export default User;
