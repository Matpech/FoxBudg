import type { JwtData } from "./users";

export {}

declare global {
    namespace Express {
        interface Request {
            user?: JwtData | null
        }
    }
}