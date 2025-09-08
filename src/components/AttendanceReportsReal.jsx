import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, Users, TrendingUp, ArrowLeft, Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AttendanceReportsReal = ({ classInfo, onBack }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [classInfo.id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load attendance records
      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance_records')
        .select(`
          *,
          profiles!attendance_records_student_id_fkey (
            full_name,
            student_id,
            email
          )
        `)
        .eq('class_id', classInfo.id)
        .order('created_at', { ascending: false });

      if (attendanceError) throw attendanceError;

      // Load enrolled students
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('class_enrollments')
        .select(`
          *,
          profiles!class_enrollments_student_id_fkey (
            full_name,
            student_id,
            email
          )
        `)
        .eq('class_id', classInfo.id);

      if (enrollmentsError) throw enrollmentsError;

      setAttendanceData(attendance || []);
      setEnrolledStudents(enrollments || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const getUniqueDates = () => {
    const dates = [...new Set(attendanceData.map(record => record.session_date))];
    return dates.sort().reverse();
  };

  const filteredAttendance = attendanceData.filter(record => {
    const dateMatch = selectedDate === 'all' || record.session_date === selectedDate;
    const statusMatch = selectedStatus === 'all' || record.status === selectedStatus;
    return dateMatch && statusMatch;
  });

  const getAttendanceStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendanceData.filter(record => record.session_date === today);
    
    const totalEnrolled = enrolledStudents.length;
    const totalPresent = todayAttendance.filter(record => record.status === 'present').length;
    const attendanceRate = totalEnrolled > 0 ? Math.round((totalPresent / totalEnrolled) * 100) : 0;

    return {
      totalEnrolled,
      totalPresent,
      totalAbsent: totalEnrolled - totalPresent,
      attendanceRate
    };
  };

  const getPresentStudents = () => {
    return filteredAttendance
      .filter(record => record.status === 'present')
      .map(record => record.profiles);
  };

  const getAbsentStudents = () => {
    if (selectedDate === 'all' || selectedStatus !== 'all') {
      return [];
    }

    const presentStudentIds = filteredAttendance
      .filter(record => record.status === 'present')
      .map(record => record.student_id);

    return enrolledStudents
      .filter(enrollment => !presentStudentIds.includes(enrollment.student_id))
      .map(enrollment => enrollment.profiles);
  };

  const exportDetailedReport = () => {
    try {
      const csvData = [
        ['Student Name', 'Student ID', 'Email', 'Date', 'Time', 'Status'],
        ...filteredAttendance.map(record => [
          record.profiles?.full_name || 'Unknown',
          record.profiles?.student_id || 'Unknown',
          record.profiles?.email || 'Unknown',
          record.session_date,
          new Date(record.check_in_time).toLocaleTimeString(),
          record.status
        ])
      ];

      const csvContent = csvData.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${classInfo.name}_attendance_report.csv`;
      link.click();
      
      toast.success('Report exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const stats = getAttendanceStats();
  const presentStudents = getPresentStudents();
  const absentStudents = getAbsentStudents();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="glass-effect shadow-medium border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-2xl font-playfair font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  Attendance Report
                </CardTitle>
                <p className="text-muted-foreground">
                  {classInfo.name} ({classInfo.code})
                </p>
              </div>
            </div>
            <Button onClick={exportDetailedReport} className="gradient-primary">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Date</label>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  {getUniqueDates().map(date => (
                    <SelectItem key={date} value={date}>
                      {new Date(date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-background/50">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{stats.totalEnrolled}</div>
                <p className="text-sm text-muted-foreground">Total Enrolled</p>
              </CardContent>
            </Card>

            <Card className="bg-background/50">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">{stats.totalPresent}</div>
                <p className="text-sm text-muted-foreground">Present Today</p>
              </CardContent>
            </Card>

            <Card className="bg-background/50">
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-red-600" />
                <div className="text-2xl font-bold text-red-600">{stats.totalAbsent}</div>
                <p className="text-sm text-muted-foreground">Absent Today</p>
              </CardContent>
            </Card>

            <Card className="bg-background/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.attendanceRate}%</div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Present Students */}
          {presentStudents.length > 0 && (
            <Card className="bg-background/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Badge variant="default" className="bg-green-600">
                    {presentStudents.length}
                  </Badge>
                  Present Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {presentStudents.map((student, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-background rounded-lg">
                      <div>
                        <p className="font-medium">{student?.full_name}</p>
                        <p className="text-sm text-muted-foreground">{student?.student_id}</p>
                      </div>
                      <Badge variant="default" className="bg-green-600">Present</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Absent Students */}
          {absentStudents.length > 0 && (
            <Card className="bg-background/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Badge variant="destructive">
                    {absentStudents.length}
                  </Badge>
                  Absent Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {absentStudents.map((student, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-background rounded-lg">
                      <div>
                        <p className="font-medium">{student?.full_name}</p>
                        <p className="text-sm text-muted-foreground">{student?.student_id}</p>
                      </div>
                      <Badge variant="destructive">Absent</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {filteredAttendance.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No attendance records found for the selected filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceReportsReal;