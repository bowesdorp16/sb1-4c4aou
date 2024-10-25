"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Loader2, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ScanMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanComplete: (analysis: {
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }) => void;
}

export function ScanMealDialog({ open, onOpenChange, onScanComplete }: ScanMealDialogProps) {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCameraSupported, setIsCameraSupported] = useState(false);
  const [isCameraInitializing, setIsCameraInitializing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check if camera is supported
  useEffect(() => {
    const checkCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(device => device.kind === 'videoinput');
        setIsCameraSupported(hasCamera);
      } catch (error) {
        console.error('Error checking camera:', error);
        setIsCameraSupported(false);
      }
    };

    checkCamera();
  }, []);

  const startCamera = async () => {
    try {
      setIsCameraInitializing(true);

      // Request camera permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Failed to access camera. Please check permissions and try again.",
      });
    } finally {
      setIsCameraInitializing(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setImagePreview(imageData);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeMeal = async () => {
    if (!imagePreview) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please take or upload a photo first",
      });
      return;
    }

    try {
      setIsAnalyzing(true);

      const response = await fetch("/api/analyze-meal-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imagePreview }),
      });

      if (!response.ok) throw new Error("Failed to analyze meal");

      const analysis = await response.json();
      onScanComplete(analysis);
      onOpenChange(false);
      setImagePreview(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to analyze meal. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetCapture = () => {
    setImagePreview(null);
    startCamera();
  };

  // Clean up on dialog close
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      stopCamera();
      setImagePreview(null);
    }
    onOpenChange(open);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-black tracking-tight">SCAN YOUR MEAL</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative aspect-video bg-secondary overflow-hidden">
            {!imagePreview && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                {isCameraSupported ? (
                  <>
                    <Button 
                      onClick={startCamera} 
                      className="hover-lift"
                      disabled={isCameraInitializing}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      {isCameraInitializing ? "Initializing..." : "Open Camera"}
                    </Button>
                    <div className="text-sm text-muted-foreground">or</div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground mb-4">
                    Camera not available
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="hover-lift"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photo
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            )}
            {videoRef.current && !imagePreview && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <Button
                  onClick={captureImage}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 hover-lift"
                >
                  Take Photo
                </Button>
              </>
            )}
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Meal preview"
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="outline"
                  onClick={resetCapture}
                  className="absolute top-4 right-4 hover-lift"
                >
                  Retake
                </Button>
              </div>
            )}
          </div>

          {imagePreview && (
            <Button
              onClick={analyzeMeal}
              disabled={isAnalyzing}
              className="w-full hover-lift"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Meal"
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}