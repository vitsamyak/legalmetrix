import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Search, Filter, ShieldCheck, Scale, History, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Disclaimer } from '../components/Disclaimer';
import { supabase } from '../lib/supabase';
import { BrandedLoader } from '../components/BrandedLoader';
import { useToast } from '../components/Toast';
import { Trash2, X } from 'lucide-react';
import { SpotlightCard } from '../components/ui/SpotlightCard';

export const RulesPage = () => {
  const { showToast } = useToast();
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewSourceRule, setViewSourceRule] = useState<any | null>(null);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const { data, error } = await supabase!
          .from('legal_rules')
          .select('*')
          .order('act_name', { ascending: true });
        
        if (error) throw error;
        
        if (data) {
          setRules(data);
        }
      } catch (err) {
        console.error('Error fetching rules:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRules();
  }, []);

  const filteredRules = rules.filter(rule => 
    (rule.rule_reference && rule.rule_reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (rule.act_name && rule.act_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (rule.requirement_description && rule.requirement_description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredRules.map(r => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} rule(s)?`)) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase!
        .from('legal_rules')
        .delete()
        .in('id', Array.from(selectedIds));

      if (error) throw error;

      showToast(`Successfully deleted ${selectedIds.size} rule(s).`, 'success');
      setRules(prev => prev.filter(r => !selectedIds.has(r.id)));
      setSelectedIds(new Set());
    } catch (err: any) {
      console.error('Error deleting rules:', err);
      if (err.message?.includes('foreign key constraint')) {
        showToast('Cannot delete rules that are used in violations.', 'error');
      } else {
        showToast(err.message || 'Failed to delete rules', 'error');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold font-heading text-content tracking-tight">Rule Management</h1>
          <p className="text-content-muted mt-1">Manage the versioned Legal Metrology compliance rule base.</p>
        </div>
        <Button variant="primary" leftIcon={<History className="w-4 h-4" />} onClick={() => showToast('Amendment Tracker feature is coming soon.', 'success')}>Amendment Tracker</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Rules', value: loading ? '-' : rules.length.toString(), icon: Scale },
          { label: 'Active Rules', value: loading ? '-' : rules.length.toString(), icon: ShieldCheck },
          { label: 'Recently Updated', value: loading ? '-' : rules.length.toString(), icon: History, trend: '' },
          { label: 'Needs Review', value: '0', icon: Filter, color: 'text-warning' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-content-muted mb-1">{stat.label}</div>
                  <div className={`text-3xl font-heading font-bold ${stat.color || 'text-content'}`}>{stat.value}</div>
                  {stat.trend && <div className="text-xs font-medium text-emerald-400 mt-2">{stat.trend}</div>}
                </div>
                <div className="p-3 bg-obsidian rounded-xl border border-border">
                  <stat.icon className={`w-5 h-5 ${stat.color || 'text-primary'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-base">Rules Database</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
              <input 
                type="text" 
                placeholder="Search rules..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-[#0F172A]/40 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-content"
              />
            </div>
            <Button variant="secondary" size="icon" className="shrink-0"><Filter className="w-4 h-4" /></Button>
          </div>
        </CardHeader>
        
        {selectedIds.size > 0 && (
          <div className="bg-primary/10 border-b border-primary/20 px-6 py-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <span className="text-sm font-medium text-primary">
              {selectedIds.size} rule{selectedIds.size > 1 ? 's' : ''} selected
            </span>
            <Button 
              variant="danger" 
              size="sm" 
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={handleBulkDelete}
              isLoading={isDeleting}
            >
              Delete Selected
            </Button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-content-muted uppercase bg-obsidian border-b border-border">
              <tr>
                <th className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    className="rounded border-border bg-sidebar/50 focus:ring-primary focus:ring-offset-0 text-primary"
                    checked={filteredRules.length > 0 && selectedIds.size === filteredRules.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 font-medium">Rule ID</th>
                <th className="px-6 py-4 font-medium">Act Name</th>
                <th className="px-6 py-4 font-medium">Requirement</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface-secondary">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8"><BrandedLoader fullScreen={false} subMessage="Loading rules..." /></td>
                </tr>
              ) : filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="p-4 bg-obsidian rounded-full border border-border">
                        <Scale className="w-8 h-8 text-content-faint" />
                      </div>
                      <h3 className="text-lg font-medium text-content">No Legal Rules Configured</h3>
                      <p className="text-content-muted max-w-md text-center">
                        The legal rule base is currently empty. Rules are used by the AI engine to evaluate product compliance automatically.
                      </p>
                      <Button variant="secondary" className="mt-2" leftIcon={<ShieldCheck className="w-4 h-4" />}>
                        Import Rule Base
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => (
                  <tr key={rule.id} className={`group transition-colors ${selectedIds.has(rule.id) ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-white/5'}`}>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="rounded border-border bg-sidebar/50 focus:ring-primary focus:ring-offset-0 text-primary"
                        checked={selectedIds.has(rule.id)}
                        onChange={() => handleSelectOne(rule.id)}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-content">{rule.rule_reference}</td>
                    <td className="px-6 py-4 text-content font-medium">{rule.act_name}</td>
                    <td className="px-6 py-4 text-content-muted max-w-[200px] truncate">{rule.requirement_description}</td>
                    <td className="px-6 py-4">
                      <Badge variant="success">Active</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 text-primary" onClick={() => setViewSourceRule(rule)}>View Source</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <Disclaimer />
      
      {viewSourceRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Enhanced Backdrop */}
          <div className="absolute inset-0 bg-obsidian/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setViewSourceRule(null)} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-obsidian/60 to-obsidian/90 pointer-events-none" />
          
          <div className="relative w-full max-w-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
            {/* Inner Modal Card */}
            <div className="relative w-full bg-[#030712]/95 backdrop-blur-2xl rounded-3xl overflow-hidden flex flex-col max-h-[85vh] shadow-[0_0_50px_-12px_rgba(99,102,241,0.5)] border border-primary/30 ring-1 ring-white/5 isolate">
              {/* Header */}
              <div className="relative p-6 sm:p-8 border-b border-white/[0.08] overflow-hidden bg-white/[0.01]">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent pointer-events-none" />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold font-h23 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                        {viewSourceRule.rule_reference}
                      </h2>
                      <p className="text-sm font-medium text-primary/80 mt-1">{viewSourceRule.act_name}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setViewSourceRule(null)}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-content-muted hover:text-white transition-all hover:scale-105 active:scale-95 shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar relative">
                <SpotlightCard className="p-[1px] rounded-2xl bg-[#0F172A]/50 border-white/5" spotlightColor="rgba(99, 102, 241, 0.2)">
                  <div className="bg-obsidian/80 backdrop-blur-sm rounded-[15px] p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                      </span>
                      <h3 className="text-sm font-bold text-primary uppercase tracking-[0.2em]">Requirement Details</h3>
                    </div>
                    
                    <p className="relative text-content/90 whitespace-pre-wrap leading-relaxed text-base sm:text-lg font-body">
                      {viewSourceRule.requirement_description}
                    </p>
                  </div>
                </SpotlightCard>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/[0.08] bg-white/[0.01] flex justify-end">
                <Button 
                  variant="primary" 
                  onClick={() => setViewSourceRule(null)}
                  className="w-full sm:w-auto shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-shadow"
                >
                  Close & Acknowledge
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
