import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Plus, Trash2, QrCode, Printer, Check, Copy, ExternalLink, Sparkles } from 'lucide-react';
import { Table as TableType } from '../types';
import { apiClient, DEFAULT_TABLES } from '../services/apiClient';
import { useBrand } from '../context/BrandContext';

export const AdminTables: React.FC = () => {
  const navigate = useNavigate();
  const { brandName, tagline } = useBrand();
  const [tables, setTables] = useState<TableType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTableNum, setNewTableNum] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copiedTableNum, setCopiedTableNum] = useState<number | null>(null);

  // Protected route check
  useEffect(() => {
    const token = localStorage.getItem('scandine_token') || localStorage.getItem('aura_cafe_token');
    if (!token) {
      navigate('/login', { replace: true, state: { unauthorized: true } });
      return;
    }
    fetchTables();
  }, [navigate]);

  const fetchTables = async () => {
    try {
      const data = await apiClient.getTables();
      if (Array.isArray(data) && data.length > 0) {
        setTables(data);
      } else {
        setTables(DEFAULT_TABLES);
      }
    } catch (e) {
      setTables(DEFAULT_TABLES);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(newTableNum, 10);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid table number.');
      return;
    }

    if (tables.some((t) => t.table_number === num)) {
      setError(`Table ${num} already exists.`);
      return;
    }

    setError(null);
    try {
      const newTable = await apiClient.addTable(num);
      setTables((prev) =>
        [...prev.filter((t) => t.table_number !== num), newTable].sort((a, b) => a.table_number - b.table_number)
      );
      setNewTableNum('');
    } catch (err: any) {
      setError(err.message || 'Failed to add table.');
    }
  };

  const handleDeleteTable = async (id: string, num: number) => {
    if (window.confirm(`Are you sure you want to delete Table #${num}?`)) {
      await apiClient.deleteTable(id);
      setTables((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const getTableUrl = (num: number) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/menu?table=${num}`;
    }
    return `/menu?table=${num}`;
  };

  const copyUrl = (num: number) => {
    const url = getTableUrl(num);
    navigator.clipboard.writeText(url);
    setCopiedTableNum(num);
    setTimeout(() => setCopiedTableNum(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] pt-4 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-blue-100 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="p-2 rounded-xl border border-blue-200 hover:bg-blue-50 text-slate-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600">{brandName} Tables</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Table QR Code Generator & Printing
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Table QR Cards</span>
        </button>
      </div>

      {/* Add Table Form */}
      <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-xs print:hidden space-y-3">
        <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Register New Dining Table</h3>
        {error && (
          <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
            {error}
          </div>
        )}
        <form onSubmit={handleAddTable} className="flex gap-2 max-w-md">
          <input
            type="number"
            min="1"
            placeholder="Enter Table Number (e.g. 11)"
            value={newTableNum}
            onChange={(e) => setNewTableNum(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl bg-blue-50/50 border border-blue-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Table</span>
          </button>
        </form>
      </div>

      {/* Grid of Table QR Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {tables.map((table) => {
          const tableUrl = getTableUrl(table.table_number);
          const isCopied = copiedTableNum === table.table_number;

          return (
            <div
              key={table.id}
              className="bg-white rounded-3xl p-5 border border-blue-100 shadow-xs flex flex-col items-center justify-between space-y-4 print:shadow-none print:border-2 print:border-black print:break-inside-avoid"
            >
              {/* Stand Card Top */}
              <div className="text-center space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  {brandName} Table
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  TABLE #{table.table_number}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Scan with Camera to Order
                </p>
              </div>

              {/* QR Code SVG */}
              <div className="p-3 bg-white border border-blue-100 rounded-2xl shadow-inner">
                <QRCodeSVG
                  value={tableUrl}
                  size={150}
                  level="H"
                  includeMargin={true}
                />
              </div>

              {/* Stand Card Instructions */}
              <div className="text-center text-[10px] text-slate-500 leading-tight">
                <p className="font-semibold text-slate-800">No App Installation Required</p>
                <p className="text-[9px] text-slate-400 mt-0.5">Contactless Dining & Kitchen Service</p>
              </div>

              {/* Action Buttons (Hidden on Print) */}
              <div className="w-full flex items-center justify-between border-t border-blue-50 pt-3 print:hidden">
                <a
                  href={`/menu?table=${table.table_number}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                  title="Open Customer View in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Test</span>
                </a>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => copyUrl(table.table_number)}
                    className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg text-xs cursor-pointer"
                    title="Copy direct table URL"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteTable(table.id, table.table_number)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                    title="Delete Table"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
