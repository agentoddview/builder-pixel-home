import { Image, ImageStatus } from "@shared/api";
import fs from "fs";
import path from "path";

// Simple file-based data store for demo purposes
// In production, you'd use a proper database
const DATA_FILE = path.join(process.cwd(), "data", "images.json");

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let nextId = 1;

// Initialize with some demo data if file doesn't exist
const initialImages: Image[] = [
  {
    id: 1,
    url: "/uploads/placeholder.svg",
    filename: "placeholder.svg",
    originalName: "Mountain Landscape.jpg",
    title: "Mountain Landscape",
    status: "approved",
    uploadedBy: "John Doe",
    uploadDate: "2024-01-15",
    approvedDate: "2024-01-16",
    approvedBy: "Admin",
    tags: ["nature", "landscape", "mountains"],
    fileSize: "2.3 MB",
    dimensions: "1920x1080",
    mimeType: "image/jpeg"
  },
  {
    id: 2,
    url: "/uploads/placeholder.svg",
    filename: "placeholder.svg",
    originalName: "City Architecture.jpg",
    title: "City Architecture",
    status: "pending",
    uploadedBy: "Jane Smith",
    uploadDate: "2024-01-14",
    tags: ["architecture", "city", "modern"],
    fileSize: "3.1 MB",
    dimensions: "2048x1366",
    mimeType: "image/jpeg"
  },
  {
    id: 3,
    url: "/uploads/placeholder.svg",
    filename: "placeholder.svg",
    originalName: "Ocean Waves.jpg",
    title: "Ocean Waves",
    status: "approved",
    uploadedBy: "Mike Johnson",
    uploadDate: "2024-01-13",
    approvedDate: "2024-01-14",
    approvedBy: "Admin",
    tags: ["ocean", "waves", "blue"],
    fileSize: "1.8 MB",
    dimensions: "1600x900",
    mimeType: "image/jpeg"
  },
  {
    id: 4,
    url: "/uploads/placeholder.svg",
    filename: "placeholder.svg",
    originalName: "Abstract Art.jpg",
    title: "Abstract Art",
    status: "pending",
    uploadedBy: "Sarah Wilson",
    uploadDate: "2024-01-12",
    tags: ["abstract", "art", "colorful"],
    fileSize: "4.2 MB",
    dimensions: "2560x1440",
    mimeType: "image/jpeg"
  },
  {
    id: 5,
    url: "/uploads/placeholder.svg",
    filename: "placeholder.svg",
    originalName: "Desert Sunset.jpg",
    title: "Desert Sunset",
    status: "rejected",
    uploadedBy: "Tom Brown",
    uploadDate: "2024-01-11",
    rejectedDate: "2024-01-12",
    rejectedBy: "Admin",
    rejectionReason: "Image quality too low",
    tags: ["desert", "sunset", "orange"],
    fileSize: "1.2 MB",
    dimensions: "1280x720",
    mimeType: "image/jpeg"
  }
];

class ImageStore {
  private images: Image[] = [];

  constructor() {
    this.loadImages();
  }

  private loadImages() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const parsed = JSON.parse(data);
        this.images = parsed.images || [];
        nextId = parsed.nextId || 1;
      } else {
        this.images = [...initialImages];
        nextId = Math.max(...this.images.map(img => img.id)) + 1;
        this.saveImages();
      }
    } catch (error) {
      console.error('Error loading images:', error);
      this.images = [...initialImages];
      nextId = Math.max(...this.images.map(img => img.id)) + 1;
    }
  }

  private saveImages() {
    try {
      const data = {
        images: this.images,
        nextId
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving images:', error);
    }
  }

  getAllImages(): Image[] {
    return [...this.images];
  }

  getImagesByStatus(status: ImageStatus): Image[] {
    return this.images.filter(img => img.status === status);
  }

  getImageById(id: number): Image | undefined {
    return this.images.find(img => img.id === id);
  }

  addImage(imageData: Omit<Image, 'id'>): Image {
    const newImage: Image = {
      id: nextId++,
      ...imageData
    };
    this.images.push(newImage);
    this.saveImages();
    return newImage;
  }

  updateImage(id: number, updates: Partial<Image>): Image | undefined {
    const index = this.images.findIndex(img => img.id === id);
    if (index === -1) return undefined;

    this.images[index] = { ...this.images[index], ...updates };
    this.saveImages();
    return this.images[index];
  }

  deleteImage(id: number): boolean {
    const index = this.images.findIndex(img => img.id === id);
    if (index === -1) return false;

    this.images.splice(index, 1);
    this.saveImages();
    return true;
  }

  approveImage(id: number, approvedBy: string): Image | undefined {
    return this.updateImage(id, {
      status: 'approved',
      approvedDate: new Date().toISOString().split('T')[0],
      approvedBy
    });
  }

  rejectImage(id: number, rejectedBy: string, rejectionReason?: string): Image | undefined {
    return this.updateImage(id, {
      status: 'rejected',
      rejectedDate: new Date().toISOString().split('T')[0],
      rejectedBy,
      rejectionReason
    });
  }
}

export const imageStore = new ImageStore();
