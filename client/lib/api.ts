import {
  Image,
  ImagesResponse,
  ImageResponse,
  ApiResponse,
  ApproveImageRequest,
  RejectImageRequest,
  LoginRequest,
  LoginResponse,
} from "@shared/api";

// API base configuration
const API_BASE = "/api";

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem("admin-token");
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `HTTP error! status: ${response.status}`,
    );
  }

  return response.json();
}

// Image API functions
export const imageApi = {
  // Get all images
  getAllImages: async (): Promise<Image[]> => {
    const response: ImagesResponse = await apiRequest("/images");
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch images");
    }
    return response.data || [];
  },

  // Get images by status
  getImagesByStatus: async (status: string): Promise<Image[]> => {
    const response: ImagesResponse = await apiRequest(
      `/images/status/${status}`,
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch images");
    }
    return response.data || [];
  },

  // Get single image
  getImageById: async (id: number): Promise<Image> => {
    const response: ImageResponse = await apiRequest(`/images/${id}`);
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch image");
    }
    return response.data!;
  },

  // Upload single image
  uploadImage: async (
    file: File,
    title: string,
    tags: string[],
    uploadedBy: string,
  ): Promise<Image> => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", title);
    formData.append("tags", JSON.stringify(tags));
    formData.append("uploadedBy", uploadedBy);

    const response = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to upload image");
    }

    const result: ImageResponse = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Failed to upload image");
    }
    return result.data!;
  },

  // Upload multiple images
  uploadMultipleImages: async (
    files: { file: File; title: string; tags: string[] }[],
    uploadedBy: string,
  ): Promise<Image[]> => {
    const formData = new FormData();

    files.forEach((item, index) => {
      formData.append("images", item.file);
      formData.append(`title_${index}`, item.title);
      formData.append(`tags_${index}`, JSON.stringify(item.tags));
    });
    formData.append("uploadedBy", uploadedBy);

    const response = await fetch(`${API_BASE}/upload/multiple`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to upload images");
    }

    const result: ApiResponse<Image[]> = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Failed to upload images");
    }
    return result.data || [];
  },
};

// Admin API functions
export const adminApi = {
  // Approve image
  approveImage: async (id: number, approvedBy: string): Promise<Image> => {
    const request: ApproveImageRequest = { approvedBy };
    const response: ImageResponse = await apiRequest(
      `/admin/images/${id}/approve`,
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to approve image");
    }
    return response.data!;
  },

  // Reject image
  rejectImage: async (
    id: number,
    rejectedBy: string,
    rejectionReason?: string,
  ): Promise<Image> => {
    const request: RejectImageRequest = { rejectedBy, rejectionReason };
    const response: ImageResponse = await apiRequest(
      `/admin/images/${id}/reject`,
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to reject image");
    }
    return response.data!;
  },

  // Delete image
  deleteImage: async (id: number): Promise<void> => {
    const response: ApiResponse = await apiRequest(`/admin/images/${id}`, {
      method: "DELETE",
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to delete image");
    }
  },
};

// Auth API functions
export const authApi = {
  // Login
  login: async (username: string, password: string): Promise<string> => {
    const request: LoginRequest = { username, password };
    const response: LoginResponse = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(request),
    });
    if (!response.success) {
      throw new Error(response.error || "Login failed");
    }
    const token = response.data?.token;
    if (token) {
      localStorage.setItem("admin-token", token);
    }
    return token || "";
  },

  // Logout
  logout: () => {
    localStorage.removeItem("admin-token");
  },

  // Check if user is logged in
  isLoggedIn: (): boolean => {
    return !!localStorage.getItem("admin-token");
  },
};
