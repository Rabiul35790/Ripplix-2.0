import React, { useEffect, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import BlogLayout from './BlogLayout';
import { ArrowLeft, FileText, Calendar, Shield, ScrollText, Sparkles, Cookie, AlertTriangle, Flag } from 'lucide-react';

interface Legal {
  id: number;
  type: string;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  type_label: string;
}

interface LegalShowProps extends PageProps {
  legal: Legal;
  userPlanLimits?: any;
  currentPlan?: any;
  settings?: {
    logo?: string;
    copyright_text?: string;
    site_name?: string;
  };
  filters?: any;
}

const LegalShow: React.FC<LegalShowProps> = ({
  legal,
  userPlanLimits,
  currentPlan,
  settings,
  filters,
  auth
}) => {
  const { props } = usePage<PageProps>();
  const authData = auth || props.auth;
  const ziggyData = props.ziggy;
  const contentRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDocumentIcon = () => {
    switch (legal.type) {
      case 'privacy_policy':
        return Shield;
      case 'terms_conditions':
        return ScrollText;
      case 'cookie_policy':
        return Cookie;
      case 'disclaimer':
        return AlertTriangle;
      case 'report_content_policy':
        return Flag;
      default:
        return FileText;
    }
  };

  const DocumentIcon = getDocumentIcon();

  // Process content to ensure proper styling
  useEffect(() => {
    if (contentRef.current) {
      // Remove any file attachment links (Filament adds these after images)
      const fileLinks = contentRef.current.querySelectorAll('a[download]');
      fileLinks.forEach(link => link.remove());

      // Style all images
      const images = contentRef.current.querySelectorAll('img');
      images.forEach(img => {
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.borderRadius = '12px';
        img.style.margin = '2rem 0';
        img.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
      });

      // Ensure headings have proper styling
      const h1Elements = contentRef.current.querySelectorAll('h1');
      const h2Elements = contentRef.current.querySelectorAll('h2');
      const h3Elements = contentRef.current.querySelectorAll('h3');
      const h4Elements = contentRef.current.querySelectorAll('h4');

      h1Elements.forEach(h1 => {
        h1.style.fontSize = '2.25rem';
        h1.style.fontWeight = '700';
        h1.style.marginTop = '2rem';
        h1.style.marginBottom = '1rem';
        h1.style.fontFamily = 'Sora, sans-serif';
        h1.style.color = '#150F32';
      });

      h2Elements.forEach(h2 => {
        h2.style.fontSize = '1.875rem';
        h2.style.fontWeight = '700';
        h2.style.marginTop = '2rem';
        h2.style.marginBottom = '1rem';
        h2.style.fontFamily = 'Sora, sans-serif';
        h2.style.color = '#150F32';
      });

      h3Elements.forEach(h3 => {
        h3.style.fontSize = '1.5rem';
        h3.style.fontWeight = '600';
        h3.style.marginTop = '1.75rem';
        h3.style.marginBottom = '0.875rem';
        h3.style.fontFamily = 'Sora, sans-serif';
        h3.style.color = '#150F32';
      });

      h4Elements.forEach(h4 => {
        h4.style.fontSize = '1.25rem';
        h4.style.fontWeight = '600';
        h4.style.marginTop = '1.5rem';
        h4.style.marginBottom = '0.75rem';
        h4.style.fontFamily = 'Sora, sans-serif';
        h4.style.color = '#150F32';
      });

      // Style paragraphs
      const paragraphs = contentRef.current.querySelectorAll('p');
      paragraphs.forEach(p => {
        p.style.fontFamily = 'Poppins, sans-serif';
        p.style.color = '#62626C';
        p.style.lineHeight = '1.8';
        p.style.marginBottom = '1rem';
      });

      // Style unordered lists (ul)
      const ulElements = contentRef.current.querySelectorAll('ul');
      ulElements.forEach(ul => {
        ul.style.fontFamily = 'Poppins, sans-serif';
        ul.style.color = '#62626C';
        ul.style.lineHeight = '1.8';
        ul.style.marginTop = '1rem';
        ul.style.marginBottom = '1rem';
        ul.style.paddingLeft = '1.5rem';
        ul.style.listStyleType = 'disc';
      });

      // Style ordered lists (ol)
      const olElements = contentRef.current.querySelectorAll('ol');
      olElements.forEach(ol => {
        ol.style.fontFamily = 'Poppins, sans-serif';
        ol.style.color = '#62626C';
        ol.style.lineHeight = '1.8';
        ol.style.marginTop = '1rem';
        ol.style.marginBottom = '1rem';
        ol.style.paddingLeft = '1.5rem';
        ol.style.listStyleType = 'decimal';
      });

      // Style list items (li)
      const liElements = contentRef.current.querySelectorAll('li');
      liElements.forEach(li => {
        li.style.fontFamily = 'Poppins, sans-serif';
        li.style.color = '#62626C';
        li.style.lineHeight = '1.8';
        li.style.marginBottom = '0.5rem';
        li.style.paddingLeft = '0.25rem';
      });

      // Style tables
      const tables = contentRef.current.querySelectorAll('table');
      tables.forEach(table => {
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.marginTop = '1.5rem';
        table.style.marginBottom = '1.5rem';
        table.style.fontFamily = 'Poppins, sans-serif';
      });

      const thElements = contentRef.current.querySelectorAll('th');
      thElements.forEach(th => {
        th.style.backgroundColor = '#F9F5FF';
        th.style.padding = '0.75rem';
        th.style.textAlign = 'left';
        th.style.fontWeight = '600';
        th.style.color = '#150F32';
        th.style.borderBottom = '2px solid #E9D5FF';
      });

      const tdElements = contentRef.current.querySelectorAll('td');
      tdElements.forEach(td => {
        td.style.padding = '0.75rem';
        td.style.borderBottom = '1px solid #F3F4F6';
        td.style.color = '#62626C';
      });
    }
  }, [legal.content]);

  const handleBack = () => {
    window.history.back();
  };

  // Legal pages configuration
  const legalPages = [
    { type: 'privacy_policy', label: 'Privacy Policy', icon: Shield, route: '/privacy' },
    { type: 'terms_conditions', label: 'Terms of Service', icon: ScrollText, route: '/terms' },
    { type: 'cookie_policy', label: 'Cookie Policy', icon: Cookie, route: '/cookie-policy' },
    { type: 'disclaimer', label: 'Disclaimer', icon: AlertTriangle, route: '/disclaimer' },
    { type: 'report_content_policy', label: 'Report Content Policy', icon: Flag, route: '/report-content-policy' }
  ];

  return (
    <>
      <Head title={legal.title}>
        <meta name="description" content={`${legal.type_label} - ${legal.title}`} />
      </Head>
      <BlogLayout
        settings={settings}
        filters={filters}
        currentPlan={currentPlan}
        userPlanLimits={userPlanLimits}
        auth={authData}
        ziggy={ziggyData}
      >
        <div className="bg-[#F9F5FF]">
          <div className="max-w-[1400px] mx-auto py-6 px-4 sm:px-6 lg:px-8 lg:py-12">
            <div className="max-w-4xl">
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 text-[#150F32] hover:opacity-80 font-poppins text-sm font-medium mb-6 sm:mb-8 lg:mb-10 transition-opacity duration-500 outline-none focus:outline-none focus:ring-0"
              >
                <ArrowLeft size={18} />
                Back
              </button>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <span className="text-[#8941D1] font-poppins text-xs sm:text-sm !font-medium uppercase flex items-center gap-2">
                  <DocumentIcon size={20} className="text-[#8941D1]" />
                  {legal.type_label}
                </span>
              </div>

              <h1 className="text-[#150F32] dark:text-white font-sora text-2xl sm:text-3xl lg:text-4xl xl:text-5xl !font-semibold mb-3 sm:mb-4 leading-tight">
                {legal.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-[#7F7F8A] font-poppins text-xs sm:text-sm mb-6">
                <span className="flex items-center gap-1.5">
                  <Calendar size={16} />
                  Last Updated: {formatDate(legal.updated_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900">
          <div className="max-w-[1400px] mx-auto py-8 px-4 sm:px-6 lg:px-8 lg:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              <div className="lg:col-span-8 max-w-4xl">
                <div
                  ref={contentRef}
                  className="legal-content prose prose-sm sm:prose-base max-w-none"
                  dangerouslySetInnerHTML={{ __html: legal.content }}
                />

                {/* Additional Information Section */}
                <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-[#F9F5FF] rounded-xl border border-[#E9D5FF]">
                  <h3 className="font-sora text-base sm:text-lg lg:text-xl !font-semibold text-[#150F32] mb-2 sm:mb-3">
                    Questions or Concerns?
                  </h3>
                  <p className="font-poppins text-sm sm:text-base text-[#62626C] leading-relaxed">
                    If you have any questions about this,
                    please feel free to contact us. We're here to help clarify any concerns you may have.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-6">
                  {/* Quick Links Card */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 lg:p-6">
                    <h3 className="font-sora text-base sm:text-lg !font-semibold text-[#150F32] mb-3 sm:mb-4">
                      Important Policies
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      {legalPages.map((page) => {
                        const Icon = page.icon;
                        return (
                          <Link
                            key={page.type}
                            href={page.route}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors outline-none focus:outline-none focus:ring-0 ${
                              legal.type === page.type
                                ? 'bg-[#F9F5FF] text-[#8941D1]'
                                : 'hover:bg-gray-50 text-[#62626C]'
                            }`}
                          >
                            <Icon size={20} className="flex-shrink-0" />
                            <span className="font-poppins text-sm font-medium">{page.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* CTA Card */}
                  <div
                    className="rounded-xl px-4 py-6 sm:px-5 sm:py-7 lg:px-6 lg:py-8 text-white flex flex-col items-center text-center"
                    style={{
                      background: 'linear-gradient(101.84deg, #9943EE 3.72%, #51148D 98.49%)',
                      boxShadow: '0px 10px 30px -5px rgba(137, 65, 209, 0.3)'
                    }}
                  >
                    <h3 className="font-sora text-lg sm:text-xl lg:text-2xl !font-bold max-w-[280px] mb-2 sm:mb-3 leading-tight">
                      Discover Thousands of Real UI Interactions
                    </h3>

                    <p className="font-poppins text-xs sm:text-sm opacity-90 max-w-[280px] mb-4 sm:mb-5 lg:mb-6">
                      Level up your design workflow with Ripplix — explore motion patterns from real apps and save hours on research.
                    </p>

                    <img
                      src="/images/logo/prompt.png"
                      alt="Prompt Logo"
                      className="mb-4 sm:mb-5 lg:mb-6 object-contain w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48"
                    />

                    <Link
                      href={route('register')}
                      className="inline-block w-full sm:w-auto bg-white text-[#8941D1] font-poppins font-semibold px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg hover:bg-gray-100 transition-colors outline-none focus:outline-none focus:ring-0 text-sm sm:text-base"
                    >
                      Try Ripplix →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BlogLayout>
    </>
  );
};

export default LegalShow;
