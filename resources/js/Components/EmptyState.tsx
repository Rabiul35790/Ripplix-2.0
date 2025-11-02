import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface EmptyStateProps {
  icon: LucideIcon;
  heading: string;
  description: string;
  buttonText: string;
  buttonRoute: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  heading,
  description,
  buttonText,
  buttonRoute,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="mb-6">
        <Icon className="w-20 h-20 text-[#62626C] mx-auto" />
      </div>

      <h2 className="text-[32px] font-sora !font-semibold text-[#0A081B] mb-3">
        {heading}
      </h2>

      <p className="text-[14px] font-poppins font-light text-[#7F7F8A] mb-8 max-w-md">
        {description}
      </p>

      <Link
        href={buttonRoute}
        className="holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] text-white px-3 sm:px-4 py-2 rounded-[4px] !font-sora !font-medium text-[16px] hover:opacity-95 transition-all whitespace-nowrap shadow-[4px_4px_6px_0px_#34407C2E] outline-none focus:outline-none"
      >
        <span className='z-10'>{buttonText}</span>

      </Link>
    </div>
  );
};

export default EmptyState;
