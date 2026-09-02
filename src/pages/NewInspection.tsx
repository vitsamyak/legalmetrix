import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Upload, Camera, FileText, CheckCircle2, ChevronRight, ChevronDown, Loader2, Info, AlertTriangle, XCircle, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Disclaimer } from '../components/Disclaimer';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useNotifications } from '../context/NotificationContext';
import { supabase } from '../lib/supabase';
import { BrandedLoader } from '../components/BrandedLoader';
import { AiProcessingLoader } from '../components/AiProcessingLoader';

const steps = [
  "Inspection Info",
  "Product Info",
  "Upload Evidence",
  "AI Processing",
  "Result"
];

export const NewInspection = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { addNotification } = useNotifications();
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  // Form State
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("Packaged Food");
  const [batchLot, setBatchLot] = useState("");
  
  // Evidence State
  const [evidenceFiles, setEvidenceFiles] = useState<Record<string, File>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  // Submission State
  const [createdInspectionId, setCreatedInspectionId] = useState<string | null>(null);
  
  // Error & Pipeline State
  const [aiErrorMsg, setAiErrorMsg] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  
  // Pipeline tracking
  const [pipelineState, setPipelineState] = useState<'idle' | 'processing_ocr' | 'processing_compliance' | 'success' | 'failed'>('idle');
  const [failedStage, setFailedStage] = useState<'ocr' | 'compliance' | null>(null);

  const handleNext = () => {
    if (currentStep === 1) {
      if (!productName || !brand) {
        showToast('Please enter both Product Name and Brand.', 'error');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (Object.keys(evidenceFiles).length === 0) {
        showToast('Please upload at least one evidence image.', 'error');
        return;
      }
      submitInspectionAndEvidence();
    } else if (currentStep === 4) {
      navigate(`/inspections/${createdInspectionId}`);
    } else {
      setCurrentStep(s => Math.min(4, s + 1));
    }
  };

  const handleFileChange = (view: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('File too large. Maximum size is 10MB.', 'error');
        return;
      }
      if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file.', 'error');
        return;
      }
      setEvidenceFiles(prev => ({ ...prev, [view]: file }));
    }
  };

  const runAiProcessing = async (inspectionId: string, isRetry = false) => {
    if (isRetry) {
      setIsRetrying(true);
    } else {
      setIsProcessingAI(true);
    }
    setAiErrorMsg(null);
    setShowTechnicalDetails(false);
    setPipelineState('processing_ocr');
    setFailedStage(null);

    // Setup realtime subscription to track OCR completion
    const channel = supabase!.channel(`inspection-${inspectionId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'inspections', 
        filter: `id=eq.${inspectionId}` 
      }, (payload: any) => {
        if (payload.new && payload.new.ocr_data) {
          setPipelineState('processing_compliance');
        }
      })
      .subscribe();
    
    try {
      const { data: aiData, error: aiError } = await supabase!.functions.invoke('process-compliance', {
        body: { inspection_id: inspectionId }
      });

      const determineFailedStage = (msg: string) => {
        const lowerMsg = msg.toLowerCase();
        if (lowerMsg.includes('ocr')) return 'ocr';
        if (lowerMsg.includes('verification') || lowerMsg.includes('compliance')) return 'compliance';
        // If we made it to processing_compliance state, then OCR succeeded
        return pipelineState === 'processing_compliance' ? 'compliance' : 'ocr';
      };

      if (aiError) {
        let errorBody = "No response body available";
        let parsedError = null;
        if (aiError.context && typeof aiError.context.text === 'function') {
          try {
            const res = aiError.context.clone();
            errorBody = await res.text();
            parsedError = JSON.parse(errorBody);
          } catch (e) {}
        }
        
        const errorMsg = parsedError?.error || aiError.message;
        const details = parsedError?.details || errorBody.substring(0, 1000);
        
        setFailedStage(determineFailedStage(errorMsg));
        setPipelineState('failed');
        setAiErrorMsg(`${errorMsg}\nServer details: ${details}`);
        return false;
      }

      if (aiData?.error) {
        setFailedStage(determineFailedStage(aiData.error));
        setPipelineState('failed');
        setAiErrorMsg(aiData.error);
        return false;
      }

      setPipelineState('success');
      return true;
    } catch (err: any) {
      setFailedStage('ocr');
      setPipelineState('failed');
      setAiErrorMsg(err.message || 'Unknown error during AI processing.');
      return false;
    } finally {
      setIsProcessingAI(false);
      setIsRetrying(false);
      supabase!.removeChannel(channel);
    }
  };

  const submitInspectionAndEvidence = async () => {
    setIsUploading(true);
    try {
      if (!supabase) throw new Error('Supabase client not initialized');

      let productId;
      
      // 1. Get or create product
      const { data: existingProduct, error: fetchError } = await supabase!
        .from('products')
        .select('id')
        .eq('name', productName)
        .eq('brand', brand)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingProduct) {
        productId = existingProduct.id;
      } else {
        const { data: newProduct, error: insertError } = await supabase!
          .from('products')
          .insert({
            name: productName,
            brand: brand,
            category: category,
          })
          .select()
          .single();
          
        if (insertError) throw insertError;
        productId = newProduct.id;
      }

      // 2. Create inspection
      const { data: newInspection, error: inspectionError } = await supabase!
        .from('inspections')
        .insert({
          inspector_id: user.id,
          product_id: productId,
          inspection_date: inspectionDate,
          location_zone: user.region,
          batch_lot_number: batchLot,
          notes: notes,
          status: 'Needs Review',
        })
        .select()
        .single();

      if (inspectionError) throw inspectionError;

      // 3. Upload Evidence
      const uploadPromises = Object.entries(evidenceFiles).map(async ([view, file]) => {
        const ext = file.name.split('.').pop();
        const safeName = file.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
        const uuid = crypto.randomUUID();
        const filePath = `${newInspection.id}/${uuid}-${safeName}.${ext}`;
        
        const { error: uploadError } = await supabase!.storage
          .from('evidence_images')
          .upload(filePath, file, { contentType: file.type, upsert: true });

        if (uploadError) throw new Error(`Failed to upload ${view}: ${uploadError.message}`);

        const { error: dbError } = await supabase!.from('inspection_evidence').insert({
          inspection_id: newInspection.id,
          evidence_type: view,
          file_path: filePath,
          file_name: file.name,
          mime_type: file.type,
          file_size: file.size
        });

        if (dbError) throw new Error(`Failed to save evidence metadata for ${view}: ${dbError.message}`);
      });

      await Promise.all(uploadPromises);

      setCreatedInspectionId(newInspection.id);
      
      // Phase 2: Call the real AI processing backend
      setIsUploading(false);
      setCurrentStep(3); // Move to AI Processing UI state
      
      const success = await runAiProcessing(newInspection.id);
      
      if (success) {
        setCurrentStep(4);
        showToast('Inspection and AI analysis securely completed!', 'success');
        addNotification('Inspection Completed', `AI Analysis finished for ${productName}.`, 'success');
      } else {
        showToast('AI Analysis failed. See details on screen.', 'error');
        addNotification('Inspection Failed', `AI Analysis failed for ${productName}.`, 'alert');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to process inspection.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetryAi = async () => {
    if (!createdInspectionId) return;
    const success = await runAiProcessing(createdInspectionId, true);
    if (success) {
      setCurrentStep(4);
      showToast('Inspection and AI analysis securely completed!', 'success');
      addNotification('Inspection Completed', `AI Analysis finished for ${productName} after retry.`, 'success');
    }
  };

  if (isUploading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <BrandedLoader 
          fullScreen={false} 
          message="Uploading Evidence"
          subMessage="Securing inspection evidence in private storage..." 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading text-content tracking-tight">New Inspection Workflow</h1>
        <p className="text-content-muted mt-1">Guided Legal Metrology compliance scan.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-surface-secondary z-0 rounded"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary z-0 transition-all duration-500 rounded"
          style={{ width: `${(currentStep / 4) * 100}%` }}
        ></div>
        
        {steps.map((step, idx) => (
          <div key={idx} className="relative z-10 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${
              idx < currentStep ? 'bg-primary border-primary text-white' : 
              idx === currentStep ? 'bg-obsidian border-primary text-primary' : 
              'bg-obsidian border-border text-content-faint'
            }`}>
              {idx < currentStep ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
            </div>
            <div className={`absolute top-10 text-[10px] sm:text-xs font-medium w-16 sm:w-24 text-center leading-tight ${
              idx <= currentStep ? 'text-content' : 'text-content-faint'
            }`}>
              <span className="hidden sm:inline">{step}</span>
              <span className="sm:hidden">{step.split(' ')[0]}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16">
        {currentStep === 0 && (
          <Card className="animate-in fade-in slide-in-from-bottom-4">
            <CardHeader className="border-b border-border">
              <CardTitle>1. Inspection Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-content-muted">Inspector Name</label>
                  <input type="text" className="w-full px-4 py-2 bg-[#0F172A]/40 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl text-content outline-none" defaultValue={user.name} key={`name-${user.name}`} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-content-muted">Location / Zone</label>
                  <input type="text" className="w-full px-4 py-2 bg-[#0F172A]/40 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl text-content outline-none" defaultValue={user.region} key={`region-${user.region}`} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-content-muted">Inspection ID</label>
                  <input type="text" className="w-full px-4 py-2 bg-[#0F172A]/40 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl text-content-muted outline-none" defaultValue="INS-AUTO" disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-content-muted">Date</label>
                  <input type="date" className="w-full px-4 py-2 bg-[#0F172A]/40 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl text-content outline-none" value={inspectionDate} onChange={(e) => setInspectionDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium text-content-muted">Optional Notes</label>
                <textarea className="w-full h-24 px-4 py-2 bg-[#0F172A]/40 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl text-content outline-none resize-none" placeholder="Enter context or specific complaints..." value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 1 && (
          <Card className="animate-in fade-in slide-in-from-bottom-4">
            <CardHeader className="border-b border-border">
              <CardTitle>2. Product Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-content-muted">Product Name *</label>
                  <input type="text" className="w-full px-4 py-2 bg-[#0F172A]/40 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl text-content outline-none" placeholder="e.g. Ashirvaad Whole Wheat Atta 5kg" value={productName} onChange={(e) => setProductName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-content-muted">Brand *</label>
                  <input type="text" className="w-full px-4 py-2 bg-[#0F172A]/40 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl text-content outline-none" placeholder="e.g. ITC Limited" value={brand} onChange={(e) => setBrand(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-content-muted">Category</label>
                  <div className="relative">
                    <select className="w-full px-4 py-2 appearance-none bg-[#0F172A]/40 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl text-content outline-none" value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option>Packaged Food</option>
                      <option>Electronics</option>
                      <option>Garments</option>
                      <option>Cosmetics</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-content-muted">Batch / Lot Number</label>
                  <input type="text" className="w-full px-4 py-2 bg-[#0F172A]/40 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl text-content outline-none" placeholder="e.g. B29103" value={batchLot} onChange={(e) => setBatchLot(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card className="animate-in fade-in slide-in-from-bottom-4">
            <CardHeader className="border-b border-border">
              <CardTitle>3. Upload Product Evidence</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-start mb-6">
                <Info className="w-5 h-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-content-muted">
                  Please capture clear, well-lit images of all relevant packaging surfaces. The LegalMetrix AI engine requires high-resolution images to accurately extract Legal Metrology declarations.
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Front View', 'Back View', 'Side/Panel', 'Top/Bottom'].map((view) => (
                  <label 
                    key={view} 
                    className={`border-2 border-dashed rounded-xl h-32 flex flex-col items-center justify-center bg-obsidian transition-colors cursor-pointer group relative overflow-hidden ${evidenceFiles[view] ? 'border-emerald-500/50' : 'border-border hover:border-primary/50'}`}
                  >
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileChange(view, e)} 
                    />
                    {evidenceFiles[view] ? (
                      <>
                        <img 
                          src={URL.createObjectURL(evidenceFiles[view])} 
                          alt={view} 
                          className="absolute inset-0 w-full h-full object-cover opacity-40" 
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-obsidian/40 backdrop-blur-[2px]">
                          <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-1" />
                          <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded uppercase tracking-wider">{view}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Camera className="w-6 h-6 text-content-muted group-hover:text-primary transition-colors mb-2" />
                        <span className="text-xs font-medium text-content-muted">{view}</span>
                      </>
                    )}
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && isProcessingAI && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <AiProcessingLoader pipelineState={pipelineState} />
          </div>
        )}

        {currentStep === 3 && !isProcessingAI && aiErrorMsg && (
          <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col lg:flex-row gap-6 items-start max-w-[1000px] mx-auto">
             {/* Left: Error / Retry Card */}
             <Card className={`flex-1 w-full shadow-lg transition-colors duration-500 ${isRetrying ? 'border-primary/20 shadow-primary/5' : 'border-danger/20 shadow-danger/5'}`}>
               <CardContent className="p-8 md:p-10 text-center flex flex-col items-center relative overflow-hidden">
                 
                 {isRetrying ? (
                   <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 w-full py-4">
                     {/* Compact AI Processing Visualization */}
                     <div className="relative w-32 h-32 mb-8 flex items-center justify-center z-10">
                       <div className="absolute inset-0 bg-primary/20 rounded-full blur-[30px] animate-pulse"></div>
                       
                       <div className="absolute inset-0 rounded-full border border-primary/30 animate-[spin_8s_linear_infinite]">
                         <div className="absolute -top-1 left-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_#6366F1]"></div>
                       </div>
                       
                       <div className="absolute inset-2 rounded-full border border-secondary/40 border-dashed animate-[spin_6s_linear_infinite_reverse]"></div>
                       
                       <div className="absolute inset-6 rounded-full border border-t-primary/80 border-r-primary/30 border-b-transparent border-l-transparent animate-[spin_3s_linear_infinite]"></div>
                       
                       <div className="absolute inset-10 bg-obsidian rounded-lg border border-primary/50 rotate-45 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.2)] overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
                         <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent -rotate-45 transform-gpu animate-[pulse_1.5s_ease-in-out_infinite]"></div>
                       </div>
                     </div>

                     <h2 className="text-2xl font-bold font-heading text-content mb-3">Re-running AI Analysis</h2>
                     <p className="text-sm text-content-muted mb-8 max-w-sm text-center">Re-analyzing your evidence against the configured compliance framework...</p>

                     {/* Live Status Panel */}
                     <div className="w-full max-w-sm bg-obsidian/50 border border-border/50 rounded-xl p-5 text-left mb-8 relative overflow-hidden backdrop-blur-sm">
                       <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-secondary"></div>
                       <div className="flex justify-between items-start mb-3">
                         <div>
                           <span className="text-[9px] uppercase tracking-widest text-content-faint block mb-0.5 font-bold">Analysis Engine</span>
                           <span className="text-xs font-medium text-content-muted">AI Compliance Engine</span>
                         </div>
                       </div>
                       <div>
                         <span className="text-[9px] uppercase tracking-widest text-content-faint block mb-1.5 font-bold">Current Task</span>
                         <div className="flex items-center gap-2.5 bg-sidebar rounded-md p-2.5 border border-border/30">
                           <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                           <span className="text-xs font-medium text-primary tracking-wide">
                             {pipelineState === 'processing_ocr' 
                               ? 'Extracting OCR text from evidence...' 
                               : 'Evaluating compliance rules...'}
                           </span>
                         </div>
                       </div>
                     </div>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300 w-full">
                     <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-6">
                       <div className="w-12 h-12 rounded-full bg-danger/20 flex items-center justify-center">
                         <AlertTriangle className="w-6 h-6 text-danger" />
                       </div>
                     </div>
                     
                     <h2 className="text-2xl font-bold font-heading text-content mb-3">
                       {failedStage === 'ocr' ? 'OCR Extraction Failed' : 'Compliance Analysis Failed'}
                     </h2>
                     <p className="text-base text-content-muted mb-2 max-w-md">
                       {failedStage === 'ocr' 
                         ? "We couldn't extract text from the provided evidence images." 
                         : "We couldn't complete the compliance analysis for this inspection."}
                     </p>
                     <p className="text-sm text-content-faint mb-8 max-w-md">Your uploaded evidence is safe. You can retry the analysis or return to the previous step.</p>
                     
                     {/* Status grid */}
                     <div className="w-full bg-[#0F172A]/40 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl p-5 mb-8">
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left divide-y sm:divide-y-0 sm:divide-x divide-border">
                         <div className="sm:px-4 first:pl-0 last:pr-0 pt-2 sm:pt-0 first:pt-0">
                           <span className="text-[10px] uppercase tracking-wider text-content-faint block mb-1">Processing Status</span>
                           <span className="text-sm font-medium text-danger flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Failed</span>
                         </div>
                         <div className="sm:px-4 pt-2 sm:pt-0">
                           <span className="text-[10px] uppercase tracking-wider text-content-faint block mb-1">Evidence</span>
                           <span className="text-sm font-medium text-emerald-500 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Secured</span>
                         </div>
                         <div className="sm:px-4 pt-2 sm:pt-0">
                           <span className="text-[10px] uppercase tracking-wider text-content-faint block mb-1">Analysis Engine</span>
                           <span className="text-sm font-medium text-content">AI Compliance Engine</span>
                         </div>
                       </div>
                     </div>
                   </div>
                 )}
                 
                 {/* Actions */}
                 <div className={`flex flex-col sm:flex-row gap-4 w-full sm:w-auto transition-all duration-500 ${isRetrying ? 'opacity-80' : 'opacity-100'}`}>
                   <Button variant="secondary" onClick={() => setCurrentStep(2)} disabled={isRetrying || isProcessingAI}>
                     Back to Upload Evidence
                   </Button>
                   <Button variant="primary" onClick={handleRetryAi} disabled={isRetrying || isProcessingAI} className={`transition-all duration-300 ${isRetrying ? 'bg-primary/50 cursor-wait' : 'bg-primary hover:bg-primary-hover text-white'}`}>
                     {isRetrying ? (
                       <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Retrying Analysis...</>
                     ) : (
                       <><RotateCcw className="w-4 h-4 mr-2" /> Retry AI Analysis</>
                     )}
                   </Button>
                 </div>
                 
                 {/* Technical Details Toggle */}
                 {!isRetrying && (
                   <div className="mt-8 w-full border-t border-border/50 pt-4 text-left animate-in fade-in">
                     <button 
                       onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                       className="text-xs text-content-faint hover:text-content transition-colors flex items-center gap-1 mx-auto"
                     >
                       <Info className="w-3.5 h-3.5" /> 
                       {showTechnicalDetails ? 'Hide technical details' : 'Show technical details'}
                     </button>
                     
                     {showTechnicalDetails && (
                       <div className="mt-4 p-4 bg-black/40 border border-border rounded-lg text-left overflow-x-auto">
                         <pre className="text-[10px] text-danger/80 font-mono whitespace-pre-wrap leading-relaxed">
                           {aiErrorMsg}
                         </pre>
                       </div>
                     )}
                   </div>
                 )}
               </CardContent>
             </Card>

             {/* Right: Pipeline Context */}
             <Card className="w-full lg:w-80 flex-shrink-0 bg-sidebar border-border">
               <CardHeader className="border-b border-border py-4 px-5">
                 <CardTitle className="text-sm font-bold uppercase tracking-wider text-content-muted">Analysis Pipeline</CardTitle>
               </CardHeader>
               <CardContent className="p-5">
                 <div className="flex flex-col">
                   
                   {/* 1. Evidence Uploaded */}
                   <div className="flex items-center gap-3">
                     <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 bg-emerald-500/10 border-emerald-500 text-emerald-500">
                       <CheckCircle2 className="w-4 h-4" />
                     </div>
                     <span className="text-sm font-medium text-content">Evidence Uploaded</span>
                   </div>
                   <div className="h-6 ml-3.5 border-l-2 border-emerald-500/30"></div>
                   
                   {/* 2. OCR Extraction */}
                   <div className="flex items-center gap-3">
                     <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-500 ${
                       (pipelineState === 'processing_compliance' || pipelineState === 'success' || (pipelineState === 'failed' && failedStage === 'compliance'))
                         ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' // Success
                         : (pipelineState === 'failed' && failedStage === 'ocr') && !isRetrying
                           ? 'bg-danger/10 border-danger text-danger' // Failed
                           : 'border-secondary text-secondary shadow-[0_0_10px_rgba(61,214,180,0.3)] bg-obsidian' // Processing
                     }`}>
                       {(pipelineState === 'processing_compliance' || pipelineState === 'success' || (pipelineState === 'failed' && failedStage === 'compliance')) ? (
                         <CheckCircle2 className="w-4 h-4" />
                       ) : (pipelineState === 'failed' && failedStage === 'ocr') && !isRetrying ? (
                         <XCircle className="w-4 h-4" />
                       ) : (
                         <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
                       )}
                     </div>
                     <span className={`text-sm font-medium transition-colors duration-500 ${
                       (pipelineState === 'failed' && failedStage === 'ocr' && !isRetrying) ? 'text-danger' : 'text-content'
                     }`}>OCR Extraction</span>
                   </div>
                   
                   <div className={`h-6 ml-3.5 border-l-2 transition-colors duration-500 ${
                     (pipelineState === 'processing_compliance' || pipelineState === 'success' || (pipelineState === 'failed' && failedStage === 'compliance'))
                       ? 'border-emerald-500/30' 
                       : (pipelineState === 'failed' && failedStage === 'ocr' && !isRetrying)
                         ? 'border-danger/30'
                         : 'border-border border-dashed'
                   }`}></div>
                   
                   {/* 3. Compliance Analysis */}
                   <div className="flex items-center gap-3">
                     <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-500 ${
                       pipelineState === 'success' 
                         ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' // Success
                         : (pipelineState === 'failed' && failedStage === 'compliance') && !isRetrying
                           ? 'bg-danger/10 border-danger text-danger' // Failed
                           : pipelineState === 'processing_compliance' || (isRetrying && failedStage === 'compliance')
                             ? 'border-secondary text-secondary shadow-[0_0_10px_rgba(61,214,180,0.3)] bg-obsidian' // Processing
                             : 'bg-obsidian border-border text-content-faint' // Pending
                     }`}>
                       {pipelineState === 'success' ? (
                         <CheckCircle2 className="w-4 h-4" />
                       ) : (pipelineState === 'failed' && failedStage === 'compliance') && !isRetrying ? (
                         <XCircle className="w-4 h-4" />
                       ) : pipelineState === 'processing_compliance' || (isRetrying && failedStage === 'compliance') ? (
                         <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
                       ) : (
                         <div className="w-1.5 h-1.5 rounded-full bg-content-faint"></div>
                       )}
                     </div>
                     <span className={`text-sm font-medium transition-colors duration-500 ${
                       (pipelineState === 'failed' && failedStage === 'compliance' && !isRetrying)
                         ? 'text-danger'
                         : pipelineState === 'processing_compliance' || pipelineState === 'success' || (isRetrying && failedStage === 'compliance')
                           ? 'text-content'
                           : 'text-content-faint'
                     }`}>Compliance Analysis</span>
                   </div>
                   
                   <div className={`h-6 ml-3.5 border-l-2 transition-colors duration-500 ${
                     pipelineState === 'success' 
                       ? 'border-emerald-500/30' 
                       : (pipelineState === 'failed' && failedStage === 'compliance' && !isRetrying)
                         ? 'border-danger/30'
                         : 'border-border border-dashed'
                   }`}></div>
                   
                   {/* 4. Compliance Result */}
                   <div className="flex items-center gap-3">
                     <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-500 ${
                       pipelineState === 'success'
                         ? 'border-secondary text-secondary shadow-[0_0_10px_rgba(61,214,180,0.3)] bg-obsidian' // Processing
                         : 'bg-obsidian border-border text-content-faint' // Pending
                     }`}>
                       {pipelineState === 'success' ? (
                         <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
                       ) : (
                         <div className="w-1.5 h-1.5 rounded-full bg-content-faint"></div>
                       )}
                     </div>
                     <span className={`text-sm font-medium transition-colors duration-500 ${
                       pipelineState === 'success' ? 'text-content' : 'text-content-faint'
                     }`}>Compliance Result</span>
                   </div>

                 </div>
               </CardContent>
             </Card>
          </div>
        )}

        {currentStep === 4 && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 border-primary">
            <CardContent className="p-8 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-content mb-2">Evidence Secured</h2>
              <p className="text-content-muted max-w-md mb-8">
                The inspection and its evidence have been securely persisted. Pending Phase 2 AI compliance analysis.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
                <Button variant="primary" rightIcon={<ChevronRight className="w-4 h-4" />} onClick={handleNext}>
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {currentStep < 3 && (
        <div className="flex justify-end pt-4">
          <Button 
            variant="primary" 
            rightIcon={currentStep === 2 ? <Upload className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            onClick={handleNext}
            disabled={isUploading}
          >
            {currentStep === 2 ? "Upload & Submit" : "Next Step"}
          </Button>
        </div>
      )}
      <Disclaimer />
    </div>
  );
};
