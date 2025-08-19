import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminLogin } from "@/components/AdminLogin";
import { imageApi, adminApi, authApi } from "@/lib/api";
import { Image } from "@shared/api";
import {
  Camera,
  ArrowLeft,
  Check,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Image as ImageIcon,
  Filter,
  Calendar,
  LogOut,
  Loader2,
  Trash2
} from "lucide-react";

export default function Admin() {
  const [images, setImages] = useState<Image[]>([]);
  const [selectedTab, setSelectedTab] = useState("pending");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const isLoggedIn = authApi.isLoggedIn();
    setIsAuthenticated(isLoggedIn);
    if (isLoggedIn) {
      loadImages();
    } else {
      setLoading(false);
    }
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      setError("");
      const fetchedImages = await imageApi.getAllImages();
      setImages(fetchedImages);
    } catch (err) {
      setError("Failed to load images. Please try again.");
      console.error("Error loading images:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = useCallback((authenticated: boolean) => {
    setIsAuthenticated(authenticated);
    if (authenticated) {
      loadImages();
    }
  }, []);

  const handleApprove = useCallback(async (imageId: number) => {
    try {
      setActionLoading(imageId);
      await adminApi.approveImage(imageId, "Current Admin");
      await loadImages(); // Reload to get updated data
    } catch (err) {
      console.error("Error approving image:", err);
      setError("Failed to approve image. Please try again.");
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleReject = useCallback(async (imageId: number, reason?: string) => {
    try {
      setActionLoading(imageId);
      await adminApi.rejectImage(imageId, "Current Admin", reason || "Content policy violation");
      await loadImages(); // Reload to get updated data
    } catch (err) {
      console.error("Error rejecting image:", err);
      setError("Failed to reject image. Please try again.");
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleDelete = useCallback(async (imageId: number) => {
    if (!confirm("Are you sure you want to permanently delete this image? This action cannot be undone.")) {
      return;
    }

    try {
      setActionLoading(imageId);
      await adminApi.deleteImage(imageId);
      await loadImages(); // Reload to get updated data
    } catch (err) {
      console.error("Error deleting image:", err);
      setError("Failed to delete image. Please try again.");
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleLogout = useCallback(() => {
    authApi.logout();
    setIsAuthenticated(false);
    setImages([]);
  }, []);

  const getImagesByStatus = (status: string) => {
    return images.filter(img => img.status === status);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    }
  };

  const pendingCount = getImagesByStatus("pending").length;
  const approvedCount = getImagesByStatus("approved").length;
  const rejectedCount = getImagesByStatus("rejected").length;

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const renderImageCard = (image: Image, showActions = false) => (
    <Card key={image.id} className="overflow-hidden">
      <div className="relative aspect-video">
        <img
          src={image.url}
          alt={image.title}
          className="w-full h-full object-cover"
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
        
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex justify-between">
            <span>Uploaded by:</span>
            <span className="text-foreground">{image.uploadedBy}</span>
          </div>
          <div className="flex justify-between">
            <span>Upload date:</span>
            <span className="text-foreground">{image.uploadDate}</span>
          </div>
          <div className="flex justify-between">
            <span>Size:</span>
            <span className="text-foreground">{image.fileSize}</span>
          </div>
          <div className="flex justify-between">
            <span>Dimensions:</span>
            <span className="text-foreground">{image.dimensions}</span>
          </div>
        </div>

        {image.status === "approved" && image.approvedDate && (
          <div className="text-xs text-green-600 dark:text-green-400 mb-3">
            Approved on {image.approvedDate} by {image.approvedBy}
          </div>
        )}

        {image.status === "rejected" && image.rejectedDate && (
          <div className="text-xs text-red-600 dark:text-red-400 mb-3">
            <div>Rejected on {image.rejectedDate} by {image.rejectedBy}</div>
            {image.rejectionReason && (
              <div className="mt-1">Reason: {image.rejectionReason}</div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-1 mb-4">
          {image.tags.map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="space-y-2">
          {showActions && image.status === "pending" && (
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => handleApprove(image.id)}
                className="flex-1"
                disabled={actionLoading === image.id}
              >
                {actionLoading === image.id ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleReject(image.id)}
                className="flex-1"
                disabled={actionLoading === image.id}
              >
                {actionLoading === image.id ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <X className="h-4 w-4 mr-1" />
                )}
                Reject
              </Button>
            </div>
          )}

          {/* Delete button available for all images */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(image.id)}
            disabled={actionLoading === image.id}
            className="w-full"
          >
            {actionLoading === image.id ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Image
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Camera className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">PixelVault</h1>
                <p className="text-xs text-muted-foreground">Admin Dashboard</p>
              </div>
            </div>
          </Link>
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                Gallery
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
              <Link to="/admin" className="text-foreground hover:text-primary transition-colors">
                Admin
              </Link>
            </nav>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Review and manage uploaded images. Approve quality content or reject inappropriate submissions.
          </p>
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
            <h3 className="text-lg font-medium text-foreground mb-2">Loading dashboard...</h3>
            <p className="text-muted-foreground">Please wait while we fetch the latest data.</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Images awaiting approval
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{approvedCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Live in gallery
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{rejectedCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Did not meet standards
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Image Management Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Pending ({pendingCount})</span>
                </TabsTrigger>
                <TabsTrigger value="approved" className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Approved ({approvedCount})</span>
                </TabsTrigger>
                <TabsTrigger value="rejected" className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4" />
                  <span>Rejected ({rejectedCount})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="mt-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Images Pending Review</h3>
                  <p className="text-muted-foreground">
                    Review these images and decide whether to approve or reject them.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getImagesByStatus("pending").map(image => renderImageCard(image, true))}
                </div>
                {pendingCount === 0 && (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No pending images</h3>
                    <p className="text-muted-foreground">All images have been reviewed!</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="approved" className="mt-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Approved Images</h3>
                  <p className="text-muted-foreground">
                    These images are live in the gallery and visible to all users.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getImagesByStatus("approved").map(image => renderImageCard(image, false))}
                </div>
              </TabsContent>

              <TabsContent value="rejected" className="mt-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Rejected Images</h3>
                  <p className="text-muted-foreground">
                    These images were rejected and are not visible to users.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getImagesByStatus("rejected").map(image => renderImageCard(image, false))}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
