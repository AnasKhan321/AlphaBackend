import express  from "express"
import http from "http"
import {Server}  from "socket.io"
import cors from "cors"
import {router }  from "./routes/user" ; 
import {socketrouter} from "./routes/sockets"   ; 
import {rooms}  from "./routes/sockets"
import { generateDownloadableUrl, UserService } from "./services/userservices";
import Redis from "ioredis"
require("dotenv").config()

const pub = new Redis(process.env.REDIS_URL  as string)
const sub = new Redis(process.env.REDIS_URL  as string)


const app = express() 
const PORT = process.env.PORT ?? 8000 ; 
app.use(cors())
app.use(express.json())

const httpServer = http.createServer(app)


const io = new Server(httpServer , {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
      }
})
sub.subscribe("message");
io.on("connection"  , (socket)=>{
    
    socket.on("message"  , async (data)=>{
        const roomIndex = rooms.findIndex(item=>item.roomid == data.roomid)


        if(roomIndex > -1 ){
            let croom = rooms[roomIndex]
            await pub.publish("message"  , JSON.stringify(data)); 
            croom.users.map((item)=>{
                io.to(item).emit("message:received"  , {data : data.message   , sender : data.sender})
            })
        }

    })
    socket.on("roomjoin"  , (data)=>{
        const room = rooms.findIndex(item => item.roomid == data.id)

        if(room > -1 ){
            let croom = rooms[room]
            croom.users.map((item)=>{
                io.to(item).emit("user:joined"  , {user : data.email})
            })
            if(!croom.users.includes(socket.id)){
                croom.users.push(socket.id)
                rooms[room]  = croom ; 
            }
            
        }

    })

    socket.on("file"  , async (data)=>{
        const url = await generateDownloadableUrl(data.file)
        const room = rooms.findIndex(item => item.roomid == data.roomid)
        
        let croom = rooms[room]
        if(room > -1 ){
            croom.users.map((item)=>{
                io.to(item).emit("file:received"  , {url  : url   , sender : data.sender})
            })
            
        }
    })
})

app.use("/api/auth"  , router)
app.use("/api/room"  , socketrouter)


httpServer.listen(PORT , ()=>{
    console.log(`server is lsistening on PORT ${PORT}`)
})




sub.on("message", async(channel, message) => {
    if(channel == "message"){

        const data = JSON.parse(message)
        await UserService.CreateMessage(data.message , data.roomid , data.sender)
    }

})