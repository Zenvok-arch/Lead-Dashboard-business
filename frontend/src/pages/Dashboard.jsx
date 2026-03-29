import React, { useState, useEffect } from 'react';
import { Search, Plus, BarChart3, Users, PhoneCall, TrendingUp, LogOut, Menu, X } from 'lucide-react';
import LeadTable from '../components/LeadTable';
import UploadCSV from '../components/UploadCSV';
import LeadForm from '../components/LeadForm';
import * as api from '../services/api';

const Dashboard = () => {
    const [leads, setLeads] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [minRating, setMinRating] = useState('');
    const [minReviews, setMinReviews] = useState('');
    const [noWebsiteOnly, setNoWebsiteOnly] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editingLead, setEditingLead] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await api.getLeads();
            setLeads(res.data);
            setFilteredLeads(res.data);
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
        let result = leads;
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
        if (minReviews) {
            result = result.filter(lead => (lead.reviews || 0) >= Number(minReviews));
        }
        if (noWebsiteOnly) {
            result = result.filter(lead => !lead.website || lead.website.trim() === "");
        }
        setFilteredLeads(result);
    }, [search, statusFilter, minRating, minReviews, noWebsiteOnly, leads]);

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

    // Stats
    const totalLeads = leads.length;
    const calledLeads = leads.filter(l => l.status === 'Called' || l.status === 'Interested' || l.status === 'Closed').length;
    const closedLeads = leads.filter(l => l.status === 'Closed').length;

    const hotLeadsCount = leads.filter(lead => {
        const noWebsite = !lead.website || lead.website.trim() === "";
        return lead.rating >= 4 && lead.reviews >= 50 && noWebsite;
    }).length;

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
                <div className="flex items-center space-x-4 w-full md:w-auto">
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="bg-gradient-main px-6 py-3 rounded-xl font-bold flex items-center space-x-2 shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                    >
                        <Plus size={20} />
                        <span>Add New Lead</span>
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

                    <UploadCSV onUploadSuccess={() => fetchLeads()} />

                    <div className="glass p-6 rounded-3xl border border-white/5 space-y-6">
                        <h3 className="text-lg font-bold flex items-center space-x-2">
                            <BarChart3 className="text-primary" size={20} />
                            <span>Filters</span>
                        </h3>

                        {/* Search */}
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name/phone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-dark/50 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary transition-all shadow-inner"
                            />
                        </div>

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
                            <label className="text-gray-400 font-bold block text-sm">Min Rating</label>
                            <input
                                type="number"
                                placeholder="0 - 5"
                                value={minRating}
                                onChange={(e) => setMinRating(e.target.value)}
                                className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-sm shadow-inner"
                                min="0" max="5" step="0.1"
                            />
                        </div>

                        {/* Reviews Filter */}
                        <div className="space-y-2">
                            <label className="text-gray-400 font-bold block text-sm">Min Reviews</label>
                            <input
                                type="number"
                                placeholder="e.g. 100"
                                value={minReviews}
                                onChange={(e) => setMinReviews(e.target.value)}
                                className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-sm shadow-inner"
                                min="0"
                            />
                        </div>

                        {/* Website Checkbox */}
                        <div className="flex items-center space-x-3 py-2">
                            <input
                                type="checkbox"
                                id="noWebsite"
                                checked={noWebsiteOnly}
                                onChange={(e) => setNoWebsiteOnly(e.target.checked)}
                                className="w-4 h-4 rounded accent-primary bg-dark/50 border-white/10 cursor-pointer"
                            />
                            <label htmlFor="noWebsite" className="text-gray-400 font-bold text-sm cursor-pointer select-none">
                                No Website Only
                            </label>
                        </div>
                    </div>
                </div>

                {/* Table Area */}
                <div className="lg:col-span-3">
                    {/* Hot Leads Highlight Card */}
                    <div className="bg-red-500/10 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)] rounded-2xl p-4 mb-6 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="text-3xl bg-red-500/20 p-3 rounded-full flex items-center justify-center">🔥</div>
                            <div>
                                <h3 className="text-red-400 font-bold text-sm uppercase tracking-wider">Hot Leads</h3>
                                <p className="text-gray-300 text-xs mt-1">High rating, many reviews, no website.</p>
                            </div>
                        </div>
                        <div className="text-3xl font-black text-white">{hotLeadsCount}</div>
                    </div>

                    <LeadTable
                        leads={filteredLeads}
                        onEdit={handleEditLead}
                        onDelete={handleDeleteLead}
                    />
                </div>
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <LeadForm
                    lead={editingLead}
                    onClose={() => {
                        setIsFormOpen(false);
                        setEditingLead(null);
                    }}
                    onSave={handleSaveLead}
                />
            )}
        </div>
    );
};

export default Dashboard;
