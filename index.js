import * as dotenv from 'dotenv';
dotenv.config();
import {Configs} from "./configs";

import express from "express";
import {Server} from "socket.io";
import cors from "cors";
import http from "http";
import  * as auth from "./modules/auth";
// const auth = await import("./modules/auth");
import { addColors } from "winston/lib/winston/config/index.js";
import { db } from "./db/connections.js";


const app = express();
//ToDo: Make CORS more precious to endpoints, 

app.use(cors(Configs.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

db.init();
app.get('/', (req, res) => {
  
  res.send('Hello World!')
  
})
app.post('/', (req, res) => {
  console.log(req.headers);
  res.send('Hello World!')
  
})

const port = Configs.httpPort
app.post('/login' , (req, res, next) => {
  auth.signin(req, res, next);
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


const httpServer = http.Server(app);
httpServer.listen(Configs.socketPort);

const io = new Server(httpServer, {
    cors:  {
      origin: "http://localhost:3002",
      methods: ["GET", "POST"]
    },
  });
  io.engine.on("headers", (headers, request) => {
    console.log(headers);
    
  })
io.use((socket, next) => {
    // ToDo: understand why this is not working
    // auth.verifyToken(socket, next);
    // next();
    const req = socket.request;
    let token = req.headers["access-token"];
    console.log("....................")
    console.log(socket);
    console.log("..................")
    console.log(socket.handshake.headers.cookie);
    if (!token) {
      const error = new Error("not authorized");
      error.data = {"status":403, "message": "No token provided!"};
      next(error);
      // return res.status(403).send({ message: "No token provided!" });
      
    } 
    try { 
      const decoded = jwt.verify(token, Configs.secret);
      req.userId = decoded.id;
      console.log("userId");  
    } 
      catch (err) {
        const error = new Error("not authorized");
        error.data = {"status":401, "message": "Unauthorized!"};
        next(error);
      }
      
    
    next();
 
   
});

io.on('connection', function (socket) {
  socket.emit('greeting-from-server', {
      greeting: 'Hello Client'
  });
  socket.on('greeting-from-client', function (message) {
    console.log(message.body);
  });
});

