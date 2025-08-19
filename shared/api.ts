/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Image status types
 */
export type ImageStatus = "pending" | "approved" | "rejected";

/**
 * Image entity
 */
export interface Image {
  id: number;
  url: string;
  filename: string;
  originalName: string;
  title: string;
  status: ImageStatus;
  uploadedBy: string;
  uploadDate: string;
  approvedDate?: string;
  approvedBy?: string;
  rejectedDate?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  tags: string[];
  fileSize: string;
  dimensions: string;
  mimeType: string;
}

/**
 * API Response types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ImagesResponse extends ApiResponse<Image[]> {}
export interface ImageResponse extends ApiResponse<Image> {}

/**
 * Upload types
 */
export interface UploadImageRequest {
  title: string;
  tags: string[];
  uploadedBy: string;
}

/**
 * Admin action types
 */
export interface ApproveImageRequest {
  approvedBy: string;
}

export interface RejectImageRequest {
  rejectedBy: string;
  rejectionReason?: string;
}

/**
 * Authentication types
 */
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse extends ApiResponse<{ token?: string }> {}
