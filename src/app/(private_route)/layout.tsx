import PrivateRoute from '@/components/auth/PrivateRoute';

interface PrivateLayoutProps {
  children: React.ReactNode;
}

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  return (
    <PrivateRoute>
      {children}
    </PrivateRoute>
  );
}