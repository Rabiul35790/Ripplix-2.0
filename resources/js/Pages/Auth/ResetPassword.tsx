import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';

interface Settings {
  logo?: string;
  favicon?: string;
  authentication_page_image?: string;
}

interface Props {
    token: string;
    email: string;
    settings?: Settings;
}

export default function ResetPassword({ token, email, settings }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Reset Password" />
            <div className="min-h-screen flex font-sora bg-white dark:bg-gray-900">
                {/* Left Side - Reset Password Form */}
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
                                Reset your password
                            </h2>
                            <p className="text-xs sm:text-sm md:text-[13px] text-[#7F7F8A] dark:text-gray-400 leading-relaxed">
                                Please enter your new password below. Make sure it's strong and secure.
                            </p>
                        </div>

                        {/* Reset Password Form */}
                        <form onSubmit={submit} className="space-y-4 sm:space-y-5 md:space-y-4">
                            {/* Email Input */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-xs sm:text-sm md:text-xs font-medium text-[#0A081B] dark:text-white mb-2"
                                >
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 md:pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 sm:h-5 sm:w-5 md:h-4 md:w-4 text-[#7F7F8A] dark:text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        autoComplete="username"
                                        className="w-full pl-10 sm:pl-12 md:pl-10 pr-3 sm:pr-4 md:pr-3 py-2.5 sm:py-3 md:py-2.5 text-sm sm:text-base md:text-sm border border-[#E3E2FF] dark:border-gray-600 rounded-lg focus:border-[#2B235A] dark:focus:border-white focus:outline-none focus:ring-0 bg-[#FAFAFC] dark:bg-gray-800 text-[#0A081B] dark:text-white placeholder-[#7F7F8A] dark:placeholder-gray-500 transition-all"
                                        placeholder="Enter your email"
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-2 text-xs sm:text-sm md:text-xs" />
                            </div>

                            {/* Password Input */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-xs sm:text-sm md:text-xs font-medium text-[#0A081B] dark:text-white mb-2"
                                >
                                    New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 md:pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 sm:h-5 sm:w-5 md:h-4 md:w-4 text-[#7F7F8A] dark:text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        autoComplete="new-password"
                                        autoFocus
                                        className="w-full pl-10 sm:pl-12 md:pl-10 pr-10 sm:pr-12 md:pr-10 py-2.5 sm:py-3 md:py-2.5 text-sm sm:text-base md:text-sm border border-[#E3E2FF] dark:border-gray-600 rounded-lg focus:border-[#2B235A] dark:focus:border-white focus:outline-none focus:ring-0 bg-[#FAFAFC] dark:bg-gray-800 text-[#0A081B] dark:text-white placeholder-[#7F7F8A] dark:placeholder-gray-500 transition-all"
                                        placeholder="Enter new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 sm:pr-4 md:pr-3 flex items-center focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 md:h-4 md:w-4 text-[#7F7F8A] dark:text-gray-400 hover:text-[#2B235A] dark:hover:text-white transition-colors" />
                                        ) : (
                                            <Eye className="h-4 w-4 sm:h-5 sm:w-5 md:h-4 md:w-4 text-[#7F7F8A] dark:text-gray-400 hover:text-[#2B235A] dark:hover:text-white transition-colors" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-2 text-xs sm:text-sm md:text-xs" />
                            </div>

                            {/* Password Confirmation Input */}
                            <div>
                                <label
                                    htmlFor="password_confirmation"
                                    className="block text-xs sm:text-sm md:text-xs font-medium text-[#0A081B] dark:text-white mb-2"
                                >
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 md:pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 sm:h-5 sm:w-5 md:h-4 md:w-4 text-[#7F7F8A] dark:text-gray-400" />
                                    </div>
                                    <input
                                        id="password_confirmation"
                                        type={showPasswordConfirmation ? 'text' : 'password'}
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        autoComplete="new-password"
                                        className="w-full pl-10 sm:pl-12 md:pl-10 pr-10 sm:pr-12 md:pr-10 py-2.5 sm:py-3 md:py-2.5 text-sm sm:text-base md:text-sm border border-[#E3E2FF] dark:border-gray-600 rounded-lg focus:border-[#2B235A] dark:focus:border-white focus:outline-none focus:ring-0 bg-[#FAFAFC] dark:bg-gray-800 text-[#0A081B] dark:text-white placeholder-[#7F7F8A] dark:placeholder-gray-500 transition-all"
                                        placeholder="Confirm new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                        className="absolute inset-y-0 right-0 pr-3 sm:pr-4 md:pr-3 flex items-center focus:outline-none"
                                    >
                                        {showPasswordConfirmation ? (
                                            <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 md:h-4 md:w-4 text-[#7F7F8A] dark:text-gray-400 hover:text-[#2B235A] dark:hover:text-white transition-colors" />
                                        ) : (
                                            <Eye className="h-4 w-4 sm:h-5 sm:w-5 md:h-4 md:w-4 text-[#7F7F8A] dark:text-gray-400 hover:text-[#2B235A] dark:hover:text-white transition-colors" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password_confirmation} className="mt-2 text-xs sm:text-sm md:text-xs" />
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <PrimaryButton
                                    type="submit"
                                    className="w-full py-3 sm:py-3.5 md:py-3 px-4 !bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] hover:!bg-[#1f1a42] text-white font-medium text-sm sm:text-base md:text-sm rounded-lg transition-all duration-300 focus:!outline-none focus:!ring-0 disabled:opacity-100 disabled:cursor-not-allowed flex items-center justify-center"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Resetting...</span>
                                        </div>
                                    ) : (
                                        <span>Reset Password</span>
                                    )}
                                </PrimaryButton>
                            </div>

                            {/* Back to Login */}
                            <div className="text-center">
                                <p className="text-xs sm:text-sm md:text-xs text-[#6B6B6B] dark:text-gray-400">
                                    Remember your password?{' '}
                                    <a
                                        href={route('login')}
                                        className="font-semibold text-[#2B235A] hover:text-[#1f1a42] dark:text-blue-400 dark:hover:text-blue-300 transition-colors focus:outline-none focus:ring-0"
                                    >
                                        Back to Login
                                    </a>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Side - Image Placeholder */}
                <div className="hidden lg:flex lg:w-1/2 dark:bg-gray-800 items-center justify-center p-8">
                    <div className="w-full h-full max-w-3xl max-h-[850px] dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center dark:border-gray-600">
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
