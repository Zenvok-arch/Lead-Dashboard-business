import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, PhoneCall, TrendingUp, Calendar, Target, CheckCircle2 } from 'lucide-react';

const COLORS = ['#6b7280', '#eab308', '#3b82f6', '#22c55e']; // gray, yellow, blue, green

const AnalyticsOverview = ({ leads }) => {
    // 1. Calculate Status Breakdown
    const statusCounts = {
        'Not Called': 0,
        'Called': 0,
        'Interested': 0,
        'Closed': 0
    };
    leads.forEach(l => {
        if (statusCounts[l.status] !== undefined) statusCounts[l.status]++;
    });
    
    const pieData = Object.keys(statusCounts).map(status => ({
        name: status,
        value: statusCounts[status]
    }));

    // 2. Rating Breakdown
    const ratingBins = {
        '0': 0,
        '0-2': 0,
        '2-3': 0,
        '3-4': 0,
        '4-5': 0
    };
    leads.forEach(l => {
        const r = l.rating || 0;
        if (r === 0) ratingBins['0']++;
        else if (r <= 2) ratingBins['0-2']++;
        else if (r <= 3) ratingBins['2-3']++;
        else if (r <= 4) ratingBins['3-4']++;
        else ratingBins['4-5']++;
    });

    const barData = Object.keys(ratingBins).map(bin => ({
        name: bin === '0' ? 'Unrated' : bin + ' Stars',
        count: ratingBins[bin]
    }));

    // 3. Stats
    const totalLeads = leads.length;
    const totalClosed = statusCounts['Closed'];
    const totalCalled = totalLeads - statusCounts['Not Called'];
    
    // Reminders pending (where reminderDate > Date.now())
    const pendingReminders = leads.filter(l => l.reminderDate && new Date(l.reminderDate) > new Date()).length;

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass p-6 rounded-3xl border border-white/5 flex items-center space-x-4">
                    <div className="p-4 bg-primary/20 rounded-2xl text-primary shrink-0">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 font-bold uppercase">Total Leads</p>
                        <h4 className="text-2xl font-black text-white">{totalLeads}</h4>
                    </div>
                </div>
                <div className="glass p-6 rounded-3xl border border-white/5 flex items-center space-x-4">
                    <div className="p-4 bg-yellow-500/20 rounded-2xl text-yellow-500 shrink-0">
                        <PhoneCall size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 font-bold uppercase">Contacted</p>
                        <h4 className="text-2xl font-black text-white">{totalCalled}</h4>
                    </div>
                </div>
                <div className="glass p-6 rounded-3xl border border-white/5 flex items-center space-x-4">
                    <div className="p-4 bg-green-500/20 rounded-2xl text-green-500 shrink-0">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 font-bold uppercase">Closed Deals</p>
                        <h4 className="text-2xl font-black text-white">{totalClosed}</h4>
                    </div>
                </div>
                <div className="glass p-6 rounded-3xl border border-white/5 flex items-center space-x-4">
                    <div className="p-4 bg-purple-500/20 rounded-2xl text-purple-500 shrink-0">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 font-bold uppercase">Active Reminders</p>
                        <h4 className="text-2xl font-black text-white">{pendingReminders}</h4>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pipeline Funnel / Pie Chart */}
                <div className="glass p-6 rounded-3xl border border-white/5">
                    <h3 className="text-lg font-bold mb-6 flex items-center space-x-2">
                        <Target size={20} className="text-primary" />
                        <span>Lead Pipeline</span>
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#13111C', borderColor: '#ffffff20', borderRadius: '1rem', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Rating Distribution */}
                <div className="glass p-6 rounded-3xl border border-white/5">
                    <h3 className="text-lg font-bold mb-6 flex items-center space-x-2">
                        <TrendingUp size={20} className="text-accent" />
                        <span>Google Ratings Dist.</span>
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#13111C', borderColor: '#ffffff20', borderRadius: '1rem', color: '#fff' }} cursor={{fill: '#ffffff10'}} />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AnalyticsOverview;
