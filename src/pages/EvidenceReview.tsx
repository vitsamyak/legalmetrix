import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Check, X, ArrowLeft, Maximize2, ZoomIn, ZoomOut, Image as ImageIcon, Search } from 'lucide-react';
import { Disclaimer } from '../components/Disclaimer';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BrandedLoader } from '../components/BrandedLoader';
import { useToast } from '../components/Toast';

export const EvidenceReview = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [inspection, setInspection] = useState<any>(null);
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null);
  const [signedUrl, setSignedUrl] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [updatingViolation, setUpdatingViolation] = useState<string | null>(null);

  const handleUpdateViolationStatus = async (violationId: string, status: 'Confirmed Violation' | 'False Positive') => {
    try {
      setUpdatingViolation(violationId);
      const { error } = await supabase!
        .from('violations')
        .update({ verification_status: status })
        .eq('id', violationId);
        
      if (error) throw error;
      
      setViolations(prev => prev.map(v => 
        v.id === violationId ? { ...v, verification_status: status } : v
      ));
      
      showToast(`Violation marked as ${status}`, 'success');
    } catch (err) {
      console.error('Error updating violation status:', err);
      showToast('Failed to update violation status', 'error');
    } finally {
      setUpdatingViolation(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  useEffect(() => {
    if (!isFullscreen) {
      setZoomLevel(1);
    }
  }, [isFullscreen]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) {
          setLoading(false);
          return;
        }
        
        // Fetch inspection
        const { data: insData, error: insError } = await supabase!
          .from('inspections')
          .select('*')
          .eq('id', id)
          .single();
          
        if (insError) throw insError;
        setInspection(insData);

        // Fetch evidence
        const { data: evData, error: evError } = await supabase!
          .from('inspection_evidence')
          .select('*')
          .eq('inspection_id', id)
          .order('created_at', { ascending: true });
          
        if (evError) throw evError;
        setEvidenceList(evData || []);
        if (evData && evData.length > 0) {
          setSelectedEvidence(evData[0]);
        }

        // Fetch violations
        const { data: vData, error: vError } = await supabase!
          .from('violations')
          .select('*')
          .eq('inspection_id', id);
          
        if (vError) throw vError;
        setViolations(vData || []);
        
      } catch (err) {
        console.error('Error fetching evidence:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (!selectedEvidence) return;
      const { data, error } = await supabase!.storage
        .from('evidence_images')
        .createSignedUrl(selectedEvidence.file_path, 3600);
      if (error) {
        console.error('Error generating signed URL:', error);
        return;
      }
      setSignedUrl(data.signedUrl);
    };
    fetchSignedUrl();
  }, [selectedEvidence]);

  if (loading) {
    return <BrandedLoader fullScreen={false} subMessage="Loading evidence data..." />;
  }

  if (!id) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] pb-12">
        <Card className="w-full max-w-lg bg-surface-secondary/80 backdrop-blur-md border border-border/80 shadow-lg text-center p-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-heading text-content mb-3">Select an Inspection</h2>
          <p className="text-content-muted mb-8 max-w-sm mx-auto">
            To review evidence, you need to select a specific inspection from your history first.
          </p>
          <Link to="/inspections">
            <Button variant="primary" className="w-full sm:w-auto">
              View Inspection History
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-8rem)] pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2 flex-shrink-0">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <Link to={`/inspections/${id}`}>
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full border border-border">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold font-heading text-content tracking-tight">Evidence Review</h1>
          </div>
          <p className="text-content-muted mt-1 ml-11">Review AI-detected violations and raw OCR extraction.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Left Side: Product Image Viewer & OCR */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          <Card className="flex flex-col overflow-hidden">
            <CardHeader className="py-3 px-5 sm:px-6 bg-obsidian border-b border-border flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-w-0">
              {/* Left: Title & Subtitle */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-content leading-tight whitespace-nowrap">Original Evidence</span>
                  <span className="text-xs text-content-faint mt-0.5">Inspection images</span>
                </div>
              </div>

              {/* Right: Controls */}
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 justify-end w-full sm:w-auto">
                {signedUrl && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsFullscreen(true)} 
                    className="text-content-muted hover:text-content h-8 flex-shrink-0"
                    leftIcon={<Maximize2 className="w-4 h-4" />}
                  >
                    Fullscreen
                  </Button>
                )}
                
                <div className="w-px h-5 bg-border hidden sm:block flex-shrink-0"></div>

                {/* Tabs Wrapper with horizontal scroll and fade indicator */}
                <div className="relative flex-shrink min-w-0 max-w-full">
                  <div className="flex items-center bg-sidebar/50 border border-border rounded-lg p-1 gap-1 overflow-x-auto flex-nowrap hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {evidenceList.map((ev, idx) => {
                      const isActive = selectedEvidence?.id === ev.id;
                      return (
                        <button
                          key={ev.id}
                          onClick={() => setSelectedEvidence(ev)}
                          className={`h-7 px-3 text-xs font-medium rounded-md transition-all duration-200 flex items-center justify-center whitespace-nowrap flex-shrink-0 ${
                            isActive 
                              ? 'bg-primary/15 text-primary border border-primary/30 shadow-sm' 
                              : 'text-content-muted hover:text-content hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          Image {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                  {/* Subtle Right Fade Indicator */}
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-obsidian to-transparent pointer-events-none rounded-r-lg"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 bg-sidebar relative">
              {signedUrl ? (
                <div className="relative w-full p-4 flex items-center justify-center bg-sidebar min-h-[200px]">
                  <img 
                    src={signedUrl} 
                    alt="Product Evidence"
                    className="max-w-full max-h-[60vh] md:max-h-[600px] w-auto h-auto object-contain rounded-md shadow-sm"
                  />
                </div>
              ) : (
                <div className="text-content-muted p-4 text-center min-h-[200px] flex items-center justify-center">No image selected or unable to load.</div>
              )}
            </CardContent>
          </Card>

          {/* OCR Panel */}
          <Card className="flex flex-col">
            <CardHeader className="py-3 border-b border-border bg-obsidian">
              <CardTitle className="text-sm flex justify-between items-center">
                <span>Raw OCR Extraction</span>
                <Badge variant={selectedEvidence?.ocr_status === 'success' ? 'success' : 'neutral'}>
                  {selectedEvidence?.ocr_status ? selectedEvidence.ocr_status.toUpperCase() : 'PENDING'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 bg-sidebar text-xs font-mono text-content-muted leading-relaxed max-h-[400px] overflow-y-auto">
              {selectedEvidence?.extracted_text ? (
                <div className="whitespace-pre-wrap">{selectedEvidence.extracted_text}</div>
              ) : (
                <div className="italic text-content-muted">No OCR text extracted for this image.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Violations List & Verification */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <Card className="flex flex-col overflow-hidden">
            <CardHeader className="py-4 px-6 border-b border-border flex-shrink-0 bg-obsidian">
            <CardTitle className="flex flex-col">
              <span className="text-base font-bold text-content">Compliance Analysis</span>
              <span className="text-xs text-content-faint font-normal mt-1">AI-assisted review of submitted evidence</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-6 space-y-6">
              
              {violations.length === 0 ? (
                <div className="space-y-6">
                  {/* Status Card */}
                  <div className="bg-sidebar border border-border rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                      <Check className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-content mb-2">No Violations Detected</h3>
                    <p className="text-sm text-content-muted mb-6 max-w-sm">
                      All configured compliance checks passed for the available evidence.
                    </p>
                    
                    <div className="bg-[#0F172A]/40 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-lg px-8 py-4 flex flex-col items-center shadow-inner">
                      <span className={`text-3xl font-bold mb-1 ${
                        inspection?.compliance_score === null || inspection?.compliance_score === undefined
                          ? 'text-content-muted'
                          : inspection.compliance_score >= 90
                            ? 'text-emerald-500'
                            : inspection.compliance_score >= 70
                              ? 'text-warning'
                              : 'text-danger'
                      }`}>
                        {inspection?.compliance_score !== null && inspection?.compliance_score !== undefined 
                          ? <>{inspection.compliance_score} <span className="text-xl opacity-50">/ 100</span></>
                          : <span className="text-lg font-medium">Unavailable</span>}
                      </span>
                      <span className="text-[10px] text-content-faint uppercase tracking-widest font-semibold mt-1">Compliance Score</span>
                    </div>
                  </div>

                  {/* Inspection Overview */}
                  <div className="bg-[#0F172A]/40 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl p-5 space-y-4">
                    <h4 className="text-xs font-bold text-content-faint uppercase tracking-wider mb-3">Inspection Overview</h4>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                      <div>
                        <span className="text-content-faint block text-xs mb-1">Evidence Files</span>
                        <span className="text-content font-medium">{evidenceList.length}</span>
                      </div>
                      <div>
                        <span className="text-content-faint block text-xs mb-1">OCR Status</span>
                        <span className="text-emerald-500 font-medium flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" /> Success
                        </span>
                      </div>
                      <div>
                        <span className="text-content-faint block text-xs mb-1">Violations</span>
                        <span className="text-content font-medium">0</span>
                      </div>
                      <div>
                        <span className="text-content-faint block text-xs mb-1">Review Status</span>
                        <span className={`font-medium flex items-center gap-1.5 ${inspection?.status === 'Needs Review' ? 'text-warning' : 'text-emerald-500'}`}>
                          {inspection?.status === 'Needs Review' ? inspection.status : <><Check className="w-3.5 h-3.5" /> Passed</>}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-content-faint uppercase tracking-wider mb-3">Quick Actions</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Link to={`/inspections/${id}`} className="block w-full">
                        <Button variant="secondary" className="w-full justify-center">Back to Inspection</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <h3 className="text-sm font-bold text-content uppercase tracking-wider">Detected Issues ({violations.length})</h3>
                  </div>
                  <div className="space-y-6">
                    {violations.map(violation => (
                      <div key={violation.id} className="space-y-4 border-b border-border pb-6 last:border-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-bold text-danger">{violation.title}</h3>
                            <p className="text-sm text-content-muted mt-1">{violation.description}</p>
                          </div>
                          <Badge variant={violation.severity === 'High' ? 'danger' : 'warning'}>
                            {violation.severity}
                          </Badge>
                        </div>

                        <div className="bg-[#0F172A]/40 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl p-4 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="md:col-span-2">
                              <span className="text-content-faint block text-xs uppercase mb-1">AI Analysis</span>
                              <span className="text-warning font-mono bg-warning/10 px-2 py-1 rounded block mt-1">
                                {violation.ai_analysis || 'No detailed analysis provided.'}
                              </span>
                            </div>
                            <div>
                              <span className="text-content-faint block text-xs uppercase mb-1">AI Confidence</span>
                              <span className="text-content">{violation.ai_confidence}%</span>
                            </div>
                            <div>
                              <span className="text-content-faint block text-xs uppercase mb-1">Source Rule</span>
                              <span className="text-content font-medium text-emerald-400">
                                {violation.title.match(/Rule\s+[A-Za-z0-9()]+/i) ? violation.title.match(/Rule\s+[A-Za-z0-9()]+/i)![0] : 'Legal Metrology Rules, 2011'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          <Button 
                            variant={violation.verification_status === 'Confirmed Violation' ? 'primary' : 'danger'} 
                            className="flex-1" 
                            leftIcon={<Check className="w-4 h-4" />}
                            onClick={() => handleUpdateViolationStatus(violation.id, 'Confirmed Violation')}
                            isLoading={updatingViolation === violation.id}
                            disabled={violation.verification_status === 'Confirmed Violation'}
                          >
                            {violation.verification_status === 'Confirmed Violation' ? 'Verified' : 'Verify Violation'}
                          </Button>
                          <Button 
                            variant={violation.verification_status === 'False Positive' ? 'primary' : 'secondary'} 
                            className="flex-1" 
                            leftIcon={<X className="w-4 h-4" />}
                            onClick={() => handleUpdateViolationStatus(violation.id, 'False Positive')}
                            isLoading={updatingViolation === violation.id}
                            disabled={violation.verification_status === 'False Positive'}
                          >
                            {violation.verification_status === 'False Positive' ? 'Dismissed' : 'Dismiss'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {isFullscreen && signedUrl && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center">
          <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-10 flex gap-2">
            <Button variant="secondary" size="icon" onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.5))} className="rounded-full bg-white/10 hover:bg-white/20 text-white border-0">
              <ZoomOut className="w-5 h-5" />
            </Button>
            <Button variant="secondary" size="icon" onClick={() => setZoomLevel(z => Math.min(5, z + 0.5))} className="rounded-full bg-white/10 hover:bg-white/20 text-white border-0">
              <ZoomIn className="w-5 h-5" />
            </Button>
            <Button variant="secondary" size="icon" onClick={() => setIsFullscreen(false)} className="rounded-full bg-white/10 hover:bg-white/20 text-white border-0 ml-4">
              <X className="w-6 h-6" />
            </Button>
          </div>
          <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
            <img 
              src={signedUrl} 
              alt="Fullscreen Product Evidence"
              className={`${zoomLevel > 1 ? 'max-w-none max-h-none' : 'max-w-full max-h-full'} transition-all duration-200 ease-out origin-center object-contain`}
              style={{
                width: zoomLevel > 1 ? `${zoomLevel * 100}%` : '100%',
                height: zoomLevel > 1 ? 'auto' : '100%',
              }}
            />
          </div>
        </div>
      )}

      <Disclaimer />
    </div>
  );
};
