import fs from 'fs';

const content = `import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Upload, Camera, FileText, CheckCircle2, ChevronRight, Loader2, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Disclaimer } from '../components/Disclaimer';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { BrandedLoader } from '../components/BrandedLoader';

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

  // Submission State
  const [createdInspectionId, setCreatedInspectionId] = useState<string | null>(null);

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
      navigate(\`/inspections/\${createdInspectionId}\`);
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

  const submitInspectionAndEvidence = async () => {
    setIsUploading(true);
    try {
      if (!supabase) throw new Error('Supabase client not initialized');

      let productId;
      
      // 1. Get or create product
      const { data: existingProduct, error: fetchError } = await supabase
        .from('products')
        .select('id')
        .eq('name', productName)
        .eq('brand', brand)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingProduct) {
        productId = existingProduct.id;
      } else {
        const { data: newProduct, error: insertError } = await supabase
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
      const { data: newInspection, error: inspectionError } = await supabase
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
        const filePath = \`\${newInspection.id}/\${uuid}-\${safeName}.\${ext}\`;
        
        const { error: uploadError } = await supabase.storage
          .from('evidence_images')
          .upload(filePath, file);

        if (uploadError) throw new Error(\`Failed to upload \${view}: \${uploadError.message}\`);

        const { error: dbError } = await supabase.from('inspection_evidence').insert({
          inspection_id: newInspection.id,
          evidence_type: view,
          file_path: filePath,
          file_name: file.name,
          mime_type: file.type,
          file_size: file.size
        });

        if (dbError) throw new Error(\`Failed to save evidence metadata for \${view}: \${dbError.message}\`);
      });

      await Promise.all(uploadPromises);

      setCreatedInspectionId(newInspection.id);
      
      // Skip the fake AI processing step (Step 3) for now, directly to Result (Step 4)
      setCurrentStep(4);
      showToast('Inspection and evidence securely saved!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to process inspection.', 'error');
    } finally {
      setIsUploading(false);
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
          style={{ width: \`\${(currentStep / 4) * 100}%\` }}
        ></div>
        
        {steps.map((step, idx) => (
          <div key={idx} className="relative z-10 flex flex-col items-center">
            <div className={\`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors \${
              idx < currentStep ? 'bg-primary border-primary text-white' : 
              idx === currentStep ? 'bg-obsidian border-primary text-primary' : 
              'bg-obsidian border-border text-content-faint'
            }\`}>
              {idx < currentStep ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
            </div>
            <div className={\`absolute top-10 text-xs font-medium w-24 text-center \${
              idx <= currentStep ? 'text-content' : 'text-content-faint'
            }\`}>
              {step}
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
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-content-muted">Inspector Name</label>
                  <input type="text" className="w-full px-4 py-2 bg-obsidian border border-border rounded-xl text-content outline-none" defaultValue={user.name} key={\`name-\${user.name}\`} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-content-muted">Location / Zone</label>
                  <input type="text" className="w-full px-4 py-2 bg-obsidian border border-border rounded-xl text-content outline-none" defaultValue={user.region} key={\`region-\${user.region}\`} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-content-muted">Inspection ID</label>
                  <input type="text" className="w-full px-4 py-2 bg-obsidian border border-border rounded-xl text-content-muted outline-none" defaultValue="INS-AUTO" disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-content-muted">Date</label>
                  <input type="date" className="w-full px-4 py-2 bg-obsidian border border-border rounded-xl text-content outline-none" value={inspectionDate} onChange={(e) => setInspectionDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium text-content-muted">Optional Notes</label>
                <textarea className="w-full h-24 px-4 py-2 bg-obsidian border border-border rounded-xl text-content outline-none resize-none" placeholder="Enter context or specific complaints..." value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
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
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-content-muted">Product Name *</label>
                  <input type="text" className="w-full px-4 py-2 bg-obsidian border border-border rounded-xl text-content outline-none" placeholder="e.g. Ashirvaad Whole Wheat Atta 5kg" value={productName} onChange={(e) => setProductName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-content-muted">Brand *</label>
                  <input type="text" className="w-full px-4 py-2 bg-obsidian border border-border rounded-xl text-content outline-none" placeholder="e.g. ITC Limited" value={brand} onChange={(e) => setBrand(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-content-muted">Category</label>
                  <select className="w-full px-4 py-2 bg-obsidian border border-border rounded-xl text-content outline-none" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option>Packaged Food</option>
                    <option>Electronics</option>
                    <option>Garments</option>
                    <option>Cosmetics</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-content-muted">Batch / Lot Number</label>
                  <input type="text" className="w-full px-4 py-2 bg-obsidian border border-border rounded-xl text-content outline-none" placeholder="e.g. B29103" value={batchLot} onChange={(e) => setBatchLot(e.target.value)} />
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
                    className={\`border-2 border-dashed rounded-xl h-32 flex flex-col items-center justify-center bg-obsidian transition-colors cursor-pointer group relative overflow-hidden \${evidenceFiles[view] ? 'border-emerald-500/50' : 'border-border hover:border-primary/50'}\`}
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
`

fs.writeFileSync('src/pages/NewInspection.tsx', content);
