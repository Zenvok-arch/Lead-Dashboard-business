import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, Globe, Tag, FileText } from 'lucide-react';

const LeadForm = ({ lead, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        website: '',
        status: 'Not Called',
        notes: ''
    });

    useEffect(() => {
        if (lead) {
            setFormData({
                name: lead.name || '',
                phone: lead.phone || '',
                website: lead.website || '',
                status: lead.status || 'Not Called',
                notes: lead.notes || ''
            });
        }
    }, [lead]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold gradient-text">{lead ? 'Edit Lead' : 'Add New Lead'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase flex items-center space-x-2">
                            <User size={12} className="text-primary" />
                            <span>Business Name</span>
                        </label>
                        <input 
                            type="text" 
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all shadow-inner"
                            placeholder="e.g. Acme Corp"
                        />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase flex items-center space-x-2">
                            <Phone size={12} className="text-secondary" />
                            <span>Phone Number</span>
                        </label>
                        <input 
                            type="text" 
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-secondary transition-all shadow-inner"
                            placeholder="e.g. +91 9876543210"
                        />
                    </div>

                    {/* Website */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase flex items-center space-x-2">
                            <Globe size={12} className="text-accent" />
                            <span>Website URL</span>
                        </label>
                        <input 
                            type="url" 
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-all shadow-inner"
                            placeholder="e.g. https://www.acme.com"
                        />
                    </div>

                    {/* Status Toggle/Select */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase flex items-center space-x-2">
                            <Tag size={12} className="text-green-400" />
                            <span>Lead Status</span>
                        </label>
                        <select 
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-400 transition-all appearance-none cursor-pointer"
                        >
                            <option value="Not Called">Not Called</option>
                            <option value="Called">Called</option>
                            <option value="Interested">Interested</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase flex items-center space-x-2">
                            <FileText size={12} className="text-gray-400" />
                            <span>Internal Notes</span>
                        </label>
                        <textarea 
                            rows="2"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gray-500 transition-all shadow-inner resize-none"
                            placeholder="Add lead-specific notes here..."
                        />
                    </div>

                    <button 
                        type="submit"
                        className="w-full py-4 rounded-xl bg-gradient-main text-white font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2"
                    >
                        <Save size={20} />
                        <span>{lead ? 'Update Lead' : 'Save Lead'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LeadForm;
