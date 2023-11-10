import mongoose from "mongoose";
import validator from "validator";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema({
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
});

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

// hash the plain text password
userSchema.pre("save", async function (next) {
	// this.password;
	console.log("before save");

	if (this.isModified("password")) {
		this.password = await bcryptjs.hash(this.password, 8);
	}

	next();
});

const User = mongoose.model("User", userSchema);

export default User;
