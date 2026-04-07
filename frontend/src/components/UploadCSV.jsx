import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import * as api from '../services/api';

const UploadCSV = ({ onUploadSuccess }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'success', 'error'
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(Array.from(e.target.files));
            setStatus(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.csv'));
            if (droppedFiles.length > 0) {
                setFiles(droppedFiles);
                setStatus(null);
            } else {
                setStatus({ type: 'error', msg: 'Only .csv files are allowed' });
            }
        }
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        setLoading(true);
        setStatus(null);

        const formData = new FormData();
        files.forEach((file) => {
            formData.append('csvFiles', file);
        });

        try {
            const response = await api.uploadCSV(formData);
            setStatus({ type: 'success', msg: `Successfully added ${response.data.leadsAdded} new leads!` });
            setFiles([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            onUploadSuccess(response.data.leadsAdded);
            
            setTimeout(() => {
                setStatus((current) => current?.type === 'success' ? null : current);
            }, 5000);
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.error || 'Failed to upload files.';
            setStatus({ type: 'error', msg: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col space-y-4">
            <div 
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${
                    isDragging ? 'border-primary bg-primary/10' : 'border-white/20 bg-dark/50 hover:bg-white/5'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-4 animate-bounce">
                    <Upload size={32} />
                </div>
                <h3 className="text-xl font-bold gradient-text text-center">Drag & Drop CSVs</h3>
                <p className="text-gray-400 text-sm text-center mb-4">Or click to select multiple files</p>
                
                <label className="cursor-pointer bg-dark/50 border border-primary/30 rounded-lg px-6 py-3 hover:bg-primary/20 transition-all shadow-lg text-white font-bold text-sm">
                    Browse Files
                    <input type="file" className="hidden" accept=".csv" multiple onChange={handleFileChange} ref={fileInputRef} />
                </label>
            </div>

            {files.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                    {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/10">
                            <div className="flex items-center space-x-2 overflow-hidden">
                                <FileText size={16} className="text-primary flex-shrink-0" />
                                <span className="text-xs text-gray-300 truncate w-32 md:w-48">{file.name}</span>
                            </div>
                            <button onClick={() => removeFile(index)} className="text-gray-500 hover:text-red-400 transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={files.length === 0 || loading}
                className={`w-full py-3 rounded-xl font-bold transition-all text-sm ${
                    files.length === 0 || loading ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-gradient-main text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95"
                }`}
            >
                {loading ? "Processing..." : `Upload ${files.length > 0 ? files.length : ''} File${files.length !== 1 ? 's' : ''}`}
            </button>

            {status?.type === 'success' && (
                <div className="flex items-center justify-center space-x-2 text-green-400 animate-in fade-in zoom-in duration-300 p-2 bg-green-500/10 rounded-lg">
                    <CheckCircle size={18} />
                    <span className="text-sm font-bold">{status.msg}</span>
                </div>
            )}
            {status?.type === 'error' && (
                <div className="flex items-center justify-center space-x-2 text-red-400 p-2 bg-red-500/10 rounded-lg">
                    <AlertCircle size={18} />
                    <span className="text-sm font-bold">{status.msg}</span>
                </div>
            )}
        </div>
    );
};

export default UploadCSV;
