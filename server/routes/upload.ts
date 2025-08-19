import { RequestHandler } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { imageStore } from "../store/imageStore";
import { ImageResponse, UploadImageRequest } from "@shared/api";

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `image-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Helper function to get image dimensions
function getImageDimensions(filePath: string): string {
  try {
    // This is a simplified version - in production you'd use a library like 'sharp' or 'probe-image-size'
    // For now, we'll return a placeholder
    return "1920x1080";
  } catch {
    return "Unknown";
  }
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Upload single image
export const uploadImage: RequestHandler = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    const { title, tags, uploadedBy }: UploadImageRequest = req.body;

    if (!title || !uploadedBy) {
      return res.status(400).json({
        success: false,
        error: "Title and uploadedBy are required",
      });
    }

    // Parse tags
    let parsedTags: string[] = [];
    try {
      parsedTags = tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [];
    } catch {
      parsedTags = [];
    }

    // Create image record
    const image = imageStore.addImage({
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      originalName: req.file.originalname,
      title,
      status: "pending",
      uploadedBy,
      uploadDate: new Date().toISOString().split("T")[0],
      tags: parsedTags,
      fileSize: formatFileSize(req.file.size),
      dimensions: getImageDimensions(req.file.path),
      mimeType: req.file.mimetype,
    });

    const response: ImageResponse = {
      success: true,
      data: image,
    };
    res.json(response);
  } catch (error) {
    console.error("Upload error:", error);
    const response: ImageResponse = {
      success: false,
      error: "Failed to upload image",
    };
    res.status(500).json(response);
  }
};

// Upload multiple images
export const uploadMultipleImages: RequestHandler = (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No files uploaded",
      });
    }

    const { uploadedBy } = req.body;
    if (!uploadedBy) {
      return res.status(400).json({
        success: false,
        error: "uploadedBy is required",
      });
    }

    const uploadedImages = files.map((file, index) => {
      // Get metadata for each file from the request body
      const title =
        req.body[`title_${index}`] ||
        file.originalname.replace(/\.[^/.]+$/, "");
      let tags: string[] = [];
      try {
        tags = req.body[`tags_${index}`]
          ? JSON.parse(req.body[`tags_${index}`])
          : [];
      } catch {
        tags = [];
      }

      return imageStore.addImage({
        url: `/uploads/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        title,
        status: "pending",
        uploadedBy,
        uploadDate: new Date().toISOString().split("T")[0],
        tags,
        fileSize: formatFileSize(file.size),
        dimensions: getImageDimensions(file.path),
        mimeType: file.mimetype,
      });
    });

    res.json({
      success: true,
      data: uploadedImages,
    });
  } catch (error) {
    console.error("Multi-upload error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload images",
    });
  }
};
