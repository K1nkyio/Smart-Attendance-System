import React from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeSwitcher = ({ variant = "outline", size = "default" }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={toggleTheme}
      className="gap-2"
    >
      {theme === 'light' ? (
        <>
          <Moon className="h-4 w-4" />
          <span className="hidden sm:inline">Dark</span>
        </>
      ) : (
        <>
          <Sun className="h-4 w-4" />
          <span className="hidden sm:inline">Light</span>
        </>
      )}
    </Button>
  );
};