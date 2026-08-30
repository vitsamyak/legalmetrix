import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Search, Filter, Download, Eye, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { BrandedLoader } from '../components/BrandedLoader';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { useToast } from '../components/Toast';
import { Trash2, ChevronDown } from 'lucide-react';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Compliant': return <Badge variant="success">Compliant</Badge>;
    case 'Non-Compliant': return <Badge variant="danger">Non-Compliant</Badge>;
    case 'Needs Review': return <Badge variant="warning">Needs Review</Badge>;
    default: return <Badge>Unknown</Badge>;
  }
};

export const InspectionHistory = () => {
  const { showToast } = useToast();
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchInspections = async () => {
      try {
        const { data, error } = await supabase!
          .from('inspections')
          .select('*, products(name, brand), profiles(full_name)')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        if (data) setInspections(data);
      } catch (err) {
        console.error('Error fetching inspections:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInspections();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredInspections = inspections.filter(item => {
    const matchesSearch = 
      (item.id && item.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.products?.name && item.products.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.products?.brand && item.products.brand.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesStatus = statusFilter === 'All Statuses' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredInspections.length / itemsPerPage);
  const paginatedInspections = filteredInspections.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedInspections.map(i => i.id)));
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
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} inspection(s)?`)) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase!
        .from('inspections')
        .delete()
        .in('id', Array.from(selectedIds));

      if (error) throw error;

      showToast(`Successfully deleted ${selectedIds.size} inspection(s).`, 'success');
      setInspections(prev => prev.filter(i => !selectedIds.has(i.id)));
      setSelectedIds(new Set());
    } catch (err: any) {
      console.error('Error deleting inspections:', err);
      showToast(err.message || 'Failed to delete inspections', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportData = () => {
    if (filteredInspections.length === 0) {
      showToast('No data to export', 'error');
      return;
    }

    const headers = ['Inspection ID', 'Product Name', 'Brand', 'Date', 'Inspector', 'Score', 'Status'];
    
    const csvContent = [
      headers.join(','),
      ...filteredInspections.map(item => [
        item.id || '',
        `"${item.products?.name || ''}"`,
        `"${item.products?.brand || ''}"`,
        `"${formatDate(item.created_at)}"`,
        `"${item.profiles?.full_name || 'Inspector'}"`,
        item.compliance_score !== null && item.compliance_score !== undefined ? item.compliance_score : '',
        item.status || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inspections_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Data exported successfully', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-content tracking-tight">Inspection History</h1>
          <p className="text-content-muted mt-1">Search, filter and manage all past compliance inspections.</p>
        </div>
        <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />} onClick={handleExportData}>
          Export Data
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by ID, product, or brand..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-light border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
            />
          </div>
          <div className="flex space-x-2">
            <div className="relative">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 pr-10 appearance-none bg-surface-light border border-border rounded-xl outline-none text-sm font-medium"
              >
                <option>All Statuses</option>
                <option>Compliant</option>
                <option>Non-Compliant</option>
                <option>Needs Review</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted pointer-events-none" />
            </div>
            <Button variant="secondary" leftIcon={<Filter className="w-4 h-4" />}>
              More Filters
            </Button>
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="bg-primary/10 border-b border-primary/20 px-6 py-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <span className="text-sm font-medium text-primary">
              {selectedIds.size} inspection{selectedIds.size > 1 ? 's' : ''} selected
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
            <thead className="text-xs text-content-muted uppercase bg-surface-light border-b border-border">
              <tr>
                <th className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    className="rounded border-border bg-sidebar/50 focus:ring-primary focus:ring-offset-0 text-primary"
                    checked={paginatedInspections.length > 0 && paginatedInspections.every(item => selectedIds.has(item.id))}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 font-medium">Inspection ID</th>
                <th className="px-6 py-4 font-medium">Product Details</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Inspector</th>
                <th className="px-6 py-4 font-medium">Score</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5].map((idx) => (
                    <tr key={`skeleton-${idx}`}>
                      <td className="px-6 py-4"><SkeletonLoader className="h-4 w-4 rounded" /></td>
                      <td className="px-6 py-4"><SkeletonLoader className="h-4 w-20" /></td>
                      <td className="px-6 py-4">
                        <SkeletonLoader className="h-4 w-32 mb-2" />
                        <SkeletonLoader className="h-3 w-24 bg-white/5" />
                      </td>
                      <td className="px-6 py-4"><SkeletonLoader className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><SkeletonLoader className="h-4 w-28" /></td>
                      <td className="px-6 py-4"><SkeletonLoader className="h-4 w-12" /></td>
                      <td className="px-6 py-4"><SkeletonLoader className="h-6 w-24 rounded-full" /></td>
                      <td className="px-6 py-4 flex justify-end"><SkeletonLoader className="h-8 w-20 rounded-lg" /></td>
                    </tr>
                  ))}
                </>
              ) : paginatedInspections.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-content-muted">No inspections found</td>
                </tr>
              ) : (
                paginatedInspections.map((item, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.5) }}
                    key={item.id} 
                    className={`transition-colors ${selectedIds.has(item.id) ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-surface-light/50'}`}
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="rounded border-border bg-sidebar/50 focus:ring-primary focus:ring-offset-0 text-primary"
                        checked={selectedIds.has(item.id)}
                        onChange={() => handleSelectOne(item.id)}
                      />
                    </td>
                    <td className="px-6 py-4 font-mono text-content-muted text-xs">{item.id?.substring(0, 8)}...</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-content">{item.products?.name || 'Unknown Product'}</div>
                      <div className="text-xs text-content-muted">{item.products?.brand || 'Unknown Brand'}</div>
                    </td>
                    <td className="px-6 py-4 text-content-muted">{formatDate(item.created_at)}</td>
                    <td className="px-6 py-4 text-content-muted">{item.profiles?.full_name || 'Inspector'}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold">{item.compliance_score !== null && item.compliance_score !== undefined ? item.compliance_score + '/100' : '--/100'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link to={`/inspections/${item.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link to={`/reports/${item.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" title="Download Report">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-content-muted">
          <div>
            Showing {filteredInspections.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredInspections.length)} of {filteredInspections.length} entries
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
