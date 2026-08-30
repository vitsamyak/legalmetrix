import React from 'react';
import { Link } from 'react-router-dom';
import { ScanLine, Shield, ExternalLink, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="w-full bg-[#090D1A] border-t border-white/[0.08] text-slate-400 relative">
      {/* Upper Footer: Contact bar & Brand Statement */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 pb-12 border-b border-white/10">
          {/* Brand & Description (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center font-heading font-bold text-2xl tracking-tight text-white hover:opacity-90 transition-opacity cursor-pointer"
              title="LegalMetrix AI - Return to Hero"
              aria-label="LegalMetrix AI - Return to Hero page"
            >
              <ScanLine className="w-7 h-7 text-primary mr-2.5" />
              LegalMetrix <span className="text-primary ml-1">AI</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              AI-assisted Legal Metrology compliance and inspection platform. Streamlining label declaration extraction,
              rule validation, and evidence-backed reporting for enforcement officers.
            </p>
            <div className="pt-2 space-y-2 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span>New Delhi, India • Specialized Compliance Technology</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>contact@legalmetrix.ai</span>
              </div>
            </div>
          </div>

          {/* Col 1: Product */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              </li>
              <li>
                <Link to="/dashboard/inspect" className="hover:text-white transition-colors">New Inspection</Link>
              </li>
              <li>
                <Link to="/dashboard/products" className="hover:text-white transition-colors">Products</Link>
              </li>
              <li>
                <Link to="/dashboard/reports" className="hover:text-white transition-colors">Reports</Link>
              </li>
              <li>
                <Link to="/dashboard/analytics" className="hover:text-white transition-colors">Analytics</Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Compliance */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Compliance</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/dashboard/rules" className="hover:text-white transition-colors">Rule Management</Link>
              </li>
              <li>
                <Link to="/dashboard/legal-framework" className="hover:text-white transition-colors">Legal Framework</Link>
              </li>
              <li>
                <Link to="/dashboard/evidence" className="hover:text-white transition-colors">Evidence Review</Link>
              </li>
              <li>
                <a
                  href="https://consumeraffairs.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center hover:text-white transition-colors"
                >
                  Consumer Affairs <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#team" className="hover:text-white transition-colors">Team</a>
              </li>
              <li>
                <a href="#problem" className="hover:text-white transition-colors">About Solution</a>
              </li>
              <li>
                <a href="#technology" className="hover:text-white transition-colors">Technology</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">Contact</a>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-slate-400">Privacy Policy</span>
              </li>
              <li>
                <span className="text-slate-400">Terms of Service</span>
              </li>
              <li>
                <span className="text-slate-400">Audit Disclaimers</span>
              </li>
              <li>
                <span className="text-slate-400">Statutory Notice</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Lower Footer: Copyright & Official Statutory Notice */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-slate-500">
            © 2026 LegalMetrix AI. All rights reserved.
          </div>

          <div className="flex items-center text-slate-500 text-center md:text-right max-w-2xl bg-white/[0.02] border border-white/[0.05] px-4 py-2 rounded-xl">
            <Shield className="w-4 h-4 text-primary mr-2 flex-shrink-0 hidden sm:block" />
            <span>
              AI-assisted preliminary compliance assessment. Final findings remain subject to inspector verification and applicable law.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
