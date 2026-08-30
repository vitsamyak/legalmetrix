import {
  ScanLine,
  FileCheck2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  BarChart4,
  Eye,
  FileBarChart,
  Search,
  Scale,
  Package,
  Layers,
  Sparkles,
  History,
  FolderLock,
  Cpu,
  CheckCircle2,
  FileBadge,
  SlidersHorizontal,
} from 'lucide-react';

export const PROBLEM_CARDS = [
  {
    icon: Search,
    title: 'Manual Verification',
    description:
      'Field officers manually scrutinize fine-print packaging labels across thousands of SKUs, resulting in fatigue, inconsistent audits, and missed non-compliances.',
    tag: 'Labor Intensive',
  },
  {
    icon: Package,
    title: 'High Product Volume',
    description:
      'Retail shelves and e-commerce fulfillment centers circulate millions of packaged commodities daily, making comprehensive physical label checks mathematically impossible without automated tools.',
    tag: 'Scalability Bottleneck',
  },
  {
    icon: FolderLock,
    title: 'Scattered Evidence',
    description:
      'Inspection photos, handwritten memos, and violation records are often fragmented across personal devices, creating chain-of-custody risks during formal statutory proceedings.',
    tag: 'Audit Vulnerability',
  },
  {
    icon: Scale,
    title: 'Complex Regulatory Rules',
    description:
      'The Legal Metrology (Packaged Commodities) Rules, 2011 and periodic amendments introduce nuanced font size, MRP, unit sale price, and country-of-origin mandates that are challenging to cross-reference rapidly.',
    tag: 'Compliance Burden',
  },
];

export const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Upload Photo',
    subtitle: 'Take a picture of the package',
    description: 'Just upload a photo of the product label from your phone, camera, or computer.',
    icon: Layers,
  },
  {
    step: '02',
    title: 'AI Reads Text',
    subtitle: 'Extracting all the words',
    description: 'Our smart system reads all the text on the label, even if the photo is slightly blurry or curved.',
    icon: ScanLine,
  },
  {
    step: '03',
    title: 'Check the Rules',
    subtitle: 'Comparing against the law',
    description: 'The system automatically checks if all the required legal information is present and correct.',
    icon: ShieldCheck,
  },
  {
    step: '04',
    title: 'Spot Mistakes',
    subtitle: 'Finding what is wrong',
    description: 'If anything is missing or incorrect (like a wrong price format), the AI highlights it with a box.',
    icon: AlertTriangle,
  },
  {
    step: '05',
    title: 'Human Review',
    subtitle: 'You are in control',
    description: 'An inspector looks at what the AI found and gives the final thumbs up or makes corrections.',
    icon: Eye,
  },
  {
    step: '06',
    title: 'Get Report',
    subtitle: 'Ready to print and share',
    description: 'Download a clean, professional report that contains all the proof and the final decision.',
    icon: FileBarChart,
  },
];

export const PLATFORM_FEATURES = [
  {
    id: 'feat-1',
    title: 'Smart Text Reader',
    description: 'Our AI easily reads text on any product package, even if it is curved, small, or hard to see.',
    icon: ScanLine,
    category: 'Computer Vision',
  },
  {
    id: 'feat-2',
    title: 'Finds Missing Info',
    description: 'Automatically checks if all required details (like dates and addresses) are printed on the package.',
    icon: FileCheck2,
    category: 'Extraction',
  },
  {
    id: 'feat-3',
    title: 'Checks Prices',
    description: 'Verifies that the MRP is formatted correctly and includes "inclusive of all taxes".',
    icon: Scale,
    category: 'Pricing Rules',
  },
  {
    id: 'feat-4',
    title: 'Checks Weights & Sizes',
    description: 'Makes sure the weight or volume is written using the correct standard units (like kg or ml).',
    icon: SlidersHorizontal,
    category: 'Metrology',
  },
  {
    id: 'feat-5',
    title: 'Finds Contact Details',
    description: 'Automatically locates the manufacturer\'s address, email, and customer care number for you.',
    icon: Package,
    category: 'Entity Analysis',
  },
  {
    id: 'feat-6',
    title: 'Visual Proof',
    description: 'Shows you exactly where on the image a rule was broken by drawing a clear box around it.',
    icon: Eye,
    category: 'Traceability',
  },
  {
    id: 'feat-7',
    title: 'Built-in Rulebook',
    description: 'Always stays updated with the latest government rules, so you never miss a new requirement.',
    icon: ShieldCheck,
    category: 'Engine',
  },
  {
    id: 'feat-8',
    title: 'Spots Violations',
    description: 'Immediately highlights any mistakes and tells you how serious the issue is.',
    icon: AlertTriangle,
    category: 'Auditing',
  },
  {
    id: 'feat-9',
    title: 'Fair Scoring System',
    description: 'Gives each product a simple score out of 100 based on how well it follows the rules.',
    icon: Sparkles,
    category: 'Metrics',
  },
  {
    id: 'feat-10',
    title: 'Easy Review Process',
    description: 'Lets human inspectors quickly approve or fix the AI\'s findings before making a final decision.',
    icon: CheckCircle2,
    category: 'Verification',
  },
  {
    id: 'feat-11',
    title: 'Creates Official Reports',
    description: 'Generates ready-to-print official reports with all the evidence and photos attached.',
    icon: FileBadge,
    category: 'Reporting',
  },
  {
    id: 'feat-12',
    title: 'Keeps History Safe',
    description: 'Safely stores all past inspections so you can search and review them at any time.',
    icon: History,
    category: 'Records',
  },
  {
    id: 'feat-13',
    title: 'Product Library',
    description: 'Builds a catalog of all inspected products and brands so you can spot recurring problems.',
    icon: Layers,
    category: 'Database',
  },
  {
    id: 'feat-14',
    title: 'Analytics Dashboard',
    description: 'Shows simple charts summarizing pass rates, common issues, and officer performance over time.',
    icon: BarChart4,
    category: 'Intelligence',
  },
  {
    id: 'feat-15',
    title: 'Track Every Action',
    description: 'Keeps an unchangeable record of every AI scan and human edit for complete transparency.',
    icon: Clock,
    category: 'Governance',
  },
];

export const AI_PIPELINE_STAGES = [
  { id: '1', title: 'Product Image', detail: 'High-res package upload' },
  { id: '2', title: 'OCR', detail: 'Optical character parsing' },
  { id: '3', title: 'Declarations', detail: 'Field classification' },
  { id: '4', title: 'Rule Engine', detail: 'LMPC rule evaluation' },
  { id: '5', title: 'AI Analysis', detail: 'Discrepancy scoring' },
  { id: '6', title: 'Violation Detection', detail: 'Severity assignment' },
  { id: '7', title: 'Evidence', detail: 'Visual coordinate crop' },
  { id: '8', title: 'Inspector Review', detail: 'Official officer sign-off' },
];

export const MOCK_ANALYTICS_STATS = [
  { label: 'Total Inspections', value: '1,284', change: '+14.2% MoM', note: 'Simulated Demo Data' },
  { label: 'Compliance Rate', value: '84.6%', change: '+3.1% MoM', note: 'Simulated Demo Data' },
  { label: 'Violations Flagged', value: '177', change: '-5.4% MoM', note: 'Simulated Demo Data' },
  { label: 'Average Score', value: '82/100', change: '+2.0 pts', note: 'Simulated Demo Data' },
];

export const ANALYTICS_TREND_DATA = [
  { month: 'Mar', compliant: 120, flagged: 18 },
  { month: 'Apr', compliant: 145, flagged: 22 },
  { month: 'May', compliant: 180, flagged: 19 },
  { month: 'Jun', compliant: 210, flagged: 25 },
  { month: 'Jul', compliant: 260, flagged: 28 },
  { month: 'Aug', compliant: 310, flagged: 24 },
];
