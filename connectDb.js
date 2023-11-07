import mongoose from "mongoose"

async function connectDb() {
    try {
        const conn = mongoose.connect("mongodb://0.0.0.0:27017/todos");
        console.log("Connected to DB");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

export default connectDb;
