import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        validate(value){
            if(value.includes("zzz")){
                throw new Error("not allowed zzz");
            }
        },
        trim: true,
    },
    completed: {
        type: Boolean,
        default: false,
        trim: true
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});

const Todo = mongoose.model("Todo", todoSchema);

export default Todo;