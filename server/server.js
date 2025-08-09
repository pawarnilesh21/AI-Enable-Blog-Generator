import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import connectDB from './configs/db.js'
import adminRouter from './routes/adminRoutes.js'
import blogRouter from './routes/blogRoutes.js'


const app=express()
await connectDB()

//MiddleWare

app.use(cors())
app.use(express.json())

const PORT=process.env.PORT || 3000


//Routes
app.get('/',(req,res)=>{
    res.send('API Is Working')
})
app.use('/api/admin',adminRouter)
app.use('/api/blog',blogRouter)

app.listen(PORT,()=>{console.log('Server is listen on Port 3000')})


export default app;

