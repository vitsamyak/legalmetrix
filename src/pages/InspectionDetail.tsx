import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ArrowLeft, Clock, FileText, CheckCircle2, Search, Image as ImageIcon } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Disclaimer } from '../components/Disclaimer';
import { supabase } from '../lib/supabase';
import { BrandedLoader } from '../components/BrandedLoader';
import { useToast } from '../components/Toast';

export const InspectionDetail = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const [inspection, setInspection] = useState<any>(null);
  const [violations, setViolations] = useState<any[]>([]);
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        if (!id) return;
        
        const { data: insData, error: insError } = await supabase!
          .from('inspections')
          .select('*, products(name, brand), profiles(full_name)')
          .eq('id', id)
          .single();
          
        if (insError) throw insError;
        setInspection(insData);

        const { data: violData, error: violError } = await supabase!
          .from('violations')
          .select('*')
          .eq('inspection_id', id);
          
        if (violError) throw violError;
        if (violData) setViolations(violData);

        // Fetch real evidence
        const { data: evData, error: evError } = await supabase!
          .from('inspection_evidence')
          .select('*')
          .eq('inspection_id', id);
          
        if (evError) console.error("Error fetching evidence:", evError);
        if (evData) setEvidenceList(evData);

      } catch (err) {
        console.error('Error fetching inspection detail:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetail();
  }, [id]);

  const handleViewEvidence = async (filePath: string) => {
    try {
      const { data, error } = await supabase!.storage
        .from('evidence_images')
        .createSignedUrl(filePath, 3600);
        
      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      } else {
        showToast('Could not generate secure link for evidence.', 'error');
      }
    } catch (err: any) {
      console.error("Error viewing evidence:", err);
      showToast(err.message || 'Error loading evidence.', 'error');
    }
  };

  if (loading) {
    return <BrandedLoader fullScreen={false} subMessage="Loading inspection details..." />;
  }

  if (!inspection) {
    return <div className="p-12 text-center text-danger">Inspection not found</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div className="flex items-center space-x-4">
          <Link to="/inspections">
            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full border border-border">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold font-heading text-content tracking-tight">
                Inspection {inspection.id?.substring(0, 8)}
              </h1>
              <Badge variant={inspection.status === 'Compliant' ? 'success' : inspection.status === 'Non-Compliant' ? 'danger' : 'warning'}>
                {inspection.status}
              </Badge>
            </div>
            <p className="text-content-muted mt-1">
              {inspection.products?.name} • Inspector: {inspection.profiles?.full_name || 'Unknown'}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
          <Link to={`/evidence/${inspection.id}`} className="w-full sm:w-auto">
            <Button variant="secondary" leftIcon={<Search className="w-4 h-4" />} className="w-full justify-center">Review Evidence</Button>
          </Link>
          <Link to={`/reports/${inspection.id}`} className="w-full sm:w-auto">
            <Button variant="primary" leftIcon={<FileText className="w-4 h-4" />} className="w-full justify-center">View Report</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="py-4 border-b border-border">
              <CardTitle className="text-base">Compliance Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                  <div className="text-content-faint text-sm uppercase mb-1">Overall Score</div>
                  <div className={`text-4xl font-heading font-bold ${
                    inspection.compliance_score === null || inspection.compliance_score === undefined 
                      ? 'text-content-muted' 
                      : inspection.compliance_score >= 90 
                        ? 'text-secondary' 
                        : inspection.compliance_score >= 70 
                          ? 'text-warning' 
                          : 'text-danger'
                  }`}>
                    {inspection.compliance_score !== null && inspection.compliance_score !== undefined 
                      ? inspection.compliance_score 
                      : '--'}<span className="text-2xl text-content-muted">/100</span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-content-faint text-sm uppercase mb-1">Status</div>
                  <div className={`font-medium ${violations.length > 0 ? 'text-danger' : inspection.status === 'Needs Review' ? 'text-warning' : 'text-secondary'}`}>
                    {violations.length > 0 ? `${violations.length} Violation(s) Detected` : inspection.status === 'Needs Review' ? 'Review Required' : 'No Violations Detected'}
                  </div>
                </div>
              </div>
              
              <div className="bg-[#0F172A]/40 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl overflow-hidden">
                {violations.length === 0 ? (
                  <div className="p-8 text-center text-content-muted">
                    {inspection.status === 'Needs Review' 
                      ? (inspection.notes ? `Needs Review: ${inspection.notes}` : 'Insufficient or unclear evidence. Compliance could not be reliably determined.') 
                      : 'No compliance violations found for this inspection.'}
                  </div>
                ) : (
                  violations.map((viol) => (
                    <div key={viol.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border bg-danger/5 gap-3">
                      <div>
                        <h4 className="font-bold text-danger">{viol.title}</h4>
                        <p className="text-sm text-content-muted mt-1">{viol.ai_analysis || 'Manual violation flagged'}</p>
                      </div>
                      <Badge variant="danger" className="whitespace-nowrap">{viol.verification_status || 'Pending Review'}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* New Evidence Section */}
          <Card>
            <CardHeader className="py-4 border-b border-border flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <CardTitle className="text-base flex items-center">
                <ImageIcon className="w-4 h-4 mr-2" /> Evidence Collected ({evidenceList.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden">
              {evidenceList.length === 0 ? (
                <div className="p-8 text-center text-content-muted">
                  No evidence uploaded for this inspection.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {evidenceList.map((ev) => (
                    <div key={ev.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-obsidian transition-colors gap-2">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center border border-primary/20">
                          <ImageIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-content">{ev.evidence_type}</div>
                          <div className="text-xs text-content-muted mt-0.5">{ev.file_name} • {(ev.file_size / 1024).toFixed(0)} KB</div>
                        </div>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => handleViewEvidence(ev.file_path)}>
                        View Securely
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="py-4 border-b border-border">
              <CardTitle className="text-base flex items-center"><Clock className="w-4 h-4 mr-2" /> Audit Trail</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-primary bg-obsidian shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-border bg-surface-elevated">
                    <div className="text-xs text-primary font-bold mb-1">
                      {new Date(inspection.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className="text-sm text-content">Inspection Logged</div>
                  </div>
                </div>
                {evidenceList.length > 0 && (
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-primary bg-obsidian shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-border bg-surface-elevated">
                      <div className="text-xs text-primary font-bold mb-1">
                        {new Date(evidenceList[0].created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="text-sm text-content">{evidenceList.length} files secured</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Disclaimer />
    </div>
  );
};
