import React from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';

interface AiProcessingLoaderProps {
  pipelineState: 'idle' | 'processing_ocr' | 'processing_compliance' | 'success' | 'failed';
}

export const AiProcessingLoader = ({ pipelineState }: AiProcessingLoaderProps) => {
  
  const getStageStatus = () => {
    switch (pipelineState) {
      case 'processing_ocr':
        return { text: "Extracting information from submitted evidence...", stage: "OCR Extraction" };
      case 'processing_compliance':
        return { text: "Evaluating declarations against applicable rules...", stage: "Compliance Analysis" };
      case 'success':
        return { text: "Analysis complete. Generating report...", stage: "Finalizing" };
      default:
        return { text: "Initializing compliance engine...", stage: "Initializing" };
    }
  };

  const { text, stage } = getStageStatus();

  return (
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center bg-surface-secondary/80 backdrop-blur-md rounded-2xl border border-border/80 shadow-lg p-8 overflow-hidden relative">
      
      {/* 1. MAIN AI VISUALIZATION */}
      <div className="relative w-40 h-40 mb-10 flex items-center justify-center z-10">
        {/* Deep ambient glow */}
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-[40px] animate-pulse"></div>

        {/* Outer Orbital Ring (Slow) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-primary/20"
        >
          <div className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#6366F1]"></div>
        </motion.div>

        {/* Middle Orbital Ring (Medium, Reverse) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="absolute inset-4 rounded-full border border-secondary/30 border-dashed"
        >
          <div className="absolute -bottom-1 left-1/4 w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_#3DD6B4]"></div>
        </motion.div>

        {/* Inner Processing Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className="absolute inset-10 rounded-full border border-t-primary/80 border-r-primary/30 border-b-transparent border-l-transparent"
        ></motion.div>

        {/* Core Geometry */}
        <div className="absolute inset-14 bg-obsidian rounded-xl border border-primary/40 rotate-45 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
          
          {/* Scanning Sweep inside core */}
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent -rotate-45 transform-gpu"
          ></motion.div>
        </div>
      </div>

      {/* 2. STATUS TEXT */}
      <div className="z-10 text-center mb-8 h-20 flex flex-col justify-end">
        <h2 className="text-xl font-heading font-bold text-content mb-2 tracking-wide uppercase">
          AI Compliance Analysis
        </h2>
        
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
            Current Stage: {stage}
          </span>
          <motion.p 
            key={pipelineState}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-content-muted"
          >
            {text}
          </motion.p>
        </div>
      </div>

    </div>
  );
};
