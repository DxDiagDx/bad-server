import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import { DB_ADDRESS } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'
import { limiter, authLimiter } from './middlewares/rate-limit'
import { setCSRFToken, verifyCSRFToken } from './middlewares/csrf'

const { PORT = 3000 } = process.env
const app = express()

app.use(limiter)
app.use('/auth', authLimiter)

app.use(cookieParser())

app.use(cors({ 
    origin: process.env.ORIGIN_ALLOW, 
    credentials: true 
}));

app.use(urlencoded({ extended: true }))
app.use(json())

app.use(setCSRFToken)
app.use(verifyCSRFToken)

app.use(serveStatic(path.join(__dirname, 'public')))
app.options('*', cors())
app.use(routes)
app.use(errors())
app.use(errorHandler)

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        const port = Number(PORT) || 3000;
        await app.listen(port, '0.0.0.0', () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
