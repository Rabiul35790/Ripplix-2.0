import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { PricingPlan } from '../types/pricing';
import DashboardContent from './DashboardComponents/Dashboard/DashboardContent';
import PricingContent from './DashboardComponents/Dashboard/PricingContent';
import AnalyticsContent from './DashboardComponents/Dashboard/AnalyticsContent';
import SettingsContent from './DashboardComponents/Dashboard/SettingsContent';
import SupportContent from './DashboardComponents/Dashboard/SupportContent';
import axios from 'axios';

interface DashboardProps {
    pricingPlans: PricingPlan[];
    currentPlan?: PricingPlan;
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
}

export default function Dashboard({ pricingPlans = [], currentPlan, auth }: DashboardProps) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [darkMode, setDarkMode] = useState(false);
    const [supportNotificationCount, setSupportNotificationCount] = useState(0);

    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedDarkMode);
        if (savedDarkMode) {
            document.documentElement.classList.add('dark');
        }

        // Fetch support notifications
        fetchSupportNotifications();

        // Set up polling for support notifications
        const interval = setInterval(fetchSupportNotifications, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const fetchSupportNotifications = async () => {
        try {
            const response = await axios.get('/support/unread-count');
            setSupportNotificationCount(response.data.count);
        } catch (error) {
            console.error('Error fetching support notifications:', error);
        }
    };

    const tabs = [
        { id: 'dashboard', name: 'Dashboard', icon: '🏠' },
        { id: 'pricing', name: 'Pricing', icon: '💎' },
        { id: 'analytics', name: 'Analytics', icon: '📊' },
        {
            id: 'support',
            name: 'Support',
            icon: '💬',
            hasNotification: supportNotificationCount > 0,
            notificationCount: supportNotificationCount
        },
        { id: 'settings', name: 'Settings', icon: '⚙️' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardContent auth={auth} currentPlan={currentPlan} />;
            case 'pricing':
                return <PricingContent pricingPlans={pricingPlans} currentPlan={currentPlan} />;
            case 'analytics':
                return <AnalyticsContent />;
            case 'support':
                return <SupportContent auth={auth} />;
            case 'settings':
                return <SettingsContent auth={auth} darkMode={darkMode} setDarkMode={setDarkMode} />;
            default:
                return <DashboardContent auth={auth} currentPlan={currentPlan} />;
        }
    };

    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
        if (tabId === 'support') {
            // Reset notification count when support tab is clicked
            setSupportNotificationCount(0);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            {/* Notification Icon in Top Navbar */}
            <div className="fixed top-4 right-4 z-50">
                {supportNotificationCount > 0 && (
                    <button
                        onClick={() => handleTabClick('support')}
                        className="relative bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5a.5.5 0 010-.7L19 9h-5l-3 3z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {supportNotificationCount}
                        </span>
                    </button>
                )}
            </div>

            {/* Welcome Section */}
            <div className="py-4">
                <div className="mx-auto max-w-6xl px-2">
                    <div className="rounded-xl bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 border dark:border-gray-700">
                        <div className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                                        Welcome, {auth.user.name}
                                    </h1>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {currentPlan
                                            ? `Current Plan: ${currentPlan.name}`
                                            : 'Upgrade to a premium plan'}
                                    </p>
                                </div>
                                {currentPlan && (
                                    <div className="hidden sm:block">
                                        <div className="text-xs px-3 py-1 rounded-full bg-green-500 text-white font-medium">
                                            {currentPlan.name}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="mx-auto max-w-6xl px-2 mt-4">
                <div className="rounded-xl bg-white dark:bg-gray-800 border dark:border-gray-700">
                    <div className="flex divide-x divide-gray-200 dark:divide-gray-700">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab.id)}
                                className={`flex-1 text-xs sm:text-sm px-2 py-2 sm:px-4 sm:py-3 font-medium text-center relative
                                    ${activeTab === tab.id
                                        ? 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
                                        : 'text-gray-500 dark:text-gray-300'
                                    }`}
                            >
                                <div className="flex flex-col items-center justify-center gap-1">
                                    <div className="relative">
                                        <span>{tab.icon}</span>
                                        {tab.hasNotification && tab.notificationCount && tab.notificationCount > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                                {tab.notificationCount}
                                            </span>
                                        )}
                                    </div>
                                    <span>{tab.name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="mx-auto max-w-6xl px-2 py-6">
                {renderTabContent()}
            </div>
        </AuthenticatedLayout>
    );
}
