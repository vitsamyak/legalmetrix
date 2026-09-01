import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ScanLine,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Eye,
  FileBadge,
  Scale,
  Check,
  FileCheck2,
} from 'lucide-react';

const GithubIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { BlurText } from '../components/ui/BlurText';
import { StarBorder } from '../components/ui/StarBorder';
import { useAuth } from '../context/AuthContext';
import { useStartInspection } from '../hooks/useStartInspection';
import {
  PROBLEM_CARDS,
  WORKFLOW_STEPS,
  PLATFORM_FEATURES,
  AI_PIPELINE_STAGES,
  MOCK_ANALYTICS_STATS,
  ANALYTICS_TREND_DATA,
} from '../data/landingData';
import { TEAM_MEMBERS } from '../data/teamData';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { handleStartInspection } = useStartInspection();
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<'mfg' | 'mrp' | 'qty'>('mrp');
  const [selectedFeatureCategory, setSelectedFeatureCategory] = useState<string>('All');
  const [inspectorVerified, setInspectorVerified] = useState(false);

  const featureCategories = [
    'All',
    'AI & OCR',
    'Rule Engine',
    'Evidence',
    'Enforcement',
    'System',
  ];

  const filteredFeatures =
    selectedFeatureCategory === 'All'
      ? PLATFORM_FEATURES
      : PLATFORM_FEATURES.filter((f) => f.category === selectedFeatureCategory);

  const evidenceSamples = {
    mfg: {
      field: 'Date of Packaging / Mfg',
      rule: 'Rule 6(1)(f)',
      requirement: 'Month and year of manufacture must be clearly legible and unobscured.',
      extractedText: '[NOT DETECTED]',
      confidence: '42%',
      status: 'FAIL',
      box: 'top-[36%] left-[28%] w-[44%] h-[16%]',
      boxLabel: 'Date Area Obscured / Missing',
    },
    mrp: {
      field: 'Maximum Retail Price (MRP)',
      rule: 'Rule 6(1)(e)',
      requirement: 'Must include "incl. of all taxes" and state standard currency notation.',
      extractedText: '₹245.00 (INCL. OF ALL TAXES)',
      confidence: '98.6%',
      status: 'PASS',
      box: 'top-[58%] left-[24%] w-[52%] h-[14%]',
      boxLabel: 'Valid Statutory MRP',
    },
    qty: {
      field: 'Net Quantity Declaration',
      rule: 'Rule 6(1)(d)',
      requirement: 'Standard metric notation (g, kg, ml, l) with prescribed minimum numeral height.',
      extractedText: 'Net Qty: 5 kg',
      confidence: '97.2%',
      status: 'PASS',
      box: 'top-[75%] left-[22%] w-[40%] h-[12%]',
      boxLabel: 'Valid Net Quantity',
    },
  };

  const currentEvidence = evidenceSamples[activeEvidenceTab];

  return (
    <div className="w-full bg-[#0B1020] text-slate-100 min-h-screen selection:bg-primary/30 selection:text-white flex flex-col items-stretch overflow-x-hidden">
      {/* ============================================================ */}
      {/* 1. HERO SECTION (#hero)                                     */}
      {/* ============================================================ */}
      <section
        id="hero"
        className="relative w-full min-h-[92vh] flex flex-col items-center justify-center pt-32 pb-20 px-4 sm:px-6 overflow-hidden bg-[#0B1020]"
        style={{
          background: 'radial-gradient(circle at 50% 20%, rgba(99,102,241,0.15) 0%, rgba(11,16,32,0) 65%), #0B1020',
        }}
      >
        {/* Full-width Ambient Glow Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] max-w-[95vw] h-[500px] rounded-full bg-primary/15 blur-[160px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/6 w-[450px] max-w-[45vw] h-[450px] rounded-full bg-secondary/10 blur-[150px] pointer-events-none" />
          <div className="absolute top-1/2 right-1/6 w-[450px] max-w-[45vw] h-[450px] rounded-full bg-accent/10 blur-[150px] pointer-events-none" />
        </div>

        {/* Centered Content Container */}
        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center space-y-8">
          {/* Active status pill */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2.5 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-1.5 text-sm font-medium text-secondary"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
            </span>
            <span>AI System is Active</span>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6 w-full flex flex-col items-center"
          >
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-heading font-extrabold tracking-tight text-white leading-[1.05] max-w-full break-words flex flex-col items-center">
              <BlurText
                text="The Smart Assistant for Legal Metrology"
                delay={80}
                animateBy="words"
                direction="bottom"
                className="justify-center text-center"
              />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary mt-2">
                Compliance
              </span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-300 max-w-[760px] w-full font-body leading-relaxed text-center px-2">
              Simply scan any product label, and our AI will automatically read the text, spot missing information, check the prices and sizes, and create a complete inspection report for you.
            </p>
          </motion.div>

          {/* Responsive Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 w-full sm:w-auto"
          >
            <StarBorder color="#8B5CF6" speed="4s" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleStartInspection('/new-inspection')}
                className="w-full sm:w-auto min-w-[200px] text-lg shadow-xl shadow-primary/25 group justify-center"
              >
                Start Inspection
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </StarBorder>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto min-w-[180px] text-lg bg-white/5 border-white/10 text-white hover:bg-white/10 justify-center"
              >
                Explore Platform
              </Button>
            </a>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-6 w-full max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-sm sm:text-base font-medium text-slate-400"
          >
            <div className="flex items-center space-x-2 bg-white/[0.03] border border-white/5 rounded-full px-3.5 py-1.5">
              <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
              <span>AI-Assisted Analysis</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/[0.03] border border-white/5 rounded-full px-3.5 py-1.5">
              <ShieldCheck className="w-4 h-4 text-secondary flex-shrink-0" />
              <span>Evidence-Based Review</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/[0.03] border border-white/5 rounded-full px-3.5 py-1.5">
              <Scale className="w-4 h-4 text-secondary flex-shrink-0" />
              <span>Regulatory Rule Mapping</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/[0.03] border border-white/5 rounded-full px-3.5 py-1.5">
              <Eye className="w-4 h-4 text-secondary flex-shrink-0" />
              <span>Inspector Verification</span>
            </div>
          </motion.div>

          {/* Centered Live Scanner Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="w-full max-w-3xl mx-auto mt-6 relative"
          >
            <div className="relative bg-gradient-to-b from-[#121A2E] to-[#090D1A] border border-white/10 rounded-2xl shadow-2xl p-5 sm:p-6 overflow-hidden text-left">
              {/* Mockup Title bar */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="text-sm font-mono text-slate-400">INSPECT-LMD-8492 // LIVE OCR</div>
                <Badge variant="primary" className="text-xs py-0.5">
                  Rule 6(1) Active
                </Badge>
              </div>

              {/* Package Mock Scanner Frame */}
              <div className="relative rounded-xl overflow-hidden bg-black/60 border border-white/10 mb-4 h-56 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&q=80"
                  alt="Packaged Label Scanner Mockup"
                  className="w-full h-full object-cover opacity-75"
                />

                {/* Animated Scanning Laser Beam */}
                <motion.div
                  animate={{ y: [-110, 110, -110] }}
                  transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
                  className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_#6366F1] z-20 pointer-events-none"
                />

                {/* Bounding box highlight 1 */}
                <div className="absolute top-4 left-6 border border-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-xs text-emerald-300 font-mono">
                  MRP: ₹245.00 [PASS]
                </div>

                {/* Bounding box highlight 2 */}
                <div className="absolute bottom-6 right-6 border border-rose-500 bg-rose-500/20 px-2 py-0.5 rounded text-xs text-rose-300 font-mono">
                  Mfg Date: MISSING [FAIL]
                </div>
              </div>

              {/* Real-time AI Confidence Output */}
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                  <div className="flex items-center space-x-2">
                    <ScanLine className="w-4 h-4 text-primary" />
                    <span className="text-slate-300">Mandatory Fields Parsed</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">6 / 7 Declarations</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                  <div className="flex items-center space-x-2">
                    <Scale className="w-4 h-4 text-accent" />
                    <span className="text-slate-300">LMPC Rule 6 Score</span>
                  </div>
                  <span className="font-mono text-amber-400 font-bold">82 / 100</span>
                </div>
              </div>

              {/* Floating score badge */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                className="hidden sm:flex absolute -bottom-3 -right-3 bg-[#182238] border border-white/15 p-3 rounded-xl shadow-2xl items-center space-x-3"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-heading font-bold text-base">
                  82%
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-white uppercase tracking-wider">Preliminary Score</div>
                  <div className="text-xs text-slate-400">Inspector Verification Pending</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. PROBLEM SECTION (#problem)                                */}
      {/* ============================================================ */}
      <section id="problem" className="w-full py-24 border-t border-white/[0.08] relative">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge variant="warning" className="px-3 py-1 text-sm">
              Regulatory Challenges
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight text-white">
              <BlurText text="Compliance Inspection, Reimagined" delay={50} direction="bottom" className="justify-center" />
            </h2>
            <p className="text-slate-400 text-lg sm:text-xl">
              Manual inspection of packaged commodities under field conditions is resource-intensive, complex, and prone
              to oversights. Enforcement officers are tasked with auditing an unprecedented volume of consumer retail
              goods.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROBLEM_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-[#121A2E]/70 border border-white/10 rounded-2xl p-6 hover:border-primary/40 hover:bg-[#121A2E] transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <card.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-white">{card.title}</h3>
                  <p className="text-base text-slate-400 leading-relaxed">{card.description}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5">
                  <span className="text-sm font-mono text-slate-400 uppercase tracking-wider">{card.tag}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. HOW IT WORKS SECTION (#how-it-works)                      */}
      {/* ============================================================ */}
      <section id="how-it-works" className="w-full py-24 border-t border-white/[0.08] relative">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <Badge variant="primary" className="px-3 py-1 text-sm">
              Standardized Workflow
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight text-white">
              <BlurText text="From Product Image to Compliance Insight" delay={50} direction="bottom" className="justify-center" />
            </h2>
            <p className="text-slate-400 text-lg sm:text-xl">
              A seamless six-stage methodology connecting physical label capture to statutory enforcement reports.
            </p>
          </div>

          {/* 6 Sequential Steps in a Responsive 3x2 Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
            {WORKFLOW_STEPS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative bg-[#121A2E]/60 border border-white/10 rounded-2xl p-7 hover:border-secondary/40 hover:bg-[#121A2E] transition-all duration-300 group"
              >
                {/* Step indicator */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
                    <step.icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-heading font-extrabold text-white/20 group-hover:text-secondary/40 transition-colors">
                    {step.step}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-mono text-secondary uppercase tracking-wider">{step.subtitle}</div>
                  <h3 className="text-2xl font-heading font-bold text-white">{step.title}</h3>
                  <p className="text-base text-slate-400 leading-relaxed pt-1">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. PLATFORM FEATURES GRID (#features)                        */}
      {/* ============================================================ */}
      <section id="features" className="w-full py-24 border-t border-white/[0.08] relative">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-3 max-w-2xl">
              <Badge variant="primary" className="px-3 py-1 text-sm">
                Capabilities
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight text-white">
              <BlurText text="Engineered for Comprehensive Enforcement" delay={50} direction="bottom"  />
            </h2>
              <p className="text-slate-400 text-lg">
                Fifteen integrated capabilities covering optical recognition, statutory rule validation, and tamper-evident
                audit management.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {featureCategories.slice(0, 5).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedFeatureCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedFeatureCategory === cat
                      ? 'bg-primary text-white'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Features 3-Column Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFeatures.map((feat, i) => (
              <motion.div
                key={feat.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 6) * 0.08 }}
                className="bg-[#121A2E]/50 border border-white/10 rounded-2xl p-8 hover:border-white/20 hover:bg-[#121A2E] hover:shadow-2xl transition-all group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all">
                    <feat.icon className="w-6 h-6" />
                  </div>
                  <Badge variant="neutral" className="text-sm font-mono bg-white/[0.03]">
                    {feat.category}
                  </Badge>
                </div>
                <h3 className="text-2xl font-heading font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-lg text-slate-400 leading-relaxed">{feat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. COMPLIANCE & LEGAL STATUTORY FOUNDATION (#compliance)     */}
      {/* ============================================================ */}
      <section id="compliance" className="w-full py-24 border-t border-white/[0.08] relative">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <Badge variant="primary" className="px-3 py-1 text-sm">
                Statutory Basis
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight text-white leading-tight">
              <BlurText text="Built Around Regulatory Compliance" delay={50} direction="bottom"  />
            </h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                LegalMetrix AI is structured directly around official regulatory source documents. All rule models cross-examine
                mandatory declarations stipulated under primary legislation and published notifications.
              </p>

              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-start space-x-3">
                    <Scale className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-base font-bold text-white">The Legal Metrology Act, 2009</h4>
                      <p className="text-sm text-slate-400 mt-1">
                        Primary legislation establishing metric standards, statutory penalties, and the legal framework for
                        consumer protection in trade and commerce.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-start space-x-3">
                    <FileCheck2 className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-base font-bold text-white">
                        Legal Metrology (Packaged Commodities) Rules, 2011
                      </h4>
                      <p className="text-sm text-slate-400 mt-1">
                        Rule 6 mandatory declarations (Manufacturer, Net Quantity, MRP, Packaging Date, Consumer Care,
                        Country of Origin) and subsequent amendments.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* MANDATORY DISCLAIMER BOX */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm text-amber-200/90 leading-relaxed">
                <div className="font-bold uppercase tracking-wider text-amber-300 mb-1 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1.5" />
                  Statutory Advisory Notice
                </div>
                LegalMetrix AI provides an <strong>AI-assisted preliminary compliance assessment</strong> to assist authorized
                inspectors. <strong>Final verification remains with the competent authority</strong> under the provisions of the
                Legal Metrology Act, 2009 and applicable State Rules.
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="bg-[#121A2E] border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-base font-heading font-bold text-white">Mapped Mandatory Declarations</span>
                  <span className="text-sm font-mono text-emerald-400">7 Core Declarations</span>
                </div>

                <div className="space-y-2.5 text-sm">
                  {[
                    { field: 'Name and address of Manufacturer / Packer / Importer', rule: 'Rule 6(1)(a)' },
                    { field: 'Generic name of the commodity', rule: 'Rule 6(1)(b)' },
                    { field: 'Net quantity in standard units of weight/measure', rule: 'Rule 6(1)(d)' },
                    { field: 'Month and year of manufacture or pre-packing', rule: 'Rule 6(1)(f)' },
                    { field: 'Maximum Retail Price (inclusive of all taxes)', rule: 'Rule 6(1)(e)' },
                    { field: 'Consumer Care details (Name, Address, Telephone, Email)', rule: 'Rule 6(1)(g)' },
                    { field: 'Country of origin for imported commodities', rule: 'Rule 6(1)(ab)' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5"
                    >
                      <span className="text-slate-300 truncate max-w-[70%]">{item.field}</span>
                      <Badge variant="primary" className="font-mono text-xs">
                        {item.rule}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. AI TECHNOLOGY PIPELINE (#technology)                      */}
      {/* ============================================================ */}
      <section id="technology" className="w-full py-24 border-t border-white/[0.08] relative">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge variant="primary" className="px-3 py-1 text-sm">
              Architecture
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight text-white">
              <BlurText text="AI That Works With Evidence" delay={50} direction="bottom" className="justify-center" />
            </h2>
            <p className="text-slate-400 text-lg sm:text-xl">
              A deterministic, multi-stage processing pipeline ensuring every automated inference is transparently mapped
              to label evidence.
            </p>
          </div>

          {/* 8-Stage Pipeline Flow */}
          <div className="bg-[#121A2E]/60 border border-white/10 rounded-2xl p-8 mb-12">
            <div className="text-sm font-mono uppercase text-slate-400 tracking-wider mb-6 text-center">
              Linear Evidence Processing Pipeline
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {AI_PIPELINE_STAGES.map((st, i) => (
                <div key={st.id} className="relative flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center font-mono font-bold text-primary text-sm mb-2">
                    {st.id}
                  </div>
                  <div className="text-sm font-bold text-white truncate max-w-full">{st.title}</div>
                  <div className="text-xs text-slate-400 mt-1 leading-tight">{st.detail}</div>
                  {i < AI_PIPELINE_STAGES.length - 1 && (
                    <div className="hidden lg:block absolute -right-2 top-5 w-4 text-slate-600">&rarr;</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 space-y-3">
              <h3 className="text-lg font-heading font-bold text-white">Computer Vision & OCR</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Tailored character recognition resilient to specular glare, plastic crumpling, cylindrical bottle
                distortion, and micro-fonts under 1mm.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 space-y-3">
              <h3 className="text-lg font-heading font-bold text-white">Contextual Classification</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Extracts semantic entities rather than raw strings: distinguishing manufacturer registered addresses from
                consumer feedback centers.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 space-y-3">
              <h3 className="text-lg font-heading font-bold text-white">Deterministic Rule Engine</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                No generative hallucination in legal judgment: declarations are matched against discrete mathematical rule
                definitions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. EVIDENCE-FIRST SECTION (#evidence)                        */}
      {/* ============================================================ */}
      <section id="evidence" className="w-full py-24 border-t border-white/[0.08] relative">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge variant="info" className="px-3 py-1 text-sm">
              Audit Integrity
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight text-white">
              <BlurText text="Every Finding Has Evidence" delay={50} direction="bottom" className="justify-center" />
            </h2>
            <p className="text-slate-400 text-lg">
              No compliance determination exists in a vacuum. Every flag links directly to visual bounding coordinates on
              the original evidence photograph.
            </p>
          </div>

          {/* Interactive Evidence Inspector Demonstration */}
          <div className="bg-[#121A2E] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex flex-col lg:flex-row">
              {/* Left: Interactive Label Viewer */}
              <div className="lg:w-7/12 relative bg-black/80 p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 min-h-[380px]">
                <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                  <span className="font-mono">FILE: EVID-IMG-8492.JPG</span>
                  <span className="text-emerald-400 font-mono">ZOOM: 140% • 300 DPI</span>
                </div>

                <div className="relative mx-auto w-full max-w-sm rounded-lg overflow-hidden border border-white/10 bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=700&q=80"
                    alt="Evidence Label"
                    className="w-full h-48 sm:h-72 object-cover opacity-80"
                  />

                  {/* Dynamic highlighted bounding box */}
                  <div
                    className={`absolute ${currentEvidence.box} border-2 ${
                      currentEvidence.status === 'PASS' ? 'border-emerald-400 bg-emerald-400/20' : 'border-rose-500 bg-rose-500/25'
                    } shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] z-20 rounded transition-all duration-300 flex items-center justify-center`}
                  >
                    <span
                      className={`absolute -top-6 left-0 px-2 py-0.5 text-xs font-mono font-bold rounded ${
                        currentEvidence.status === 'PASS' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                      }`}
                    >
                      {currentEvidence.boxLabel}
                    </span>
                  </div>
                </div>

                <div className="text-center pt-4 text-sm text-slate-400">
                  Click tabs on the right to inspect different declarations mapped on this sample package.
                </div>
              </div>

              {/* Right: Evidence Inspection Details */}
              <div className="lg:w-5/12 p-6 flex flex-col justify-between bg-[#090D1A]/60">
                <div className="space-y-5">
                  {/* Selector Tabs */}
                  <div className="flex flex-col sm:flex-row gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                    <button
                      onClick={() => setActiveEvidenceTab('mfg')}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                        activeEvidenceTab === 'mfg' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Mfg Date
                    </button>
                    <button
                      onClick={() => setActiveEvidenceTab('mrp')}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                        activeEvidenceTab === 'mrp' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      MRP Check
                    </button>
                    <button
                      onClick={() => setActiveEvidenceTab('qty')}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                        activeEvidenceTab === 'qty' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Net Qty
                    </button>
                  </div>

                  {/* Evidence Card Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono text-slate-400">Statutory Field</span>
                      <Badge variant={currentEvidence.status === 'PASS' ? 'success' : 'danger'}>
                        {currentEvidence.status}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-heading font-bold text-white">{currentEvidence.field}</h3>
                    <div className="text-sm font-mono text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded inline-block">
                      Regulatory Mandate: {currentEvidence.rule}
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">{currentEvidence.requirement}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Extracted Text:</span>
                      <span className="font-mono font-medium text-white">{currentEvidence.extractedText}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">OCR Model Confidence:</span>
                      <span className="font-mono text-secondary font-bold">{currentEvidence.confidence}</span>
                    </div>
                  </div>

                  {/* Inspector Verification Toggle */}
                  <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-white">Inspector Sign-Off</div>
                      <div className="text-xs text-slate-400">Mark evidence as officer-confirmed</div>
                    </div>
                    <button
                      onClick={() => setInspectorVerified(!inspectorVerified)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center justify-center space-x-1.5 transition-colors w-full sm:w-auto ${
                        inspectorVerified
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-white/10 text-slate-300 border border-white/10 hover:bg-white/15'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{inspectorVerified ? 'Verified' : 'Verify'}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 text-sm text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span>Tamper-Resistant Hash</span>
                  <span className="font-mono text-slate-400 text-xs sm:text-sm">SHA-256: 8f9b...a10e</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. ANALYTICS PREVIEW SECTION (#analytics)                    */}
      {/* ============================================================ */}
      <section id="analytics" className="w-full py-24 border-t border-white/[0.08] relative">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge variant="primary" className="px-3 py-1 text-sm">
              Enforcement Intelligence
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight text-white">
              <BlurText text="Turn Inspection Data into Actionable Intelligence" delay={50} direction="bottom" className="justify-center" />
            </h2>
            <p className="text-slate-400 text-lg">
              Consolidate thousands of label assessments across districts into regional compliance trends and repeat-violation
              analytics.
            </p>
          </div>

          {/* 4 Metric Cards with Demo Labels */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {MOCK_ANALYTICS_STATS.map((stat, i) => (
              <div key={i} className="bg-[#121A2E] border border-white/10 rounded-2xl p-5 space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>{stat.label}</span>
                  <span className="text-xs font-mono bg-white/5 px-2 py-0.5 rounded text-secondary">
                    {stat.change}
                  </span>
                </div>
                <div className="text-4xl font-heading font-extrabold text-white">{stat.value}</div>
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">{stat.note}</div>
              </div>
            ))}
          </div>

          {/* Chart Preview Card */}
          <div className="bg-[#121A2E] border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-white/10 gap-4">
              <div>
                <h3 className="text-xl font-heading font-bold text-white">Monthly Regional Compliance Ingestion</h3>
                <p className="text-sm text-slate-400">Simulated monthly trends across North Zone retail inspections</p>
              </div>
              <Badge variant="neutral" className="text-sm">
                Preview Demo Chart
              </Badge>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ANALYTICS_TREND_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCompliant" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3DD6B4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3DD6B4" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorFlagged" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090D1A',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="compliant"
                    name="Compliant Products"
                    stroke="#3DD6B4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCompliant)"
                  />
                  <Area
                    type="monotone"
                    dataKey="flagged"
                    name="Flagged Violations"
                    stroke="#FF6B6B"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorFlagged)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. REPORTING SECTION (#reports)                              */}
      {/* ============================================================ */}
      <section id="reports" className="w-full py-24 border-t border-white/[0.08] relative">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <Badge variant="primary" className="px-3 py-1 text-sm">
                Export Ready
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight text-white leading-tight">
              <BlurText text="Inspection Reports, Ready to Review" delay={50} direction="bottom"  />
            </h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                Every completed assessment produces an executive, standardized compliance dossier containing full product
                provenance, mapped label crops, rule violation citations, and officer sign-offs.
              </p>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span>Inspection ID & Timestamp</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span>Manufacturer Postal Details</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span>Rule-by-Rule Scoring</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span>Embedded High-Res Evidence</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link to="/reports">
                  <Button variant="primary" leftIcon={<FileBadge className="w-4 h-4" />}>
                    Preview Reports
                  </Button>
                </Link>
                <Link to="/reports">
                  <Button variant="secondary" className="bg-white/5 border-white/10 hover:bg-white/10">
                    Export PDF Dossier
                  </Button>
                </Link>
              </div>
            </div>

            {/* Structured Report Mockup */}
            <div className="lg:col-span-6">
              <div className="bg-[#121A2E] text-slate-100 rounded-2xl p-6 shadow-2xl border border-white/10 space-y-5">
                <div className="flex flex-col sm:flex-row sm:justify-between items-start border-b border-white/10 pb-4 gap-4">
                  <div>
                    <div className="text-sm font-mono text-primary uppercase tracking-wider font-bold">
                      Official Statutory Report Mockup
                    </div>
                    <h3 className="text-xl font-bold font-heading text-white">Legal Metrology Inspection Dossier</h3>
                  </div>
                  <div className="text-left sm:text-right text-sm font-mono text-slate-400">
                    <div>REP-2026-DL-8492</div>
                    <div className="text-slate-500">Date: August 27, 2026</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/[0.03] p-3 rounded-lg border border-white/5">
                    <div className="text-slate-400 font-bold uppercase text-xs">Commodity Subject</div>
                    <div className="font-semibold text-white mt-0.5">Ashirvaad Whole Wheat Atta 5kg</div>
                    <div className="text-slate-400 text-sm">Brand: ITC Limited</div>
                  </div>
                  <div className="bg-white/[0.03] p-3 rounded-lg border border-white/5">
                    <div className="text-slate-400 font-bold uppercase text-xs">Inspector Authority</div>
                    <div className="font-semibold text-white mt-0.5">Senior Metrology Officer</div>
                    <div className="text-slate-400 text-sm">Zone: Delhi NCR</div>
                  </div>
                </div>

                {/* Status banner in report */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-sm gap-2">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="font-bold">Preliminary Status: Needs Officer Review</span>
                  </div>
                  <span className="font-bold">Score: 82 / 100</span>
                </div>

                <div className="text-sm text-slate-400 border-t border-white/10 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span>Tamper-Proof Digital Verification Stamp</span>
                  <span className="font-mono font-bold text-emerald-400 break-all">VERIFIED // GOV-LMD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 10. OFFICIAL REGULATORY SOURCES SECTION (#sources)           */}
      {/* ============================================================ */}
      <section id="sources" className="w-full py-24 border-t border-white/[0.08] relative">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-[#121A2E] to-[#090D1A] border border-white/10 rounded-2xl p-8 lg:p-12 relative overflow-hidden">
            <div className="max-w-3xl space-y-4">
              <Badge variant="primary" className="px-3 py-1 text-sm">
                Official Reference
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white">
              <BlurText text="Grounded in Official Regulatory Sources" delay={50} direction="bottom"  />
            </h2>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                LegalMetrix AI uses verified rule documents referencing the official Department of Consumer Affairs guidelines.
                All extraction targets and format validations are modeled strictly from official statutory notifications.
              </p>

              <div className="pt-2 flex flex-wrap gap-4 items-center">
                <a
                  href="https://consumeraffairs.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-white transition-colors"
                >
                  <span>Department of Consumer Affairs</span>
                  <ExternalLink className="w-3.5 h-3.5 text-primary" />
                </a>
                <span className="text-sm text-slate-400">
                  Official Portal: <span className="font-mono">consumeraffairs.gov.in</span>
                </span>
              </div>

              <p className="text-sm text-slate-400 pt-2 border-t border-white/5">
                * Notice: LegalMetrix AI cites official regulatory notices solely for compliance reference. LegalMetrix AI does not
                claim government partnership or official government endorsement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 11. OUR TEAM SECTION (#team) (Part 1 & 17)                   */}
      {/* ============================================================ */}
      <section id="team" className="w-full py-24 border-t border-white/[0.08] relative">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge variant="info" className="px-3 py-1 text-sm">
              Meet Our Team
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight text-white">
              <BlurText text="Meet the Team Behind LegalMetrix AI" delay={50} direction="bottom" className="justify-center" />
            </h2>
            <p className="text-slate-400 text-lg sm:text-xl">
              Engineering technology for smarter, evidence-driven compliance.
            </p>
          </div>

          {/* 6 Premium Configurable Team Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAM_MEMBERS.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="bg-[#121A2E]/70 border border-white/10 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:border-primary/40 hover:bg-[#121A2E] transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Profile Photo / Avatar with hover effect */}
                  <div className="relative mb-5 mx-auto w-24 h-24 rounded-2xl overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-heading font-bold text-3xl group-hover:border-primary transition-colors shadow-inner">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <span className="group-hover:scale-110 transition-transform duration-300 font-mono">
                        {member.initials}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>

                  <div className="text-center space-y-1">
                    <h3 className="text-xl font-heading font-bold text-white group-hover:text-primary transition-colors">
                      {member.name}
                    </h3>
                    <div className="text-sm font-medium text-secondary">{member.role}</div>
                    <p className="text-sm text-slate-400 pt-3 leading-relaxed">{member.bio}</p>
                  </div>
                </div>

                {/* Social Links */}
                <div className="pt-5 mt-5 border-t border-white/5 flex items-center justify-center space-x-3">
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/5 hover:bg-primary/20 text-slate-400 hover:text-primary transition-colors"
                      title="LinkedIn"
                    >
                      <LinkedinIcon className="w-4 h-4" />
                    </a>
                  )}
                  {member.github && (
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title="GitHub"
                    >
                      <GithubIcon className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 12. FINAL CALL-TO-ACTION (#cta)                              */}
      {/* ============================================================ */}
      <section id="cta" className="w-full py-24 border-t border-white/[0.08] relative">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
          <div className="relative rounded-3xl bg-gradient-to-r from-[#182238] via-[#121A2E] to-[#090D1A] border border-white/15 p-10 sm:p-16 text-center overflow-hidden shadow-2xl">
            {/* Subtle glow circles */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/15 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-4xl sm:text-6xl font-heading font-extrabold text-white tracking-tight leading-tight">
              <BlurText text="Ready to Make Compliance Smarter?" delay={50} direction="bottom"  />
            </h2>
              <p className="text-slate-300 text-lg sm:text-xl leading-relaxed">
                Use AI-assisted inspection workflows to extract, validate, and review packaged commodity declarations faster.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleStartInspection('/new-inspection')}
                  className="w-full sm:w-auto text-lg shadow-xl shadow-primary/30"
                >
                  Start Inspection
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <a href="#hero">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto text-lg bg-white/5 border-white/10 hover:bg-white/10">
                    Explore Platform
                  </Button>
                </a>
              </div>

              <div className="text-sm text-slate-400 pt-4">
                Authorized metrology officers and audit personnel • Immediate secure access
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
