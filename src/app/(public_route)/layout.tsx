import PublicRoute from '@/components/auth/PublicRoute';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <PublicRoute>
      {children}
    </PublicRoute>
  );
}