import React from 'react';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import BlogHeader from './BlogHeader';

interface Filter {
  id: number;
  name: string;
  slug: string;
}

interface UserPlanLimits {
  isFree: boolean;
  maxBoards: number;
  maxLibrariesPerBoard: number;
  canShare: boolean;
  planName: string;
  planSlug: string;
}

interface CurrentPlan {
  id: number;
  name: string;
  slug: string;
  price: number;
  billing_period: string;
  expires_at?: string;
  days_until_expiry?: number;
}

interface Settings {
  logo?: string;
  copyright_text?: string;
}

interface BlogLayoutProps extends PageProps {
  children: React.ReactNode;
  userPlanLimits?: UserPlanLimits | null;
  currentPlan?: CurrentPlan | null;
  settings?: Settings;
  filters?: {
    platforms: Filter[];
    categories: Filter[];
    industries: Filter[];
    interactions: Filter[];
  };
}

const BlogLayout: React.FC<BlogLayoutProps> = ({
  children,
  filters,
  userPlanLimits,
  currentPlan,
  settings,
  auth,
}) => {
  const { props } = usePage<PageProps>();

  // Use auth from props if passed directly, otherwise fall back to props.auth from usePage
  const authData = auth || props.auth;

  return (
    <div className="min-h-screen max-w-[1920px] mx-auto bg-[#F9F5FF] dark:bg-gray-900">
      <BlogHeader
        auth={authData}
        filters={filters}
        ziggy={props.ziggy}
        userPlanLimits={userPlanLimits}
        currentPlan={currentPlan}
        settings={settings}
      />

      <main className="min-h-screen">
        {children}
        {/* Bottom spacer without padding/margin */}
      </main>
    </div>
  );
};

export default BlogLayout;
