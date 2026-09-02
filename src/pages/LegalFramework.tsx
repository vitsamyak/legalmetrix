import React from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Scale, FileText, Download, ExternalLink } from 'lucide-react';
import { Disclaimer } from '../components/Disclaimer';
import { useToast } from '../components/Toast';

const legalDocs = [
  { id: 'ACT-2009', title: 'The Legal Metrology Act, 2009', type: 'Act', date: '01 Mar 2010', status: 'Active', url: 'https://consumeraffairs.nic.in/sites/default/files/uploads/legal-metrology-acts-rules/8.pdf' },
  { id: 'RULES-2011', title: 'Legal Metrology (Packaged Commodities) Rules, 2011', type: 'Rules', date: '01 Apr 2011', status: 'Active', url: 'https://consumeraffairs.nic.in/sites/default/files/uploads/legal-metrology-acts-rules/1%281%29.pdf' },
  { id: 'AMD-2022', title: 'LMPC Amendment Rules, 2022', type: 'Amendment', date: '28 Mar 2022', status: 'Active', url: 'https://consumeraffairs.nic.in/sites/default/files/uploads/legal-metrology-acts-rules/GSR_226_E.pdf' },
  { id: 'NOT-2023', title: 'Advisory on E-commerce display', type: 'Notification', date: '15 Jan 2023', status: 'Active', url: 'https://consumeraffairs.nic.in/en/legal-metrology/legal-metrology-acts-rules' },
];

export const LegalFramework = () => {
  const { showToast } = useToast();
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  const handleDownload = async (doc: any) => {
    setDownloadingId(doc.id);
    showToast(`Downloading ${doc.title}...`, 'info');
    try {
      const response = await fetch(doc.url);
      if (!response.ok) throw new Error('Network response failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${doc.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      showToast('Download completed successfully!', 'success');
    } catch (error) {
      console.warn('Direct download blocked by CORS, opening in new tab instead.', error);
      window.open(doc.url, '_blank', 'noopener,noreferrer');
      showToast('Opened document in new tab.', 'success');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleExternal = (doc: any) => {
    window.open(doc.url, '_blank', 'noopener,noreferrer');
  };
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading text-content tracking-tight">Legal Framework</h1>
        <p className="text-content-muted mt-1">Official Legal Metrology resources, acts, and amendments from the Department of Consumer Affairs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-4">
          {legalDocs.map((doc) => (
            <Card key={doc.id} className="hoverable">
              <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-surface-elevated rounded-xl text-primary flex-shrink-0 border border-border">
                    <Scale className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-content font-bold">{doc.title}</h3>
                    <div className="flex items-center space-x-3 mt-1 text-sm text-content-faint">
                      <span>{doc.type}</span>
                      <span>•</span>
                      <span>Effective: {doc.date}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">Source: Dept of Consumer Affairs</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <Badge variant={doc.status === 'Active' ? 'success' : 'neutral'}>{doc.status}</Badge>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => handleDownload(doc)}
                    isLoading={downloadingId === doc.id}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => handleExternal(doc)}>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-5">
              <h3 className="font-bold text-primary flex items-center mb-2">
                <FileText className="w-4 h-4 mr-2" /> Amendment Tracker
              </h3>
              <p className="text-sm text-content-muted mb-4">Track recent changes to the LMPC rules that affect the AI compliance engine.</p>
              <div className="space-y-4">
                <div className="border-l-2 border-primary/30 pl-3">
                  <div className="text-xs text-primary font-bold">Oct 2023</div>
                  <div className="text-sm text-content">Revised Unit Sale Price guidelines applied to Rule DB.</div>
                </div>
                <div className="border-l-2 border-border pl-3">
                  <div className="text-xs text-content-faint font-bold">Mar 2022</div>
                  <div className="text-sm text-content-muted">Garment packaging declarations updated.</div>
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
