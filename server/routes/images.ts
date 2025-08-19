import { RequestHandler } from "express";
import { imageStore } from "../store/imageStore";
import { ImagesResponse, ImageResponse, ApproveImageRequest, RejectImageRequest } from "@shared/api";

// Get all images
export const getAllImages: RequestHandler = (req, res) => {
  try {
    const images = imageStore.getAllImages();
    const response: ImagesResponse = {
      success: true,
      data: images
    };
    res.json(response);
  } catch (error) {
    const response: ImagesResponse = {
      success: false,
      error: "Failed to fetch images"
    };
    res.status(500).json(response);
  }
};

// Get images by status
export const getImagesByStatus: RequestHandler = (req, res) => {
  try {
    const { status } = req.params;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status"
      });
    }
    
    const images = imageStore.getImagesByStatus(status as any);
    const response: ImagesResponse = {
      success: true,
      data: images
    };
    res.json(response);
  } catch (error) {
    const response: ImagesResponse = {
      success: false,
      error: "Failed to fetch images"
    };
    res.status(500).json(response);
  }
};

// Get single image
export const getImageById: RequestHandler = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid image ID"
      });
    }

    const image = imageStore.getImageById(id);
    if (!image) {
      return res.status(404).json({
        success: false,
        error: "Image not found"
      });
    }

    const response: ImageResponse = {
      success: true,
      data: image
    };
    res.json(response);
  } catch (error) {
    const response: ImageResponse = {
      success: false,
      error: "Failed to fetch image"
    };
    res.status(500).json(response);
  }
};

// Approve image
export const approveImage: RequestHandler = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid image ID"
      });
    }

    const { approvedBy }: ApproveImageRequest = req.body;
    if (!approvedBy) {
      return res.status(400).json({
        success: false,
        error: "approvedBy is required"
      });
    }

    const image = imageStore.approveImage(id, approvedBy);
    if (!image) {
      return res.status(404).json({
        success: false,
        error: "Image not found"
      });
    }

    const response: ImageResponse = {
      success: true,
      data: image
    };
    res.json(response);
  } catch (error) {
    const response: ImageResponse = {
      success: false,
      error: "Failed to approve image"
    };
    res.status(500).json(response);
  }
};

// Reject image
export const rejectImage: RequestHandler = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid image ID"
      });
    }

    const { rejectedBy, rejectionReason }: RejectImageRequest = req.body;
    if (!rejectedBy) {
      return res.status(400).json({
        success: false,
        error: "rejectedBy is required"
      });
    }

    const image = imageStore.rejectImage(id, rejectedBy, rejectionReason);
    if (!image) {
      return res.status(404).json({
        success: false,
        error: "Image not found"
      });
    }

    const response: ImageResponse = {
      success: true,
      data: image
    };
    res.json(response);
  } catch (error) {
    const response: ImageResponse = {
      success: false,
      error: "Failed to reject image"
    };
    res.status(500).json(response);
  }
};

// Delete image
export const deleteImage: RequestHandler = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid image ID"
      });
    }

    const success = imageStore.deleteImage(id);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: "Image not found"
      });
    }

    res.json({
      success: true,
      data: { id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to delete image"
    });
  }
};
