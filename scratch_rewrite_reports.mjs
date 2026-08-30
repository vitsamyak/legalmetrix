import fs from 'fs';
const content = `import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Search, Download, FileText, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

export const ReportsPage = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*, inspections(id, profiles(full_name), products(name))')
          .order('report_date', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          setReports(data);
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, []);

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
    const reportId = item.id || '';
    const term = searchTerm.toLowerCase();
    
    return reportId.toLowerCase().includes(term) || inspectorName.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
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
              placeholder="Search reports by ID, Inspector..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-obsidian border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm text-content"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-content-muted uppercase bg-obsidian border-b border-border">
              <tr>
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
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-content-muted">Loading reports...</td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-content-muted">No reports found</td>
                </tr>
              ) : (
                filteredReports.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
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
                        <Link to={\`/dashboard/report/\${item.inspection_id || item.inspections?.id}\`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-content-muted">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
`;
fs.writeFileSync('src/pages/ReportsPage.tsx', content);
