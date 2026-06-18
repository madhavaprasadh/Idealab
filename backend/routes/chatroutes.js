import express from "express"

import {chat} from "../controller/chat-controller.js"

const chatrouter=express.Router()

chatrouter.post("/",chat)

export default chatrouter