import { PricingPlan } from "../../../types/pricing";

interface DashboardContentProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
    currentPlan?: PricingPlan;
}

export default function DashboardContent({ auth, currentPlan }: DashboardContentProps) {
    const stats = [
        { label: 'Total Projects', value: '12', change: '+2 this week', icon: '🚀', color: 'from-blue-500 to-cyan-500' },
        { label: 'Daily Previews', value: `8/${currentPlan?.daily_previews || 10}`, change: '2 remaining', icon: '⚡', color: 'from-emerald-500 to-green-500' },
        { label: 'Active Boards', value: '5', change: '3 shared', icon: '📋', color: 'from-purple-500 to-pink-500' },
        { label: 'Hours This Week', value: '24.5', change: '+3.2 hours', icon: '⏰', color: 'from-orange-500 to-red-500' },
    ];

    const activities = [
        { action: 'Created new project "Website Redesign"', time: '2 hours ago', color: 'bg-emerald-500' },
        { action: 'Updated board "Marketing Campaign"', time: '5 hours ago', color: 'bg-blue-500' },
        { action: 'Shared project with team member', time: '1 day ago', color: 'bg-purple-500' },
        { action: 'Completed analytics review', time: '2 days ago', color: 'bg-orange-500' },
    ];

    const quickActions = [
        { title: 'New Project', desc: 'Start fresh', icon: '✨', color: 'from-blue-500 to-purple-600' },
        { title: 'Import Data', desc: 'Upload files', icon: '📁', color: 'from-emerald-500 to-green-600' },
        { title: 'Team Invite', desc: 'Add members', icon: '👥', color: 'from-pink-500 to-rose-600' },
        { title: 'Analytics', desc: 'View reports', icon: '📊', color: 'from-orange-500 to-yellow-600' },
    ];

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="relative rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white text-base`}>
                                    {stat.icon}
                                </div>
                                <div className="text-right text-lg font-semibold text-gray-900 dark:text-white">
                                    {stat.value}
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300">{stat.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.change}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Activity */}
                <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-1">
                        📈 Recent Activity
                    </h3>
                    <div className="space-y-2">
                        {activities.map((activity, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm">
                                <div className={`w-2 h-2 mt-1 rounded-full ${activity.color}`} />
                                <div className="text-gray-800 dark:text-gray-200">
                                    <p className="text-sm">{activity.action}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-1">
                        ⚡ Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {quickActions.map((action, i) => (
                            <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-left">
                                <div className={`w-8 h-8 mb-2 rounded-md bg-gradient-to-br ${action.color} flex items-center justify-center text-white text-base`}>
                                    {action.icon}
                                </div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{action.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{action.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
