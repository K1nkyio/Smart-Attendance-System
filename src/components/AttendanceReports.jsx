import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download,
  UserCheck,
  UserX,
  Calendar,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from '@/contexts/LanguageContext';

const AttendanceReports = ({ classInfo, attendanceData, mockData }) => {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Get all students enrolled in this class
  const enrolledStudents = classInfo.students || [];
  
  // Get attendance records for this class
  const classAttendance = attendanceData.filter(record => record.classId === classInfo.id);

  // Filter attendance based on selected date and status
  const filteredAttendance = classAttendance.filter(record => {
    const recordDate = new Date(record.timestamp).toDateString();
    const today = new Date().toDateString();
    
    let dateMatch = true;
    if (selectedDate === 'today') {
      dateMatch = recordDate === today;
    } else if (selectedDate === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateMatch = new Date(record.timestamp) >= weekAgo;
    } else if (selectedDate === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateMatch = new Date(record.timestamp) >= monthAgo;
    }

    let statusMatch = true;
    if (selectedStatus !== 'all') {
      statusMatch = record.status === selectedStatus;
    }

    return dateMatch && statusMatch;
  });

  // Get unique students who attended
  const attendedStudentIds = [...new Set(filteredAttendance.map(record => record.studentId))];
  
  // Get students who haven't attended (for today's filter)
  const absentStudents = selectedDate === 'today' 
    ? enrolledStudents.filter(studentId => !attendedStudentIds.includes(studentId))
    : [];

  const getStudentName = (studentId) => {
    const student = mockData.students.find(s => s.id === studentId);
    return student?.name || studentId;
  };

  const getStudentEmail = (studentId) => {
    const student = mockData.students.find(s => s.id === studentId);
    return student?.email || 'N/A';
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportDetailedReport = () => {
    let csvContent = "Student Name,Student ID,Email,Status,Date,Time\n";
    
    // Add present students
    filteredAttendance.forEach(record => {
      const studentName = getStudentName(record.studentId);
      const studentEmail = getStudentEmail(record.studentId);
      const date = new Date(record.timestamp);
      csvContent += `${studentName},${record.studentId},${studentEmail},Present,${date.toLocaleDateString()},${date.toLocaleTimeString()}\n`;
    });

    // Add absent students (only for today's report)
    if (selectedDate === 'today') {
      absentStudents.forEach(studentId => {
        const studentName = getStudentName(studentId);
        const studentEmail = getStudentEmail(studentId);
        const today = new Date();
        csvContent += `${studentName},${studentId},${studentEmail},Absent,${today.toLocaleDateString()},N/A\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${classInfo.name}_detailed_report_${selectedDate}.csv`;
    a.click();
    toast.success(t('attendanceExported'));
  };

  const attendanceRate = enrolledStudents.length > 0 
    ? ((attendedStudentIds.length / enrolledStudents.length) * 100).toFixed(1)
    : 0;

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            {t('attendanceReport')} - {classInfo.name}
          </div>
          <Button onClick={exportDetailedReport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t('exportReport')}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Time Period</label>
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card/50 rounded-lg p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{enrolledStudents.length}</p>
            <p className="text-sm text-muted-foreground">Total Enrolled</p>
          </div>
          
          <div className="bg-card/50 rounded-lg p-4 text-center">
            <UserCheck className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold">{attendedStudentIds.length}</p>
            <p className="text-sm text-muted-foreground">Present</p>
          </div>
          
          {selectedDate === 'today' && (
            <div className="bg-card/50 rounded-lg p-4 text-center">
              <UserX className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <p className="text-2xl font-bold">{absentStudents.length}</p>
              <p className="text-sm text-muted-foreground">Absent</p>
            </div>
          )}
          
          <div className="bg-card/50 rounded-lg p-4 text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold">{attendanceRate}%</p>
            <p className="text-sm text-muted-foreground">Attendance Rate</p>
          </div>
        </div>

        {/* Present Students */}
        {(selectedStatus === 'all' || selectedStatus === 'present') && filteredAttendance.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Students Present ({filteredAttendance.length})
            </h3>
            <div className="space-y-2">
              {filteredAttendance.slice(-20).reverse().map((record, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-lg border border-muted/50 bg-background/50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">{getStudentName(record.studentId)}</p>
                      <p className="text-sm text-muted-foreground">ID: {record.studentId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDateTime(record.timestamp)}
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200 dark:border-green-800">
                      Present
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Absent Students (only for today) */}
        {selectedDate === 'today' && (selectedStatus === 'all' || selectedStatus === 'absent') && absentStudents.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center">
              <XCircle className="h-5 w-5 mr-2 text-red-600" />
              Students Absent Today ({absentStudents.length})
            </h3>
            <div className="space-y-2">
              {absentStudents.map((studentId, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-lg border border-muted/50 bg-background/50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded-full">
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium">{getStudentName(studentId)}</p>
                      <p className="text-sm text-muted-foreground">ID: {studentId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      Today
                    </div>
                    <Badge variant="outline" className="text-red-600 border-red-200 dark:border-red-800">
                      Absent
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No data message */}
        {filteredAttendance.length === 0 && (selectedStatus === 'all' || selectedStatus === 'present') && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No attendance records found</p>
            <p className="text-sm">Generate a QR code for students to scan</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceReports;