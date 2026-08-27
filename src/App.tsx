import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { RouterProvider, useRouter } from '@/lib/router';
import { ensureDemoAccounts } from '@/lib/demo';
import { Layout } from '@/components/Layout';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { FarmerDashboard } from '@/pages/FarmerDashboard';
import { DiagnosePage } from '@/pages/DiagnosePage';
import { AskAgriDoctorPage } from '@/pages/AskAgriDoctorPage';
import { MyCropsPage } from '@/pages/MyCropsPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { DiagnosisDetailPage } from '@/pages/DiagnosisDetailPage';
import { ExpertHelpPage } from '@/pages/ExpertHelpPage';
import { ExpertDashboard } from '@/pages/ExpertDashboard';
import { ChatPage } from '@/pages/ChatPage';
import { LearnPage } from '@/pages/LearnPage';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { AdminCropsPage } from '@/pages/AdminCropsPage';
import { AdminDiseasesPage } from '@/pages/AdminDiseasesPage';
import { AdminUsersPage } from '@/pages/AdminUsersPage';
import type { Profile } from '@/types';

function Routes() {
  const { path } = useRouter();
  const { session, profile, loading } = useAuth();

  useEffect(() => {
    ensureDemoAccounts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-50">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Public routes
  if (path === '/' || path === '') {
    return <LandingPage />;
  }
  if (path === '/login') {
    return session ? <NavigateToDashboard profile={profile} /> : <LoginPage />;
  }
  if (path === '/register') {
    return session ? <NavigateToDashboard profile={profile} /> : <RegisterPage />;
  }

  // Protected routes — require auth
  if (!session) {
    return <LoginPage />;
  }

  // Route by role and path
  const role = profile?.role ?? 'farmer';

  // Farmer routes
  if (path === '/dashboard') {
    return role === 'farmer' ? <Layout activePage="dashboard"><FarmerDashboard /></Layout> : <NavigateToDashboard profile={profile} />;
  }
  if (path === '/diagnose') {
    return role === 'farmer' ? <Layout activePage="diagnose"><DiagnosePage /></Layout> : <NavigateToDashboard profile={profile} />;
  }
  if (path === '/ask') {
    return role === 'farmer' ? <Layout activePage="ask"><AskAgriDoctorPage /></Layout> : <NavigateToDashboard profile={profile} />;
  }
  if (path === '/my-crops') {
    return role === 'farmer' ? <Layout activePage="my-crops"><MyCropsPage /></Layout> : <NavigateToDashboard profile={profile} />;
  }
  if (path === '/history') {
    return role === 'farmer' ? <Layout activePage="history"><HistoryPage /></Layout> : <NavigateToDashboard profile={profile} />;
  }
  if (path.startsWith('/diagnosis/')) {
    return role === 'farmer' ? <Layout activePage="history"><DiagnosisDetailPage /></Layout> : <NavigateToDashboard profile={profile} />;
  }
  if (path.startsWith('/expert-help')) {
    return role === 'farmer' ? <Layout activePage="expert-help"><ExpertHelpPage /></Layout> : <NavigateToDashboard profile={profile} />;
  }

  // Expert routes
  if (path === '/expert-dashboard') {
    return role === 'expert' ? <Layout activePage="expert-dashboard"><ExpertDashboard /></Layout> : <NavigateToDashboard profile={profile} />;
  }
  if (path === '/expert-requests') {
    return role === 'expert' ? <Layout activePage="expert-requests"><ExpertDashboard /></Layout> : <NavigateToDashboard profile={profile} />;
  }

  // Shared routes (chat)
  if (path.startsWith('/chat/')) {
    return (role === 'farmer' || role === 'expert') ? <Layout activePage={role === 'expert' ? 'expert-requests' : 'expert-help'}><ChatPage /></Layout> : <NavigateToDashboard profile={profile} />;
  }

  // Learn — all roles
  if (path === '/learn') {
    return <Layout activePage="learn"><LearnPage /></Layout>;
  }

  // Admin routes
  if (path === '/admin-dashboard') {
    return role === 'admin' ? <Layout activePage="admin-dashboard"><AdminDashboard /></Layout> : <NavigateToDashboard profile={profile} />;
  }
  if (path === '/admin-crops') {
    return role === 'admin' ? <Layout activePage="admin-crops"><AdminCropsPage /></Layout> : <NavigateToDashboard profile={profile} />;
  }
  if (path === '/admin-diseases') {
    return role === 'admin' ? <Layout activePage="admin-diseases"><AdminDiseasesPage /></Layout> : <NavigateToDashboard profile={profile} />;
  }
  if (path === '/admin-users') {
    return role === 'admin' ? <Layout activePage="admin-users"><AdminUsersPage /></Layout> : <NavigateToDashboard profile={profile} />;
  }

  // Fallback
  return <NavigateToDashboard profile={profile} />;
}

function NavigateToDashboard({ profile }: { profile: Profile | null }) {
  const { navigate } = useRouter();
  useEffect(() => {
    const role = profile?.role ?? 'farmer';
    navigate(role === 'admin' ? '/admin-dashboard' : role === 'expert' ? '/expert-dashboard' : '/dashboard');
  }, [profile, navigate]); // ✅ FIXED: Added 'navigate' to dependency array

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </RouterProvider>
  );
}
