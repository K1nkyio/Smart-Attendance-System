import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, QrCode, BookOpen, TrendingUp, Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const StudentDashboardReal = ({ user, profile, onScanQR }) => {
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      loadStudentData();
    }
  }, [profile]);

  const loadStudentData = async () => {
    try {
      setLoading(true);

      // Load enrolled classes
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('class_enrollments')
        .select(`
          *,
          classes (
            *,
            profiles!classes_instructor_id_fkey (
              full_name
            )
          )
        `)
        .eq('student_id', profile.id);

      if (enrollmentsError) throw enrollmentsError;

      // Load attendance history
      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance_records')
        .select(`
          *,
          classes (
            name,
            code
          )
        `)
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (attendanceError) throw attendanceError;

      setEnrolledClasses(enrollments || []);
      setAttendanceHistory(attendance || []);
    } catch (error) {
      console.error('Error loading student data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getAttendanceCount = (classId) => {
    return attendanceHistory.filter(
      record => record.class_id === classId && record.status === 'present'
    ).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/10 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative z-10 p-6 space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-primary/10 p-4 rounded-full">
                <User className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-playfair font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            Welcome back, {profile?.full_name}!
          </h1>
          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {profile?.program}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {profile?.student_id}
            </span>
          </div>
        </div>

        {/* Quick Scan Card */}
        <Card className="glass-effect shadow-medium border-0 bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Quick Scan</h3>
                <p className="text-muted-foreground">Scan QR code to mark attendance</p>
              </div>
              <Button 
                onClick={onScanQR}
                className="gradient-primary hover:shadow-lg transition-all duration-300"
                size="lg"
              >
                <QrCode className="mr-2 h-5 w-5" />
                Scan QR Code
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* My Classes */}
          <Card className="glass-effect shadow-medium border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                My Classes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrolledClasses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No classes enrolled yet</p>
                  <p className="text-sm">Contact your instructor to get enrolled</p>
                </div>
              ) : (
                enrolledClasses.map((enrollment) => {
                  const classData = enrollment.classes;
                  const attendanceCount = getAttendanceCount(classData.id);
                  
                  return (
                    <Card key={enrollment.id} className="bg-background/50 hover:bg-background/70 transition-colors">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-lg">{classData.name}</h4>
                              <p className="text-muted-foreground text-sm">{classData.code}</p>
                            </div>
                            <Badge variant="secondary">
                              {attendanceCount} sessions
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <User className="h-4 w-4" />
                              <span>{classData.profiles?.full_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{classData.schedule}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <MapPin className="h-4 w-4" />
                            <span>{classData.location}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Recent Attendance */}
          <Card className="glass-effect shadow-medium border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Recent Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {attendanceHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No attendance records yet</p>
                  <p className="text-sm">Start scanning QR codes to track attendance</p>
                </div>
              ) : (
                attendanceHistory.map((record) => (
                  <Card key={record.id} className="bg-background/50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-medium">{record.classes?.name}</h4>
                          <p className="text-sm text-muted-foreground">{record.classes?.code}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(record.check_in_time)}</span>
                          </div>
                        </div>
                        <Badge 
                          variant={record.status === 'present' ? 'default' : 'destructive'}
                          className="capitalize"
                        >
                          {record.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardReal;