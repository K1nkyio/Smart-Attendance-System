import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  QrCode, 
  Camera, 
  CheckCircle, 
  AlertCircle,
  Type,
  Scan
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from '@/contexts/LanguageContext';

const QRScanner = ({ currentUser, onAttendanceRecord, onBack, mockData }) => {
  const { t } = useLanguage();
  const [scanMode, setScanMode] = useState('manual'); // 'camera' or 'manual'
  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Cleanup camera stream when component unmounts or scan mode changes
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera if available
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      toast.success(t('cameraStarted'));
    } catch (error) {
      console.error('Camera error:', error);
      toast.error(t('cameraAccessDenied'));
      setScanMode('manual');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const processQRData = (qrData) => {
    try {
      // Try to parse as JSON (dynamic QR codes)
      let parsedData;
      try {
        parsedData = JSON.parse(qrData);
      } catch {
        // If not JSON, treat as simple class ID (static QR codes)
        parsedData = { classId: qrData.trim() };
      }

      const { classId, timestamp, expiresAt } = parsedData;

      // Validate class exists
      const classInfo = mockData.classes.find(cls => cls.id === classId);
      if (!classInfo) {
        toast.error(t('invalidClassCode'));
        return false;
      }

      // Check if student is enrolled in this class
      if (!classInfo.students.includes(currentUser.id)) {
        toast.error(t('notEnrolledInClass'));
        return false;
      }

      // Check if QR code has expired (for dynamic codes)
      if (expiresAt && Date.now() > expiresAt) {
        toast.error(t('qrCodeExpired'));
        return false;
      }

      // Check for duplicate scan (within last 5 minutes)
      if (lastScan && 
          lastScan.classId === classId && 
          Date.now() - lastScan.timestamp < 5 * 60 * 1000) {
        toast.error(t('attendanceAlreadyRecorded'));
        return false;
      }

      // Record attendance
      onAttendanceRecord(currentUser.id, classId);
      setLastScan({ classId, timestamp: Date.now() });
      
      toast.success(`${t('attendanceMarked')} ${classInfo.name}!`);
      return true;

    } catch (error) {
      console.error('QR processing error:', error);
      toast.error(t('invalidQRFormat'));
      return false;
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) {
      toast.error(t('pleaseEnterClassCode'));
      return;
    }

    if (processQRData(manualInput)) {
      setManualInput('');
    }
  };

  // Simulate QR scan for demo (in real app, you'd use a QR scanning library)
  const simulateScan = (classId) => {
    const qrData = {
      classId,
      timestamp: Date.now(),
      instructorId: 'I001',
      expiresAt: Date.now() + (30 * 60 * 1000)
    };
    processQRData(JSON.stringify(qrData));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/10 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative z-10 min-h-screen p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('scanAttendance')}</h1>
              <p className="text-muted-foreground">{t('scanQRCodeToMarkAttendance')}</p>
            </div>
          </div>

          {/* Scanner Card */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center">
                <QrCode className="h-5 w-5 mr-2 text-primary" />
                {t('qrCodeScanner')}
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant={scanMode === 'camera' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    if (scanMode === 'camera') {
                      stopCamera();
                    }
                    setScanMode('camera');
                  }}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {t('camera')}
                </Button>
                <Button
                  variant={scanMode === 'manual' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    stopCamera();
                    setScanMode('manual');
                  }}
                >
                  <Type className="h-4 w-4 mr-2" />
                  {t('manual')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {scanMode === 'camera' ? (
                <div className="space-y-4">
                  {!isScanning ? (
                    <div className="text-center py-8">
                      <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground mb-4">
                        {t('cameraAccessRequired')}
                      </p>
                      <Button onClick={startCamera} className="gradient-primary">
                        <Camera className="h-4 w-4 mr-2" />
                        {t('startCamera')}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="border-2 border-primary rounded-lg p-4 bg-primary/10">
                            <QrCode className="h-12 w-12 text-primary" />
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground text-sm mb-4">
                          {t('pointCameraAtQR')}
                        </p>
                        <Button variant="outline" onClick={stopCamera}>
                          {t('stopCamera')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="manual-input">{t('enterClassCode')}</Label>
                    <Input
                      id="manual-input"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder={t('enterClassCodePlaceholder')}
                      className="bg-background/50"
                    />
                  </div>
                  <Button type="submit" className="w-full gradient-primary">
                    <Scan className="h-4 w-4 mr-2" />
                    {t('submitAttendance')}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Demo Section */}
          <Card className="glass-effect border-dashed">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                {t('demoQuickScan')}
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                {t('simulateScanningDemo')}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {mockData.classes
                  .filter(cls => cls.students.includes(currentUser.id))
                  .map(cls => (
                    <Button
                      key={cls.id}
                      variant="outline"
                      onClick={() => simulateScan(cls.id)}
                      className="w-full justify-start hover:bg-primary/5"
                    >
                      <QrCode className="h-4 w-4 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">{cls.name}</div>
                        <div className="text-sm text-muted-foreground">{cls.location} • {cls.schedule}</div>
                      </div>
                    </Button>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          {lastScan && (
            <Card className="glass-effect border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">{t('attendanceRecorded')}</p>
                    <p className="text-sm opacity-80">
                      {t('lastScan')} {mockData.classes.find(c => c.id === lastScan.classId)?.name}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;