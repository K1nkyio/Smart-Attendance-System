import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, QrCode, GraduationCap, BarChart3, Loader } from "lucide-react";
import AuthForm from './AuthForm';
import StudentDashboardReal from './StudentDashboardReal';
import InstructorDashboardReal from './InstructorDashboardReal';
import QRScannerReal from './QRScannerReal';
import { Navigation } from './Navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AttendanceSystemReal = () => {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalStudents: 0, totalAttendance: 0 });

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
          setCurrentView('dashboard');
        } else {
          setProfile(null);
          setCurrentView('home');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
        setCurrentView('dashboard');
      }
      setLoading(false);
    });

    // Load stats
    loadStats();

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load user profile');
    }
  };

  const loadStats = async () => {
    try {
      // Get total students count
      const { count: studentsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'student');

      // Get total attendance count
      const { count: attendanceCount } = await supabase
        .from('attendance_records')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalStudents: studentsCount || 0,
        totalAttendance: attendanceCount || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
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
          Streamlined attendance tracking with QR codes and real-time analytics
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="glass-effect hover:shadow-medium transition-all duration-300 group cursor-pointer"
              onClick={() => setCurrentView('auth')}>
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
              Scan QR codes to mark attendance
            </p>
            <Button variant="outline" className="w-full">
              Student Login
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-effect hover:shadow-medium transition-all duration-300 group cursor-pointer"
              onClick={() => setCurrentView('auth')}>
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
              Generate QR codes and manage classes
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
            <div className="text-2xl font-bold text-primary">{stats.totalStudents}</div>
            <p className="text-muted-foreground text-sm">Active Students</p>
            <div className="text-lg font-semibold text-accent-foreground">{stats.totalAttendance}</div>
            <p className="text-muted-foreground text-xs">Total Check-ins</p>
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
            <p className="text-muted-foreground text-sm">Instructor creates a class session</p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-primary font-bold">2</span>
            </div>
            <h4 className="font-semibold">Students Scan</h4>
            <p className="text-muted-foreground text-sm">Students use their phones to scan</p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-primary font-bold">3</span>
            </div>
            <h4 className="font-semibold">Track Attendance</h4>
            <p className="text-muted-foreground text-sm">Automatic recording and analytics</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (currentView === 'auth') {
    return (
      <>
        <Navigation 
          showBack 
          onBack={() => setCurrentView('home')}
          title="Authentication"
        />
        <div className="pt-16">
          <AuthForm 
            onBack={() => setCurrentView('home')}
          />
        </div>
      </>
    );
  }

  if (currentView === 'scanner') {
    return (
      <>
        <Navigation 
          showBack 
          onBack={() => setCurrentView('dashboard')}
          showHome
          onHome={() => setCurrentView('home')}
          title="QR Scanner"
        />
        <div className="pt-16">
          <QRScannerReal 
            user={user}
            profile={profile}
            onBack={() => setCurrentView('dashboard')}
          />
        </div>
      </>
    );
  }

  if (currentView === 'dashboard' && profile?.user_type === 'student') {
    return (
      <>
        <Navigation 
          showHome
          onHome={() => setCurrentView('home')}
          showLogout
          onLogout={handleLogout}
          title="Student Dashboard"
        />
        <div className="pt-16">
          <StudentDashboardReal 
            user={user}
            profile={profile}
            onScanQR={() => setCurrentView('scanner')}
          />
        </div>
      </>
    );
  }

  if (currentView === 'dashboard' && profile?.user_type === 'instructor') {
    return (
      <>
        <Navigation 
          showHome
          onHome={() => setCurrentView('home')}
          showLogout
          onLogout={handleLogout}
          title="Instructor Dashboard"
        />
        <div className="pt-16">
          <InstructorDashboardReal 
            user={user}
            profile={profile}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="pt-16 min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/10 relative overflow-hidden">
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
    </>
  );
};

export default AttendanceSystemReal;