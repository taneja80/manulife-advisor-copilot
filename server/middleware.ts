import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        // In a real app, return 401. For demo/placeholder, log warning.
        console.warn(`[AUTH] Missing or invalid Authorization header on ${req.method} ${req.path}`);
        // return res.status(401).json({ message: "Unauthorized" });
    }

    next();
}
