"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeSwitcherButton() {
      const { theme, systemTheme, setTheme, resolvedTheme } = useTheme();
      const [mounted, setMounted] = React.useState(false);

      // Prevent hydration mismatch
      React.useEffect(() => {
        setMounted(true);
      }, []);

      if (!mounted) return null;

      // resolvedTheme is either 'light' or 'dark'
      const current = resolvedTheme;

      // On click, toggle between light/dark
      const toggle = () => {
        setTheme(current === 'dark' ? 'light' : 'dark');
      };

  return (    
    <Button
        variant="outline"
        size="icon"
        onClick={toggle}
        aria-label="Toggle theme"
        className="h-full aspect-square" // so it vertically centers if your navbar is fixed-height
    >
      {current === 'dark' 
        ? <Sun className="h-[1.2rem] w-[1.2rem]" /> 
        : <Moon className="h-[1.2rem] w-[1.2rem]" />
      }
    </Button>
  );
}
