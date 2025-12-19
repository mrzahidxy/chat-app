import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

interface TokenPayload extends JwtPayload {
  id: string;
}

type AuthedRequest = Request & { userId?: string };

const auth = (req: AuthedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SEC_KEY || ""
    ) as TokenPayload;

    if (!payload?.id) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.userId = payload.id;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export default auth;
