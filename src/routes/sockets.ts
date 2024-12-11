import {Router   , Request , Response}  from 'express'
import {v4 as uuidv4} from 'uuid';


interface Room {
    adminEmail : string , 
    users : [] , 
    roomid : string
}

export const rooms  : Room[]  = []

export const socketrouter = Router()


socketrouter.get("/rooms/:id"  , (req  : Request,res  : Response)=>{
    try {
        const id = req.params.id ; 
        const ind = rooms.findIndex(item=> item.roomid == id)
        if(ind > -1){
            return res.json({exsists : true})
        }
        return res.json({exsists : false})
        
    } catch (error) {
        return res.status(500).json({exsists : false})
    }
})

socketrouter.post("/createroom"  , (req,res)=>{
    try {
        let myuuid = uuidv4();
        const {email  }  = req.body ; 
        rooms.push({adminEmail : email , roomid : myuuid  , users : []})

        return  res.json({id : myuuid})

        
    } catch (error) {
        return res.status(500).json({success : false})
    }
})

