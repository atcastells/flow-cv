import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  // Auto-close sidebar on mobile when switching to desktop
  useEffect(() => {
    if (!isMobile && isSidebarOpen) {
      toggleSidebar();
    }
  }, [isMobile, isSidebarOpen, toggleSidebar]);

  return (
    <div className="flex h-screen bg-[var(--color-bg-main)] font-sans">
      {/* Sidebar Toggle Button - Only visible on mobile */}
      <Button
        variant="icon_toggle"
        size="icon"
        onClick={toggleSidebar}
        className={`md:hidden fixed top-4 left-4 z-20 text-[var(--color-icon)] bg-[var(--color-bg-card)]/80 dark:bg-[var(--color-bg-card)]/80 backdrop-blur-sm border border-[var(--color-border)] transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-4'
        }`}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        <span className="sr-only">Mostrar/Ocultar Resumen</span>
      </Button>

      {/* CV Preview Sidebar */}
      <div
        className={`
          fixed md:relative
          top-0 left-0
          w-full h-full
          md:w-72 lg:w-96
          transition-all duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          z-10 md:z-0
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