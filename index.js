const express = require("express");
const app = express();
const PORT = 8000;
const connectDB = require("./config/db")
connectDB();

app.use(express.json());

const userRoute = require("./routes/user")

app.use("/user", userRoute)

app.listen(PORT, () => {
    console.log(`Server started successfully at ${PORT}`);
})