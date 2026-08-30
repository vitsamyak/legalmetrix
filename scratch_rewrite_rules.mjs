import fs from 'fs';
const content = `import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Search, Filter, ShieldCheck, Scale, History } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Disclaimer } from '../components/Disclaimer';
import { supabase } from '../lib/supabase';

export const RulesPage = () => {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold font-heading text-content tracking-tight">Rule Management</h1>
          <p className="text-content-muted mt-1">Manage the versioned Legal Metrology compliance rule base.</p>
        </div>
        <Button variant="primary" leftIcon={<History className="w-4 h-4" />}>Amendment Tracker</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Rules', value: loading ? '-' : rules.length.toString(), icon: Scale },
          { label: 'Active Rules', value: loading ? '-' : rules.length.toString(), icon: ShieldCheck },
          { label: 'Recently Updated', value: '-', icon: History, trend: '' },
          { label: 'Needs Review', value: '0', icon: Filter, color: 'text-warning' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-content-muted mb-1">{stat.label}</div>
                  <div className={\`text-3xl font-heading font-bold \${stat.color || 'text-content'}\`}>{stat.value}</div>
                  {stat.trend && <div className="text-xs font-medium text-emerald-400 mt-2">{stat.trend}</div>}
                </div>
                <div className="p-3 bg-obsidian rounded-xl border border-border">
                  <stat.icon className={\`w-5 h-5 \${stat.color || 'text-primary'}\`} />
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
                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-obsidian border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-content"
              />
            </div>
            <Button variant="secondary" size="icon" className="shrink-0"><Filter className="w-4 h-4" /></Button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-content-muted uppercase bg-obsidian border-b border-border">
              <tr>
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
                  <td colSpan={5} className="px-6 py-8 text-center text-content-muted">Loading rules...</td>
                </tr>
              ) : filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-content-muted">No rules found</td>
                </tr>
              ) : (
                filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-medium text-content">{rule.rule_reference}</td>
                    <td className="px-6 py-4 text-content font-medium">{rule.act_name}</td>
                    <td className="px-6 py-4 text-content-muted max-w-[200px] truncate">{rule.requirement_description}</td>
                    <td className="px-6 py-4">
                      <Badge variant="success">Active</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 text-primary">View Source</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <Disclaimer />
    </div>
  );
};
`;
fs.writeFileSync('src/pages/RulesPage.tsx', content);
