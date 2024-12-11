import {Router }  from "express"
import {SignupSchema}  from "../utils/types.ts"
import {UserService} from "../services/userservices.ts"
import { tryCatch } from "bullmq";

export const router = Router() ; 


router.post("/signup"  ,async (req , res)=>{
    try {
        const parsedData = SignupSchema.safeParse(req.body)

        if(!parsedData){
            res.status(400).json({message : "validation failed"})
        }
        await UserService.createUser(parsedData.data.name , parsedData.data.email , parsedData.data.imageurl)
    
        res.json({success : true})
        
    } catch (error) {
        res.json({success : false })
    }

})

router.get("/user/:email"  , async(req,res)=>{
    try {
        const email  = req.params.email ; 
        const data = await UserService.getUserwithEmail(email)
        if(!data){
           return  res.json({success : false })
        }
        res.json({success : true}) 
    } catch (error) {
        res.json({success : false })
    }

})

router.get("/users"  , async(req,res)=>{
    try {
        const data = await UserService.GetAlluser() ; 
        return res.json({users : data})
        
    } catch (error) {
        return res.json({success : false})
    }
})

router.delete("/users/:id"  , async(req,res)=>{
    try {
        const id = req.params.id ; 
        await UserService.DeleteUser(id)

        return res.json({success : true})
    } catch (error) {
        return res.json({success : false})
    }
})

router.patch("/users"  , async(req,res)=>{
    try {
        const {email , value} = req.body  ; 
        await UserService.updateUser(value  , email)

        return res.json({success : true})
    } catch (error) {
        return res.status(500).json({success : false})
    }
})


router.post("/uploadImage"  , async(req,res)=>{
    try {
        const {imageName , imageType , email}  = req.body
        const checkisrestricted = await UserService.getUserwithEmail(email)

        if(checkisrestricted.isRestricted){
            return res.json({success : false , message : "You are restricted"})
        }
        const url = await UserService.SignedUrl(imageName , imageType)
        return res.json({url : url  , success : true})
    } catch (error) {
        return res.status(500).json({success : false  , message : "something went wrong"})
    }
})