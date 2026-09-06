import type { JwtData } from "./security";

export {}

declare global {
    namespace Express {
        interface Request {
            user?: JwtData | null
        }
    }
}