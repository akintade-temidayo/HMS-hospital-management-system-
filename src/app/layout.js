import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'HMS - Multi-Tenant Hospital Management System',
  description: 'Enterprise Healthcare Management Platform Frontend',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 font-sans antialiased selection:bg-(--primary-color) selection:text-white">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors duration={3000} closeButton />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
