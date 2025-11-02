import React from 'react';
import { Infinity, X } from 'lucide-react';
import { Link as InertiaLink } from '@inertiajs/react';

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
  redirectUrl?: string;
}

const MembershipModal: React.FC<MembershipModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  buttonText,
  redirectUrl
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-md flex items-center justify-center z-[60] font-sora" onClick={handleBackdropClick}>
      <div className="bg-[#FFFFFFE5] border border-[#C3C3C9] rounded-[4px] p-6 md:p-16 max-w-5xl w-full h-auto md:h-[35rem] mx-4 relative shadow-2xl flex items-center justify-center">
        <button
          onClick={onClose}
          className="absolute right-4 md:right-6 top-4 md:top-6 text-gray-600 hover:text-[#2B235A] transition-colors duration-500 focus:outline-none focus:ring-0"
        >
          <X size={20} className="md:w-6 md:h-6" />
        </button>

        <div className="text-center flex flex-col items-center justify-center w-full">
          {/* Infinity Symbol */}
            {/* <div className="flex justify-center font-extrabold mb-4">
                <Infinity className="w-32 h-32 text-[#62626C]" />
            </div> */}
            <div className="flex justify-center font-extrabold mb-4">
                <svg className="w-32 h-32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="infinityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#06b6d4">
                                <animate attributeName="stop-color" values="#06b6d4; #f59e0b; #ef4444; #8b5cf6; #06b6d4" dur="4s" repeatCount="indefinite" />
                            </stop>
                            <stop offset="50%" stopColor="#f59e0b">
                                <animate attributeName="stop-color" values="#f59e0b; #ef4444; #8b5cf6; #06b6d4; #f59e0b" dur="4s" repeatCount="indefinite" />
                            </stop>
                            <stop offset="100%" stopColor="#ef4444">
                                <animate attributeName="stop-color" values="#ef4444; #8b5cf6; #06b6d4; #f59e0b; #ef4444" dur="4s" repeatCount="indefinite" />
                            </stop>
                        </linearGradient>
                    </defs>
                    <path
                        d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"
                        stroke="url(#infinityGradient)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>

          {/* Title */}
          <div className='max-w-xs mb-2'>
            <span className="font-semibold text-xl md:text-3xl text-[#2E241C]">{title}</span>
          </div>

          {/* Message */}
          <p className="text-xs md:text-sm text-[#62626C] mb-6 max-w-xs mx-auto">
            {message}
          </p>

          {/* Button */}
          <InertiaLink
            href={redirectUrl || "#"}
            className="holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] hover:opacity-95 transition-opacity text-white px-4 md:px-6 py-2 rounded-md font-sora font-semibold inline-block text-sm md:text-base focus:outline-none focus:ring-0"
            onClick={onClose}
          >
            <span className='z-10'>
            {buttonText}
            </span>
          </InertiaLink>
        </div>
      </div>
    </div>
  );
};

export default MembershipModal;
