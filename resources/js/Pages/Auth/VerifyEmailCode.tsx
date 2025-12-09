import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState, useRef, useEffect } from 'react';
import { Mail, CheckCircle, RefreshCw} from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';

interface Settings {
  logo?: string;
  favicon?: string;
  authentication_page_image?: string;
}

interface Props {
    email: string;
    status?: string;
    message?: string;
    settings?: Settings;
}

export default function VerifyEmailCode({ email, status, message, settings }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [resending, setResending] = useState(false);

    useEffect(() => {
        // We look for a flag that indicates the page has already reloaded once
        const hasReloaded = localStorage.getItem('hasVerifiedEmailReloaded');

        if (!hasReloaded) {
            // If it hasn't reloaded yet:
            // 1. Set the flag to true.
            localStorage.setItem('hasVerifiedEmailReloaded', 'true');

            // 2. Force the browser to reload the page completely.
            window.location.reload();
        } else {
            // If it has reloaded (this is the second visit), remove the flag.
            // This allows the next *initial* visit to trigger the reload again if necessary.
            localStorage.removeItem('hasVerifiedEmailReloaded');
        }

        // Standard useEffect cleanup function
        return () => {
            // Ensure the local storage item is cleared if the user navigates away normally
            localStorage.removeItem('hasVerifiedEmailReloaded');
        };
    }, []);


    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value.slice(-1);
        setCode(newCode);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        setData('code', newCode.join(''));
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newCode = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
        setCode(newCode);
        setData('code', newCode.join(''));

        const lastIndex = Math.min(pastedData.length, 5);
        inputRefs.current[lastIndex]?.focus();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.code.verify'));
    };

    const handleResend = () => {
        setResending(true);
        post(route('verification.code.resend'), {
            preserveScroll: true,
            onFinish: () => setResending(false),
        });
    };

    // console.log('Settings:', settings);

    return (
        <>
            <Head title="Verify Email" />
            <div className="min-h-screen flex font-sora bg-white dark:bg-gray-900">
                {/* Left Side - Verification Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-y-auto">
                    {/* Logo at top left */}
                    <div className="absolute top-6 sm:top-8 md:top-10 left-6 sm:left-8 md:left-10">
                        <Link
                        href='/'
                        >
                        {settings?.logo && (
                            <img
                                src={settings.logo}
                                alt="Logo"
                                className="h-8 sm:h-10 md:h-9 w-auto object-contain"
                            />
                        )}

                        </Link>


                    </div>

                    <div className="w-full max-w-md py-4 sm:py-0">
                        {/* Favicon Icon */}
                        <div className="hidden sm:block mb-6 sm:mb-8 md:mb-6">
                            {settings?.favicon && (
                                <img
                                    src={settings.favicon}
                                    alt="Favicon"
                                    className="w-16 sm:w-16 md:w-14 h-16 sm:h-16 md:h-14 object-cover"
                                />
                            )}
                        </div>

                        {/* Header */}
                        <div className="mb-6 sm:mb-8 md:mb-6 text-left">
                            <h2 className="text-2xl sm:text-3xl md:text-[28px] font-bold text-[#0A081B] dark:text-white mb-3">
                                Verify your email address
                            </h2>
                            <p className="text-xs sm:text-sm md:text-[13px] text-[#7F7F8A] dark:text-gray-400 leading-relaxed">
                                We've sent a 6 digit verification code to{' '}
                                <span className="font-semibold text-[#0A081B] dark:text-white">{email}</span>. Please copy that code from your inbox and paste here.
                            </p>
                        </div>

                        {/* Message Alert */}
                        {message && (
                            <div className="mb-4 sm:mb-6 md:mb-4 p-3 sm:p-4 md:p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <p className="text-xs sm:text-sm md:text-xs text-yellow-700 dark:text-yellow-300">
                                    {message}
                                </p>
                            </div>
                        )}

                        {/* Success Alert */}
                        {status === 'verification-code-sent' && (
                            <div className="mb-4 sm:mb-6 md:mb-4 p-3 sm:p-4 md:p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start space-x-2 sm:space-x-3 md:space-x-2">
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs sm:text-sm md:text-xs text-green-700 dark:text-green-300">
                                    A new verification code has been sent to your email.
                                </p>
                            </div>
                        )}

                        {/* Verification Form */}
                        <form onSubmit={submit} className="space-y-5 sm:space-y-6 md:space-y-5">
                            {/* Code Input Fields */}
                            <div>
                                <div className="flex justify-left gap-2 sm:gap-3 md:gap-2 mb-2">
                                    {code.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (inputRefs.current[index] = el)}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            onPaste={handlePaste}
                                            className="w-11 h-12 sm:w-14 sm:h-14 md:w-12 md:h-13 text-center text-xl sm:text-2xl md:text-xl font-semibold border border-[#E3E2FF] dark:border-gray-600 rounded-lg focus:border-[#2B235A] dark:focus:border-white focus:outline-none focus:ring-0 dark:focus:ring-gray-500 bg-[#FAFAFC] dark:bg-gray-800 text-[#2B235A] dark:text-white transition-all"
                                        />
                                    ))}
                                </div>
                                <InputError message={errors.code} className="mt-2 text-center text-xs sm:text-sm md:text-xs" />
                            </div>

                            {/* Verify Button */}
                            <PrimaryButton
                                onClick={submit}
                                className="w-full py-3 sm:py-3.5 md:py-3 px-4 !bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] hover:!bg-[#1f1a42] text-white font-medium text-sm sm:text-base md:text-sm rounded-lg transition-all duration-300 focus:!outline-none focus:!ring-0 disabled:opacity-100 disabled:cursor-not-allowed flex items-center justify-center"
                                disabled={processing || code.join('').length !== 6}
                            >
                                {processing ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Verifying...</span>
                                    </div>
                                ) : (
                                    <span>Verify</span>
                                )}
                            </PrimaryButton>

                            {/* Resend Code Section */}
                            <div className="text-center">
                                <p className="text-xs sm:text-sm md:text-xs text-[#6B6B6B] dark:text-gray-400">
                                    Didn't received yet?{' '}
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={resending}
                                        className="font-semibold text-[#2B235A] hover:text-[#1f1a42] dark:text-blue-400 dark:hover:text-blue-300 transition-colors disabled:opacity-50 focus:outline-none focus:ring-0"
                                    >
                                        {resending ? 'Sending...' : 'Resend Code'}
                                    </button>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Side - Image Placeholder */}
                <div className="hidden lg:flex lg:w-1/2 dark:bg-gray-800 items-center justify-center p-8">
                    <div className="w-full h-full max-w-3xl max-h-[850px] dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center  dark:border-gray-600 ">
                        {/* Image Placeholder */}

                    {settings?.authentication_page_image && (
                        <img
                            src={settings.authentication_page_image}
                            alt="Registration Side"
                            className="w-full h-full object-cover rounded-2xl"
                        />

                        )}

                    </div>
                </div>
            </div>
        </>
    );
}
