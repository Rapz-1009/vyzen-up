import { useState, useCallback } from "react";
import { Upload, X, File, Image, Video, Music, FileText, Download } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  progress: number;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <Image className="h-8 w-8" />;
  if (type.startsWith('video/')) return <Video className="h-8 w-8" />;
  if (type.startsWith('audio/')) return <Music className="h-8 w-8" />;
  if (type.includes('pdf') || type.includes('document')) return <FileText className="h-8 w-8" />;
  return <File className="h-8 w-8" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const FileUploader = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    
    for (const file of acceptedFiles) {
      const fileId = crypto.randomUUID();
      
      // Create temporary file object for display
      const tempFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        progress: 0
      };
      
      setUploadedFiles(prev => [...prev, tempFile]);
      
      // Simulate upload progress
      const simulateProgress = setInterval(() => {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileId && f.progress < 100
              ? { ...f, progress: Math.min(f.progress + 10, 100) }
              : f
          )
        );
      }, 200);
      
      // In a real app, you would upload to storage here
      // For now, just complete the progress
      setTimeout(() => {
        clearInterval(simulateProgress);
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileId ? { ...f, progress: 100 } : f
          )
        );
        toast.success(`${file.name} uploaded successfully!`);
      }, 2000);
    }
    
    setUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true
  });

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    toast.info("File removed");
  };

  const downloadFile = (file: UploadedFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
    toast.success("Download started");
  };

  return (
    <div className="min-h-screen p-6 md:p-12" style={{ background: 'var(--gradient-background)' }}>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Vyzen Uploader
          </h1>
          <p className="text-lg text-muted-foreground">
            Upload photos, videos, audio, documents — all file types supported
          </p>
        </div>

        {/* Upload Zone */}
        <Card 
          {...getRootProps()} 
          className="p-12 cursor-pointer transition-all duration-300 border-2 border-dashed hover:border-primary hover:shadow-[var(--shadow-hover)] animate-scale-in"
          style={{
            borderColor: isDragActive ? 'hsl(var(--primary))' : undefined,
            background: isDragActive ? 'hsl(var(--primary) / 0.05)' : undefined,
            boxShadow: isDragActive ? 'var(--shadow-hover)' : 'var(--shadow-card)'
          }}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div 
              className="p-6 rounded-full transition-transform duration-300 hover:scale-110"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <Upload className="h-12 w-12 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold">
                {isDragActive ? "Drop files here" : "Drag & drop files here"}
              </h3>
              <p className="text-muted-foreground">
                or click to browse • All file types supported
              </p>
            </div>
            <Button 
              type="button"
              size="lg"
              className="mt-4"
              style={{ background: 'var(--gradient-accent)' }}
            >
              Choose Files
            </Button>
          </div>
        </Card>

        {/* Uploaded Files Grid */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-2xl font-semibold">Uploaded Files ({uploadedFiles.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uploadedFiles.map((file) => (
                <Card 
                  key={file.id} 
                  className="p-6 transition-all duration-300 hover:shadow-[var(--shadow-hover)] hover:scale-[1.02] animate-scale-in"
                  style={{ boxShadow: 'var(--shadow-card)' }}
                >
                  <div className="space-y-4">
                    {/* File Info */}
                    <div className="flex items-start gap-4">
                      <div 
                        className="p-3 rounded-lg shrink-0"
                        style={{ background: 'var(--gradient-primary)' }}
                      >
                        <div className="text-white">
                          {getFileIcon(file.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{file.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(file.id)}
                        className="shrink-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Progress Bar */}
                    {file.progress < 100 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Uploading...</span>
                          <span className="font-medium">{file.progress}%</span>
                        </div>
                        <Progress value={file.progress} className="h-2" />
                      </div>
                    )}

                    {/* Download Button */}
                    {file.progress === 100 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadFile(file)}
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};