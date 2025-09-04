import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  QrCode, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle,
  User,
  BookOpen
} from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';

const StudentDashboard = ({ user, attendanceData, mockData, onScanQR, onLogout }) => {
  const { t } = useLanguage();
  // Get student's classes
  const studentClasses = mockData.classes.filter(cls => 
    cls.students.includes(user.id)
  );

  // Get student's attendance records
  const studentAttendance = attendanceData.filter(record => 
    record.studentId === user.id
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <div className="flex items-center space-x-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome, {user.name}</h1>
            <p className="text-muted-foreground">{user.program}</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
          {/* Quick Scan Card */}
          <Card className="lg:col-span-1 glass-effect hover:shadow-medium transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative bg-primary/10 p-4 rounded-full">
                    <QrCode className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-xl">{t('quickScan')}</CardTitle>
              <p className="text-muted-foreground text-sm">
                {t('scanQRCodeToMark')}
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={onScanQR} 
                className="w-full gradient-primary hover:shadow-medium transition-all duration-300 transform hover:scale-[1.02]"
                size="lg"
              >
                <QrCode className="mr-2 h-5 w-5" />
                {t('scanQRCode')}
              </Button>
            </CardContent>
          </Card>

          {/* My Classes */}
          <Card className="lg:col-span-2 glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-primary" />
                {t('studentMyClasses')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentClasses.map((cls) => {
                  const attendanceCount = studentAttendance.filter(
                    record => record.classId === cls.id
                  ).length;
                  
                  return (
                    <div 
                      key={cls.id} 
                      className="p-4 rounded-lg border border-muted/50 bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{cls.name}</h3>
                          <p className="text-muted-foreground text-sm">{cls.instructor}</p>
                        </div>
                        <Badge variant="secondary">
                          {attendanceCount} {t('sessionsAttended')}
                        </Badge>
                      </div>
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
                    </div>
                  );
                })}
                
                {studentClasses.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('noClassesEnrolled')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Attendance History */}
          <Card className="lg:col-span-3 glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                {t('recentAttendance')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {studentAttendance.slice(-10).reverse().map((record, index) => {
                  const classInfo = mockData.classes.find(cls => cls.id === record.classId);
                  
                  return (
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
                            {classInfo?.name || record.classId}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {classInfo?.location || t('unknownLocation')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(record.timestamp)}
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-200 dark:border-green-800">
                          {t('present')}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                
                {studentAttendance.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('noAttendanceYet')}</p>
                    <p className="text-sm">{t('scanFirstAttendance')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;