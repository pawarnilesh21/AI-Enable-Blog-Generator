import fs from 'fs'
import imagekit from '../configs/imageKit.js'
import Blog from '../models/Blog.js'
import main from '../configs/gemini.js'
import Comment from '../models/Comment.js'
export const addBlog=async (req,res)=>{
    try {
        const {title,subTitle,description,category, isPublished} =JSON.parse(req.body.blog)
        const imageFile=req.file

        //Check if All fields are present
        if(!title || !description || !category || !imageFile){
            return res.json({success:false, message:"Missing Required Fields"})
        }
        
        //Upload Image to ImageKit
        const fileBuffer=fs.readFileSync(imageFile.path)
        const response=await imagekit.upload({
            file:fileBuffer,
            fileName:imageFile.originalname,
            folder:'/blogs'
        })

        //Optimize through imageKit URL transformation 
        const optimizeImageUrl=imagekit.url({
            path:response.filePath,
            transformation:[
                {quality:'auto'}, //AutoCompression
                {format:'webp'},    //Convert to Modern format
                {width:'1280'}      // Width Resizing 
            ]
        })

        const image=optimizeImageUrl

        await Blog.create({title,subTitle,description,category,image,isPublished})
        res.json({success:true,message:"Blog added Successfully"})
    } catch (error) {
        res.json({
            success:false,
            message:"Failed to add blog",
            errors:error
        })
    }
}


export const getAllBlogs=async (req,res)=>{
    try {
        const blogs=await Blog.find({isPublished:true})
        res.json({success:true,blogs})

    } catch (error) {
        res.json({success:false,message:error.message})

    }
}

export const getBlogById=async(req,res)=>{
    try {
        const {blogId}=req.params
        const blog=await Blog.findById(blogId)
        if(!blog){
            return res.json({success:false,message:"Blog Not Found"})
        }
        res.json({success: true,blog})
    } catch (error) {
         res.json({success:false,message:error.message})
    }
}

export const deleteBlogById=async(req,res)=>{
    try {
        const {id}=req.body
        await Blog.findByIdAndDelete(id)

        //delete All Comments Associated with the blog
        await Comment.deleteMany({blog:id})
        res.json({success: true,message:"blog deleted"})
    } catch (error) {
         res.json({success:false,message:error.message})
    }
}

export const togglePublished=async(req,res)=>{
    try {
        const {id}=req.body
        const blog=await Blog.findById(id)
        blog.isPublished=!blog.isPublished
        await blog.save()
        res.json({success:true,message:"Blog Status Updated"})
    } catch (error) {
         res.json({success:false,message:error.message})
    }
}

export const addComment=async (req,res)=>{
    try {
        const {blog,name,content}=req.body
        await Comment.create({blog,name,content})
        res.json({success:false,message:"Comment Added for Review"})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}


export const getBlogComments=async (req,res)=>{
    try {
        const {blogId}=req.body

        const comments=await Comment.find({blog:blogId,isApproved:true}).sort({createdAt: -1})
        res.json({success:true,comments})
    } catch (error) {
        res.json({success:false,message:error.message})

    }
}

export const generateContent =async (req,res)=>{
    try {
        const {prompt}=req.body
       const content= await main(prompt +"Generate a blog content for this topic in simple text format")
        res.json({success :true,content})

    } catch (error) {
        res.json({success:false,message:error.message})
    }
}