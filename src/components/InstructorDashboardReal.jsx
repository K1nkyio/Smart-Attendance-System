import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Plus, Users, BarChart3, BookOpen, Calendar, Clock, MapPin, Loader, Eye, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ClassCreationFormReal from './ClassCreationFormReal';
import AttendanceReportsReal from './AttendanceReportsReal';

const InstructorDashboardReal = ({ user, profile }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [activeQRCode, setActiveQRCode] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [selectedClassForReports, setSelectedClassForReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      loadInstructorClasses();
    }
  }, [profile]);

  const loadInstructorClasses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('instructor_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = (classId) => {
    const qrData = JSON.stringify({
      classId: classId,
      timestamp: new Date().toISOString(),
      action: 'attendance'
    });
    return qrData;
  };

  const handleGenerateQR = (classId) => {
    const qrData = generateQRCode(classId);
    setActiveQRCode(qrData);
    setSelectedClassId(classId);
    toast.success('QR code generated successfully!');
  };

  const handleCreateClass = async (newClassData) => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .insert([{
          ...newClassData,
          instructor_id: profile.id
        }])
        .select()
        .single();

      if (error) throw error;

      setClasses(prev => [data, ...prev]);
      setShowCreateForm(false);
      toast.success('Class created successfully!');
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error('Failed to create class');
      throw error;
    }
  };

  const getClassAttendance = async (classId) => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select(`
          *,
          profiles!attendance_records_student_id_fkey (
            full_name,
            student_id
          )
        `)
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return [];
    }
  };

  const handleViewReports = (classData) => {
    setSelectedClassForReports(classData);
    setShowReports(true);
  };

  const exportAttendance = async (classId) => {
    try {
      const attendanceData = await getClassAttendance(classId);
      const classData = classes.find(c => c.id === classId);
      
      if (attendanceData.length === 0) {
        toast.error('No attendance data to export');
        return;
      }

      const csvData = [
        ['Student Name', 'Student ID', 'Date', 'Time', 'Status'],
        ...attendanceData.map(record => [
          record.profiles?.full_name || 'Unknown',
          record.profiles?.student_id || 'Unknown',
          new Date(record.session_date).toLocaleDateString(),
          new Date(record.check_in_time).toLocaleTimeString(),
          record.status
        ])
      ];

      const csvContent = csvData.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${classData?.name || 'class'}_attendance.csv`;
      link.click();
      
      toast.success('Attendance data exported successfully!');
    } catch (error) {
      console.error('Error exporting attendance:', error);
      toast.error('Failed to export attendance data');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6">
        <ClassCreationFormReal
          onCreateClass={handleCreateClass}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    );
  }

  if (showReports && selectedClassForReports) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6">
        <AttendanceReportsReal
          classInfo={selectedClassForReports}
          onBack={() => {
            setShowReports(false);
            setSelectedClassForReports(null);
          }}
        />
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
          <h1 className="text-3xl font-playfair font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            Welcome, {profile?.full_name}!
          </h1>
          <p className="text-muted-foreground">Manage your classes and track attendance</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* QR Code Generator */}
          <Card className="glass-effect shadow-medium border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                QR Code Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!activeQRCode ? (
                <div className="text-center py-8">
                  <QrCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Select a class to generate QR code</p>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <QRCodeSVG
                      value={activeQRCode}
                      size={200}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Students can scan this code to mark attendance
                  </p>
                  <Badge variant="secondary">
                    Class: {classes.find(c => c.id === selectedClassId)?.name}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Classes */}
          <Card className="lg:col-span-2 glass-effect shadow-medium border-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                My Classes
              </CardTitle>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="gradient-primary"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Class
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {classes.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground mb-4">No classes created yet</p>
                  <Button 
                    onClick={() => setShowCreateForm(true)}
                    variant="outline"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Class
                  </Button>
                </div>
              ) : (
                classes.map((classData) => (
                  <Card key={classData.id} className="bg-background/50 hover:bg-background/70 transition-colors">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-lg">{classData.name}</h4>
                            <p className="text-muted-foreground text-sm">{classData.code}</p>
                          </div>
                          <Badge variant="outline">Active</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{classData.schedule}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{classData.location}</span>
                          </div>
                        </div>

                        {classData.description && (
                          <p className="text-sm text-muted-foreground">{classData.description}</p>
                        )}
                        
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleGenerateQR(classData.id)}
                            className="flex-1"
                          >
                            <QrCode className="mr-2 h-4 w-4" />
                            Generate QR
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewReports(classData)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Reports
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => exportAttendance(classData.id)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Export
                          </Button>
                        </div>
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

export default InstructorDashboardReal;