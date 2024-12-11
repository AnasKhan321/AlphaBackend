import {prismaClient}  from "../client/prismaClient.ts"
import { S3Client, PutObjectCommand   , GetObjectCommand  } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
require("dotenv").config()

const client = new S3Client({
    region:  process.env.AWS_REGION as string ,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID  ,
        secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET
    }
})



const bucket = "hls.anaskhan" 

export class UserService{

        public static  async createUser(name : string , email : string , imageurl  : string){
            await prismaClient.user.create({
                data : {
                    name , 
                    email , 
                    imageurl
                }
            })
        }

        public static async getUserwithEmail(email : string){
            const user = await prismaClient.user.findUnique({
                where : {
                    email : email
                }
            })
            return user ; 
        }

        public static async CreateMessage(message : string , roomid : string   , sender : string){
            const umessage = await prismaClient.message.create({
                data : {
                    roomid     : roomid,
                    message    : message, 
                    sender      : sender 
                }
            })
            return umessage ; 
        }

        public static async GetAlluser(){
            const users = await prismaClient.user.findMany()
            return users ; 
        }

        public static async DeleteUser(userId : string){
            const deluser = await prismaClient.user.delete({
                where : {
                    id : userId
                }
            })
            return deluser
        }

        public static async updateUser(isRestrictd : boolean  , email : string){
            const updateUser = await prismaClient.user.update({
                where: {
                  email: email ,
                },
                data: {
                    isRestricted: isRestrictd,
                },
              })
            return updateUser
        }


        public static async  SignedUrl (imageName : string , imageType : string){
            const command = new PutObjectCommand({
                Bucket: bucket,
                Key: `uploads/${imageName}`, // Use the name directly without appending the extension
                ContentType: imageType, // Specify the content type
            });
            const signedUrl  = await getSignedUrl(client , command , { expiresIn: 900 })
    
            return signedUrl ; 
        }



}




export const generateDownloadableUrl = async (url : string) => {
    try {
      const parsedUrl = new URL(url);
      let  key = decodeURIComponent(parsedUrl.pathname.slice(1));
      key = key.replace("hls.anaskhan/", "")
      const command = new GetObjectCommand({
        Bucket: "hls.anaskhan",
        Key: key,
        ResponseContentDisposition: "attachment", 
      });
  
      const signedUrl = await getSignedUrl(client, command, { expiresIn: 60 * 10 });
  
      return signedUrl; 
    } catch (error : any) {
      console.error("Error generating pre-signed URL:", error.message);
      throw error;
    }
};