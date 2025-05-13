"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toastUpload";
import { Upload, X, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AudioUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("audio/")) {
        toast("Invalid file type. Please upload an audio file (MP3, WAV, OGG).");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);

      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("file", file);

      // Fetch token from local storage or authentication context
      const token = localStorage.getItem("accessToken");

      const response = await fetch("http://localhost:8000/auth/upload-audio-db/", {
        method: "POST",
        headers: {
          token: token || "", // Pass the token as a custom header
        },
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.detail === "Audio name already used") {
          throw new Error("Audio name already used");
        }
        throw new Error(errorData.detail || "Failed to upload audio");
      }

      setUploadProgress(100);
      toast("Upload successful! Your audio file has been uploaded.");
    } catch (error: any) {
      console.error("Upload failed:", error);
      if (error.message === "Audio name already used") {
        toast("Upload failed: Audio name already used.");
      } else {
        toast("Upload failed. There was an error uploading your file. Please try again.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center">Audio File Uploader</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-4",
              file ? "border-slate-300 bg-slate-50" : "border-slate-200 hover:border-slate-300"
            )}
          >
            {!file ? (
              <>
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-slate-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-900">Drag and drop your audio file here</p>
                  <p className="text-xs text-slate-500 mt-1">MP3, WAV, or OGG up to 100MB</p>
                </div>
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                  Select File
                </Button>
                <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
              </>
            ) : (
              <div className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <Volume2 className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {isUploading && (
                  <div className="mb-4">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-slate-500 mt-1 text-right">{uploadProgress}% uploaded</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" disabled={!file || isUploading} onClick={handleUpload}>
            {isUploading ? "Uploading..." : "Upload Audio"}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
