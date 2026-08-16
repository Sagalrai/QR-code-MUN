import dotenv from "dotenv";

dotenv.config();

export const config = {
    port: Number(process.env.PORT || 4000),
    appUrl: process.env.APP_URL || "http://localhost:5173",
    jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
    databaseUrl: process.env.DATABASE_URL || "mysql://appuser:apppass@localhost:3306/event_volunteer_db",
    adminUsername: process.env.ADMIN_USERNAME || "admin",
    adminPassword: process.env.ADMIN_PASSWORD || "admin123",
};
