import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import * as api from '../services/api';

const UploadCSV = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'success', 'error'
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus(null); // clear previous success/error messages when a new file is chosen
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setStatus(null);

        const formData = new FormData();
        formData.append('csvFile', file);

        try {
            const response = await api.uploadCSV(formData);
            setStatus({ type: 'success', msg: `Successfully added ${response.data.leadsAdded} new leads!` });
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            onUploadSuccess(response.data.leadsAdded);
            
            // Auto-clear success message after 5 seconds
            setTimeout(() => {
                setStatus((current) => current?.type === 'success' ? null : current);
            }, 5000);
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.error || 'Failed to upload file.';
            setStatus({ type: 'error', msg: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary animate-pulse">
                <Upload size={32} />
            </div>
            <h3 className="text-xl font-bold gradient-text">Import Leads</h3>
            <p className="text-gray-400 text-sm">Upload your CSV file to populate the list</p>
            
            <div className="flex items-center space-x-2">
                <label className="cursor-pointer bg-dark/50 border border-primary/30 rounded-lg px-4 py-2 hover:bg-primary/20 transition-all flex items-center space-x-2">
                    <FileText size={18} className="text-primary" />
                    <span className="text-sm font-medium">{file ? file.name : "Choose CSV"}</span>
                    <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} ref={fileInputRef} />
                </label>
            </div>

            <button
                onClick={handleUpload}
                disabled={!file || loading}
                className={`w-full py-2 rounded-lg font-bold transition-all ${
                    !file || loading ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-gradient-main text-white shadow-lg hover:brightness-110 active:scale-95"
                }`}
            >
                {loading ? "Processing..." : "Upload Leads"}
            </button>

            {status?.type === 'success' && (
                <div className="flex items-center space-x-2 text-green-400 animate-bounce">
                    <CheckCircle size={18} />
                    <span className="text-xs">{status.msg}</span>
                </div>
            )}
            {status?.type === 'error' && (
                <div className="flex items-center space-x-2 text-red-400">
                    <AlertCircle size={18} />
                    <span className="text-xs">{status.msg}</span>
                </div>
            )}
        </div>
    );
};

export default UploadCSV;
