import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { ReactNode } from 'react';

interface AppLayoutProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  sidebarComponent: ReactNode;
  chatComponent: ReactNode;
}

export const AppLayout = ({
  isSidebarOpen,
  toggleSidebar,
  sidebarComponent,
  chatComponent,
}: AppLayoutProps) => {
  return (
    <div className={`flex h-screen bg-[var(--color-bg-main)] font-sans`}>
      {/* Sidebar Toggle Button */}
      <Button
        variant="icon_toggle"
        size="icon"
        onClick={toggleSidebar}
        className="md:hidden absolute top-4 left-4 z-20 text-[var(--color-icon)] bg-[var(--color-bg-card)]/80 dark:bg-[var(--color-bg-card)]/80 backdrop-blur-sm border border-[var(--color-border)]"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        <span className="sr-only">Mostrar/Ocultar Resumen</span>
      </Button>

      {/* CV Preview Sidebar */}
      <div
        className={`
          ${isSidebarOpen ? 'block absolute top-0 left-0 z-10 w-full h-full' : 'hidden'}
          md:block md:relative md:flex-shrink-0 h-full
        `}
      >
        {sidebarComponent}
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-center flex-1 p-2 sm:p-4">
          {chatComponent}
        </div>
      </div>
    </div>
  );
};