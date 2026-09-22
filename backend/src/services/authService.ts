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
   * Update email address for a user
   */
  public static async updateEmail(userId: string, newEmail: string) {
    const trimmed = newEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      throw new Error("Please enter a valid email address");
    }

    const existing = await prisma.user.findFirst({
      where: {
        email: trimmed,
        NOT: { id: userId },
      },
    });

    if (existing) {
      throw new Error(`Email "${trimmed}" is already in use by another account`);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { email: trimmed },
    });

    const token = this.generateToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
    });

    return {
      token,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    };
  }

  /**
   * Update password for a user
   */
  public static async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    if (!currentPassword) {
      throw new Error("Current password is required");
    }
    if (!newPassword || newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters long");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new Error("Current password is incorrect");
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
    await prisma.user.update({
      where: { id: userId },
      data: { password: passwordHash },
    });

    return { message: "Password updated successfully" };
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
