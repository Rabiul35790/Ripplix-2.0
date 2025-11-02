import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';
import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeClosed, Mail, User } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface Settings {
  logo?: string;
  favicon?: string;
  authentication_page_image?: string;
}

export default function Register({
    settings,
    totalLibraryCount,
    totalUserCount,
}: {
    settings?: Settings;
    totalLibraryCount?: number;
    totalUserCount?: number;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const handleGoogleLogin = () => {
        window.location.href = route('auth.google');
    };

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    return (
        <>
            <Head title="Register" />
            <div className="min-h-screen flex font-sora bg-white dark:bg-gray-900">
                {/* Left Side - Registration Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-y-auto">
                    {/* Logo at top left - Hidden on small mobile when keyboard is active */}
                    <div className="absolute top-6 sm:top-8 md:top-10 left-6 sm:left-8 md:left-10 sm:block hidden">
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
                        {/* Favicon - Hidden on mobile */}
                        <div className="hidden sm:block mb-6 sm:mb-8 md:mb-6">
                            {settings?.favicon && (
                                <img
                                    src={settings.favicon}
                                    alt="Favicon"
                                    className="w-16 sm:w-16 md:w-14 h-16 sm:h-16 md:h-14 object-cover"
                                />
                            )}
                        </div>

                        {/* Header - Reduced margin on mobile */}
                        <div className="mb-4 sm:mb-8 md:mb-6">
                            <h2 className="text-2xl sm:text-3xl md:text-[28px] font-bold text-[#2B235A] dark:text-white mb-2">
                                Welcom to Ripplix!
                            </h2>
                            <p className="text-xs sm:text-sm md:text-[13px] text-[#7F7F8A] dark:text-gray-400">
                                Register your account to join the design revolution
                            </p>
                        </div>

                        {/* Google Login Button */}
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full mb-4 sm:mb-6 md:mb-5 flex items-center justify-center space-x-2 sm:space-x-3 md:space-x-2.5 bg-white dark:bg-gray-800 border border-[#E3E2FF] dark:border-gray-600 rounded-lg py-2.5 sm:py-3 md:py-2.5 px-4 hover:bg-[#F8F8F9] dark:hover:bg-gray-700 transition-all duration-300 group shadow-sm hover:shadow-md focus:outline-none focus:ring-0"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5" viewBox="0 0 24 24">
                                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span className="font-medium text-[#2B235A] dark:text-gray-300 text-xs sm:text-sm md:text-[13px]">
                                Continue with Google
                            </span>
                        </button>

                        {/* Divider */}
                        <div className="relative mb-4 sm:mb-6 md:mb-5">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#E3E2FF] dark:border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-xs sm:text-sm md:text-xs">
                                <span className="px-2 sm:px-3 md:px-2.5 bg-[#F8F8F9] dark:bg-gray-900 text-[#7F7F8A] dark:text-gray-400">
                                    or
                                </span>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-3 sm:space-y-4 md:space-y-3.5">
                            {/* Name Field */}
                            <div className="space-y-1.5 sm:space-y-2 md:space-y-1.5">
                                <InputLabel
                                    htmlFor="name"
                                    value="Full Name"
                                    className="!text-[#2B235A] dark:text-gray-300 font-medium text-xs sm:text-sm md:text-[13px]"
                                />
                                <div className="relative">
                                    <TextInput
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        className="w-full pl-3 sm:pl-4 md:pl-3.5 pr-10 sm:pr-12 md:pr-10 py-2 sm:py-3 md:py-2.5 text-xs sm:text-base md:text-sm border border-[#E3E2FF] dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E3E2FF] dark:focus:ring-gray-500 bg-[#FAFAFC] dark:bg-gray-800 text-[#2B235A] dark:text-white placeholder-[#B2B2BD] dark:placeholder-gray-500"
                                        autoComplete="name"
                                        isFocused={true}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        placeholder="Your Name"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 md:pr-3.5 pointer-events-none">
                                        <User className="w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5 text-[#B2B2BD] dark:text-gray-500"/>
                                    </div>
                                </div>
                                <InputError message={errors.name} className="mt-1 text-xs sm:text-sm md:text-xs" />
                            </div>

                            {/* Email Field */}
                            <div className="space-y-1.5 sm:space-y-2 md:space-y-1.5">
                                <InputLabel
                                    htmlFor="email"
                                    value="Email"
                                    className="!text-[#2B235A] dark:text-gray-300 font-medium text-xs sm:text-sm md:text-[13px]"
                                />
                                <div className="relative">
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="w-full pl-3 sm:pl-4 md:pl-3.5 pr-10 sm:pr-12 md:pr-10 py-2 sm:py-3 md:py-2.5 text-xs sm:text-base md:text-sm border border-[#E3E2FF] dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E3E2FF] dark:focus:ring-gray-500 bg-[#FAFAFC] dark:bg-gray-800 text-[#2B235A] dark:text-white placeholder-[#B2B2BD] dark:placeholder-gray-500"
                                        autoComplete="username"
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        placeholder="Your Email"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 md:pr-3.5 pointer-events-none">
                                        <Mail className="w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5 text-[#B2B2BD] dark:text-gray-500"/>
                                    </div>
                                </div>
                                <InputError message={errors.email} className="mt-1 text-xs sm:text-sm md:text-xs" />
                            </div>

                            {/* Password Field */}
                            <div className="space-y-1.5 sm:space-y-2 md:space-y-1.5">
                                <InputLabel
                                    htmlFor="password"
                                    value="Password"
                                    className="!text-[#2B235A] dark:text-gray-300 font-medium text-xs sm:text-sm md:text-[13px]"
                                />
                                <div className="relative">
                                    <TextInput
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        className="w-full pl-3 sm:pl-4 md:pl-3.5 pr-10 sm:pr-12 md:pr-10 py-2 sm:py-3 md:py-2.5 text-xs sm:text-base md:text-sm border border-[#E3E2FF] dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E3E2FF] dark:focus:ring-gray-500 bg-[#FAFAFC] dark:bg-gray-800 text-[#2B235A] dark:text-white placeholder-[#B2B2BD] dark:placeholder-gray-500"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                        placeholder="Your Password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 md:pr-3.5 text-[#B2B2BD] dark:text-gray-500 focus:outline-none focus:ring-0"
                                        onClick={togglePasswordVisibility}
                                    >
                                        {showPassword ? (
                                            <EyeClosed className="w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5"/>
                                        ) : (
                                            <Eye className="w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5"/>
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-1 text-xs sm:text-sm md:text-xs" />
                            </div>

                            {/* Confirm Password Field */}
                            <div className="space-y-1.5 sm:space-y-2 md:space-y-1.5">
                                <InputLabel
                                    htmlFor="password_confirmation"
                                    value="Confirm Password"
                                    className="!text-[#2B235A] dark:text-gray-300 font-medium text-xs sm:text-sm md:text-[13px]"
                                />
                                <div className="relative">
                                    <TextInput
                                        id="password_confirmation"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="w-full pl-3 sm:pl-4 md:pl-3.5 pr-10 sm:pr-12 md:pr-10 py-2 sm:py-3 md:py-2.5 text-xs sm:text-base md:text-sm border border-[#E3E2FF] dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E3E2FF] dark:focus:ring-gray-500 bg-[#FAFAFC] dark:bg-gray-800 text-[#2B235A] dark:text-white placeholder-[#B2B2BD] dark:placeholder-gray-500"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        required
                                        placeholder="Confirm Password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 md:pr-3.5 text-[#B2B2BD] dark:text-gray-500 focus:outline-none focus:ring-0"
                                        onClick={toggleConfirmPasswordVisibility}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeClosed className="w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5"/>
                                        ) : (
                                            <Eye className="w-4 h-4 sm:w-5 sm:h-5 md:w-4.5 md:h-4.5"/>
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password_confirmation} className="mt-1 text-xs sm:text-sm md:text-xs" />
                            </div>

                            {/* Terms Checkbox */}
                            <div className="flex items-start space-x-2 pt-1 sm:pt-2 md:pt-1">
                                <Checkbox
                                    name="terms"
                                    checked={agreeToTerms}
                                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-3.5 md:h-3.5 !text-[#2B235A] bg-white dark:bg-gray-800 border border-[#E3E2FF] dark:border-gray-600 rounded focus:outline-none focus:ring-0 mt-0.5"
                                    required
                                />
                                <label htmlFor="terms" className="text-xs sm:text-sm md:text-xs text-[#7F7F8A] dark:text-gray-400 leading-relaxed">
                                    I agree to the{' '}
                                    <Link
                                        href="#"
                                        className="text-[#2B235A] hover:text-black dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-300 focus:outline-none focus:ring-0"
                                    >
                                        Terms of Service
                                    </Link>{' '}
                                    and{' '}
                                    <Link
                                        href="#"
                                        className="text-[#2B235A] hover:text-black dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-300 focus:outline-none focus:ring-0"
                                    >
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <PrimaryButton
                                className="w-full py-2.5 sm:py-3 md:py-2.5 px-4 !bg-[linear-gradient(360deg,_#1A04B0_-126.39%,_#260F63_76.39%)] hover:opacity-90 text-white font-medium text-xs sm:text-base md:text-sm rounded-lg transition-all duration-300 transform hover:scale-[1.01] focus:!outline-none focus:!ring-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_6px_0px_#34407C2E] flex items-center justify-center"
                                disabled={processing}
                            >
                                {processing ? (
                                    <div className="flex items-center justify-center focus:outline-none focus:ring-0">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Creating Account...</span>
                                    </div>
                                ) : (
                                    <span>Sign Up</span>
                                )}
                            </PrimaryButton>

                            {/* Login Link */}
                            <div className="text-center pt-2 sm:pt-3 md:pt-2">
                                <p className="text-[#7F7F8A] dark:text-gray-400 text-xs sm:text-sm md:text-xs">
                                    Already have an account?{' '}
                                    <Link
                                        href={route('login')}
                                        className="text-[#2B235A] hover:text-black dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors duration-300 focus:outline-none focus:ring-0"
                                    >
                                        Sign in
                                    </Link>
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
