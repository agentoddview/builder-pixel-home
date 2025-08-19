import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Image as ImageIcon, Plus, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onClose: () => void;
  onUpload: (imageData: Array<{ file: File; title: string; tags: string[] }>) => void;
  uploading?: boolean;
}

interface ImagePreview {
  file: File;
  url: string;
  title: string;
  tags: string[];
}

export function ImageUpload({ onClose, onUpload }: ImageUploadProps) {
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => {
      const newCount = prev - 1;
      if (newCount === 0) {
        setIsDragOver(false);
      }
      return newCount;
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCounter(0);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      handleFiles(selectedFiles);
    },
    [],
  );

  const handleFiles = useCallback((files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const newImage: ImagePreview = {
          file,
          url,
          title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
          tags: [],
        };
        setImages((prev) => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateImage = useCallback(
    (index: number, updates: Partial<Pick<ImagePreview, "title" | "tags">>) => {
      setImages((prev) =>
        prev.map((img, i) => (i === index ? { ...img, ...updates } : img)),
      );
    },
    [],
  );

  const addTag = useCallback((index: number, tag: string) => {
    if (!tag.trim()) return;
    const normalizedTag = tag.trim().toLowerCase();
    setImages((prev) =>
      prev.map((img, i) => {
        if (i === index && !img.tags.includes(normalizedTag)) {
          return { ...img, tags: [...img.tags, normalizedTag] };
        }
        return img;
      }),
    );
  }, []);

  const removeTag = useCallback((index: number, tagToRemove: string) => {
    setImages((prev) =>
      prev.map((img, i) => {
        if (i === index) {
          return {
            ...img,
            tags: img.tags.filter((tag) => tag !== tagToRemove),
          };
        }
        return img;
      }),
    );
  }, []);

  const handleSubmit = useCallback(() => {
    if (images.length === 0) return;
    onUpload(images.map((img) => img.file));
  }, [images, onUpload]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold">Upload Images</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Drop Zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50",
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload
              className={cn(
                "h-12 w-12 mx-auto mb-4",
                isDragOver ? "text-primary" : "text-muted-foreground",
              )}
            />
            <h3 className="text-lg font-semibold mb-2">
              {isDragOver ? "Drop your images here" : "Drag & drop images here"}
            </h3>
            <p className="text-muted-foreground mb-4">
              or click to browse files
            </p>
            <Button type="button" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center">
                <ImageIcon className="h-5 w-5 mr-2" />
                Selected Images ({images.length})
              </h4>
              <div className="space-y-4">
                {images.map((image, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex gap-4">
                      {/* Image Preview */}
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Image Details */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <Label
                            htmlFor={`title-${index}`}
                            className="text-sm font-medium"
                          >
                            Title
                          </Label>
                          <Input
                            id={`title-${index}`}
                            value={image.title}
                            onChange={(e) =>
                              updateImage(index, { title: e.target.value })
                            }
                            placeholder="Enter image title..."
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Tags</Label>
                          <div className="flex flex-wrap gap-2 mt-1 mb-2">
                            {image.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {tag}
                                <button
                                  onClick={() => removeTag(index, tag)}
                                  className="ml-1 hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                          <Input
                            placeholder="Add tags (press Enter)"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const input = e.target as HTMLInputElement;
                                addTag(index, input.value);
                                input.value = "";
                              }
                            }}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Upload Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Please note:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>All images will be reviewed before being published</li>
                  <li>Accepted formats: JPG, PNG, GIF, WebP</li>
                  <li>Maximum file size: 10MB per image</li>
                  <li>Please ensure you have rights to upload these images</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={images.length === 0}
              className="min-w-[120px]"
            >
              Upload {images.length > 0 && `(${images.length})`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
