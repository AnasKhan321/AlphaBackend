import z from 'zod'


export const SignupSchema = z.object({
    email : z.string().email(), 
    name : z.string() , 
    imageurl : z.string() , 


})

