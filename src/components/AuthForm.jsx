import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, LogIn, User, GraduationCap, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from "@/integrations/supabase/client";

const AuthForm = ({ onBack }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [program, setProgram] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('student');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isSignUp && (!fullName || (activeTab === 'student' && (!studentId || !program)))) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
              user_type: activeTab,
              student_id: activeTab === 'student' ? studentId : null,
              program: activeTab === 'student' ? program : null
            }
          }
        });

        if (error) throw error;
        toast.success('Account created! Please check your email to verify your account.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        toast.success('Welcome back!');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setStudentId('');
    setProgram('');
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    resetForm();
  };

  const handleModeChange = (signUpMode) => {
    setIsSignUp(signUpMode);
    resetForm();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/10 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <Card className="shadow-medium border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="absolute left-4 top-4 p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative bg-primary/10 p-4 rounded-full">
                  {isSignUp ? <UserPlus className="h-8 w-8 text-primary" /> : <LogIn className="h-8 w-8 text-primary" />}
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl font-playfair font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <p className="text-muted-foreground">
              {isSignUp ? 'Sign up to get started' : 'Sign in to your account'}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex gap-2">
              <Button
                variant={!isSignUp ? "default" : "outline"}
                onClick={() => handleModeChange(false)}
                className="flex-1"
              >
                Sign In
              </Button>
              <Button
                variant={isSignUp ? "default" : "outline"}
                onClick={() => handleModeChange(true)}
                className="flex-1"
              >
                Sign Up
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger value="instructor" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Instructor
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student" className="space-y-4 mt-6">
                <form onSubmit={handleAuth} className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="bg-background/50"
                        required
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@university.edu"
                      className="bg-background/50"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="bg-background/50"
                      required
                    />
                  </div>

                  {isSignUp && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="studentId">Student ID</Label>
                        <Input
                          id="studentId"
                          type="text"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          placeholder="S001234"
                          className="bg-background/50"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="program">Program</Label>
                        <Select value={program} onValueChange={setProgram}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select your program" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Computer Science">Computer Science</SelectItem>
                            <SelectItem value="Mathematics">Mathematics</SelectItem>
                            <SelectItem value="Physics">Physics</SelectItem>
                            <SelectItem value="Engineering">Engineering</SelectItem>
                            <SelectItem value="Business">Business</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  
                  <Button
                    type="submit"
                    className="w-full gradient-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : (isSignUp ? 'Create Student Account' : 'Sign In as Student')}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="instructor" className="space-y-4 mt-6">
                <form onSubmit={handleAuth} className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Dr. Jane Smith"
                        className="bg-background/50"
                        required
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="instructor@university.edu"
                      className="bg-background/50"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="bg-background/50"
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full gradient-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : (isSignUp ? 'Create Instructor Account' : 'Sign In as Instructor')}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthForm;