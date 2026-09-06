import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import Express from "express"
import { errorHandler } from "./src/middlewares/errorHandler"
import { pool } from "./src/utils/db"
import { jwtMiddleware } from "./src/middlewares/jwtMiddleware"

import authRouter from "./src/routes/authRouter"
import reportRouter from "./src/routes/expenseReportsRouter"

const API_PORT = 4000
const app = Express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(jwtMiddleware)

app.get('/healthcheck', async (req, res) => {
    try {
        await pool.query("SELECT 1")
        return res.json({
            api: "OK",
            db: "OK",
            user: req.user
        })
    } catch (error) {
        return res.json({
            api: "OK",
            db: "ERROR",
            user: req.user,
            error
        })
    }
})

// Sub routers
app.use("/auth", authRouter)
app.use("/reports", reportRouter)

// Handle errors
app.use(errorHandler)

app.listen(API_PORT, () => {
    console.log(`API server is now running on :${API_PORT}`)
    if (process.env.NODE_ENV === "development") {
        console.log("Running in a dev environment: cookies wont be set to Secure")
    }
})