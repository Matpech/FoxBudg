import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import Express from "express"
import { errorHandler } from "./src/middlewares/errorHandler"
import { pool } from "./src/utils/db"

const API_PORT = 4000
const app = Express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())
//TODO: Implement JWT middleware

app.get('/healthcheck', async (req, res) => {
    try {
        await pool.query("SELECT 1")
        return res.json({
            api: "OK",
            db: "OK"
        })
    } catch (error) {
        return res.json({
            api: "OK",
            db: "ERROR",
            error
        })
    }
})

// Handle errors
app.use(errorHandler)

app.listen(API_PORT, () => {
    console.log(`API server is now running on :${API_PORT}`)
})