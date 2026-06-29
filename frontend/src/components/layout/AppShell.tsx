import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileBottomNav } from './MobileBottomNav';
import { AchievementToast } from '../achievements/AchievementToast';
import { CommandPalette } from '../navigation/CommandPalette';
import { ShaylaLauncher } from '../ai/ShaylaLauncher';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === 'Escape') {
        setCommandOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="app-shell text-textPrimary">
      <Sidebar />
      <div className="shell-main">
        <Topbar onOpenCommandPalette={() => setCommandOpen(true)} />
        <main className="workspace-area">
          {children}
        </main>
      </div>
      <MobileBottomNav />
      <AchievementToast />
      <ShaylaLauncher />
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
};
