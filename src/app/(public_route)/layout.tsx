import PublicRoute from '@/components/common/auth/PublicRoute';

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