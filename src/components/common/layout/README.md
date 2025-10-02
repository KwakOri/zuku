# Page Layout Components

페이지 헤더와 레이아웃을 통일하기 위한 공통 컴포넌트입니다.

## Components

### PageHeader

Fixed 포지션으로 상단에 고정되는 페이지 헤더 컴포넌트입니다.

#### Props

- `title` (required): 페이지 제목
- `description` (optional): 페이지 설명
- `icon` (optional): 헤더 아이콘 (LucideIcon)
- `actions` (optional): 헤더 우측에 표시할 액션 버튼 또는 컴포넌트
- `showHomeLink` (optional): 홈 링크 표시 여부 (기본: true)
- `homeLinkHref` (optional): 홈 링크 경로 (기본: '/')

#### Example

```tsx
import { PageHeader } from '@/components/common/layout';
import { Users, UserPlus } from 'lucide-react';

<PageHeader
  title="학생 관리"
  description="학생 정보를 관리하고 개별 일정을 편집하세요"
  icon={Users}
  actions={
    <button className="px-4 py-2 bg-primary-600 text-white rounded-xl">
      <UserPlus className="w-4 h-4" />
      학생 추가
    </button>
  }
/>
```

### PageLayout

페이지 메인 컨텐츠를 감싸는 레이아웃 컴포넌트입니다.

#### Props

- `children` (required): 페이지 컨텐츠
- `variant` (optional): 레이아웃 변형
  - `'default'`: 일반적인 컨테이너 레이아웃 (max-w-7xl, padding)
  - `'inset'`: 화면 전체를 사용하는 레이아웃 (패딩 없음)
- `hasHeader` (optional): PageHeader 사용 시 상단 여백 추가 (기본: true)
- `className` (optional): 배경색 클래스 (기본: 'bg-gray-50')

#### Example

```tsx
import { PageLayout } from '@/components/common/layout';

// Default layout (일반 페이지)
<PageLayout variant="default">
  <YourContent />
</PageLayout>

// Inset layout (전체 화면 사용)
<PageLayout variant="inset">
  <FullWidthContent />
</PageLayout>

// Without header
<PageLayout variant="default" hasHeader={false}>
  <YourContent />
</PageLayout>
```

## Full Page Example

```tsx
'use client';

import { PageHeader, PageLayout } from '@/components/common/layout';
import { Users, UserPlus } from 'lucide-react';
import { useState } from 'react';

export default function ExamplePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="학생 관리"
        description="학생 정보를 관리하고 개별 일정을 편집하세요"
        icon={Users}
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl"
          >
            <UserPlus className="w-4 h-4" />
            학생 추가
          </button>
        }
      />

      <PageLayout variant="default">
        {/* Your page content here */}
        <div>Page Content</div>
      </PageLayout>
    </>
  );
}
```

## Layout Variants

### Default Layout
- 최대 너비: `max-w-7xl`
- 좌우 패딩: `px-4 sm:px-6 lg:px-8`
- 상하 패딩: `py-8`
- 사용 예: 일반적인 페이지, 목록 페이지, 상세 페이지

### Inset Layout
- 패딩 없음
- 화면 전체 사용
- 사용 예: 시간표, 캘린더, 대시보드 등 전체 화면이 필요한 페이지

## Features

- ✅ Fixed 헤더로 스크롤 시에도 항상 상단에 표시
- ✅ 헤더 높이만큼 자동 padding-top 적용
- ✅ 반응형 디자인 지원
- ✅ TypeScript 타입 지원
- ✅ 두 가지 레이아웃 변형 (default, inset)
- ✅ 커스터마이징 가능한 액션 영역
