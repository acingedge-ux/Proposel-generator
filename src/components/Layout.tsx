import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LayoutDashboard, FileText, Menu, X, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'react-hot-toast';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const navLinks = [
    { name: 'DASHBOARD', path: '/dashboard', icon: LayoutDashboard },
    { name: 'GENERATOR', path: '/create', icon: FileText }
  ];

  const SidebarContent = () => (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-head italic tracking-tighter cursor-pointer">XYRON<br/>LABS</h1>
          <p className="text-xs font-bold mt-1 opacity-60">PROPOSAL GEN v2.4</p>
        </div>
        
        <nav className="space-y-4">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link 
                key={link.name}
                to={link.path} 
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "theme-sidebar-link flex items-center gap-3",
                  isActive ? "active" : ""
                )}
              >
                <Icon size={18} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4 pt-10">
        <div className="p-3 theme-badge text-center text-sm uppercase">
          THEME: {theme}
        </div>
        <div className="flex flex-col gap-3 py-4 border-t-[var(--theme-border-width)] border-[var(--theme-border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 theme-card-no-shadow"></div>
            <div className="overflow-hidden">
              <p className="font-bold text-sm leading-tight truncate">{user?.email?.split('@')[0]}</p>
              <p className="text-xs font-bold opacity-60">Creative User</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-left text-xs font-bold opacity-60 hover:opacity-100 uppercase underline mt-2">
            Sign Out
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="w-64 theme-sidebar flex-col justify-between p-6 hidden md:flex h-screen sticky top-0 overflow-y-auto print:hidden">
        <SidebarContent />
      </aside>

      {/* Mobile Topbar */}
      <header className="md:hidden flex items-center justify-between p-4 border-b-[var(--theme-border-width)] border-[var(--theme-border-color)] bg-[var(--theme-surface)] sticky top-0 z-40 print:hidden">
        <h1 className="text-xl font-head italic tracking-tighter">XYRON LABS</h1>
        <button onClick={() => setMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[var(--theme-bg)] flex flex-col p-6 print:hidden">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-2xl font-head italic tracking-tighter">XYRON LABS</h1>
            <button onClick={() => setMobileMenuOpen(false)}>
              <X size={28} />
            </button>
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
