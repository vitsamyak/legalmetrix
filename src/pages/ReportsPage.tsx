import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Search, Download, FileText, Eye, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { BrandedLoader } from '../components/BrandedLoader';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { ReportDocument } from '../components/ReportDocument';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Trash2 } from 'lucide-react';
// @ts-ignore
import * as html2pdfLib from 'html2pdf.js/dist/html2pdf.bundle.min.js';
const html2pdf = html2pdfLib.default || html2pdfLib;

export const ReportsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [hiddenReportData, setHiddenReportData] = useState<{ inspection: any; violations: any[] } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data, error } = await supabase!
          .from('inspections')
          .select('*, profiles(full_name), products(name)')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          const derivedReports = data.map(inspection => ({
            id: inspection.human_id || inspection.id,
            inspection_id: inspection.id,
            report_date: inspection.created_at,
            status: inspection.status === 'Needs Review' ? 'Pending' : 'Generated',
            inspections: {
              id: inspection.id,
              profiles: inspection.profiles,
              products: inspection.products
            }
          }));
          setReports(derivedReports);
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, []);

  const handleDownloadRow = async (inspectionId: string) => {
    if (downloadingId) return;
    setDownloadingId(inspectionId);
    
    try {
      const { data: insData, error: insError } = await supabase!
        .from('inspections')
        .select('*, products(name, brand, category), profiles(full_name, region)')
        .eq('id', inspectionId)
        .single();
        
      if (insError) throw insError;

      const { data: violData, error: violError } = await supabase!
        .from('violations')
        .select('*')
        .eq('inspection_id', inspectionId);
        
      if (violError) throw violError;

      setHiddenReportData({ inspection: insData, violations: violData || [] });
      
      // Wait for React to render the hidden component
      setTimeout(async () => {
        const element = document.getElementById('hidden-report-content-wrapper')?.firstElementChild;
        if (element) {
          const opt = {
            margin:       0,
            filename:     `LegalMetrix-AI-Report-${inspectionId.substring(0,8)}.pdf`,
            image:        { type: 'jpeg' as const, quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, logging: false },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' as const }
          };
          await html2pdf().set(opt).from(element as HTMLElement).save();
        }
        setHiddenReportData(null);
        setDownloadingId(null);
      }, 500); // 500ms to ensure fonts/icons load
      
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to generate PDF download.');
      setHiddenReportData(null);
      setDownloadingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredReports = reports.filter(item => {
    const inspectorName = item.inspections?.profiles?.full_name || '';
    const productName = item.inspections?.products?.name || '';
    const reportId = item.id || '';
    const term = searchTerm.toLowerCase();
    
    return reportId.toLowerCase().includes(term) || 
           inspectorName.toLowerCase().includes(term) ||
           productName.toLowerCase().includes(term);
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedReports.map(r => r.inspection_id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} report(s)?`)) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase!
        .from('inspections')
        .delete()
        .in('id', Array.from(selectedIds));

      if (error) throw error;

      showToast(`Successfully deleted ${selectedIds.size} report(s).`, 'success');
      setReports(prev => prev.filter(r => !selectedIds.has(r.inspection_id)));
      setSelectedIds(new Set());
    } catch (err: any) {
      console.error('Error deleting reports:', err);
      showToast(err.message || 'Failed to delete reports', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden container for PDF generation */}
      {hiddenReportData && (
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0, pointerEvents: 'none' }} id="hidden-report-content-wrapper">
          <ReportDocument 
            inspection={hiddenReportData.inspection}
            violations={hiddenReportData.violations}
            user={user}
            reportDate={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-content tracking-tight">Compliance Reports</h1>
          <p className="text-content-muted mt-1">Review, generate and export inspection reports.</p>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-faint" />
            <input 
              type="text" 
              placeholder="Search reports by ID, Product, or Inspector..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0F172A]/40 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm text-content"
            />
          </div>
        </div>
        
        {selectedIds.size > 0 && (
          <div className="bg-primary/10 border-b border-primary/20 px-6 py-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <span className="text-sm font-medium text-primary">
              {selectedIds.size} report{selectedIds.size > 1 ? 's' : ''} selected
            </span>
            <Button 
              variant="danger" 
              size="sm" 
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={handleBulkDelete}
              isLoading={isDeleting}
            >
              Delete Selected
            </Button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-content-muted uppercase bg-obsidian border-b border-border">
              <tr>
                <th className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    className="rounded border-border bg-sidebar/50 focus:ring-primary focus:ring-offset-0 text-primary"
                    checked={paginatedReports.length > 0 && paginatedReports.every(item => {
                      const id = item.inspection_id || item.inspections?.id;
                      return id ? selectedIds.has(id) : false;
                    })}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 font-medium">Report ID</th>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Inspector</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface-secondary">
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5].map((idx) => (
                    <tr key={`skeleton-${idx}`}>
                      <td className="px-6 py-4"><SkeletonLoader className="h-4 w-4 rounded" /></td>
                      <td className="px-6 py-4"><SkeletonLoader className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><SkeletonLoader className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><SkeletonLoader className="h-4 w-28" /></td>
                      <td className="px-6 py-4"><SkeletonLoader className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><SkeletonLoader className="h-6 w-24 rounded-full" /></td>
                      <td className="px-6 py-4 flex justify-end space-x-2">
                        <SkeletonLoader className="h-8 w-8 rounded-lg" />
                        <SkeletonLoader className="h-8 w-8 rounded-lg" />
                      </td>
                    </tr>
                  ))}
                </>
              ) : paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="p-4 bg-obsidian rounded-full border border-border">
                        <FileText className="w-8 h-8 text-content-faint" />
                      </div>
                      <h3 className="text-lg font-medium text-content">No Reports Found</h3>
                      <p className="text-content-muted max-w-md text-center">
                        {searchTerm ? 'No reports matched your search criteria.' : 'Reports are automatically generated from completed inspections.'}
                      </p>
                      {!searchTerm && (
                        <Link to="/inspections/new">
                          <Button variant="primary" className="mt-2">Start New Inspection</Button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedReports.map((item) => {
                  const actualInspectionId = item.inspection_id || item.inspections?.id;
                  const isDownloading = downloadingId === actualInspectionId;
                  const canDownload = item.status === 'Generated';

                  return (
                    <tr key={item.id} className={`transition-colors ${selectedIds.has(actualInspectionId) ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-white/5'}`}>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          className="rounded border-border bg-sidebar/50 focus:ring-primary focus:ring-offset-0 text-primary"
                          checked={selectedIds.has(actualInspectionId)}
                          onChange={() => handleSelectOne(actualInspectionId)}
                        />
                      </td>
                      <td className="px-6 py-4 font-mono text-content-muted text-xs">{item.id?.substring(0, 8)}...</td>
                      <td className="px-6 py-4 font-medium text-content">{item.inspections?.products?.name || 'Unknown Product'}</td>
                      <td className="px-6 py-4 text-content-muted">{item.inspections?.profiles?.full_name || 'Unknown Inspector'}</td>
                      <td className="px-6 py-4 text-content-muted">{formatDate(item.report_date)}</td>
                      <td className="px-6 py-4">
                        <Badge variant={item.status === 'Generated' ? 'success' : 'warning'}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Link to={`/reports/${actualInspectionId}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" title="View Report">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`h-8 w-8 ${canDownload ? 'text-content-muted hover:text-content' : 'text-slate-600 cursor-not-allowed opacity-50'}`}
                            title={canDownload ? "Download PDF" : "Cannot download pending report"}
                            onClick={() => canDownload && handleDownloadRow(actualInspectionId)}
                            disabled={!canDownload || isDownloading}
                          >
                            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-content-muted">
          <div>
            Showing {filteredReports.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredReports.length)} of {filteredReports.length} entries
          </div>
          <div className="flex space-x-1">
            <button 
              className="px-3 py-1 border border-border rounded-lg hover:bg-surface-light disabled:opacity-50" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              Previous
            </button>
            <button className="px-3 py-1 bg-primary text-white rounded-lg">{currentPage}</button>
            <button 
              className="px-3 py-1 border border-border rounded-lg hover:bg-surface-light disabled:opacity-50" 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
