import React from 'react';
import { Link } from '@inertiajs/react';

interface HolographicButtonProps {
  href?: string;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  as?: 'button' | 'link';
}

const HolographicButton: React.FC<HolographicButtonProps> = ({
  href,
  onClick,
  className = '',
  children,
  type = 'button',
  as = 'button',
}) => {
  const baseClasses = "holographic-link bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] text-white px-3 sm:px-4 py-2 rounded-[4px] !font-sora !font-medium text-[16px] hover:opacity-95 hover:text-black transition-all text-sm whitespace-nowrap shadow-[4px_4px_6px_0px_#34407C2E] outline-none focus:outline-none";

  if (as === 'link' && href) {
    return (
      <>
        <style>{`
          @keyframes greenCover {
            0% {
              left: -100%;
              top: 0%;
            }
            100% {
              left: 100%;
              top: 100%;
            }
          }

          .holographic-link {
            position: relative;
            overflow: hidden;
            display: inline-block;
            transition: all 1s ease;
          }

          .holographic-link::before {
            content: '';
            position: absolute;
            top: -100%;
            left: -100%;
            width: 300%;
            height: 300%;
            background: #00ff00;
            pointer-events: none;
            z-index: -1;
            transform: rotate(45deg) translateX(-100%);
            transition: transform 1s ease;
            color: black;
          }

          .holographic-link:hover::before {
            transform: rotate(45deg) translateX(0%);
            color: black;
          }
        `}</style>
        <Link href={href} className={`${baseClasses} ${className}`}>
          {children}
        </Link>
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes greenCover {
          0% {
            left: -100%;
            top: 0%;
          }
          100% {
            left: 100%;
            top: 100%;
          }
        }

        .holographic-link {
          position: relative;
          overflow: hidden;
          display: inline-block;
          transition: all 1s ease;
        }

        .holographic-link::before {
          content: '';
          position: absolute;
          top: -100%;
          left: -100%;
          width: 300%;
          height: 300%;
          background: #00ff00;
          pointer-events: none;
          z-index: -1;
          transform: rotate(45deg) translateX(-100%);
          transition: transform 1s ease;
          color: black;
        }

        .holographic-link:hover::before {
          transform: rotate(45deg) translateX(0%);
          color: black;
        }
      `}</style>
      <button
        type={type}
        onClick={onClick}
        className={`${baseClasses} ${className}`}
      >
        {children}
      </button>
    </>
  );
};

export default HolographicButton;
