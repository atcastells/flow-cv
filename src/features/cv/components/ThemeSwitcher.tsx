import { Moon, Sun } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface ThemeSwitcherProps {
  theme: string;
  toggleTheme: () => void;
}

export const ThemeSwitcher = ({ theme, toggleTheme }: ThemeSwitcherProps) => (
  <div className="flex items-center space-x-2">
    <Button
      variant="ghost"
      active={theme === 'light'}
      onClick={() => {
        if (theme === 'dark') toggleTheme();
      }}
      aria-pressed={theme === 'light'}
      aria-label="Activar tema claro"
    >
      <Sun className="w-5 h-5 mr-2" /> <span>Claro</span>
    </Button>
    <Button
      variant="ghost"
      active={theme === 'dark'}
      onClick={() => {
        if (theme === 'light') toggleTheme();
      }}
      aria-pressed={theme === 'dark'}
      aria-label="Activar tema oscuro"
    >
      <Moon className="w-5 h-5 mr-2" /> <span>Oscuro</span>
    </Button>
  </div>
); 