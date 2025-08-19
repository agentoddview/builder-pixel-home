import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ImageUpload";
import { imageApi, authApi, adminApi } from "@/lib/api";
import { Image } from "@shared/api";
import {
  Camera,
  Search,
  Filter,
  Grid,
  List,
  Upload,
  Star,
  Clock,
  CheckCircle,
  Loader2,
  XCircle,
  Trash2,
} from "lucide-react";

export default function Index() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "approved" | "pending" | "rejected"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load images on component mount and check admin status
  useEffect(() => {
    const adminStatus = authApi.isLoggedIn();
    setIsAdmin(adminStatus);
    loadImages();
  }, []);

  // Listen for admin status changes (like logout)
  useEffect(() => {
    const handleFocus = () => {
      const adminStatus = authApi.isLoggedIn();
      if (adminStatus !== isAdmin) {
        setIsAdmin(adminStatus);
        loadImages();
        // Reset filter if no longer admin and on non-approved filter
        if (!adminStatus && (statusFilter === 'pending' || statusFilter === 'rejected')) {
          setStatusFilter('all');
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isAdmin, statusFilter]);

  const loadImages = async () => {
    try {
      setLoading(true);
      setError("");
      const fetchedImages = await imageApi.getAllImages();

      // Filter images based on admin status
      const adminStatus = authApi.isLoggedIn();
      const filteredImages = adminStatus
        ? fetchedImages // Admins see all images
        : fetchedImages.filter(img => img.status === 'approved'); // Regular users only see approved

      setImages(filteredImages);
    } catch (err) {
      setError("Failed to load images. Please try again.");
      console.error("Error loading images:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = images.filter((image) => {
    const matchesSearch =
      image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesStatus =
      statusFilter === "all" || image.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleImageUpload = useCallback(async (imageData: Array<{ file: File; title: string; tags: string[] }>) => {
    try {
      setUploading(true);
      
      // Upload each image
      const uploadPromises = imageData.map(({ file, title, tags }) =>
        imageApi.uploadImage(file, title, tags, "Anonymous User")
      );
      
      await Promise.all(uploadPromises);
      
      // Reload images to show the new uploads
      await loadImages();
      setShowUpload(false);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Camera className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">PixelVault</h1>
              <p className="text-xs text-muted-foreground">Image Library</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Gallery
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
              Contact
            </Link>
            <Link to="/admin" className="text-muted-foreground hover:text-primary transition-colors">
              Admin
            </Link>
          </nav>
          <Button 
            onClick={() => setShowUpload(true)}
            className="flex items-center space-x-2"
            disabled={uploading}
          >
            <Upload className="h-4 w-4" />
            <span>Upload</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Share Your <span className="text-primary">Visual Stories</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Upload, share, and discover amazing images in our curated collection. 
            Every image goes through our approval process to ensure quality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setShowUpload(true)}
              className="flex items-center space-x-2"
              disabled={uploading}
            >
              <Upload className="h-5 w-5" />
              <span>Upload Images</span>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/contact" className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>Get in Touch</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadImages}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-foreground mb-2">Loading images...</h3>
            <p className="text-muted-foreground">Please wait while we fetch the image library.</p>
          </div>
        ) : (
          <>
            {/* Search and Filters */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 max-w-md relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search images by title or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value as "all" | "approved" | "pending" | "rejected",
                      )
                    }
                    className="px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm"
                  >
                    <option value="all">All Images</option>
                    <option value="approved">Approved</option>
                    {isAdmin && <option value="pending">Pending</option>}
                    {isAdmin && <option value="rejected">Rejected</option>}
                  </select>
                  <div className="flex rounded-md border border-input">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-r-none"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className={`grid gap-6 ${
              viewMode === "grid" 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1"
            }`}>
              {filteredImages.map((image) => (
                <Card key={image.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className={getStatusColor(image.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(image.status)}
                          <span className="capitalize">{image.status}</span>
                        </div>
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-2">{image.title}</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span>by {image.uploadedBy}</span>
                      <span>{image.uploadDate}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {image.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredImages.length === 0 && !loading && (
              <div className="text-center py-12">
                <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No images found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Be the first to upload an image to the library!"
                  }
                </p>
                <Button onClick={() => setShowUpload(true)}>
                  Upload First Image
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Upload Modal */}
      {showUpload && (
        <ImageUpload
          onClose={() => setShowUpload(false)}
          onUpload={handleImageUpload}
          uploading={uploading}
        />
      )}
    </div>
  );
}
