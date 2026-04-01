import express, { Application } from 'express'
import cors from 'cors'
import compression from 'compression'
import 'express-async-errors'
import { env } from './config/env'
import { errorHandler } from './middleware/errorHandler'
import { httpLogger } from './middleware/logger'
import { systemRouter } from './modules/system'
import { authRouter } from './modules/auth'
import { customerRouter } from './modules/customer'
import { statsRouter } from './modules/stats'

export const createApp = (): Application => {
  const app = express()

  // HTTP request logging
  app.use(httpLogger)

  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN,
      credentials: env.CORS_ORIGIN !== '*',
    })
  )

  // Body parsing and compression
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(compression())

  // API routes - System & Health
  app.use(env.API_PREFIX, systemRouter)

  // 认证路由
  app.use(`${env.API_PREFIX}/auth`, authRouter)

  // 客户路由
  app.use(`${env.API_PREFIX}/customers`, customerRouter)

  // 统计路由
  app.use(`${env.API_PREFIX}/stats`, statsRouter)

  // Error handling
  app.use(errorHandler)

  return app
}
