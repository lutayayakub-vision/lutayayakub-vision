import { useAuth } from '@/lib/auth';
import { useNavigate } from '@/lib/router';
import { Leaf, LogOut, Menu, X, Globe } from 'lucide-react';
import { useState, type ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  activePage: string;
}

const farmerNav = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { key: 'diagnose', label: 'Diagnose Crop', path: '/diagnose' },
  { key: 'ask', label: 'Ask AgriDoctor', path: '/ask' },
  { key: 'my-crops', label: 'My Crops', path: '/my-crops' },
  { key: 'history', label: 'History', path: '/history' },
  { key: 'expert-help', label: 'Expert Help', path: '/expert-help' },
  { key: 'learn', label: 'Learn', path: '/learn' },
];

const expertNav = [
  { key: 'expert-dashboard', label: 'Dashboard', path: '/expert-dashboard' },
  { key: 'expert-requests', label: 'Requests', path: '/expert-requests' },
  { key: 'learn', label: 'Learn', path: '/learn' },
];

const adminNav = [
  { key: 'admin-dashboard', label: 'Dashboard', path: '/admin-dashboard' },
  { key: 'admin-crops', label: 'Crops', path: '/admin-crops' },
  { key: 'admin-diseases', label: 'Diseases', path: '/admin-diseases' },
  { key: 'admin-users', label: 'Users', path: '/admin-users' },
  { key: 'learn', label: 'Learn', path: '/learn' },
];

export function Layout({ children, activePage }: LayoutProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = profile?.role === 'admin' ? adminNav : profile?.role === 'expert' ? expertNav : farmerNav;

  const greeting = profile?.role === 'expert' ? 'Expert' : profile?.role === 'admin' ? 'Admin' : 'Farmer';

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-primary-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(navItems[0].path)}
              className="flex items-center gap-2 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-primary-800 hidden sm:block">AgriDoctor AI</span>
            </button>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => navigate(item.path)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activePage === item.key
                      ? 'bg-primary-100 text-primary-800'
                      : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500 bg-primary-50 px-2.5 py-1.5 rounded-lg">
                <Globe className="w-3.5 h-3.5" />
                <span className="font-medium">EN</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-400">LG</span>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-xs text-gray-500">{greeting}</p>
                <p className="text-sm font-semibold text-primary-800">{profile?.name}</p>
              </div>
              <button
                onClick={() => signOut().then(() => navigate('/'))}
                className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-primary-50"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="lg:hidden border-t border-primary-100 bg-white animate-slide-up">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activePage === item.key
                      ? 'bg-primary-100 text-primary-800'
                      : 'text-gray-600 hover:bg-primary-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-6">
        {children}
      </main>

      <footer className="border-t border-primary-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-primary-600" />
              <span className="font-semibold text-primary-700">AgriDoctor AI</span>
              <span className="text-gray-400">— Smarter Decisions. Healthier Crops.</span>
            </div>
            <p className="text-xs text-gray-400">Vet4 | Makerere University UniPod AI Boot Camp</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="animate-fade-in">{children}</div>;
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-primary-100 ${className}`}>
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}) {
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-600/20',
    secondary: 'bg-primary-100 text-primary-800 hover:bg-primary-200',
    outline: 'border-2 border-primary-200 text-primary-700 hover:bg-primary-50',
    ghost: 'text-gray-600 hover:bg-primary-50',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Badge({ children, color = 'primary' }: { children: ReactNode; color?: 'primary' | 'yellow' | 'red' | 'blue' | 'gray' }) {
  const colors = {
    primary: 'bg-primary-100 text-primary-700',
    yellow: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-sky-100 text-sky-700',
    gray: 'bg-gray-100 text-gray-600',
  };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colors[color]}`}>{children}</span>;
}

export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      {label && <p className="mt-4 text-sm text-gray-500 animate-pulse-soft">{label}</p>}
    </div>
  );
}

export function EmptyState({ icon, title, message, action }: { icon: ReactNode; title: string; message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-4">{message}</p>
      {action}
    </div>
  );
}
