import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, QrCode, GraduationCap, BarChart3 } from "lucide-react";
import LoginForm from './LoginForm';
import StudentDashboard from './StudentDashboard';
import InstructorDashboard from './InstructorDashboard';
import QRScanner from './QRScanner';

// Mock data
const mockData = {
  students: [
    { id: 'S001', name: 'Alice Johnson', email: 'alice@student.edu', program: 'Computer Science' },
    { id: 'S002', name: 'Bob Smith', email: 'bob@student.edu', program: 'Mathematics' },
    { id: 'S003', name: 'Carol Wilson', email: 'carol@student.edu', program: 'Computer Science' },
    { id: 'S004', name: 'David Brown', email: 'david@student.edu', program: 'Physics' },
  ],
  instructors: [
    { id: 'I001', name: 'Dr. Sarah Chen', email: 'sarah.chen@university.edu', department: 'Computer Science' },
    { id: 'I002', name: 'Prof. Michael Davis', email: 'michael.davis@university.edu', department: 'Mathematics' },
  ],
  classes: [
    { 
      id: 'CS101', 
      name: 'Introduction to Programming', 
      instructor: 'Dr. Sarah Chen',
      schedule: 'Mon/Wed/Fri 10:00 AM',
      location: 'Room 101',
      students: ['S001', 'S003']
    },
    { 
      id: 'MATH201', 
      name: 'Calculus II', 
      instructor: 'Prof. Michael Davis',
      schedule: 'Tue/Thu 2:00 PM',
      location: 'Room 205',
      students: ['S002', 'S004']
    },
  ],
  attendance: [
    { studentId: 'S001', classId: 'CS101', timestamp: new Date().toISOString(), status: 'present' },
    { studentId: 'S003', classId: 'CS101', timestamp: new Date().toISOString(), status: 'present' },
  ]
};

const AttendanceSystem = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [currentView, setCurrentView] = useState('home'); // home, login, dashboard, scanner
  const [attendanceData, setAttendanceData] = useState(() => {
    const saved = localStorage.getItem('attendanceData');
    return saved ? JSON.parse(saved) : mockData.attendance;
  });

  useEffect(() => {
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
  }, [attendanceData]);

  const handleLogin = (email, password, type) => {
    // Mock authentication
    const users = type === 'student' ? mockData.students : mockData.instructors;
    const user = users.find(u => u.email === email);
    
    if (user) {
      setCurrentUser(user);
      setUserType(type);
      setCurrentView('dashboard');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserType(null);
    setCurrentView('home');
  };

  const handleAttendanceRecord = (studentId, classId) => {
    const newRecord = {
      studentId,
      classId,
      timestamp: new Date().toISOString(),
      status: 'present'
    };
    setAttendanceData(prev => [...prev, newRecord]);
  };

  const renderHomeView = () => (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
            <div className="relative bg-primary/10 p-6 rounded-full">
              <GraduationCap className="h-12 w-12 text-primary" />
            </div>
          </div>
        </div>
        <h1 className="text-4xl font-playfair font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
          Smart Attendance System
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Streamlined attendance tracking with QR codes for modern classrooms
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="glass-effect hover:shadow-medium transition-all duration-300 group cursor-pointer"
              onClick={() => setCurrentView('login')}>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-lg">Student Access</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground text-sm mb-4">
              Scan QR codes to record your attendance
            </p>
            <Button variant="outline" className="w-full">
              Student Login
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-effect hover:shadow-medium transition-all duration-300 group cursor-pointer"
              onClick={() => setCurrentView('login')}>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-lg">Instructor Portal</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground text-sm mb-4">
              Generate QR codes and track attendance
            </p>
            <Button variant="outline" className="w-full">
              Instructor Login
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-effect hover:shadow-medium transition-all duration-300 group">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-lg">Live Stats</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-2">
            <div className="text-2xl font-bold text-primary">{mockData.students.length}</div>
            <p className="text-muted-foreground text-sm">Active Students</p>
            <div className="text-lg font-semibold text-accent-foreground">{attendanceData.length}</div>
            <p className="text-muted-foreground text-xs">Total Check-ins Today</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card/50 rounded-xl p-6 border border-muted/50">
        <h3 className="text-xl font-semibold mb-4 text-center">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-primary font-bold">1</span>
            </div>
            <h4 className="font-semibold">Generate QR Code</h4>
            <p className="text-muted-foreground text-sm">Instructor creates unique QR code for each class session</p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-primary font-bold">2</span>
            </div>
            <h4 className="font-semibold">Students Scan</h4>
            <p className="text-muted-foreground text-sm">Students use their phones to scan the QR code</p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-primary font-bold">3</span>
            </div>
            <h4 className="font-semibold">Track Attendance</h4>
            <p className="text-muted-foreground text-sm">Automatic attendance recording with timestamps</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (currentView === 'login') {
    return (
      <LoginForm 
        onLogin={handleLogin}
        onBack={() => setCurrentView('home')}
      />
    );
  }

  if (currentView === 'scanner') {
    return (
      <QRScanner 
        currentUser={currentUser}
        onAttendanceRecord={handleAttendanceRecord}
        onBack={() => setCurrentView('dashboard')}
        mockData={mockData}
      />
    );
  }

  if (currentView === 'dashboard' && userType === 'student') {
    return (
      <StudentDashboard 
        user={currentUser}
        attendanceData={attendanceData}
        mockData={mockData}
        onScanQR={() => setCurrentView('scanner')}
        onLogout={handleLogout}
      />
    );
  }

  if (currentView === 'dashboard' && userType === 'instructor') {
    return (
      <InstructorDashboard 
        user={currentUser}
        attendanceData={attendanceData}
        mockData={mockData}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/10 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10 w-full px-4">
        {renderHomeView()}
      </div>
    </div>
  );
};

export default AttendanceSystem;