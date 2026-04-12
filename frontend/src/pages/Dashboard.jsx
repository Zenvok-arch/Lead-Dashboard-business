import React, { useState, useEffect } from 'react';
import { Search, Plus, BarChart3, Users, PhoneCall, TrendingUp, LogOut, Menu, X, Trash2, Play, BellRing, Calendar, Loader2, CalendarDays } from 'lucide-react';
import LeadTable from '../components/LeadTable';
import LeadForm from '../components/LeadForm';
import AnalyticsOverview from '../components/AnalyticsOverview';
import * as api from '../services/api';

const Dashboard = () => {
    const [leads, setLeads] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [minRating, setMinRating] = useState('');
    const [maxRating, setMaxRating] = useState('');
    const [minReviews, setMinReviews] = useState('');
    const [maxReviews, setMaxReviews] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [noWebsiteOnly, setNoWebsiteOnly] = useState(false);
    const [showHotLeadsOnly, setShowHotLeadsOnly] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editingLead, setEditingLead] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedLeads, setSelectedLeads] = useState([]);
    
    // Feature States
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'analytics'
    const [reminderModalLead, setReminderModalLead] = useState(null);
    const [reminderDate, setReminderDate] = useState('');
    const [toast, setToast] = useState(null); // { msg, type: 'success' | 'error' }

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await api.getLeads();
            const data = Array.isArray(res.data) ? res.data : [];
            setLeads(data);
            setFilteredLeads(data);
        } catch (err) {
            console.error('Error fetching leads:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    useEffect(() => {
        let result = Array.isArray(leads) ? leads : [];
        if (search) {
            result = result.filter(lead =>
                lead.name.toLowerCase().includes(search.toLowerCase()) ||
                lead.phone.includes(search)
            );
        }
        if (statusFilter !== 'All') {
            result = result.filter(lead => lead.status === statusFilter);
        }
        if (minRating) {
            result = result.filter(lead => (lead.rating || 0) >= Number(minRating));
        }
        if (maxRating) {
            result = result.filter(lead => (lead.rating || 0) <= Number(maxRating));
        }
        if (minReviews) {
            result = result.filter(lead => (lead.reviews || 0) >= Number(minReviews));
        }
        if (maxReviews) {
            result = result.filter(lead => (lead.reviews || 0) <= Number(maxReviews));
        }
        if (noWebsiteOnly) {
            result = result.filter(lead => !lead.website || lead.website.trim() === "");
        }
        if (showHotLeadsOnly) {
            result = result.filter(lead => {
                const noWeb = !lead.website || lead.website.trim() === "";
                return lead.rating >= 4 && lead.reviews >= 50 && noWeb;
            });
        }

        if (sortBy) {
            const [field, order] = sortBy.split('-');
            result = [...result].sort((a, b) => {
                let valA = a[field] || '';
                let valB = b[field] || '';
                if (field === 'rating' || field === 'reviews') {
                    valA = Number(valA);
                    valB = Number(valB);
                } else if (field === 'createdAt' || field === 'lastContacted') {
                    valA = valA ? new Date(valA).getTime() : 0;
                    valB = valB ? new Date(valB).getTime() : 0;
                } else {
                    valA = String(valA).toLowerCase();
                    valB = String(valB).toLowerCase();
                }
                if (valA < valB) return order === 'asc' ? -1 : 1;
                if (valA > valB) return order === 'asc' ? 1 : -1;
                return 0;
            });
        }
        setFilteredLeads(result);
    }, [search, statusFilter, minRating, maxRating, minReviews, maxReviews, noWebsiteOnly, showHotLeadsOnly, sortBy, leads]);

    const handleSaveLead = async (formData) => {
        try {
            if (editingLead) {
                await api.updateLead(editingLead._id, formData);
            } else {
                await api.createLead(formData);
            }
            setIsFormOpen(false);
            setEditingLead(null);
            fetchLeads();
        } catch (err) {
            console.error('Error saving lead:', err);
        }
    };

    const handleDeleteLead = async (id) => {
        if (window.confirm('Are you sure you want to delete this lead?')) {
            try {
                await api.deleteLead(id);
                fetchLeads();
            } catch (err) {
                console.error('Error deleting lead:', err);
            }
        }
    };

    const handleEditLead = (lead) => {
        setEditingLead(lead);
        setIsFormOpen(true);
    };

    const handleBulkDelete = async () => {
        if (!selectedLeads.length) return;
        if (window.confirm(`Are you sure you want to delete ${selectedLeads.length} selected leads?`)) {
            try {
                await api.bulkDeleteLeads(selectedLeads);
                setSelectedLeads([]);
                fetchLeads();
            } catch (err) {
                console.error('Error in bulk delete:', err);
            }
        }
    };

    const handleUpdateLeadStatus = async (id, data) => {
        try {
            await api.updateLead(id, data);
            fetchLeads(); // refresh leads to reflect changes
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const handleSetReminder = async () => {
        console.log('[Reminder] handleSetReminder called');
        console.log('[Reminder] Lead:', reminderModalLead?._id, 'Date:', reminderDate);

        if (!reminderModalLead || !reminderDate) {
            console.warn('[Reminder] Aborted — lead or date missing.');
            showToast('Please select a date first.', 'error');
            return;
        }
        try {
            const localDate = new Date(reminderDate);
            const isoDate = localDate.toISOString();
            console.log('[Reminder] Sending PUT with reminderDate:', isoDate);

            const res = await api.updateLead(reminderModalLead._id, { reminderDate: isoDate });
            console.log('[Reminder] API response:', res?.data);

            setReminderModalLead(null);
            setReminderDate('');
            showToast(`Reminder set for ${localDate.toLocaleString()}`);
            fetchLeads();
        } catch (err) {
            console.error('[Reminder] Error setting reminder:', err?.response?.data || err.message);
            showToast(`Failed: ${err?.response?.data?.error || err.message}`, 'error');
        }
    };

    const handleClearReminder = async () => {
        console.log('[Reminder] handleClearReminder called');
        if (!reminderModalLead) return;
        try {
            const res = await api.updateLead(reminderModalLead._id, { reminderDate: null });
            console.log('[Reminder] Clear response:', res?.data);
            setReminderModalLead(null);
            setReminderDate('');
            showToast('Reminder cleared.');
            fetchLeads();
        } catch (err) {
            console.error('[Reminder] Error clearing reminder:', err?.response?.data || err.message);
            showToast(`Failed to clear: ${err?.response?.data?.error || err.message}`, 'error');
        }
    };

    const callNextLead = () => {
        const nextLead = filteredLeads.find(l => l.status === 'Not Called');
        if (nextLead) {
            handleUpdateLeadStatus(nextLead._id, { status: 'Called', lastContacted: new Date() });
            window.location.href = `tel:${nextLead.phone}`;
        } else {
            alert("No 'Not Called' leads available in the current filter list.");
        }
    };

    // Stats
    const safeLeads = Array.isArray(leads) ? leads : [];
    const totalLeads = safeLeads.length;
    const calledLeads = safeLeads.filter(l => l.status === 'Called' || l.status === 'Interested' || l.status === 'Closed').length;
    const closedLeads = safeLeads.filter(l => l.status === 'Closed').length;

    const hotLeadsCount = safeLeads.filter(lead => {
        const noWebsite = !lead.website || lead.website.trim() === "";
        return lead.rating >= 4 && lead.reviews >= 50 && noWebsite;
    }).length;

    // Determine overdue / due today reminders
    const overdueReminders = safeLeads.filter(lead => lead.reminderDate && new Date(lead.reminderDate) <= new Date());

    if (loading && leads.length === 0) {
        return (
            <div className="min-h-screen bg-dark flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary opacity-20 blur-xl rounded-full animate-pulse"></div>
                    <Loader2 className="animate-spin text-primary relative z-10" size={48} strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-bold gradient-text animate-pulse tracking-wide">Syncing Workspace...</h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark text-white p-6 md:p-12">
            {/* Header */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div className="flex items-start justify-between w-full md:w-auto gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold gradient-text tracking-tight leading-tight">Lead Dashboard</h1>
                        <p className="text-sm md:text-base text-gray-400 font-medium mt-1">Manage your leads and track progress efficiently</p>
                    </div>
                    <button
                        className="lg:hidden glass p-2.5 rounded-xl text-gray-400 hover:text-white transition-colors shrink-0"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>
                </div>
                <div className="flex flex-wrap items-center justify-start md:justify-end gap-3 w-full md:w-auto">
                    {/* View Mode Toggles */}
                    <div className="glass p-1 rounded-xl flex items-center space-x-1 mr-2 border border-white/5 shadow-inner">
                        <button 
                            onClick={() => setViewMode('list')} 
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-primary/20 text-primary shadow-lg shadow-primary/10' : 'text-gray-400 hover:text-white'}`}
                        >
                            List View
                        </button>
                        <button 
                            onClick={() => setViewMode('analytics')} 
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'analytics' ? 'bg-accent/20 text-accent shadow-lg shadow-accent/10' : 'text-gray-400 hover:text-white'}`}
                        >
                            Analytics
                        </button>
                    </div>

                    <button
                        onClick={callNextLead}
                        className="glass text-primary border border-primary/30 px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-xl shadow-primary/10 hover:bg-primary/20 hover:text-white transition-all group"
                        title="Call the next uncontacted lead in list"
                    >
                        <Play size={18} className="text-primary group-hover:text-white transition-colors" />
                        <span className="text-sm md:text-base">Call Next</span>
                    </button>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="bg-gradient-main text-white px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                    >
                        <Plus size={18} />
                        <span className="text-sm md:text-base">Add Lead</span>
                    </button>
                    {/* <button className="glass p-3 rounded-xl text-gray-400 hover:text-white transition-colors">
                        <LogOut size={20} />
                    </button> */}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto grid grid-cols-3 gap-3 md:gap-6 mb-8 md:mb-12">
                {[
                    { label: 'Total', value: totalLeads, icon: Users, color: 'text-primary' },
                    { label: 'Called', value: calledLeads, icon: PhoneCall, color: 'text-secondary' },
                    { label: 'Closed', value: closedLeads, icon: TrendingUp, color: 'text-accent' }
                ].map((stat, i) => (
                    <div key={i} className="glass p-3 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 shadow-xl hover:border-white/10 transition-all card-hover group flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center md:justify-between w-full">
                            <stat.icon className={`${stat.color} group-hover:scale-110 transition-transform mb-1 md:mb-0 w-6 h-6 md:w-7 md:h-7`} />
                            <span className="text-[9px] md:text-xs font-bold text-gray-500 uppercase truncate w-full md:w-auto mt-1 md:mt-0">{stat.label}</span>
                        </div>
                        <h4 className="text-2xl md:text-4xl font-black mt-1 md:mt-4">{stat.value}</h4>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            {viewMode === 'analytics' ? (
                <div className="max-w-7xl mx-auto">
                    <AnalyticsOverview leads={Array.isArray(leads) ? leads : []} />
                </div>
            ) : (
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar/Upload */}
                <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-dark p-6 overflow-y-auto transition-transform duration-300 transform lg:static lg:transform-none lg:w-auto lg:p-0 lg:overflow-visible lg:col-span-1 space-y-8 h-full lg:h-auto border-r border-white/10 lg:border-none shadow-2xl lg:shadow-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}>
                    <div className="flex justify-between items-center lg:hidden pb-4 border-b border-white/10">
                        <h2 className="text-xl font-bold">Filters & Import</h2>
                        <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white p-2 glass rounded-xl">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="glass p-6 rounded-3xl border border-white/5 space-y-6 mt-4 lg:mt-0">
                        <h3 className="text-lg font-bold flex items-center space-x-2">
                            <BarChart3 className="text-primary" size={20} />
                            <span>Filters</span>
                        </h3>

                        {/* Status Filter */}
                        <div className="grid grid-cols-2 gap-2">
                            {['All', 'Not Called', 'Called', 'Interested', 'Closed'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${statusFilter === status
                                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        {/* Rating Filter */}
                        <div className="space-y-2">
                            <label className="text-gray-400 font-bold block text-sm">Rating Range</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={minRating}
                                    onChange={(e) => setMinRating(e.target.value)}
                                    className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-sm shadow-inner"
                                    min="0" max="5" step="0.1"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={maxRating}
                                    onChange={(e) => setMaxRating(e.target.value)}
                                    className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-sm shadow-inner"
                                    min="0" max="5" step="0.1"
                                />
                            </div>
                        </div>

                        {/* Reviews Filter */}
                        <div className="space-y-2">
                            <label className="text-gray-400 font-bold block text-sm">Reviews Range</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={minReviews}
                                    onChange={(e) => setMinReviews(e.target.value)}
                                    className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-sm shadow-inner"
                                    min="0"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={maxReviews}
                                    onChange={(e) => setMaxReviews(e.target.value)}
                                    className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-sm shadow-inner"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Sort By */}
                        <div className="space-y-2">
                            <label className="text-gray-400 font-bold block text-sm">Sort By</label>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full bg-dark/80 border border-white/20 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm shadow-inner text-white appearance-none cursor-pointer"
                                >
                                    <option value="" className="bg-dark text-white">Default (Database Order)</option>
                                    <option value="rating-desc" className="bg-dark text-white">Rating: High to Low</option>
                                    <option value="rating-asc" className="bg-dark text-white">Rating: Low to High</option>
                                    <option value="reviews-desc" className="bg-dark text-white">Reviews: High to Low</option>
                                    <option value="reviews-asc" className="bg-dark text-white">Reviews: Low to High</option>
                                    <option value="lastContacted-desc" className="bg-dark text-white">Recently Contacted</option>
                                    <option value="lastContacted-asc" className="bg-dark text-white">Oldest Contacted</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Website Checkbox */}
                        <div className="flex items-center space-x-3 py-2">
                            <input
                                type="checkbox"
                                id="noWebsite"
                                checked={noWebsiteOnly}
                                onChange={(e) => setNoWebsiteOnly(e.target.checked)}
                                className="w-5 h-5 rounded-md border-2 border-white/20 bg-dark text-primary outline-none focus:outline-none cursor-pointer transition-all appearance-none checked:bg-primary checked:border-primary relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-px after:w-1.5 after:h-2.5 after:border-white after:border-b-2 after:border-r-2 after:rotate-45"
                            />
                            <label htmlFor="noWebsite" className="text-gray-400 font-bold text-sm cursor-pointer select-none">
                                No Website Only
                            </label>
                        </div>
                    </div>
                </div>

                {/* Table Area */}
                <div className="lg:col-span-3">
                    
                    {/* Due For Follow Up Section */}
                    {overdueReminders.length > 0 && (
                        <div className="mb-6 p-5 rounded-2xl bg-orange-500/10 border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.1)] flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-orange-500/20 rounded-xl text-orange-500 animate-pulse">
                                    <BellRing size={24} />
                                </div>
                                <div>
                                    <h3 className="text-orange-400 font-black text-lg">Due For Follow-up</h3>
                                    <p className="text-orange-200/60 text-sm">You have {overdueReminders.length} lead{overdueReminders.length > 1 ? 's' : ''} with pending reminders right now!</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setFilteredLeads(overdueReminders)} className="px-4 py-2 bg-orange-500/20 text-orange-400 font-bold text-sm rounded-xl hover:bg-orange-500 hover:text-white transition-all shadow-lg">
                                    View Reminders
                                </button>
                                <button onClick={() => setFilteredLeads(leads)} className="px-4 py-2 border border-orange-500/30 text-orange-400/60 font-bold text-sm rounded-xl hover:bg-orange-500/10 hover:text-orange-400 transition-all">
                                    Clear Filter
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mb-6 space-y-4">
                        <div className="w-full bg-red-500/10 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)] rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center space-x-4">
                                <div className="text-3xl bg-red-500/20 p-3 rounded-full flex items-center justify-center">🔥</div>
                                <div>
                                    <h3 className="text-red-400 font-bold text-sm uppercase tracking-wider">Hot Leads</h3>
                                    <p className="text-gray-300 text-xs mt-1">High rating, many reviews, no website.</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="showHotLeadsOnly"
                                        checked={showHotLeadsOnly}
                                        onChange={(e) => setShowHotLeadsOnly(e.target.checked)}
                                        className="w-5 h-5 rounded-md border-2 border-red-500/50 bg-dark text-red-500 outline-none focus:outline-none cursor-pointer transition-all appearance-none checked:bg-red-500 checked:border-red-500 relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-px after:w-1.5 after:h-2.5 after:border-white after:border-b-2 after:border-r-2 after:rotate-45"
                                    />
                                    <label htmlFor="showHotLeadsOnly" className="text-red-400 font-bold text-sm cursor-pointer select-none">
                                        Show Only
                                    </label>
                                </div>
                                <div className="text-3xl font-black text-white">{hotLeadsCount}</div>
                            </div>
                        </div>

                        {/* Search moved here */}
                        <div className="relative group w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search leads by name or phone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-dark/50 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <LeadTable
                        leads={filteredLeads}
                        onEdit={handleEditLead}
                        onDelete={handleDeleteLead}
                        selectedLeads={selectedLeads}
                        setSelectedLeads={setSelectedLeads}
                        onUpdateLead={handleUpdateLeadStatus}
                        onSetReminder={(lead) => setReminderModalLead(lead)}
                    />
                </div>
            </div>
            )}

            {/* Form Modal */}
            {isFormOpen && (
                <LeadForm
                    lead={editingLead}
                    onClose={() => {
                        setIsFormOpen(false);
                        setEditingLead(null);
                    }}
                    onSave={handleSaveLead}
                    onUploadSuccess={(count) => {
                        setIsFormOpen(false);
                        fetchLeads();
                    }}
                />
            )}

            {/* Reminder Modal */}
            {reminderModalLead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-300 relative">
                        <button onClick={() => setReminderModalLead(null)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white shrink-0">
                            <X size={20} />
                        </button>
                        
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="p-3 bg-orange-500/20 rounded-2xl text-orange-500 mt-1 shadow-lg shadow-orange-500/10">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold gradient-text">Set Reminder</h2>
                                <p className="text-sm text-gray-400 mt-1">For <span className="font-bold text-gray-300">{reminderModalLead.name}</span></p>
                                {reminderModalLead.reminderDate && (
                                    <div className="inline-block mt-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                                        <p className="text-xs text-orange-400 font-bold">Currently set: {new Date(reminderModalLead.reminderDate).toLocaleString()}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => {
                                        const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(10, 0, 0, 0); 
                                        const offset = d.getTimezoneOffset() * 60000;
                                        setReminderDate(new Date(d.getTime() - offset).toISOString().slice(0, 16));
                                    }}
                                    className="px-4 py-3 rounded-xl border border-white/10 bg-dark/50 text-sm font-bold text-gray-300 hover:bg-white/10 transition-all text-center group"
                                >
                                    Tomorrow 10 AM
                                </button>
                                <button
                                    onClick={() => {
                                        const d = new Date(); d.setDate(d.getDate() + 7); d.setHours(10, 0, 0, 0); 
                                        const offset = d.getTimezoneOffset() * 60000;
                                        setReminderDate(new Date(d.getTime() - offset).toISOString().slice(0, 16));
                                    }}
                                    className="px-4 py-3 rounded-xl border border-white/10 bg-dark/50 text-sm font-bold text-gray-300 hover:bg-white/10 transition-all text-center group"
                                >
                                    Next Week
                                </button>
                            </div>

                            <div className="relative group">
                                <label className="text-gray-400 font-bold block text-sm mb-2 group-hover:text-primary transition-colors">Custom Date & Time</label>
                                <div className="relative flex items-center">
                                    <input
                                        type="datetime-local"
                                        value={reminderDate}
                                        onChange={(e) => setReminderDate(e.target.value)}
                                        className="custom-datetime-input w-full bg-dark/80 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all text-sm font-medium text-white appearance-none cursor-pointer hover:border-white/30"
                                        min={(() => {
                                            const now = new Date();
                                            const offset = now.getTimezoneOffset() * 60000;
                                            return new Date(now.getTime() - offset).toISOString().slice(0, 16);
                                        })()}
                                    />
                                    <CalendarDays className="absolute left-4 text-primary w-5 h-5 opacity-80 group-focus-within:animate-pulse group-focus-within:opacity-100 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all pointer-events-none" />
                                </div>
                            </div>

                            <div className="pt-4 flex flex-col gap-3">
                                <div className="flex gap-3">
                                    <button onClick={() => setReminderModalLead(null)} className="flex-1 py-3 px-4 rounded-xl font-bold bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all">
                                        Cancel
                                    </button>
                                    <button onClick={handleSetReminder} disabled={!reminderDate} className="flex-1 py-3 px-4 bg-gradient-main text-white rounded-xl font-bold hover:scale-[1.02] transition-transform shadow-xl shadow-primary/20 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                                        <BellRing size={16} />
                                        <span>Save</span>
                                    </button>
                                </div>
                                {reminderModalLead.reminderDate && (
                                    <button onClick={handleClearReminder} className="w-full py-3 px-4 rounded-xl font-bold border border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10 group flex items-center justify-center space-x-2">
                                        <Trash2 size={16} className="group-hover:animate-bounce" />
                                        <span>Clear Active Reminder</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Action Popup */}
            <div
                className={`fixed bottom-0 left-0 right-0 p-4 md:p-6 flex justify-center z-50 pointer-events-none transition-all duration-300 ease-in-out ${selectedLeads.length > 0
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-8'
                    }`}
            >
                <div className={`bg-dark/80 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl p-3 md:p-4 flex items-center justify-between w-full max-w-2xl gap-4 pointer-events-auto ${selectedLeads.length > 0 ? 'scale-100' : 'scale-95'} transition-transform duration-300`}>
                    <div className="flex items-center space-x-3 text-white">
                        <div className="bg-primary/20 text-primary w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base border border-primary/20">
                            {selectedLeads.length}
                        </div>
                        <span className="font-bold text-sm md:text-base text-gray-200">Selected</span>
                    </div>

                    <div className="flex items-center space-x-2 md:space-x-4">
                        <button
                            onClick={() => setSelectedLeads([])}
                            className="px-3 py-2 md:px-4 md:py-2 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all text-sm md:text-base"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            className="bg-red-500/20 text-red-500 border border-red-500/30 px-4 py-2 md:px-6 md:py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-red-500/10 hover:bg-red-500 hover:text-white transition-all group text-sm md:text-base"
                        >
                            <Trash2 size={18} className="group-hover:animate-bounce" />
                            <span className="hidden sm:inline">Delete All</span>
                            <span className="sm:hidden">Delete</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-24 right-6 z-[100] px-5 py-3 rounded-2xl shadow-2xl font-bold text-sm flex items-center space-x-3 border transition-all animate-in fade-in slide-in-from-bottom-4 duration-300 ${
                    toast.type === 'error'
                        ? 'bg-red-500/20 border-red-500/40 text-red-300 shadow-red-500/20'
                        : 'bg-green-500/20 border-green-500/40 text-green-300 shadow-green-500/20'
                }`}>
                    <span>{toast.type === 'error' ? '❌' : '✅'}</span>
                    <span>{toast.msg}</span>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
