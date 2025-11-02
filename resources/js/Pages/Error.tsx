import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
  Home,
  ArrowLeft,
  AlertTriangle,
  Lock,
  Server,
  Clock,
  Zap,
  RefreshCw
} from 'lucide-react';
import Layout2 from './Layout2';

interface Library {
  id: number;
  title: string;
  slug: string;
  url: string;
  video_url: string;
  description?: string;
  logo?: string;
  platforms: Array<{ id: number; name: string }>;
  categories: Array<{ id: number; name: string; image?: string }>;
  industries: Array<{ id: number; name: string }>;
  interactions: Array<{ id: number; name: string }>;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
}

interface Filter {
  id: number;
  name: string;
  slug: string;
  image?: string;
}

interface ErrorData {
  title: string;
  message: string;
  description: string;
  icon: string;
  canRetry: boolean;
  showCategories: boolean;
  theme: {
    bg: string;
    text: string;
    button: string;
  };
}

interface SuggestedAction {
  label: string;
  action: string;
  primary: boolean;
}

interface ErrorPageProps extends PageProps {
  status: number;
  error: ErrorData;
  libraries: Library[];
  categories: Category[];
  filters: {
    platforms: Filter[];
    categories: Filter[];
    industries: Filter[];
    interactions: Filter[];
  };
  suggestedActions: SuggestedAction[];
  filterType?: string | null;
  filterValue?: string | null;
  filterName?: string | null;
  categoryData?: any | null;
}

const Error: React.FC<ErrorPageProps> = ({
  status,
  error,
  libraries,
  categories,
  filters,
  suggestedActions,
  filterType,
  filterValue,
  filterName,
  categoryData,
  auth
}) => {
  const { url, props } = usePage<PageProps>();

  const authData = auth || props.auth;
  const ziggyData = props.ziggy;

  // Get appropriate icon based on status code
  const getErrorIcon = (statusCode: number) => {
    switch (statusCode) {
      case 404:
        return <AlertTriangle className="w-32 h-32 text-red-500" />;
      case 403:
        return <Lock className="w-32 h-32 text-red-500" />;
      case 500:
        return <Server className="w-32 h-32 text-red-500" />;
      case 503:
        return <Clock className="w-32 h-32 text-yellow-500" />;
      case 419:
        return <RefreshCw className="w-32 h-32 text-blue-500" />;
      case 429:
        return <Zap className="w-32 h-32 text-orange-500" />;
      default:
        return <AlertTriangle className="w-32 h-32 text-gray-500" />;
    }
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'refresh':
        window.location.reload();
        break;
      case 'back':
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = '/';
        }
        break;
      case 'home':
        window.location.href = '/';
        break;
      case 'browse':
        window.location.href = '/browse';
        break;
      default:
        window.location.href = '/';
    }
  };

  return (
    <>
      <Head title={`${status} - ${error.title}`} />
      <Layout2
        libraries={libraries}
        currentRoute={url}
        onSearch={() => {}}
        searchQuery=""
        filters={filters}
        auth={authData}
        ziggy={ziggyData}
        filterType={filterType}
        filterValue={filterValue}
        filterName={filterName}
        categoryData={categoryData}
      >
        {/* Error Page Content */}
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 font-sora">

          <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

            {/* Left Side */}
            <div className="space-y-4 text-right md:text-center">
              <h1 className="text-9xl font-bold text-[#0A081B] dark:text-white">
                {status}
              </h1>
              <h2 className="text-5xl pb-5 font-semibold text-[#0A081B] dark:text-white">
                {error.title}
              </h2>
              <p className="text-xl pb-5 text-gray-600 dark:text-gray-400">
                {error.message}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-center mt-6">
                {suggestedActions?.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleAction(action.action)}
                    className={`holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] text-white px-3 sm:px-6 py-3 rounded-[4px] !font-sora !font-medium text-lg hover:opacity-95 transition-opacity whitespace-nowrap shadow-[4px_4px_6px_0px_#34407C2E] outline-none focus:outline-none ${
                      action.primary
                        ? `border-transparent text-white ${error.theme?.button || 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'}`
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className='z-10'>
                    {action.action === 'home'}
                    {action.action === 'back'}
                    {(action.action === 'refresh' || action.action === 'retry')}
                    {action.label}
                    </span>
                  </button>
                )) || (
                  <Link
                    href="/"
                    className={`bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] text-white px-3 sm:px-4 py-2 rounded-[4px] !font-sora !font-medium text-[16px] hover:opacity-95 transition-opacity text-sm whitespace-nowrap shadow-[4px_4px_6px_0px_#34407C2E] outline-none focus:outline-none ${error.theme?.button || 'bg-[#784AEF] hover:opacity-90 focus:ring-0 focus:outline-none'} transition-opacity duration-500`}
                  >

                    Back to Home
                  </Link>
                )}
              </div>
            </div>

            {/* Right Side - Error Icon/Image */}
            <div className="flex justify-center md:justify-start">
              <div className="w-56 h-56 flex items-center justify-center">
                {/* {getErrorIcon(status)} */}
                <img src='images/error.png' alt='Error Illustration' className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </Layout2>
    </>
  );
};

export default Error;
