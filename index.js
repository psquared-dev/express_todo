import express from "express"
import connectDb from "./connectDb.js";
import todoRoutes from "./routes/todoRoutes.js";
import userRoutes from "./routes/userRoutes.js";


const app = express();
connectDb();

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(userRoutes);
app.use(todoRoutes);

app.get("/", (req, res) => {
    res.send("root");
})

const PORT = 3000;

app.listen(PORT, ()=> {
    console.log(`Server running on port ${PORT}`);
})