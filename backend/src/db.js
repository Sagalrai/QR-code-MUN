import { PrismaClient } from "@prisma/client";
import { config } from "./config.js";

const globalForPrisma = globalThis;

const prisma =
    globalForPrisma.__prisma ??
    new PrismaClient({
        datasources: {
            db: { url: config.databaseUrl },
        },
    });

if (!globalForPrisma.__prisma) {
    globalForPrisma.__prisma = prisma;
}

export default prisma;
