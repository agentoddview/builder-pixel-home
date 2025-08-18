import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Calendar
} from "lucide-react";

// Extended mock data for admin view
const mockImages = [
  {
    id: 1,
    url: "/placeholder.svg",
    title: "Mountain Landscape",
    status: "approved" as const,
    uploadedBy: "John Doe",
    uploadDate: "2024-01-15",
    approvedDate: "2024-01-16",
    approvedBy: "Admin",
    tags: ["nature", "landscape", "mountains"],
    fileSize: "2.3 MB",
    dimensions: "1920x1080"
  },
  {
    id: 2,
    url: "/placeholder.svg",
    title: "City Architecture",
    status: "pending" as const,
    uploadedBy: "Jane Smith",
    uploadDate: "2024-01-14",
    tags: ["architecture", "city", "modern"],
    fileSize: "3.1 MB",
    dimensions: "2048x1366"
  },
  {
    id: 3,
    url: "/placeholder.svg",
    title: "Ocean Waves",
    status: "approved" as const,
    uploadedBy: "Mike Johnson",
    uploadDate: "2024-01-13",
    approvedDate: "2024-01-14",
    approvedBy: "Admin",
    tags: ["ocean", "waves", "blue"],
    fileSize: "1.8 MB",
    dimensions: "1600x900"
  },
  {
    id: 4,
    url: "/placeholder.svg",
    title: "Abstract Art",
    status: "pending" as const,
    uploadedBy: "Sarah Wilson",
    uploadDate: "2024-01-12",
    tags: ["abstract", "art", "colorful"],
    fileSize: "4.2 MB",
    dimensions: "2560x1440"
  },
  {
    id: 5,
    url: "/placeholder.svg",
    title: "Desert Sunset",
    status: "rejected" as const,
    uploadedBy: "Tom Brown",
    uploadDate: "2024-01-11",
    rejectedDate: "2024-01-12",
    rejectedBy: "Admin",
    rejectionReason: "Image quality too low",
    tags: ["desert", "sunset", "orange"],
    fileSize: "1.2 MB",
    dimensions: "1280x720"
  },
  {
    id: 6,
    url: "/placeholder.svg",
    title: "Urban Street Photography",
    status: "pending" as const,
    uploadedBy: "Lisa Davis",
    uploadDate: "2024-01-10",
    tags: ["street", "urban", "night"],
    fileSize: "2.7 MB",
    dimensions: "1920x1280"
  }
];

type ImageStatus = "pending" | "approved" | "rejected";

export default function Admin() {
  const [images, setImages] = useState(mockImages);
  const [selectedTab, setSelectedTab] = useState("pending");

  const handleApprove = useCallback((imageId: number) => {
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { 
            ...img, 
            status: "approved" as const,
            approvedDate: new Date().toISOString().split('T')[0],
            approvedBy: "Current Admin"
          }
        : img
    ));
  }, []);

  const handleReject = useCallback((imageId: number, reason?: string) => {
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { 
            ...img, 
            status: "rejected" as const,
            rejectedDate: new Date().toISOString().split('T')[0],
            rejectedBy: "Current Admin",
            rejectionReason: reason || "Content policy violation"
          }
        : img
    ));
  }, []);

  const getImagesByStatus = (status: ImageStatus) => {
    return images.filter(img => img.status === status);
  };

  const getStatusIcon = (status: ImageStatus) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: ImageStatus) => {
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

  const renderImageCard = (image: any, showActions = false) => (
    <Card key={image.id} className="overflow-hidden">
      <div className="relative aspect-video">
        <img
          src={image.url}
          alt={image.title}
          className="w-full h-full object-cover"
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

        {showActions && image.status === "pending" && (
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              onClick={() => handleApprove(image.id)}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => handleReject(image.id)}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        )}
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
              {getImagesByStatus("approved").map(image => renderImageCard(image))}
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
              {getImagesByStatus("rejected").map(image => renderImageCard(image))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
