import { RequestHandler } from "express";
import { LoginRequest, LoginResponse } from "@shared/api";

// Simple demo authentication - in production use proper auth with JWT, bcrypt, etc.
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "password123",
};

// Login route
export const login: RequestHandler = (req, res) => {
  try {
    const { username, password }: LoginRequest = req.body;

    if (!username || !password) {
      const response: LoginResponse = {
        success: false,
        error: "Username and password are required",
      };
      return res.status(400).json(response);
    }

    // Check credentials
    if (
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      // In production, generate a proper JWT token
      const token = "demo-admin-token";

      const response: LoginResponse = {
        success: true,
        data: { token },
      };
      res.json(response);
    } else {
      const response: LoginResponse = {
        success: false,
        error: "Invalid credentials",
      };
      res.status(401).json(response);
    }
  } catch (error) {
    const response: LoginResponse = {
      success: false,
      error: "Authentication failed",
    };
    res.status(500).json(response);
  }
};

// Middleware to verify admin token (simplified for demo)
export const verifyAdmin: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");

  if (token === "demo-admin-token") {
    next();
  } else {
    res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }
};
