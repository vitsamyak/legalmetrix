import fs from 'fs';
const content = `import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Search, Filter, Download, Eye, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Compliant': return <Badge variant="success">Compliant</Badge>;
    case 'Non-Compliant': return <Badge variant="danger">Non-Compliant</Badge>;
    case 'Needs Review': return <Badge variant="warning">Needs Review</Badge>;
    default: return <Badge>Unknown</Badge>;
  }
};

export const InspectionHistory = () => {
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  useEffect(() => {
    const fetchInspections = async () => {
      try {
        const { data, error } = await supabase
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-content tracking-tight">Inspection History</h1>
          <p className="text-content-muted mt-1">Search, filter and manage all past compliance inspections.</p>
        </div>
        <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>
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
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-surface-light border border-border rounded-xl outline-none text-sm font-medium"
            >
              <option>All Statuses</option>
              <option>Compliant</option>
              <option>Non-Compliant</option>
              <option>Needs Review</option>
            </select>
            <Button variant="secondary" leftIcon={<Filter className="w-4 h-4" />}>
              More Filters
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-content-muted uppercase bg-surface-light border-b border-border">
              <tr>
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
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-content-muted">Loading inspections...</td>
                </tr>
              ) : filteredInspections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-content-muted">No inspections found</td>
                </tr>
              ) : (
                filteredInspections.map((item, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.5) }}
                    key={item.id} 
                    className="hover:bg-surface-light/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-content-muted text-xs">{item.id?.substring(0, 8)}...</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-content">{item.products?.name || 'Unknown Product'}</div>
                      <div className="text-xs text-content-muted">{item.products?.brand || 'Unknown Brand'}</div>
                    </td>
                    <td className="px-6 py-4 text-content-muted">{formatDate(item.created_at)}</td>
                    <td className="px-6 py-4 text-content-muted">{item.profiles?.full_name || 'Inspector'}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold">{(item.compliance_score || 0)}/100</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link to={\`/dashboard/inspection/\${item.id}\`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link to={\`/dashboard/report/\${item.id}\`}>
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
          <div>Showing {filteredInspections.length > 0 ? 1 : 0} to {filteredInspections.length} of {inspections.length} entries</div>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border border-border rounded-lg hover:bg-surface-light disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 bg-primary text-white rounded-lg">1</button>
            <button className="px-3 py-1 border border-border rounded-lg hover:bg-surface-light disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </Card>
    </div>
  );
};
`;
fs.writeFileSync('src/pages/InspectionHistory.tsx', content);
