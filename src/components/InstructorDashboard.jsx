import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  Plus,
  Eye,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import ClassCreationForm from './ClassCreationForm';
import AttendanceReports from './AttendanceReports';
import { useLanguage } from '@/contexts/LanguageContext';

const InstructorDashboard = ({ user, attendanceData, mockData, onLogout }) => {
  const { t } = useLanguage();
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeQR, setActiveQR] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [instructorClasses, setInstructorClasses] = useState([]);

  // Initialize instructor's classes
  useEffect(() => {
    const classes = mockData.classes.filter(cls => 
      cls.instructor === user.name
    );
    setInstructorClasses(classes);
  }, [mockData.classes, user.name]);

  // Generate QR code data with enhanced information
  const generateQRCode = (classId) => {
    const classInfo = instructorClasses.find(cls => cls.id === classId);
    const timestamp = Date.now();
    const qrData = {
      classId,
      timestamp,
      instructorId: user.id,
      instructorName: classInfo?.instructor || user.name,
      className: classInfo?.name || '',
      location: classInfo?.location || '',
      unitCode: classInfo?.unitCode || '',
      session: classInfo?.schedule || '',
      contact: classInfo?.contact || { phone: '', email: '' },
      expiresAt: timestamp + (30 * 60 * 1000) // 30 minutes
    };
    return JSON.stringify(qrData);
  };

  const handleGenerateQR = (classId) => {
    setActiveQR({ classId, data: generateQRCode(classId), timestamp: Date.now() });
    toast.success(t('qrCodeGenerated'));
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

  const handleCreateClass = async (newClass) => {
    // Add the new class to the instructor's classes
    setInstructorClasses(prev => [...prev, newClass]);
    
    // Update the mock data (in a real app, this would be sent to the backend)
    mockData.classes.push(newClass);
    
    // Hide the form
    setShowCreateForm(false);
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
    toast.success(t('attendanceExported'));
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="bg-primary/10 p-2 sm:p-3 rounded-full">
              <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Welcome, {user.name}</h1>
              <p className="text-sm sm:text-base text-muted-foreground">{user.department}</p>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout} size="sm" className="self-end sm:self-auto">
            <LogOut className="h-4 w-4 mr-2" />
            {t('logout')}
          </Button>
        </div>

        {/* Create Class Form */}
        {showCreateForm && (
          <div className="max-w-4xl mx-auto mb-6">
            <ClassCreationForm 
              onCreateClass={handleCreateClass}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        )}

        {/* Detailed Reports View */}
        {showReports && selectedClass && (
          <div className="max-w-6xl mx-auto mb-6">
            <div className="flex items-center mb-4">
              <Button 
                variant="outline" 
                onClick={() => setShowReports(false)}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('backToDashboard')}
              </Button>
            </div>
            <AttendanceReports 
              classInfo={instructorClasses.find(cls => cls.id === selectedClass)}
              attendanceData={attendanceData}
              mockData={mockData}
            />
          </div>
        )}

        {/* Main Dashboard */}
        {!showCreateForm && !showReports && (
          <div className="max-w-7xl mx-auto space-y-6">
          {/* Mobile: Stack vertically, Desktop: Grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* QR Code Generator */}
          <Card className="lg:col-span-1 glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <QrCode className="h-5 w-5 mr-2 text-primary" />
                {t('qrGenerator')}
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
                    <p>{t('activeFor')} {mockData.classes.find(c => c.id === activeQR.classId)?.name}</p>
                    <p>{t('generated')} {formatDate(new Date(activeQR.timestamp).toISOString())}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleGenerateQR(activeQR.classId)}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t('regenerate')}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <QrCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground text-sm">
                    {t('selectClassToGenerate')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Classes */}
          <Card className="lg:col-span-3 glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  {t('instructorMyClasses')} ({instructorClasses.length})
                </div>
                <Button onClick={() => setShowCreateForm(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('instructorCreateClass')}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {instructorClasses.map((cls) => {
                  const attendance = getClassAttendance(cls.id);
                  const totalStudents = cls.students.length;
                  const todayAttendance = attendance.filter(record => 
                    new Date(record.timestamp).toDateString() === new Date().toDateString()
                  );
                  
                  return (
                    <div 
                      key={cls.id} 
                      className={`p-3 sm:p-4 rounded-lg border transition-all cursor-pointer ${
                        selectedClass === cls.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted/50 bg-background/50 hover:bg-background/80'
                      }`}
                      onClick={() => setSelectedClass(cls.id)}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-3">
                      <div className="flex-1 mb-2 sm:mb-0">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base">{cls.name}</h3>
                        <p className="text-muted-foreground text-xs sm:text-sm">{cls.unitCode || cls.id}</p>
                        {cls.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{cls.description}</p>
                        )}
                      </div>
                        <Badge variant="secondary" className="text-xs">
                          {totalStudents} {t('students')}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="truncate">{cls.schedule}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="truncate">{cls.location}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                          <div className="flex items-center text-xs sm:text-sm">
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-green-600" />
                            <span className="text-foreground">{t('todayAttendance')} {todayAttendance.length}/{totalStudents}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            <Button 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateQR(cls.id);
                              }}
                              className="h-7 sm:h-8 text-xs px-2"
                            >
                              <QrCode className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              <span className="hidden sm:inline">{t('generateQRCode')}</span>
                              <span className="sm:hidden">QR</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedClass(cls.id);
                                setShowReports(true);
                              }}
                              className="h-7 sm:h-8 text-xs px-2"
                            >
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              <span className="hidden sm:inline">{t('reports')}</span>
                              <span className="sm:hidden">View</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                exportAttendance(cls.id);
                              }}
                              className="h-7 sm:h-8 text-xs px-2"
                            >
                              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
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
                  {t('attendanceDetails')} - {instructorClasses.find(c => c.id === selectedClass)?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {getClassAttendance(selectedClass).slice(-20).reverse().map((record, index) => (
                    <div 
                      key={index} 
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border border-muted/50 bg-background/50 space-y-2 sm:space-y-0"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="bg-green-100 dark:bg-green-900/20 p-1.5 sm:p-2 rounded-full">
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm sm:text-base">
                            {getStudentName(record.studentId)}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            ID: {record.studentId}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end sm:text-right space-x-2">
                        <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          {formatDate(record.timestamp)}
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-200 dark:border-green-800 text-xs">
                          {t('present')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {getClassAttendance(selectedClass).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{t('noAttendanceRecords')}</p>
                      <p className="text-sm">{t('generateQRForStudents')}</p>
                    </div>
                  )}
              </div>
              
              {instructorClasses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">{t('noClassesCreated')}</p>
                  <p className="text-sm mb-4">{t('createFirstClass')}</p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('createYourFirstClass')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;