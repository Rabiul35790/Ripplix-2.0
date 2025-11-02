// resources/js/Pages/DashboardComponents/Dashboard/SettingsContent.tsx

import { useState, useEffect } from 'react';

interface SettingsContentProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
}

export default function SettingsContent({ auth, darkMode, setDarkMode }: SettingsContentProps) {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);

    useEffect(() => {
        const savedEmailPref = localStorage.getItem('emailNotifications');
        const savedPushPref = localStorage.getItem('pushNotifications');

        if (savedEmailPref !== null) setEmailNotifications(savedEmailPref === 'true');
        if (savedPushPref !== null) setPushNotifications(savedPushPref === 'true');
    }, []);

    const toggleEmailNotifications = () => {
        const newValue = !emailNotifications;
        setEmailNotifications(newValue);
        localStorage.setItem('emailNotifications', newValue.toString());
    };

    const togglePushNotifications = () => {
        const newValue = !pushNotifications;
        setPushNotifications(newValue);
        localStorage.setItem('pushNotifications', newValue.toString());
    };

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('darkMode', newDarkMode.toString());

        if (newDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
        <button
            onClick={onToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                enabled
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-600'
            } hover:scale-110 active:scale-95`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
    );

    return (
        <div className="space-y-8">

            {/* Preferences */}
            <div className="rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl border border-white/20 dark:border-gray-700/30">
                <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                        <span className="text-3xl">⚙️</span>
                        Preferences
                    </h3>
                    <div className="space-y-8">
                        <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl">
                                    {darkMode ? '🌙' : '☀️'}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">Dark Mode</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark/light theme</p>
                                </div>
                            </div>
                            <ToggleSwitch enabled={darkMode} onToggle={toggleDarkMode} />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white text-xl">
                                    📧
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">Email Notifications</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive email updates</p>
                                </div>
                            </div>
                            <ToggleSwitch enabled={emailNotifications} onToggle={toggleEmailNotifications} />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xl">
                                    🔔
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">Push Notifications</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Browser notifications</p>
                                </div>
                            </div>
                            <ToggleSwitch enabled={pushNotifications} onToggle={togglePushNotifications} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
