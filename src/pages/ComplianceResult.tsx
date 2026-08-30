import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, ShieldCheck, FileText, ChevronRight, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BrandedLoader } from '../components/BrandedLoader';

export const ComplianceResult = () => {
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get('id');
  
  const [inspection, setInspection] = useState<any>(null);
  const [declarations, setDeclarations] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        let inspectionId = idParam;
        
        // If no ID provided, fetch the latest inspection
        if (!inspectionId) {
          const { data: latest } = await supabase!
            .from('inspections')
            .select('id')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          if (latest) {
            inspectionId = latest.id;
          }
        }
        
        if (!inspectionId) return;
        
        const { data: insData, error: insError } = await supabase!
          .from('inspections')
          .select('*, products(name)')
          .eq('id', inspectionId)
          .single();
          
        if (insError) throw insError;
        setInspection(insData);
        
        const { data: declData } = await supabase!
          .from('compliance_results')
          .select('*, legal_rules(rule_reference)')
          .eq('inspection_id', inspectionId);
          
        if (declData) setDeclarations(declData);
        
        const { data: violData } = await supabase!
          .from('violations')
          .select('*')
          .eq('inspection_id', inspectionId);
          
        if (violData) setViolations(violData);

      } catch (err) {
        console.error('Error fetching compliance result:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [idParam]);

  if (loading) {
    return <BrandedLoader fullScreen={false} subMessage="Loading results..." />;
  }

  if (!inspection) {
    return <div className="p-12 text-center text-danger">No inspection results found</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-secondary p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center border ${inspection.status === 'Compliant' ? 'bg-emerald-500/15 border-emerald-500/30' : 'bg-rose-500/15 border-rose-500/30'}`}>
              <span className={`text-3xl font-bold font-heading ${inspection.status === 'Compliant' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {inspection.compliance_score !== null && inspection.compliance_score !== undefined ? inspection.compliance_score : '--'}
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold font-heading text-content">Inspection Result</h1>
              <Badge variant={inspection.status === 'Compliant' ? 'success' : inspection.status === 'Non-Compliant' ? 'danger' : 'warning'}>
                {inspection.status?.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-content-muted mt-1">ID: {inspection.id?.substring(0, 8)} • {inspection.products?.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Button variant="secondary" className="flex-1 md:flex-none" leftIcon={<ShieldCheck className="w-4 h-4" />}>
            Confirm Violations
          </Button>
          <Link to={`/reports/${inspection.id}`}>
            <Button variant="primary" className="flex-1 md:flex-none" leftIcon={<FileText className="w-4 h-4" />}>
              Generate Report
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Image Evidence */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyzed Evidence</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative bg-slate-900 group flex items-center justify-center h-[400px]">
                <div className="text-content-muted text-sm">Image evidence from Supabase would appear here</div>
              </div>
              <div className="p-4 border-t border-border flex justify-between items-center text-sm">
                <span className="text-content-muted">Evidence analyzed</span>
                <Link to="/evidence">
                  <Button variant="ghost" size="sm">View Gallery</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Declarations Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Mandatory Declarations</CardTitle>
                <p className="text-sm text-content-muted mt-1">Validation against Legal Metrology Rules</p>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-content-muted uppercase bg-surface-light border-y border-border">
                  <tr>
                    <th className="px-6 py-3 font-medium">Field</th>
                    <th className="px-6 py-3 font-medium">Extracted Value</th>
                    <th className="px-6 py-3 font-medium text-center">Confidence</th>
                    <th className="px-6 py-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {declarations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-content-muted">No compliance results found</td>
                    </tr>
                  ) : declarations.map((item, i) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={item.id} 
                      className="hover:bg-surface-light/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-content">{item.field_name}</div>
                        <div className="text-xs text-content-muted font-mono mt-0.5">{item.legal_rules?.rule_reference || 'Unknown Rule'}</div>
                      </td>
                      <td className="px-6 py-4">
                        {item.status === 'FAIL' ? (
                          <span className="text-danger italic">{item.extracted_value || 'Not Detected'}</span>
                        ) : (
                          <span className="text-content">{item.extracted_value}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
                          {item.confidence_score ? `${item.confidence_score}%` : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {item.status === 'PASS' ? (
                          <Badge variant="success" className="inline-flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/> PASS</Badge>
                        ) : (
                          <Badge variant="danger" className="inline-flex items-center"><XCircle className="w-3 h-3 mr-1"/> FAIL</Badge>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Potential Violations Alert */}
          {violations.length > 0 && (
            <Card className="border-danger/30 overflow-hidden relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-danger" />
              <CardHeader className="bg-danger/5">
                <CardTitle className="text-danger flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Potential Violations Detected
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {violations.map((viol) => (
                    <div key={viol.id} className="p-4 hover:bg-surface-light transition-colors flex items-start justify-between cursor-pointer group">
                      <div>
                        <h4 className="font-medium text-content group-hover:text-primary transition-colors">{viol.title}</h4>
                        <p className="text-sm text-content-muted mt-1">{viol.ai_analysis || 'Review required'}</p>
                        <div className="mt-2 flex space-x-2">
                          <Badge variant="danger">{viol.severity || 'High'} Severity</Badge>
                          <Badge variant="neutral">{viol.detection_type || 'Auto-Flagged'}</Badge>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary mt-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
