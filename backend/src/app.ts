import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import csurf from 'csurf'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import { DB_ADDRESS } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'
import { limiter, authLimiter } from './middlewares/rate-limit';

const { PORT = 3000 } = process.env
const app = express()


app.use(cookieParser())

app.use(cors({ 
    origin: process.env.ORIGIN_ALLOW, 
    credentials: true 
}));

app.use(urlencoded({ extended: true }))
app.use(json())
app.use(serveStatic(path.join(__dirname, 'public')))
// app.use(express.static(path.join(__dirname, 'public')));

app.options('*', cors())
app.use(routes)

const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
})

app.use((req, res, next) => {
  const isAuthPath = req.path.startsWith('/auth/');
  const isModifyingMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  
  if (isModifyingMethod && !isAuthPath) {
    return csrfProtection(req, res, next);
  }
  next();
});

app.use(limiter);
app.use('/auth', authLimiter);
app.use(errors())
app.use(errorHandler)

// eslint-disable-next-line no-console

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(3000, '0.0.0.0', () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
