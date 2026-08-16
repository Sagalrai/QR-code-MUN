import dotenv from "dotenv";
import path from "node:path";

const projectRoot = process.cwd();
const envPath = path.resolve(projectRoot, ".env");
dotenv.config({ path: envPath });

const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;

export const config = {
    port: Number(process.env.PORT || 4000),
    appUrl: process.env.APP_URL || vercelUrl || "http://localhost:5173",
    jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
    corsOrigin: process.env.CORS_ORIGIN || vercelUrl || "http://localhost:5173",
    databaseUrl: process.env.DATABASE_URL || "mysql://appuser:apppass@127.0.0.1:3306/event_volunteer_db",
    adminUsername: process.env.ADMIN_USERNAME || "admin",
    adminPassword: process.env.ADMIN_PASSWORD || "12345678",
};
