import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastHost } from '@/components/ui';
import { RequireAdmin, RequireAuth } from '@/guards';
import { pageView } from '@/services/analytics.service';

import { Home } from '@/pages/Home';
import { Books } from '@/pages/Books';
import { BookDetails } from '@/pages/BookDetails';
import { Author } from '@/pages/Author';
import { About } from '@/pages/About';
import { SearchPage } from '@/pages/Search';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { Account } from '@/pages/Account';
import { Library } from '@/pages/Library';
import { Bookmarks } from '@/pages/Bookmarks';
import { History } from '@/pages/History';
import { Checkout } from '@/pages/Checkout';
import { PaymentSuccess } from '@/pages/PaymentSuccess';
import { PaymentFailed } from '@/pages/PaymentFailed';
import { NotFound } from '@/pages/NotFound';

import { ReaderPage } from '@/reader/Reader';
import { AdminLayout } from '@/admin/AdminLayout';
import { AdminDashboard } from '@/admin/Dashboard';
import { AdminBooks } from '@/admin/BooksAdmin';
import { AdminBookEdit } from '@/admin/BookEdit';
import { AdminChapters } from '@/admin/ChaptersAdmin';
import { AdminChapterEditor } from '@/admin/ChapterEditor';
import { AdminAuthors } from '@/admin/AuthorsAdmin';
import { AdminUsers } from '@/admin/UsersAdmin';
import { AdminOrders } from '@/admin/OrdersAdmin';
import { AdminPayments } from '@/admin/PaymentsAdmin';
import { AdminAnalytics } from '@/admin/AnalyticsAdmin';
import { AdminSettings } from '@/admin/SettingsAdmin';

function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="page">{children}</main>
      <Footer />
    </>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Tracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    pageView(pathname);
  }, [pathname]);
  return null;
}

export function App() {
  const { toasts, dismiss } = useToast();
  const { hydrate } = useAuth();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <>
      <ScrollToTop />
      <Tracker />
      <ToastHost toasts={toasts} onDismiss={dismiss} />
      <Routes>
        <Route path="/" element={<PublicShell><Home /></PublicShell>} />
        <Route path="/books" element={<PublicShell><Books /></PublicShell>} />
        <Route path="/books/:slug" element={<PublicShell><BookDetails /></PublicShell>} />
        <Route path="/author" element={<PublicShell><Author /></PublicShell>} />
        <Route path="/about" element={<PublicShell><About /></PublicShell>} />
        <Route path="/search" element={<PublicShell><SearchPage /></PublicShell>} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/library"
          element={
            <RequireAuth>
              <PublicShell><Library /></PublicShell>
            </RequireAuth>
          }
        />
        <Route
          path="/account"
          element={
            <RequireAuth>
              <PublicShell><Account /></PublicShell>
            </RequireAuth>
          }
        />
        <Route
          path="/bookmarks"
          element={
            <RequireAuth>
              <PublicShell><Bookmarks /></PublicShell>
            </RequireAuth>
          }
        />
        <Route
          path="/history"
          element={
            <RequireAuth>
              <PublicShell><History /></PublicShell>
            </RequireAuth>
          }
        />
        <Route
          path="/checkout/:bookId"
          element={
            <RequireAuth>
              <PublicShell><Checkout /></PublicShell>
            </RequireAuth>
          }
        />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />

        <Route
          path="/read/:bookId"
          element={
            <RequireAuth>
              <ReaderPage />
            </RequireAuth>
          }
        />
        <Route
          path="/read/:bookId/:chapterId"
          element={
            <RequireAuth>
              <ReaderPage />
            </RequireAuth>
          }
        />

        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="books" element={<AdminBooks />} />
          <Route path="books/new" element={<AdminBookEdit />} />
          <Route path="books/:id" element={<AdminBookEdit />} />
          <Route path="books/:id/chapters" element={<AdminChapters />} />
          <Route path="books/:id/chapters/new" element={<AdminChapterEditor />} />
          <Route path="books/:id/chapters/:chapterId" element={<AdminChapterEditor />} />
          <Route path="authors" element={<AdminAuthors />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<PublicShell><NotFound /></PublicShell>} />
      </Routes>
    </>
  );
}