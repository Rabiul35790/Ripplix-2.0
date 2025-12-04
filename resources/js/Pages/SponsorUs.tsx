import React, { useCallback, useEffect, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { PageProps as BasePageProps } from '@/types';
import Layout from './Layout';
import {
  Building,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  AlertCircle,
  User,
  MessageSquare,
  Home,
  ChevronRight,
  Mail,
  DollarSign,
  Target
} from 'lucide-react';
import SimpleCaptcha from './Website/Components/SimpleCaptcha';
import LayoutUnauth from './LayoutUnauth';

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
  created_at: string;
  published_date:string;
}

interface UserPlanLimits {
  isFree: boolean;
  maxBoards: number;
  maxLibrariesPerBoard: number;
  canShare: boolean;
  planName: string;
  planSlug: string;
}

interface Flash {
  success?: string;
  error?: string;
}

interface Settings {
  emails: string[];
  phones: string[];
  addresses: string[];
  copyright_text?: string;
  logo?: string;
}

interface Filter {
  id: number;
  name: string;
  slug: string;
  image?: string;
}

interface SponsorUsProps extends BasePageProps {
  libraries: Library[];
  userLibraryIds?: number[];
  viewedLibraryIds?: number[];
  userPlanLimits?: UserPlanLimits | null;
  currentPlan?: any;
  filters: {
    platforms: Filter[];
    categories: Filter[];
    industries: Filter[];
    interactions: Filter[];
  };
  filterType?: string | null;
  filterValue?: string | null;
  filterName?: string | null;
  categoryData?: any | null;
  settings: Settings;
}

interface PageProps {
  flash?: Flash;
  auth: any;
  ziggy: any;
  [key: string]: any;
}

const SponsorUs: React.FC<SponsorUsProps> = ({
  libraries = [],
  filters,
  userLibraryIds: initialUserLibraryIds = [],
  viewedLibraryIds: initialViewedLibraryIds = [],
  userPlanLimits,
  currentPlan,
  filterType,
  filterValue,
  filterName,
  categoryData,
  settings,
  auth
}) => {
  const { url, props } = usePage<PageProps>();
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const [captchaError, setCaptchaError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use auth from props if passed directly, otherwise fall back to props.auth from usePage
  const authData = auth || props.auth;
  const ziggyData = props.ziggy;

  // Use settings from props first, then fallback to page props
  const settingsData = settings || props.settings;

  const [userLibraryIds, setUserLibraryIds] = useState<number[]>(initialUserLibraryIds);

  // ADD THIS: State for viewedLibraryIds
  const [viewedLibraryIds, setViewedLibraryIds] = useState<number[]>(initialViewedLibraryIds);

  // ADD THIS: Update viewedLibraryIds when props change
  useEffect(() => {
    setViewedLibraryIds(initialViewedLibraryIds);
  }, [initialViewedLibraryIds]);

  // ADD THIS: Update userLibraryIds when props change
  useEffect(() => {
    setUserLibraryIds(initialUserLibraryIds);
  }, [initialUserLibraryIds]);

  // ADD THIS: Callback to handle when a library is viewed
  const handleLibraryViewed = useCallback((libraryId: number) => {
    setViewedLibraryIds(prev => {
      if (prev.includes(libraryId)) return prev;
      return [...prev, libraryId];
    });
  }, []);

  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    name: authData?.user?.name || '',
    company_name: '',
    email: authData?.user?.email || '',
    phone: '',
    address: '',
    budget_range_min: '',
    budget_range_max: '',
    message: '',
    sponsorship_goals: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isCaptchaValid) {
      setCaptchaError('Please complete the anti-robot verification.');
      return;
    }

    setIsSubmitting(true);
    setCaptchaError('');
    clearErrors();

    post('/sponsor-us', {
      onSuccess: () => {
        reset('company_name', 'phone', 'address', 'budget_range_min', 'budget_range_max', 'message', 'sponsorship_goals');
        setIsSubmitting(false);
        setIsCaptchaValid(false);
      },
      onError: () => {
        setIsSubmitting(false);
      },
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setData(field as any, value);
    if (errors[field as keyof typeof errors]) {
      clearErrors(field as keyof typeof errors);
    }
  };

  // Safe render function for contact items
  const renderContactItems = (items: any[] | undefined, type: 'email' | 'phone' | 'address') => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return null;
    }

    const validItems = items.filter(item => item !== null && item !== undefined && item !== '');

    if (validItems.length === 0) {
      return null;
    }

    return validItems.map((item, index) => {
      let displayText = '';

      if (typeof item === 'string') {
        displayText = item;
      } else if (typeof item === 'object' && item !== null) {
        if (type === 'email' && item.email) {
          displayText = item.email;
        } else if (type === 'phone' && item.number) {
          displayText = item.number;
        } else if (type === 'address' && item.address) {
          displayText = item.address;
        } else {
          displayText = String(item);
        }
      } else {
        displayText = String(item);
      }

      return (
        <p key={index} className="text-xs sm:text-sm md:text-[13px] text-[#443B82] dark:text-gray-300 whitespace-pre-line">
          {displayText}
        </p>
      );
    });
  };

  return (
    <>
      <Head title="Sponsor" />
      <LayoutUnauth
        libraries={libraries}
        currentRoute={url}
        onSearch={() => {}}
        searchQuery=""
        filters={filters}
        auth={authData}
        ziggy={ziggyData}
        settings={settingsData}
        userPlanLimits={userPlanLimits}
        currentPlan={currentPlan}
        userLibraryIds={userLibraryIds}
        viewedLibraryIds={viewedLibraryIds}
        onLibraryViewed={handleLibraryViewed}
      >
        <div className="min-h-screen bg-[#F8F8F9] dark:bg-gray-900 py-6 sm:py-12 md:py-10 font-sora">
          <div className="max-w-full mx-auto px-4 sm:px-6 md:px-7 lg:px-8">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center space-x-1 text-sm text-[#BABABA] dark:text-gray-400 mb-3 sm:mb-4 md:mb-3.5">
              <Link
                href="/"
                className="hover:text-gray-700 dark:hover:text-gray-300 outline-none focus:outline-none transition-colors duration-300 ease-in-out"
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5" />
              </Link>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5" />
            </nav>

            <h3 className="text-xl sm:text-3xl md:text-[26px] font-sora !font-semibold text-gray-900 focus:outline-none outline-none dark:text-white mb-4 sm:mb-6 md:mb-5">
              Sponsor Us
            </h3>

            {/* Main Container */}
            <div className="max-w-full mx-auto bg-white dark:bg-gray-800 p-4 sm:p-8 md:p-6 lg:p-11 rounded-xl shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 md:gap-10">
                {/* Sponsorship Information */}
                <div className="flex flex-col">
                  <div className="dark:bg-gray-800 rounded-xl flex-1 lg:pr-20 flex flex-col">
                    <h2 className="text-lg sm:text-2xl md:text-2xl font-bold text-[#2B235A] dark:text-white mb-3 sm:mb-6 md:mb-4">
                      Why Sponsor Us?
                    </h2>

                    <p className="text-xs sm:text-base md:text-sm text-[#7F7F8A] dark:text-gray-300 mb-6 sm:mb-8 md:mb-7">
                      Join us as a sponsor and elevate your brand as we reach new heights together. Partner with us to access our engaged community and gain meaningful visibility.
                    </p>

                    {/* Benefits Section */}
                    <div className="space-y-3 sm:space-y-4 md:space-y-3.5 mb-6 sm:mb-8 md:mb-7">
                      <div className="flex items-start">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5 bg-[#2B235A] rounded-full mt-0.5 sm:mt-1 mr-2 sm:mr-3 md:mr-2.5 flex-shrink-0 flex items-center justify-center">
                          <svg
                            className="w-2.5 h-2.5 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-xs sm:text-base md:text-sm text-[#7F7F8A] dark:text-gray-300">
                          Brand visibility across our platform
                        </p>
                      </div>

                      <div className="flex items-start">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5 bg-[#2B235A] rounded-full mt-0.5 sm:mt-1 mr-2 sm:mr-3 md:mr-2.5 flex-shrink-0 flex items-center justify-center">
                          <svg
                            className="w-2.5 h-2.5 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-xs sm:text-base md:text-sm text-[#7F7F8A] dark:text-gray-300">
                          Access to our engaged developer community
                        </p>
                      </div>

                      <div className="flex items-start">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5 bg-[#2B235A] rounded-full mt-0.5 sm:mt-1 mr-2 sm:mr-3 md:mr-2.5 flex-shrink-0 flex items-center justify-center">
                          <svg
                            className="w-2.5 h-2.5 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-xs sm:text-base md:text-sm text-[#7F7F8A] dark:text-gray-300">
                          Custom sponsorship packages tailored to your needs
                        </p>
                      </div>

                      <div className="flex items-start">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5 bg-[#2B235A] rounded-full mt-0.5 sm:mt-1 mr-2 sm:mr-3 md:mr-2.5 flex-shrink-0 flex items-center justify-center">
                          <svg
                            className="w-2.5 h-2.5 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-xs sm:text-base md:text-sm text-[#7F7F8A] dark:text-gray-300">
                          Networking opportunities and strategic partnerships
                        </p>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4 sm:space-y-6 md:space-y-5 mt-auto p-4 sm:p-6 md:p-5 bg-[#F8F8F9] rounded-lg border border-[#F4F4FF]">
                      {/* Email Section */}
                      {settingsData?.emails && Array.isArray(settingsData.emails) && settingsData.emails.length > 0 && (
                        <div className="flex items-start">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-8.5 md:h-8.5 bg-white dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 border border-[#F2F2FF]">
                            <Mail className="w-4 h-4 sm:w-[18px] sm:h-[18px] md:w-[17px] md:h-[17px] text-[#443B82] dark:text-blue-400" />
                          </div>
                          <div className="ml-3 sm:ml-4 md:ml-3.5">
                            <h3 className="text-sm sm:text-base md:text-[15px] font-semibold text-[#2B235A] dark:text-white mb-1">Email</h3>
                            <div className="space-y-1">
                              {renderContactItems(settingsData.emails, 'email')}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Phone Section */}
                      {settingsData?.phones && Array.isArray(settingsData.phones) && settingsData.phones.length > 0 && (
                        <div className="flex items-start">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-8.5 md:h-8.5 bg-white dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 border border-[#F2F2FF]">
                            <Phone className="w-4 h-4 sm:w-[18px] sm:h-[18px] md:w-[17px] md:h-[17px] text-[#443B82] dark:text-blue-400" />
                          </div>
                          <div className="ml-3 sm:ml-4 md:ml-3.5">
                            <h3 className="text-sm sm:text-base md:text-[15px] font-semibold text-[#2B235A] dark:text-white mb-1">Phone</h3>
                            <div className="space-y-1">
                              {renderContactItems(settingsData.phones, 'phone')}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sponsorship Form */}
                <div className="flex flex-col">
                  <div className="dark:bg-gray-800 rounded-xl border border-[#F4F4FF] p-4 sm:p-8 md:p-6 flex-1 flex flex-col">
                    {/* Success/Error Messages */}
                    {props.flash?.success && (
                      <div className="mb-4 sm:mb-6 md:mb-5 p-3 sm:p-4 md:p-3.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0" />
                          <p className="text-xs sm:text-sm md:text-[13px] text-green-800 dark:text-green-200">{props.flash.success}</p>
                        </div>
                      </div>
                    )}

                    {props.flash?.error && (
                      <div className="mb-4 sm:mb-6 md:mb-5 p-3 sm:p-4 md:p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center">
                          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
                          <p className="text-xs sm:text-sm md:text-[13px] text-red-800 dark:text-red-200">{props.flash.error}</p>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 md:space-y-5 flex flex-col flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-5">
                        {/* Name Field */}
                        <div>
                          <label htmlFor="name" className="block text-xs sm:text-sm md:text-[13px] font-medium text-[#2B235A] dark:text-gray-300 mb-1.5 sm:mb-2 md:mb-1.5">
                            <User className="w-3 h-3 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 inline mr-1 sm:mr-2 md:mr-1.5" />
                            Full Name *
                          </label>
                          <input
                            type="text"
                            id="name"
                            value={data.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={`w-full px-3 sm:px-4 md:px-3.5 py-2 sm:py-3 md:py-2.5 text-xs sm:text-base md:text-sm border border-[#E3E2FF] bg-[#FAFAFC] rounded-lg focus:ring-2 focus:ring-[#E3E2FF] focus:border-transparent transition-colors ${
                              errors.name
                                ? 'border-red-500 dark:bg-red-900/20 dark:border-red-600'
                                : 'dark:border-gray-600 dark:bg-gray-700'
                            } text-[#2B235A] dark:text-white placeholder-[#B2B2BD] dark:placeholder-gray-500/50`}
                            placeholder="Enter your full name"
                            disabled={processing || isSubmitting}
                          />
                          {errors.name && (
                            <p className="mt-1 text-xs sm:text-sm md:text-xs text-red-600 dark:text-red-400">{errors.name}</p>
                          )}
                        </div>

                        {/* Company Name Field */}
                        <div>
                          <label htmlFor="company_name" className="block text-xs sm:text-sm md:text-[13px] font-medium text-[#2B235A] dark:text-gray-300 mb-1.5 sm:mb-2 md:mb-1.5">
                            <Building className="w-3 h-3 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 inline mr-1 sm:mr-2 md:mr-1.5" />
                            Company/Brand Name *
                          </label>
                          <input
                            type="text"
                            id="company_name"
                            value={data.company_name}
                            onChange={(e) => handleInputChange('company_name', e.target.value)}
                            className={`w-full px-3 sm:px-4 md:px-3.5 py-2 sm:py-3 md:py-2.5 text-xs sm:text-base md:text-sm border border-[#E3E2FF] bg-[#FAFAFC] rounded-lg focus:ring-2 focus:ring-[#E3E2FF] focus:border-transparent transition-colors ${
                              errors.company_name
                                ? 'border-red-500 dark:bg-red-900/20 dark:border-red-600'
                                : 'dark:border-gray-600 dark:bg-gray-700'
                            } text-[#2B235A] dark:text-white placeholder-[#B2B2BD] dark:placeholder-gray-500/50`}
                            placeholder="Enter your company or brand name"
                            disabled={processing || isSubmitting}
                          />
                          {errors.company_name && (
                            <p className="mt-1 text-xs sm:text-sm md:text-xs text-red-600 dark:text-red-400">{errors.company_name}</p>
                          )}
                        </div>

                        {/* Email Field */}
                        <div>
                          <label htmlFor="email" className="block text-xs sm:text-sm md:text-[13px] font-medium text-[#2B235A] dark:text-gray-300 mb-1.5 sm:mb-2 md:mb-1.5">
                            <Mail className="w-3 h-3 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 inline mr-1 sm:mr-2 md:mr-1.5" />
                            Email Address *
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={data.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={`w-full px-3 sm:px-4 md:px-3.5 py-2 sm:py-3 md:py-2.5 text-xs sm:text-base md:text-sm border border-[#E3E2FF] bg-[#FAFAFC] rounded-lg focus:ring-2 focus:ring-[#E3E2FF] focus:border-transparent transition-colors ${
                              errors.email
                                ? 'border-red-500 dark:bg-red-900/20 dark:border-red-600'
                                : 'dark:border-gray-600 dark:bg-gray-700'
                            } text-[#2B235A] dark:text-white placeholder-[#B2B2BD] dark:placeholder-gray-500/50`}
                            placeholder="Enter your email address"
                            disabled={processing || isSubmitting}
                          />
                          {errors.email && (
                            <p className="mt-1 text-xs sm:text-sm md:text-xs text-red-600 dark:text-red-400">{errors.email}</p>
                          )}
                        </div>

                        {/* Phone Field */}
                        <div>
                          <label htmlFor="phone" className="block text-xs sm:text-sm md:text-[13px] font-medium text-[#2B235A] dark:text-gray-300 mb-1.5 sm:mb-2 md:mb-1.5">
                            <Phone className="w-3 h-3 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 inline mr-1 sm:mr-2 md:mr-1.5" />
                            Contact Number *
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            value={data.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className={`w-full px-3 sm:px-4 md:px-3.5 py-2 sm:py-3 md:py-2.5 text-xs sm:text-base md:text-sm border border-[#E3E2FF] bg-[#FAFAFC] rounded-lg focus:ring-2 focus:ring-[#E3E2FF] focus:border-transparent transition-colors ${
                              errors.phone
                                ? 'border-red-500 dark:bg-red-900/20 dark:border-red-600'
                                : 'dark:border-gray-600 dark:bg-gray-700'
                            } text-[#2B235A] dark:text-white placeholder-[#B2B2BD] dark:placeholder-gray-500/50`}
                            placeholder="Enter your contact number"
                            disabled={processing || isSubmitting}
                          />
                          {errors.phone && (
                            <p className="mt-1 text-xs sm:text-sm md:text-xs text-red-600 dark:text-red-400">{errors.phone}</p>
                          )}
                        </div>
                      </div>

                      {/* Address Field */}
                      <div>
                        <label htmlFor="address" className="block text-xs sm:text-sm md:text-[13px] font-medium text-[#2B235A] dark:text-gray-300 mb-1.5 sm:mb-2 md:mb-1.5">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 inline mr-1 sm:mr-2 md:mr-1.5" />
                          Address *
                        </label>
                        <textarea
                          id="address"
                          rows={3}
                          value={data.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className={`w-full px-3 sm:px-4 md:px-3.5 py-2 sm:py-3 md:py-2.5 text-xs sm:text-base md:text-sm bg-[#FAFAFC] border border-[#E3E2FF] rounded-lg focus:ring-2 focus:ring-[#E3E2FF] focus:border-transparent transition-colors resize-vertical ${
                            errors.address
                              ? 'border-red-500 dark:bg-red-900/20 dark:border-red-600'
                              : 'dark:border-gray-600 dark:bg-gray-700'
                          } text-[#2B235A] dark:text-white placeholder-[#B2B2BD] dark:placeholder-gray-500/50`}
                          placeholder="Enter your company address"
                          disabled={processing || isSubmitting}
                        />
                        {errors.address && (
                          <p className="mt-1 text-xs sm:text-sm md:text-xs text-red-600 dark:text-red-400">{errors.address}</p>
                        )}
                      </div>

                      {/* Budget Range Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-5">
                        <div>
                          <label htmlFor="budget_range_min" className="block text-xs sm:text-sm md:text-[13px] font-medium text-[#2B235A] dark:text-gray-300 mb-1.5 sm:mb-2 md:mb-1.5">
                            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 inline mr-1 sm:mr-2 md:mr-1.5" />
                            Budget Range (Min)
                          </label>
                          <input
                            type="number"
                            id="budget_range_min"
                            value={data.budget_range_min}
                            onChange={(e) => handleInputChange('budget_range_min', e.target.value)}
                            className={`w-full px-3 sm:px-4 md:px-3.5 py-2 sm:py-3 md:py-2.5 text-xs sm:text-base md:text-sm border border-[#E3E2FF] bg-[#FAFAFC] rounded-lg focus:ring-2 focus:ring-[#E3E2FF] focus:border-transparent transition-colors ${
                              errors.budget_range_min
                                ? 'border-red-500 dark:bg-red-900/20 dark:border-red-600'
                                : 'dark:border-gray-600 dark:bg-gray-700'
                            } text-[#2B235A] dark:text-white placeholder-[#B2B2BD] dark:placeholder-gray-500/50`}
                            placeholder="e.g. 1000"
                            disabled={processing || isSubmitting}
                          />
                          {errors.budget_range_min && (
                            <p className="mt-1 text-xs sm:text-sm md:text-xs text-red-600 dark:text-red-400">{errors.budget_range_min}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="budget_range_max" className="block text-xs sm:text-sm md:text-[13px] font-medium text-[#2B235A] dark:text-gray-300 mb-1.5 sm:mb-2 md:mb-1.5">
                            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 inline mr-1 sm:mr-2 md:mr-1.5" />
                            Budget Range (Max)
                          </label>
                          <input
                            type="number"
                            id="budget_range_max"
                            value={data.budget_range_max}
                            onChange={(e) => handleInputChange('budget_range_max', e.target.value)}
                            className={`w-full px-3 sm:px-4 md:px-3.5 py-2 sm:py-3 md:py-2.5 text-xs sm:text-base md:text-sm border border-[#E3E2FF] bg-[#FAFAFC] rounded-lg focus:ring-2 focus:ring-[#E3E2FF] focus:border-transparent transition-colors ${
                              errors.budget_range_max
                                ? 'border-red-500 dark:bg-red-900/20 dark:border-red-600'
                                : 'dark:border-gray-600 dark:bg-gray-700'
                            } text-[#2B235A] dark:text-white placeholder-[#B2B2BD] dark:placeholder-gray-500/50`}
                            placeholder="e.g. 5000"
                            disabled={processing || isSubmitting}
                          />
                          {errors.budget_range_max && (
                            <p className="mt-1 text-xs sm:text-sm md:text-xs text-red-600 dark:text-red-400">{errors.budget_range_max}</p>
                          )}
                        </div>
                      </div>

                      {/* Sponsorship Goals Field */}
                      <div>
                        <label htmlFor="sponsorship_goals" className="block text-xs sm:text-sm md:text-[13px] font-medium text-[#2B235A] dark:text-gray-300 mb-1.5 sm:mb-2 md:mb-1.5">
                          <Target className="w-3 h-3 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 inline mr-1 sm:mr-2 md:mr-1.5" />
                          Sponsorship Goals
                        </label>
                        <textarea
                          id="sponsorship_goals"
                          rows={4}
                          value={data.sponsorship_goals}
                          onChange={(e) => handleInputChange('sponsorship_goals', e.target.value)}
                          className={`w-full px-3 sm:px-4 md:px-3.5 py-2 sm:py-3 md:py-2.5 text-xs sm:text-base md:text-sm bg-[#FAFAFC] border border-[#E3E2FF] rounded-lg focus:ring-2 focus:ring-[#E3E2FF] focus:border-transparent transition-colors resize-vertical ${
                            errors.sponsorship_goals
                              ? 'border-red-500 dark:bg-red-900/20 dark:border-red-600'
                              : 'dark:border-gray-600 dark:bg-gray-700'
                          } text-[#2B235A] dark:text-white placeholder-[#B2B2BD] dark:placeholder-gray-500/50`}
                          placeholder="What do you hope to achieve through this sponsorship?"
                          disabled={processing || isSubmitting}
                        />
                        <div className="mt-1 flex justify-between items-center">
                          {errors.sponsorship_goals ? (
                            <p className="text-xs sm:text-sm md:text-xs text-red-600 dark:text-red-400">{errors.sponsorship_goals}</p>
                          ) : (
                            <span></span>
                          )}
                          <span className={`text-xs sm:text-sm md:text-xs ${
                            data.sponsorship_goals.length > 1800
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-[#BABABA] dark:text-gray-400'
                          }`}>
                            {data.sponsorship_goals.length}/2000
                          </span>
                        </div>
                      </div>

                      {/* Message Field */}
                      <div>
                        <label htmlFor="message" className="block text-xs sm:text-sm md:text-[13px] font-medium text-[#2B235A] dark:text-gray-300 mb-1.5 sm:mb-2 md:mb-1.5">
                          <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 inline mr-1 sm:mr-2 md:mr-1.5" />
                          Message *
                        </label>
                        <textarea
                          id="message"
                          rows={6}
                          value={data.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          className={`w-full px-3 sm:px-4 md:px-3.5 py-2 sm:py-3 md:py-2.5 text-xs sm:text-base md:text-sm bg-[#FAFAFC] border border-[#E3E2FF] rounded-lg focus:ring-2 focus:ring-[#E3E2FF] focus:border-transparent transition-colors resize-vertical ${
                            errors.message
                              ? 'border-red-500 dark:bg-red-900/20 dark:border-red-600'
                              : 'dark:border-gray-600 dark:bg-gray-700'
                          } text-[#2B235A] dark:text-white placeholder-[#B2B2BD] dark:placeholder-gray-500/50`}
                          placeholder="Tell us more about your sponsorship proposal and how you'd like to collaborate..."
                          disabled={processing || isSubmitting}
                        />
                        <div className="mt-1 flex justify-between items-center">
                          {errors.message ? (
                            <p className="text-xs sm:text-sm md:text-xs text-red-600 dark:text-red-400">{errors.message}</p>
                          ) : (
                            <span></span>
                          )}
                          <span className={`text-xs sm:text-sm md:text-xs ${
                            data.message.length > 4500
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-[#BABABA] dark:text-gray-400'
                          }`}>
                            {data.message.length}/5000
                          </span>
                        </div>
                      </div>

                      <SimpleCaptcha
                        onValidationChange={setIsCaptchaValid}
                        error={captchaError}
                      />

                      {/* Submit Button */}
                      <div className="mt-auto pt-2">
                        <button
                          type="submit"
                          disabled={processing || isSubmitting || !isCaptchaValid}
                          className={`w-full flex items-center justify-center px-4 sm:px-6 md:px-5 py-2.5 sm:py-3 md:py-2.5 border border-transparent text-xs sm:text-base md:text-sm font-medium rounded-lg text-white transition-colors ${
                            processing || isSubmitting || !isCaptchaValid
                              ? 'bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] opacity-70 cursor-not-allowed'
                              : 'bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] hover:opacity-90 focus:outline-none focus:ring-0 focus:ring-offset-0 transition-opacity duration-500'
                          }`}
                        >
                          {processing || isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 md:h-4.5 md:w-4.5 border-b-2 border-white mr-2"></div>
                              <span className="text-xs sm:text-base md:text-sm">Sending...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5 mr-2" />
                              <span className="text-xs sm:text-base md:text-sm">Send Sponsorship Request</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LayoutUnauth>
    </>
  );
};

export default SponsorUs;
