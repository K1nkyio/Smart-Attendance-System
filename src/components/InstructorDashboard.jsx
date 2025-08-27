import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, 
  LogOut, 
  Users, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle,
  GraduationCap,
  BarChart3,
  Download,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

const InstructorDashboard = ({ user, attendanceData, mockData, onLogout }) => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeQR, setActiveQR] = useState(null);

  // Get instructor's classes
  const instructorClasses = mockData.classes.filter(cls => 
    cls.instructor === user.name
  );

  // Generate QR code data
  const generateQRCode = (classId) => {
    const timestamp = Date.now();
    const qrData = {
      classId,
      timestamp,
      instructorId: user.id,
      expiresAt: timestamp + (30 * 60 * 1000) // 30 minutes
    };
    return JSON.stringify(qrData);
  };

  const handleGenerateQR = (classId) => {
    setActiveQR({ classId, data: generateQRCode(classId), timestamp: Date.now() });
    toast.success("QR Code generated! Valid for 30 minutes");
  };

  const getClassAttendance = (classId) => {
    return attendanceData.filter(record => record.classId === classId);
  };

  const getStudentName = (studentId) => {
    const student = mockData.students.find(s => s.id === studentId);
    return student?.name || studentId;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportAttendance = (classId) => {
    const classAttendance = getClassAttendance(classId);
    const classInfo = instructorClasses.find(cls => cls.id === classId);
    
    let csvContent = "Student Name,Student ID,Date,Time,Status\n";
    classAttendance.forEach(record => {
      const studentName = getStudentName(record.studentId);
      const date = new Date(record.timestamp);
      csvContent += `${studentName},${record.studentId},${date.toLocaleDateString()},${date.toLocaleTimeString()},${record.status}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${classInfo?.name || classId}_attendance.csv`;
    a.click();
    toast.success("Attendance exported successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/10 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative z-10 min-h-screen p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Welcome, {user.name}</h1>
              <p className="text-muted-foreground">{user.department}</p>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-6">
          {/* QR Code Generator */}
          <Card className="lg:col-span-1 glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <QrCode className="h-5 w-5 mr-2 text-primary" />
                QR Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeQR ? (
                <div className="text-center space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <QRCodeSVG 
                      value={activeQR.data} 
                      size={150}
                      level="H"
                      className="mx-auto"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Active for: {mockData.classes.find(c => c.id === activeQR.classId)?.name}</p>
                    <p>Generated: {formatDate(new Date(activeQR.timestamp).toISOString())}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleGenerateQR(activeQR.classId)}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <QrCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground text-sm">
                    Select a class to generate QR code
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Classes */}
          <Card className="lg:col-span-3 glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                My Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {instructorClasses.map((cls) => {
                  const attendance = getClassAttendance(cls.id);
                  const totalStudents = cls.students.length;
                  const todayAttendance = attendance.filter(record => 
                    new Date(record.timestamp).toDateString() === new Date().toDateString()
                  );
                  
                  return (
                    <div 
                      key={cls.id} 
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        selectedClass === cls.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted/50 bg-background/50 hover:bg-background/80'
                      }`}
                      onClick={() => setSelectedClass(cls.id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{cls.name}</h3>
                          <p className="text-muted-foreground text-sm">{cls.id}</p>
                        </div>
                        <Badge variant="secondary">
                          {totalStudents} students
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {cls.schedule}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {cls.location}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                            <span className="text-foreground">Today: {todayAttendance.length}/{totalStudents}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateQR(cls.id);
                              }}
                              className="h-8"
                            >
                              <QrCode className="h-4 w-4 mr-1" />
                              Generate QR
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                exportAttendance(cls.id);
                              }}
                              className="h-8"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Attendance Details */}
          {selectedClass && (
            <Card className="lg:col-span-4 glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  Attendance Details - {instructorClasses.find(c => c.id === selectedClass)?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getClassAttendance(selectedClass).slice(-20).reverse().map((record, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 rounded-lg border border-muted/50 bg-background/50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-full">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {getStudentName(record.studentId)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ID: {record.studentId}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(record.timestamp)}
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-200 dark:border-green-800">
                          Present
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {getClassAttendance(selectedClass).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No attendance records yet</p>
                      <p className="text-sm">Generate a QR code for students to scan</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;