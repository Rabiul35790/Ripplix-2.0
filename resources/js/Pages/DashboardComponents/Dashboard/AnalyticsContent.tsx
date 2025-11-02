export default function AnalyticsContent() {
    const analyticsData = [
        { label: 'Total Views', value: '12.5K', change: '+23%', icon: '👁️', color: 'from-blue-500 to-cyan-500' },
        { label: 'Active Users', value: '1,247', change: '+12%', icon: '👥', color: 'from-emerald-500 to-green-500' },
        { label: 'Conversion Rate', value: '3.2%', change: '+0.5%', icon: '📊', color: 'from-purple-500 to-pink-500' },
        { label: 'Revenue', value: '$8,432', change: '+18%', icon: '💰', color: 'from-orange-500 to-red-500' },
    ];

    const recentActivities = [
        { action: 'User registration spike', time: '2h ago', impact: 'High', color: 'bg-emerald-500' },
        { action: 'Performance optimization', time: '4h ago', impact: 'Medium', color: 'bg-blue-500' },
        { action: 'New feature release', time: '1d ago', impact: 'High', color: 'bg-purple-500' },
        { action: 'Security update deployed', time: '2d ago', impact: 'Critical', color: 'bg-orange-500' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="rounded-xl bg-white dark:bg-gray-800 border p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <span>📈</span> Analytics Overview
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                            Track your performance and growth metrics
                        </p>
                    </div>
                    <div className="flex gap-2 text-sm">
                        <button className="px-3 py-1 bg-blue-600 text-white rounded-md">Export</button>
                        <button className="px-3 py-1 border text-gray-700 dark:text-gray-300 rounded-md">Refresh</button>
                    </div>
                </div>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {analyticsData.map((stat, index) => (
                    <div key={index} className="relative rounded-xl bg-white dark:bg-gray-800 border p-4">
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <div className={`w-8 h-8 rounded-md bg-gradient-to-br ${stat.color} text-white flex items-center justify-center text-sm`}>
                                    {stat.icon}
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</div>
                                    <div className="text-xs text-emerald-600 dark:text-emerald-400">{stat.change}</div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[['📊', 'Usage Analytics'], ['⚡', 'Performance Metrics']].map(([icon, title], i) => (
                    <div key={i} className="rounded-xl bg-white dark:bg-gray-800 border p-4">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="text-base">{icon}</span> {title}
                        </h4>
                        <div className="h-48 bg-gray-50 dark:bg-gray-700 rounded-md flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 border">
                            Chart visualization coming soon
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activities */}
            <div className="rounded-xl bg-white dark:bg-gray-800 border p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span>🔄</span> Recent Analytics Events
                </h4>
                <div className="space-y-2 text-xs">
                    {recentActivities.map((a, i) => (
                        <div key={i} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 ${a.color} rounded-full`} />
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{a.action}</p>
                                    <p className="text-gray-500 dark:text-gray-400">{a.time}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                a.impact === 'Critical'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                    : a.impact === 'High'
                                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            }`}>
                                {a.impact}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Insights & Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {[{
                    title: 'Key Insights',
                    icon: '💡',
                    items: [
                        'User engagement increased by 23%',
                        'Peak usage 2-4 PM daily',
                        'Mobile traffic 67%',
                    ],
                    textColor: 'text-blue-700 dark:text-blue-300',
                    dot: 'bg-blue-500',
                    border: 'border-blue-200 dark:border-blue-800/50',
                    bg: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
                }, {
                    title: 'Recommendations',
                    icon: '🎯',
                    items: [
                        'Optimize mobile experience',
                        'Schedule content at peak hours',
                        'Focus on user retention',
                    ],
                    textColor: 'text-emerald-700 dark:text-emerald-300',
                    dot: 'bg-emerald-500',
                    border: 'border-emerald-200 dark:border-emerald-800/50',
                    bg: 'from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20'
                }].map(({ title, icon, items, textColor, dot, border, bg }, i) => (
                    <div key={i} className={`rounded-xl bg-gradient-to-br ${bg} border ${border} p-4`}>
                        <h4 className={`font-semibold mb-3 flex items-center gap-2 ${textColor}`}>
                            <span>{icon}</span> {title}
                        </h4>
                        <ul className={`space-y-1 ${textColor}`}>
                            {items.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <span className={`w-1.5 h-1.5 ${dot} rounded-full mt-1`} />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
