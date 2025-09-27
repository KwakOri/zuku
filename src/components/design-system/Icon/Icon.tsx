import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Edit,
  Eye,
  EyeOff,
  File,
  FileText,
  Globe,
  Home,
  Info,
  Mail,
  Menu,
  MoreHorizontal,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Settings,
  Star,
  Trash2,
  User,
  Users,
  X,
  XCircle,
} from 'lucide-react';

const iconVariants = cva(
  // Base styles
  "transition-colors duration-200 ease-in-out",
  {
    variants: {
      size: {
        xs: "w-3 h-3",
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
        xl: "w-8 h-8",
        "2xl": "w-10 h-10",
      },
      color: {
        default: "text-current",
        primary: "text-primary-600",
        secondary: "text-secondary-600",
        success: "text-success-600",
        warning: "text-warning-600",
        error: "text-error-600",
        muted: "text-neu-500",
        white: "text-white",
        black: "text-black",
      },
    },
    defaultVariants: {
      size: "md",
      color: "default",
    },
  }
);

// Icon mapping
const iconMap = {
  'alert-circle': AlertCircle,
  'alert-triangle': AlertTriangle,
  calendar: Calendar,
  check: Check,
  'check-circle': CheckCircle,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevron-up': ChevronUp,
  clock: Clock,
  edit: Edit,
  eye: Eye,
  'eye-off': EyeOff,
  file: File,
  'file-text': FileText,
  globe: Globe,
  home: Home,
  info: Info,
  mail: Mail,
  menu: Menu,
  'more-horizontal': MoreHorizontal,
  'more-vertical': MoreVertical,
  pencil: Pencil,
  plus: Plus,
  search: Search,
  settings: Settings,
  star: Star,
  trash: Trash2,
  user: User,
  users: Users,
  x: X,
  'x-circle': XCircle,
} as const;

export type IconName = keyof typeof iconMap;

export interface IconProps extends VariantProps<typeof iconVariants> {
  /** Icon name from lucide-react */
  name: IconName;
  /** Icon size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Icon color */
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted' | 'white' | 'black';
  /** Additional CSS class */
  className?: string;
  /** Click handler */
  onClick?: () => void;
  /** Accessibility label */
  'aria-label'?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size,
  color,
  className,
  onClick,
  'aria-label': ariaLabel,
  ...props
}) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in iconMap`);
    return null;
  }

  return (
    <IconComponent
      className={cn(iconVariants({ size, color }), onClick && 'cursor-pointer', className)}
      onClick={onClick}
      aria-label={ariaLabel}
      {...props}
    />
  );
};