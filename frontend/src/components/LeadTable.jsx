import React from 'react';
import { Phone, MessageCircle, MapPin, ExternalLink, Edit3, Trash2, Star } from 'lucide-react';

const LeadTable = ({ leads, onEdit, onDelete, selectedLeads = [], setSelectedLeads = () => {}, onUpdateLead }) => {
    
    // Select all logic
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = leads.map(l => l._id);
            setSelectedLeads(allIds);
        } else {
            setSelectedLeads([]);
        }
    };

    const handleSelectLead = (e, id) => {
        if (e.target.checked) {
            setSelectedLeads(prev => [...prev, id]);
        } else {
            setSelectedLeads(prev => prev.filter(leadId => leadId !== id));
        }
    };

    const handleContactClick = (lead) => {
        if (!onUpdateLead) return;
        const now = new Date();
        if (lead.status === 'Not Called') {
            onUpdateLead(lead._id, { status: 'Called', lastContacted: now });
        } else {
            onUpdateLead(lead._id, { lastContacted: now });
        }
    };

    const formatRelativeTime = (dateString) => {
        if (!dateString) return '';
        const diff = new Date() - new Date(dateString);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        if (days > 7) return new Date(dateString).toLocaleDateString();
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        const mins = Math.floor(diff / 60000);
        return mins > 0 ? `${mins}m ago` : 'Just now';
    };
    
    const getStatusColor = (status) => {
        switch (status) {
            case 'Closed': return 'bg-green-500/20 text-green-500 border-green-500/30';
            case 'Interested': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
            case 'Called': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
            default: return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
        }
    };

    return (
        <div className="glass rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Desktop View: Table Layout */}
            <div className="hidden md:block overflow-x-auto w-full">
                <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            <th className="px-6 py-4 text-xs font-bold w-16">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded-md border-2 border-white/20 bg-dark text-primary outline-none focus:outline-none cursor-pointer transition-all appearance-none checked:bg-primary checked:border-primary relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-[1px] after:w-1.5 after:h-2.5 after:border-white after:border-b-2 after:border-r-2 after:rotate-45"
                                    checked={leads.length > 0 && selectedLeads.length === leads.length}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-1/3">Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-1/5">Phone / Rating</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center w-1/6">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {leads.map((lead) => (
                            <tr key={lead._id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded-md border-2 border-white/20 bg-dark text-primary outline-none focus:outline-none cursor-pointer transition-all appearance-none checked:bg-primary checked:border-primary relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-[1px] after:w-1.5 after:h-2.5 after:border-white after:border-b-2 after:border-r-2 after:rotate-45"
                                        checked={selectedLeads.includes(lead._id)}
                                        onChange={(e) => handleSelectLead(e, lead._id)}
                                    />
                                </td>
                                <td className="px-6 py-4 overflow-hidden">
                                    <div className="flex flex-col min-w-0 w-full">
                                        <span className="text-white font-medium text-lg truncate w-full" title={lead.name}>{lead.name}</span>
                                        {lead.website && (
                                            <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center space-x-1 mt-1 w-fit max-w-full min-w-0">
                                                <span className="truncate">{lead.website.replace(/(^\w+:|^)\/\//, '')}</span>
                                                <ExternalLink size={10} className="shrink-0" />
                                            </a>
                                        )}
                                        {lead.notes && (
                                            <div className="mt-2 text-xs text-gray-400 w-full truncate" title={lead.notes}>
                                                <span className="font-bold text-gray-500">Note: </span>{lead.notes}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col space-y-1">
                                        <span className="text-gray-300 font-mono text-sm">{lead.phone}</span>
                                        <div className="flex items-center space-x-1 text-yellow-400">
                                            <Star size={12} fill="currentColor" />
                                            <span className="text-xs font-medium">{lead.rating || 0} ({lead.reviews || 0})</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col items-center justify-center gap-1 text-center">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold border uppercase transition-all ${getStatusColor(lead.status)}`}>
                                            {lead.status}
                                        </span>
                                        {lead.lastContacted && (
                                            <div className="text-[10px] text-gray-400 font-medium">
                                                Contacted: {formatRelativeTime(lead.lastContacted)}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end space-x-2">
                                        {/* Actions */}
                                        <a href={`tel:${lead.phone}`} onClick={() => handleContactClick(lead)} className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all shadow-lg shadow-green-500/20" title="Call">
                                            <Phone size={14} />
                                        </a>
                                        <a href={`https://wa.me/${lead.phone.startsWith('91') ? lead.phone : '91' + lead.phone}`} onClick={() => handleContactClick(lead)} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/20" title="WhatsApp">
                                            <MessageCircle size={14} />
                                        </a>
                                        {lead.mapsLink && (
                                            <a href={lead.mapsLink} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-lg shadow-blue-500/20" title="Maps">
                                                <MapPin size={14} />
                                            </a>
                                        )}
                                        <div className="h-6 w-px bg-white/10 mx-1"></div>
                                        <button onClick={() => onEdit(lead)} className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center hover:bg-purple-500 hover:text-white transition-all" title="Edit">
                                            <Edit3 size={14} />
                                        </button>
                                        <button onClick={() => onDelete(lead._id)} className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all" title="Delete">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View: Card Layout */}
            <div className="md:hidden flex flex-col p-4 space-y-4">
                {leads.map((lead) => (
                    <div key={lead._id} className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col space-y-4">
                        
                        {/* Header: Name and Status */}
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex items-start space-x-3 overflow-hidden">
                                <div className="pt-1">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded-md border-2 border-white/20 bg-dark text-primary outline-none focus:outline-none cursor-pointer transition-all appearance-none checked:bg-primary checked:border-primary relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-[1px] after:w-1.5 after:h-2.5 after:border-white after:border-b-2 after:border-r-2 after:rotate-45 flex-shrink-0"
                                        checked={selectedLeads.includes(lead._id)}
                                        onChange={(e) => handleSelectLead(e, lead._id)}
                                    />
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-white font-bold text-lg truncate">{lead.name}</span>
                                    {lead.website && (
                                        <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center space-x-1 mt-1 truncate">
                                            <span className="truncate">{lead.website.replace(/(^\w+:|^)\/\//, '')}</span>
                                            <ExternalLink size={10} className="flex-shrink-0" />
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold border uppercase ${getStatusColor(lead.status)}`}>
                                    {lead.status}
                                </span>
                                {lead.lastContacted && (
                                    <span className="text-[9px] text-gray-400 font-medium">
                                        {formatRelativeTime(lead.lastContacted)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Middle: Phone and Rating */}
                        <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center bg-dark/40 rounded-xl p-3 border border-white/5 gap-2">
                            <div className="flex items-center space-x-2">
                                <Phone size={14} className="text-gray-400" />
                                <span className="text-gray-300 font-mono text-sm truncate">{lead.phone}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-yellow-400">
                                <Star size={14} fill="currentColor" />
                                <span className="text-sm font-medium">{lead.rating || 0} ({lead.reviews || 0})</span>
                            </div>
                        </div>

                        {/* Notes Area (if exists) */}
                        {lead.notes && (
                            <div className="bg-dark/20 rounded-xl p-3 border border-white/5 text-xs text-gray-300">
                                <span className="font-bold text-gray-500">Note: </span>{lead.notes}
                            </div>
                        )}

                        {/* Footer: Action Buttons */}
                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/10">
                            <div className="flex items-center space-x-2">
                                <a href={`tel:${lead.phone}`} onClick={() => handleContactClick(lead)} className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all active:scale-95" title="Call">
                                    <Phone size={16} />
                                </a>
                                <a href={`https://wa.me/${lead.phone.startsWith('91') ? lead.phone : '91' + lead.phone}`} onClick={() => handleContactClick(lead)} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all active:scale-95" title="WhatsApp">
                                    <MessageCircle size={16} />
                                </a>
                                {lead.mapsLink && (
                                    <a href={lead.mapsLink} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all active:scale-95" title="Maps">
                                        <MapPin size={16} />
                                    </a>
                                )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <button onClick={() => onEdit(lead)} className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center hover:bg-purple-500 hover:text-white transition-all active:scale-95" title="Edit">
                                    <Edit3 size={16} />
                                </button>
                                <button onClick={() => onDelete(lead._id)} className="w-10 h-10 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-95" title="Delete">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {leads.length === 0 && (
                <div className="py-20 px-6 text-center text-gray-500">
                    <p className="text-lg">No leads found. Please upload a CSV to get started!</p>
                </div>
            )}
        </div>
    );
};

export default LeadTable;
