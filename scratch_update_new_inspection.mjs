import fs from 'fs';

const path = 'src/pages/NewInspection.tsx';
let content = fs.readFileSync(path, 'utf-8');

// 1. Add AI processing state
content = content.replace(
  'const [isUploading, setIsUploading] = useState(false);',
  `const [isUploading, setIsUploading] = useState(false);\n  const [isProcessingAI, setIsProcessingAI] = useState(false);`
);

// 2. Rewrite submitInspectionAndEvidence
const startPattern = '      await Promise.all(uploadPromises);\n\n      setCreatedInspectionId(newInspection.id);';
const endPattern = '    } catch (err: any) {';

const replacement = `      await Promise.all(uploadPromises);
      setCreatedInspectionId(newInspection.id);
      
      // Phase 2: Call the real AI processing backend
      setIsUploading(false);
      setCurrentStep(3); // Move to AI Processing UI state
      setIsProcessingAI(true);
      
      const { data: aiData, error: aiError } = await supabase!.functions.invoke('process-compliance', {
        body: { inspection_id: newInspection.id }
      });
      
      setIsProcessingAI(false);

      if (aiError) {
        throw new Error(\`AI Analysis failed: \${aiError.message}. The inspection was saved and can be reviewed manually.\`);
      }
      
      if (aiData?.error) {
        throw new Error(\`AI Analysis failed: \${aiData.error}\`);
      }

      setCurrentStep(4);
      showToast('Inspection and AI analysis securely completed!', 'success');
`;

content = content.replace(new RegExp(startPattern.replace(/[.*+?^$\{key\}()|[\\]\\\\]/g, '\\\\$&') + '.*?' + endPattern.replace(/[.*+?^$\{key\}()|[\\]\\\\]/g, '\\\\$&'), 's'), replacement + endPattern);

// 3. Update loading screen to handle both states
content = content.replace(
  '  if (isUploading) {\n    return (\n      <div className="min-h-[60vh] flex flex-col items-center justify-center">\n        <BrandedLoader \n          fullScreen={false} \n          message="Uploading Evidence" \n          subMessage="Securing inspection evidence in private storage..." \n        />\n      </div>\n    );\n  }',
  `  if (isUploading || isProcessingAI) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <BrandedLoader 
          fullScreen={false} 
          message={isProcessingAI ? "AI Compliance Analysis" : "Uploading Evidence"} 
          subMessage={isProcessingAI ? "Analyzing packaging declarations using Multimodal AI..." : "Securing inspection evidence in private storage..."} 
        />
      </div>
    );
  }`
);

fs.writeFileSync(path, content);
console.log("Updated NewInspection.tsx");
