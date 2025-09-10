import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Camera, CheckCircle, AlertCircle, ArrowLeft, Video, VideoOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import QrScanner from 'qr-scanner';

const QRScannerReal = ({ user, profile, onBack }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  const processAttendance = async (classId) => {
    try {
      setIsProcessing(true);

      // Check if class exists
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();

      if (classError || !classData) {
        throw new Error('Class not found');
      }

      // Check if student is enrolled
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('class_enrollments')
        .select('*')
        .eq('class_id', classId)
        .eq('student_id', profile.id)
        .single();

      if (enrollmentError || !enrollment) {
        // Auto-enroll student if not already enrolled
        const { error: enrollError } = await supabase
          .from('class_enrollments')
          .insert([{
            class_id: classId,
            student_id: profile.id
          }]);

        if (enrollError) {
          throw new Error('Failed to enroll in class');
        }
        
        toast.success('Automatically enrolled in class!');
      }

      // Check if already marked present today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingRecord } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('class_id', classId)
        .eq('student_id', profile.id)
        .eq('session_date', today)
        .single();

      if (existingRecord) {
        throw new Error('Attendance already marked for today');
      }

      // Create attendance record
      const { error: attendanceError } = await supabase
        .from('attendance_records')
        .insert([{
          class_id: classId,
          student_id: profile.id,
          session_date: today,
          status: 'present'
        }]);

      if (attendanceError) {
        throw new Error('Failed to record attendance');
      }

      toast.success(`Attendance marked for ${classData.name}!`);
      return classData;
    } catch (error) {
      console.error('Error processing attendance:', error);
      toast.error(error.message || 'Failed to process attendance');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQRCodeScan = async (qrData) => {
    try {
      const parsedData = JSON.parse(qrData);
      
      if (!parsedData.classId || parsedData.action !== 'attendance') {
        throw new Error('Invalid QR code format');
      }

      const classData = await processAttendance(parsedData.classId);
      setScannedData({
        ...parsedData,
        className: classData.name,
        classCode: classData.code,
        success: true
      });
    } catch (error) {
      console.error('QR scan error:', error);
      setScannedData({
        success: false,
        error: error.message || 'Invalid QR code'
      });
    }
  };

  useEffect(() => {
    // Check if camera is available and permissions
    const checkCameraSupport = async () => {
      try {
        const hasCamera = await QrScanner.hasCamera();
        setHasCamera(hasCamera);
        console.log('Camera availability:', hasCamera);
        
        if (hasCamera) {
          console.log('Checking camera permissions...');
          // Try to get camera permissions early
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
            console.log('Camera permissions granted');
          } catch (error) {
            console.log('Camera permission not yet granted:', error);
          }
        }
      } catch (error) {
        console.error('Error checking camera support:', error);
        setHasCamera(false);
      }
    };
    
    checkCameraSupport();
    
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      console.log('Starting QR scanner...');
      
      if (!videoRef.current) {
        throw new Error('Video element not available');
      }

      // First, explicitly request camera permission
      try {
        console.log('Requesting camera permission...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment' // Use back camera if available
          } 
        });
        console.log('Camera permission granted, stream obtained');
        stream.getTracks().forEach(track => track.stop()); // Stop the test stream
      } catch (permissionError) {
        console.error('Camera permission denied:', permissionError);
        throw new Error('Camera access denied. Please allow camera permissions and try again.');
      }
      
      // Now create the QR scanner
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code detected:', result.data);
          handleQRCodeScan(result.data);
          stopScanning();
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 5,
          preferredCamera: 'environment', // Prefer back camera
        }
      );
      
      console.log('Starting QR scanner camera...');
      await qrScannerRef.current.start();
      console.log('QR scanner started successfully');
      
      // Add a small delay to ensure video is ready
      setTimeout(() => {
        if (videoRef.current && videoRef.current.videoWidth === 0) {
          console.warn('Video stream may not be ready');
        }
      }, 1000);
      
    } catch (error) {
      console.error('Failed to start QR scanner:', error);
      
      let errorMessage = 'Failed to access camera. ';
      if (error.message.includes('Permission denied') || error.message.includes('NotAllowedError')) {
        errorMessage += 'Please allow camera permissions and try again.';
      } else if (error.message.includes('NotFoundError')) {
        errorMessage += 'No camera found on this device.';
      } else if (error.message.includes('NotSupportedError')) {
        errorMessage += 'Camera not supported in this browser.';
      } else {
        errorMessage += 'Please ensure you\'re using HTTPS and camera permissions are allowed.';
      }
      
      toast.error(errorMessage);
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const result = await QrScanner.scanImage(file);
      handleQRCodeScan(result);
    } catch (error) {
      console.error('Failed to scan QR code from image:', error);
      toast.error('No QR code found in the image');
    }
  };

  const handleManualInput = () => {
    // For demo purposes, let's create a sample QR data
    const sampleClassId = '123e4567-e89b-12d3-a456-426614174000'; // This should match a real class ID
    const qrData = JSON.stringify({
      classId: sampleClassId,
      timestamp: new Date().toISOString(),
      action: 'attendance'
    });
    
    handleQRCodeScan(qrData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/10 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-md mx-auto space-y-6">
          <Card className="glass-effect shadow-medium border-0">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative bg-primary/10 p-4 rounded-full">
                    <QrCode className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-2xl font-playfair font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                QR Code Scanner
              </CardTitle>
              <p className="text-muted-foreground">
                Scan the QR code displayed by your instructor
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {!scannedData ? (
                <div className="space-y-4">
                  {!isScanning ? (
                    <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                      <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground mb-4">
                        Ready to scan QR code
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        className="w-full h-64 bg-black rounded-lg object-cover"
                        playsInline
                        muted
                        autoPlay
                      />
                      <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-primary rounded-lg animate-pulse"></div>
                      </div>
                      <p className="text-center text-sm text-muted-foreground mt-2">
                        Position QR code within the frame
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {hasCamera ? (
                      <Button
                        onClick={isScanning ? stopScanning : startScanning}
                        className={`w-full ${isScanning ? 'bg-red-600 hover:bg-red-700' : 'gradient-primary'}`}
                        disabled={isProcessing}
                      >
                        {isScanning ? (
                          <>
                            <VideoOff className="mr-2 h-4 w-4" />
                            Stop Camera
                          </>
                        ) : (
                          <>
                            <Video className="mr-2 h-4 w-4" />
                            Start Camera Scan
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-950/20 dark:border-yellow-800">
                        <Camera className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Camera not available or permissions not granted
                        </p>
                      </div>
                    )}

                  <div className="space-y-3">
                    {hasCamera ? (
                      <Button
                        onClick={isScanning ? stopScanning : startScanning}
                        className={`w-full ${isScanning ? 'bg-red-600 hover:bg-red-700' : 'gradient-primary'}`}
                        disabled={isProcessing}
                      >
                        {isScanning ? (
                          <>
                            <VideoOff className="mr-2 h-4 w-4" />
                            Stop Camera
                          </>
                        ) : (
                          <>
                            <Video className="mr-2 h-4 w-4" />
                            Start Camera Scan
                          </>
                        )}
                      </Button>
                    )}

                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="w-full"
                      disabled={isProcessing || isScanning}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Upload QR Code Image
                    </Button>

                    <Button
                      onClick={handleManualInput}
                      variant="outline"
                      className="w-full"
                      disabled={isProcessing || isScanning}
                    >
                      Demo Scan (Test)
                    </Button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {isProcessing && (
                    <div className="text-center py-4">
                      <div className="animate-spin inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Processing attendance...
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`text-center py-6 rounded-lg ${
                    scannedData.success 
                      ? 'bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                      : 'bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-800'
                  }`}>
                    {scannedData.success ? (
                      <>
                        <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
                        <h3 className="font-semibold text-green-800 dark:text-green-400 mb-2">
                          Attendance Recorded!
                        </h3>
                        <p className="text-green-700 dark:text-green-300 text-sm">
                          {scannedData.className} ({scannedData.classCode})
                        </p>
                        <Badge variant="secondary" className="mt-2">
                          Present
                        </Badge>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-12 w-12 mx-auto mb-3 text-red-600" />
                        <h3 className="font-semibold text-red-800 dark:text-red-400 mb-2">
                          Scan Failed
                        </h3>
                        <p className="text-red-700 dark:text-red-300 text-sm">
                          {scannedData.error}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setScannedData(null)}
                      variant="outline"
                      className="flex-1"
                    >
                      Scan Another
                    </Button>
                    <Button
                      onClick={onBack}
                      className="flex-1"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>Make sure the QR code is clearly visible and well-lit</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScannerReal;