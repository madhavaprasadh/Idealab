import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import chatrouter from "./routes/chatroutes.js"
const result = dotenv.config();

console.log(result);
console.log(process.env.AI_SERVER);
const app=express()

app.use(cors())

app.use(express.json())

app.use("/api/chat",chatrouter)

app.listen(process.env.PORT,()=>{
    console.log(`Server running on port ${process.env.PORT}`)
})