import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { handleDemo } from "./routes/demo";
import {
  getAllImages,
  getImagesByStatus,
  getImageById,
  approveImage,
  rejectImage,
  deleteImage
} from "./routes/images";
import { upload, uploadImage, uploadMultipleImages } from "./routes/upload";
import { login, verifyAdmin } from "./routes/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  // Auth routes
  app.post("/api/auth/login", login);

  // Public image routes (no auth required)
  app.get("/api/images", getAllImages);
  app.get("/api/images/status/:status", getImagesByStatus);
  app.get("/api/images/:id", getImageById);

  // Upload routes (no auth required for users to upload)
  app.post("/api/upload", upload.single('image'), uploadImage);
  app.post("/api/upload/multiple", upload.array('images', 10), uploadMultipleImages);

  // Admin routes (require authentication)
  app.post("/api/admin/images/:id/approve", verifyAdmin, approveImage);
  app.post("/api/admin/images/:id/reject", verifyAdmin, rejectImage);
  app.delete("/api/admin/images/:id", verifyAdmin, deleteImage);

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  return app;
}
