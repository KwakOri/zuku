'use client';

import Link from 'next/link';
import { Home, LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

export interface PageHeaderProps {
  /** 페이지 제목 */
  title: string;
  /** 페이지 설명 */
  description?: string;
  /** 헤더 아이콘 (LucideIcon) */
  icon?: LucideIcon;
  /** 헤더 우측에 표시할 액션 버튼 또는 컴포넌트 */
  actions?: ReactNode;
  /** 홈 링크 표시 여부 (기본: true) */
  showHomeLink?: boolean;
  /** 홈 링크 경로 (기본: '/') */
  homeLinkHref?: string;
}

export default function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  showHomeLink = true,
  homeLinkHref = '/',
}: PageHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flat-surface bg-gray-50 border-0 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {showHomeLink && (
              <Link
                href={homeLinkHref}
                className="p-2 flat-card text-gray-500 hover:text-gray-700 rounded-2xl hover:flat-pressed transition-all duration-200"
              >
                <Home className="w-5 h-5" />
              </Link>
            )}

            <div className="flex items-center gap-3">
              {Icon && (
                <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-md">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-800">{title}</h1>
                {description && (
                  <p className="text-sm text-gray-600">{description}</p>
                )}
              </div>
            </div>
          </div>

          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </div>
    </header>
  );
}
