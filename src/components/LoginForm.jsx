import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, LogIn, User, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from '@/contexts/LanguageContext';

const LoginForm = ({ onLogin, onBack }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('student');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t('fillFields'));
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const success = onLogin(email, password, activeTab);
      setIsLoading(false);
      
      if (success) {
        toast.success(`${t('welcomeBack')}!`);
      } else {
        toast.error(t('invalidCredentials'));
      }
    }, 1000);
  };

  const fillDemoCredentials = (type, userIndex = 0) => {
    if (type === 'student') {
      const students = [
        { email: 'alice@student.edu', password: 'student123' },
        { email: 'bob@student.edu', password: 'student123' },
        { email: 'carol@student.edu', password: 'student123' },
        { email: 'david@student.edu', password: 'student123' }
      ];
      setEmail(students[userIndex].email);
      setPassword(students[userIndex].password);
    } else {
      const instructors = [
        { email: 'sarah.chen@university.edu', password: 'instructor123' },
        { email: 'michael.davis@university.edu', password: 'instructor123' }
      ];
      setEmail(instructors[userIndex].email);
      setPassword(instructors[userIndex].password);
    }
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
                  <LogIn className="h-8 w-8 text-primary" />
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl font-playfair font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              {t('welcomeBack')}
            </CardTitle>
            <p className="text-muted-foreground">
              {t('signIn')}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t('student')}
                </TabsTrigger>
                <TabsTrigger value="instructor" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  {t('instructor')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student" className="space-y-4 mt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@university.edu"
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('password')}
                      className="bg-background/50"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full gradient-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? t('signingIn') : t('signInAsStudent')}
                  </Button>
                </form>
                
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground text-center">{t('demoAccounts')}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => fillDemoCredentials('student', 0)}
                      className="text-xs"
                    >
                      Alice Johnson
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => fillDemoCredentials('student', 2)}
                      className="text-xs"
                    >
                      Carol Wilson
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="instructor" className="space-y-4 mt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="instructor@university.edu"
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('password')}
                      className="bg-background/50"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full gradient-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? t('signingIn') : t('signInAsInstructor')}
                  </Button>
                </form>
                
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground text-center">{t('demoAccounts')}</p>
                  <div className="grid grid-cols-1 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => fillDemoCredentials('instructor', 0)}
                      className="text-xs"
                    >
                      Dr. Sarah Chen
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;