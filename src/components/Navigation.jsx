import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, LogOut } from 'lucide-react';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { useLanguage } from '@/contexts/LanguageContext';

export const Navigation = ({ 
  showBack = false, 
  onBack, 
  showHome = false, 
  onHome,
  showLogout = false,
  onLogout,
  title = ""
}) => {
  const { t } = useLanguage();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Navigation buttons */}
          <div className="flex items-center space-x-2">
            {showBack && (
              <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{t('back')}</span>
              </Button>
            )}
            {showHome && (
              <Button variant="ghost" size="sm" onClick={onHome} className="gap-2">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">{t('home')}</span>
              </Button>
            )}
            {title && (
              <h1 className="text-lg font-semibold text-foreground ml-4">
                {title}
              </h1>
            )}
          </div>

          {/* Right side - Settings and logout */}
          <div className="flex items-center space-x-2">
            <LanguageSwitcher variant="ghost" size="sm" />
            <ThemeSwitcher variant="ghost" size="sm" />
            {showLogout && (
              <Button variant="outline" size="sm" onClick={onLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t('logout')}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};