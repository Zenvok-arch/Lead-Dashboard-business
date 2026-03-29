import React from 'react';
import { Phone, MessageCircle, MapPin, ExternalLink, Edit3, Trash2, Star } from 'lucide-react';

const LeadTable = ({ leads, onEdit, onDelete }) => {
    
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
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Phone / Rating</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {leads.map((lead) => (
                            <tr key={lead._id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-white font-medium text-lg">{lead.name}</span>
                                        {lead.website && (
                                            <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center space-x-1 mt-1 w-fit">
                                                <span>{lead.website.replace(/(^\w+:|^)\/\//, '')}</span>
                                                <ExternalLink size={10} />
                                            </a>
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
                                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold border uppercase transition-all ${getStatusColor(lead.status)}`}>
                                        {lead.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end space-x-2">
                                        {/* Actions */}
                                        <a href={`tel:${lead.phone}`} className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all shadow-lg shadow-green-500/20" title="Call">
                                            <Phone size={14} />
                                        </a>
                                        <a href={`https://wa.me/${lead.phone.startsWith('91') ? lead.phone : '91' + lead.phone}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/20" title="WhatsApp">
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
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-white font-bold text-lg truncate">{lead.name}</span>
                                {lead.website && (
                                    <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center space-x-1 mt-1 truncate">
                                        <span className="truncate">{lead.website.replace(/(^\w+:|^)\/\//, '')}</span>
                                        <ExternalLink size={10} className="flex-shrink-0" />
                                    </a>
                                )}
                            </div>
                            <span className={`inline-flex flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-bold border uppercase ${getStatusColor(lead.status)}`}>
                                {lead.status}
                            </span>
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

                        {/* Footer: Action Buttons */}
                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/10">
                            <div className="flex items-center space-x-2">
                                <a href={`tel:${lead.phone}`} className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all active:scale-95" title="Call">
                                    <Phone size={16} />
                                </a>
                                <a href={`https://wa.me/${lead.phone.startsWith('91') ? lead.phone : '91' + lead.phone}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all active:scale-95" title="WhatsApp">
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
