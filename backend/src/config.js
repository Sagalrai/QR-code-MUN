import dotenv from "dotenv";
import path from "node:path";

const projectRoot = process.cwd();
const envPath = path.resolve(projectRoot, ".env");
dotenv.config({ path: envPath });

const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
const isProduction = Boolean(process.env.VERCEL || process.env.NODE_ENV === "production");

function requireEnv(name, fallback) {
    const value = process.env[name] || fallback;
    if (isProduction && !value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

export const config = {
    port: Number(process.env.PORT || 4000),
    appUrl: requireEnv("APP_URL", vercelUrl || "http://localhost:5173"),
    jwtSecret: requireEnv("JWT_SECRET", "supersecretdevelopmentjwtkey"),
    corsOrigin: requireEnv("CORS_ORIGIN", vercelUrl || "http://localhost:5173"),
    databaseUrl: requireEnv("DATABASE_URL", "mysql://appuser:apppass@127.0.0.1:3306/event_volunteer_db"),
    adminUsername: requireEnv("ADMIN_USERNAME", "admin"),
    adminPassword: requireEnv("ADMIN_PASSWORD", "12345678"),
};
