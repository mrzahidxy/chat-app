import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import User, { type IUser } from "../models/user";

const router = Router();

interface RegisterRequestBody {
  username?: string;
  email?: string;
  password?: string;
}

interface LoginRequestBody {
  username?: string;
  password?: string;
}

interface AuthSuccessResponse {
  user: {
    id: string;
    username: string;
    email: string;
  };
  token: string;
}

const buildToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SEC_KEY || "secret", { expiresIn: "3d" });

const normalizeAuthPayload = ({ username, email, password }: RegisterRequestBody) => {
  const normalizedUsername =
    typeof username === "string" ? username.trim() : "";
  const normalizedEmail =
    typeof email === "string" ? email.trim().toLowerCase() : "";
  const normalizedPassword = typeof password === "string" ? password : "";
  return { normalizedUsername, normalizedEmail, normalizedPassword };
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
});

router.use(authLimiter);

const logAttempt = (
  action: string,
  identifier: string,
  ip?: string | undefined
) => {
  const safeIdentifier = identifier || "unknown";
  const safeIp = ip || "unknown";
  console.log(`[auth] ${action} attempt for ${safeIdentifier} from ${safeIp}`);
};

const handleRegister = async (
  req: Request<unknown, unknown, RegisterRequestBody>,
  res: Response<AuthSuccessResponse | { message: string }>
) => {
  try {
    const { normalizedUsername, normalizedEmail, normalizedPassword } =
      normalizeAuthPayload(req.body);

    if (!normalizedUsername || !normalizedEmail || !normalizedPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (normalizedPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }

    logAttempt("register", normalizedEmail || normalizedUsername, req.ip);

    const existingUser = await User.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Username or email already in use." });
    }

    const hashedPassword = await bcrypt.hash(normalizedPassword, 10);
    const newUser: IUser = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = buildToken(newUser._id.toString());

    return res.status(201).json({
      user: {
        id: newUser._id.toString(),
        username: newUser.username,
        email: newUser.email,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register user." });
  }
};

router.post("/register", handleRegister);
router.post("/signup", handleRegister);

router.post(
  "/login",
  async (
    req: Request<unknown, unknown, LoginRequestBody>,
    res: Response<AuthSuccessResponse | { message: string }>
  ) => {
    try {
      const { username, password } = req.body;
      const normalizedUsername =
        typeof username === "string" ? username.trim() : "";

      if (!normalizedUsername || !password) {
        return res
          .status(400)
          .json({ message: "Username and password required." });
      }

      logAttempt("login", normalizedUsername, req.ip);

      const foundUser = await User.findOne({ username: normalizedUsername });

      if (!foundUser) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      const passwordMatch = await bcrypt.compare(password, foundUser.password);

      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      const token = buildToken(foundUser._id.toString());

      return res.status(200).json({
        user: {
          id: foundUser._id.toString(),
          username: foundUser.username,
          email: foundUser.email,
        },
        token,
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to login user." });
    }
  }
);

export default router;
