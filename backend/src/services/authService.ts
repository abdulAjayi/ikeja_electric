import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db.js";
import { CONFIG } from "../config.js";
import { AuthTokenPayload } from "../types.js";

const BCRYPT_SALT_ROUNDS = 10;

export class AuthService {
  /**
   * Register a new user with an assigned role (ENGINEER or EXECUTIVE)
   */
  public static async register(
    email: string,
    password: string,
    name: string,
    role: "ENGINEER" | "EXECUTIVE" = "ENGINEER"
  ) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error(`User with email "${email}" already exists`);
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: passwordHash,
        role,
      },
    });

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Login with email and password
   */
  public static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Helper to sign JWT tokens
   */
  public static generateToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload, CONFIG.JWT_SECRET, { expiresIn: "24h" });
  }

  /**
   * Helper to verify and decode JWT tokens
   */
  public static verifyToken(token: string): AuthTokenPayload {
    return jwt.verify(token, CONFIG.JWT_SECRET) as AuthTokenPayload;
  }
}
