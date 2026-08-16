import cors from "cors";
import express from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { config } from "./config.js";
import prisma from "./db.js";
import { authenticateToken } from "./middleware/auth.js";
import { comparePassword, hashPassword } from "./services/password.js";
import { generateVolunteerQrCode } from "./utils/qr.js";

const app = express();
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: "2mb" }));

const publicVolunteerFields = {
    id: true,
    volunteerId: true,
    name: true,
    photo: true,
    role: true,
    team: true,
    status: true,
    createdAt: true,
};

function handleValidationError(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Validation failed",
            errors: errors.array().map(error => ({
                field: error.path,
                msg: error.msg,
            })),
        });
    }
    return null;
}

function generateVolunteerNumber() {
    return "VOL-" + Math.random().toString().slice(2, 8).padStart(4, "0");
}

function makeVolunteerId() {
    const serial = Date.now().toString().slice(-6);
    return `VOL-${serial.padStart(4, "0")}`;
}

async function generateUniqueVolunteerId() {
    let volunteerId = makeVolunteerId();
    while (await prisma.volunteer.findUnique({ where: { volunteerId } })) {
        volunteerId = makeVolunteerId();
    }
    return volunteerId;
}

app.get("/health", async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ ok: true, status: "healthy" });
    } catch (error) {
        res.status(500).json({ ok: false, message: "Database connection failed", details: error.message });
    }
});

app.post(
    "/api/auth/login",
    [
        body("username").notEmpty().withMessage("Username is required"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    async (req, res) => {
        const validation = handleValidationError(req, res);
        if (validation) return validation;

        const { username, password } = req.body;

        try {
            const admin = await prisma.adminUser.findUnique({ where: { username } });
            if (!admin) {
                return res.status(401).json({ message: "Invalid username or password" });
            }

            const isValid = await comparePassword(password, admin.password);
            if (!isValid) {
                return res.status(401).json({ message: "Invalid username or password" });
            }

            const token = jwt.sign({ id: admin.id, username: admin.username }, config.jwtSecret, { expiresIn: "8h" });
            return res.json({ token, user: { id: admin.id, username: admin.username } });
        } catch (error) {
            return res.status(500).json({ message: "Login failed", details: error.message });
        }
    },
);

app.get("/api/volunteers", authenticateToken, async (req, res) => {
    try {
        const volunteers = await prisma.volunteer.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                volunteerId: true,
                name: true,
                photo: true,
                phone: true,
                email: true,
                role: true,
                team: true,
                status: true,
                qrCode: true,
                createdAt: true,
            },
        });
        res.json(volunteers);
    } catch (error) {
        res.status(500).json({ message: "Unable to fetch volunteers", details: error.message });
    }
});

app.post(
    "/api/volunteers",
    authenticateToken,
    [
        body("name").trim().notEmpty().withMessage("Name is required"),
        body("phone").optional({ values: "falsy" }).isString(),
        body("email").optional({ values: "falsy" }).isEmail().withMessage("Email must be valid"),
        body("role").optional({ values: "falsy" }).isString(),
        body("team").optional({ values: "falsy" }).isString(),
        body("status")
            .optional()
            .isIn(["ACTIVE", "INACTIVE", "SUSPENDED"])
            .withMessage("Status must be ACTIVE, INACTIVE, or SUSPENDED"),
    ],
    async (req, res) => {
        const validation = handleValidationError(req, res);
        if (validation) return validation;

        try {
            const volunteerId = await generateUniqueVolunteerId();
            const qrUrl = `${config.appUrl}/v/${volunteerId}`;
            const qrCode = await generateVolunteerQrCode(qrUrl);

            const volunteer = await prisma.volunteer.create({
                data: {
                    volunteerId,
                    name: req.body.name,
                    photo: req.body.photo || null,
                    phone: req.body.phone || null,
                    email: req.body.email || null,
                    role: req.body.role || null,
                    team: req.body.team || null,
                    status: req.body.status || "ACTIVE",
                    qrCode,
                },
            });

            res.status(201).json(volunteer);
        } catch (error) {
            res.status(500).json({ message: "Unable to create volunteer", details: error.message });
        }
    },
);

app.get("/api/volunteers/:volunteerId", authenticateToken, async (req, res) => {
    const { volunteerId } = req.params;
    if (!/^VOL-\d{4,}$/.test(volunteerId)) {
        return res.status(400).json({ message: "Invalid volunteer ID format" });
    }

    try {
        const volunteer = await prisma.volunteer.findUnique({ where: { volunteerId } });
        if (!volunteer) {
            return res.status(404).json({ message: "Volunteer not found" });
        }
        return res.json(volunteer);
    } catch (error) {
        return res.status(500).json({ message: "Unable to fetch volunteer", details: error.message });
    }
});

app.put(
    "/api/volunteers/:volunteerId",
    authenticateToken,
    [
        body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
        body("email").optional({ values: "falsy" }).isEmail().withMessage("Email must be valid"),
        body("status")
            .optional()
            .isIn(["ACTIVE", "INACTIVE", "SUSPENDED"])
            .withMessage("Status must be ACTIVE, INACTIVE, or SUSPENDED"),
    ],
    async (req, res) => {
        const validation = handleValidationError(req, res);
        if (validation) return validation;

        const { volunteerId } = req.params;

        try {
            const existing = await prisma.volunteer.findUnique({ where: { volunteerId } });
            if (!existing) {
                return res.status(404).json({ message: "Volunteer not found" });
            }

            const updated = await prisma.volunteer.update({
                where: { volunteerId },
                data: {
                    name: req.body.name ?? existing.name,
                    photo: req.body.photo ?? existing.photo,
                    phone: req.body.phone ?? existing.phone,
                    email: req.body.email ?? existing.email,
                    role: req.body.role ?? existing.role,
                    team: req.body.team ?? existing.team,
                    status: req.body.status ?? existing.status,
                },
            });

            return res.json(updated);
        } catch (error) {
            return res.status(500).json({ message: "Unable to update volunteer", details: error.message });
        }
    },
);

app.patch("/api/volunteers/:volunteerId/status", authenticateToken, async (req, res) => {
    const { volunteerId } = req.params;
    const { status } = req.body;

    if (!["ACTIVE", "INACTIVE", "SUSPENDED"].includes(status)) {
        return res.status(400).json({ message: "Status must be ACTIVE, INACTIVE, or SUSPENDED" });
    }

    try {
        const volunteer = await prisma.volunteer.findUnique({ where: { volunteerId } });
        if (!volunteer) {
            return res.status(404).json({ message: "Volunteer not found" });
        }

        const updated = await prisma.volunteer.update({
            where: { volunteerId },
            data: { status },
        });

        return res.json(updated);
    } catch (error) {
        return res.status(500).json({ message: "Unable to update volunteer status", details: error.message });
    }
});

app.delete("/api/volunteers/:volunteerId", authenticateToken, async (req, res) => {
    const { volunteerId } = req.params;

    try {
        const existing = await prisma.volunteer.findUnique({ where: { volunteerId } });
        if (!existing) {
            return res.status(404).json({ message: "Volunteer not found" });
        }

        await prisma.volunteer.delete({ where: { volunteerId } });
        return res.json({ message: "Volunteer deleted", volunteerId });
    } catch (error) {
        return res.status(500).json({ message: "Unable to delete volunteer", details: error.message });
    }
});

app.get("/api/public/volunteers/:volunteerId", async (req, res) => {
    const { volunteerId } = req.params;
    if (!/^VOL-\d{4,}$/.test(volunteerId)) {
        return res.status(400).json({ message: "Invalid volunteer ID format" });
    }

    try {
        const volunteer = await prisma.volunteer.findUnique({
            where: { volunteerId },
            select: publicVolunteerFields,
        });

        if (!volunteer) {
            return res.status(404).json({ message: "Volunteer not found" });
        }

        if (volunteer.status !== "ACTIVE") {
            return res.status(403).json({ message: `Volunteer profile is ${volunteer.status.toLowerCase()}` });
        }

        return res.json(volunteer);
    } catch (error) {
        return res.status(500).json({ message: "Unable to fetch public profile", details: error.message });
    }
});

app.get("/v/:volunteerId", async (req, res) => {
    const { volunteerId } = req.params;

    try {
        const volunteer = await prisma.volunteer.findUnique({
            where: { volunteerId },
            select: {
                ...publicVolunteerFields,
                phone: true,
                email: true,
            },
        });

        if (!volunteer) {
            return res.status(404).json({ message: "Volunteer not found" });
        }

        if (volunteer.status !== "ACTIVE") {
            return res.status(403).json({ message: `Volunteer profile is ${volunteer.status.toLowerCase()}` });
        }

        return res.json(volunteer);
    } catch (error) {
        return res.status(500).json({ message: "Unable to load profile", details: error.message });
    }
});

app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.originalUrl}` }));

app.use((error, _req, res, _next) => {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
});

const PORT = config.port;
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);

    try {
        const adminExists = await prisma.adminUser.count();
        if (!adminExists) {
            const hashed = await hashPassword(config.adminPassword);
            await prisma.adminUser.create({
                data: {
                    username: config.adminUsername,
                    password: hashed,
                },
            });
            console.log(`Seeded admin user: ${config.adminUsername}`);
        }
    } catch (error) {
        console.error("Admin seeding failed:", error.message);
    }
});
