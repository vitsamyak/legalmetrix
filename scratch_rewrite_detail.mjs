import fs from 'fs';
const content = `import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ArrowLeft, Clock, FileText, CheckCircle2, Search } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Disclaimer } from '../components/Disclaimer';
import { supabase } from '../lib/supabase';

export const InspectionDetail = () => {
  const { id } = useParams();
  const [inspection, setInspection] = useState<any>(null);
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        if (!id) return;
        
        const { data: insData, error: insError } = await supabase
          .from('inspections')
          .select('*, products(name, brand), profiles(full_name)')
          .eq('id', id)
          .single();
          
        if (insError) throw insError;
        setInspection(insData);

        const { data: violData, error: violError } = await supabase
          .from('violations')
          .select('*')
          .eq('inspection_id', id);
          
        if (violError) throw violError;
        if (violData) setViolations(violData);

      } catch (err) {
        console.error('Error fetching inspection detail:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetail();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-content-muted">Loading inspection details...</div>;
  }

  if (!inspection) {
    return <div className="p-12 text-center text-danger">Inspection not found</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard/history">
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
        <div className="flex space-x-3">
          <Link to="/dashboard/evidence">
            <Button variant="secondary" leftIcon={<Search className="w-4 h-4" />}>Review Evidence</Button>
          </Link>
          <Link to={\`/dashboard/report/\${inspection.id}\`}>
            <Button variant="primary" leftIcon={<FileText className="w-4 h-4" />}>View Report</Button>
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
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-content-faint text-sm uppercase mb-1">Overall Score</div>
                  <div className={\`text-4xl font-heading font-bold \${inspection.compliance_score >= 90 ? 'text-secondary' : inspection.compliance_score >= 70 ? 'text-warning' : 'text-danger'}\`}>
                    {inspection.compliance_score || 0}<span className="text-2xl text-content-muted">/100</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-content-faint text-sm uppercase mb-1">Status</div>
                  <div className={\`font-medium \${violations.length > 0 ? 'text-danger' : 'text-secondary'}\`}>
                    {violations.length > 0 ? \`\${violations.length} Violation(s) Detected\` : 'No Violations Detected'}
                  </div>
                </div>
              </div>
              
              <div className="bg-obsidian border border-border rounded-xl overflow-hidden">
                {violations.length === 0 ? (
                  <div className="p-8 text-center text-content-muted">
                    No compliance violations found for this inspection.
                  </div>
                ) : (
                  violations.map((viol) => (
                    <div key={viol.id} className="p-4 flex items-start justify-between border-b border-border bg-danger/5">
                      <div>
                        <h4 className="font-bold text-danger">{viol.title}</h4>
                        <p className="text-sm text-content-muted mt-1">{viol.ai_analysis || 'Manual violation flagged'}</p>
                      </div>
                      <Badge variant="danger">{viol.verification_status || 'Pending Review'}</Badge>
                    </div>
                  ))
                )}
              </div>
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Disclaimer />
    </div>
  );
};
`;
fs.writeFileSync('src/pages/InspectionDetail.tsx', content);
