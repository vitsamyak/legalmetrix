import fs from 'fs';
const content = `import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileCheck2, 
  AlertTriangle, 
  Clock, 
  Search,
  Filter,
  MoreVertical,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  FileText
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Compliant': return <Badge variant="success">Compliant</Badge>;
    case 'Non-Compliant': return <Badge variant="danger">Non-Compliant</Badge>;
    case 'Needs Review': return <Badge variant="warning">Needs Review</Badge>;
    default: return <Badge>Unknown</Badge>;
  }
};

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-emerald-600';
  if (score >= 70) return 'text-amber-600';
  return 'text-rose-600';
};

const container: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export const InspectorDashboard = () => {
  const { user } = useAuth();
  const [inspections, setInspections] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: insData, error: insError } = await supabase
          .from('inspections')
          .select('*, products(name, brand)')
          .order('created_at', { ascending: false });
        
        if (insError) throw insError;
        if (insData) setInspections(insData);

        const { data: violData, error: violError } = await supabase
          .from('violations')
          .select('*');
          
        if (violError) throw violError;
        if (violData) setViolations(violData);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Calculate dynamic stats
  const totalInspections = inspections.length;
  const compliantCount = inspections.filter(i => i.status === 'Compliant').length;
  const nonCompliantCount = inspections.filter(i => i.status === 'Non-Compliant').length;
  const needsReviewCount = inspections.filter(i => i.status === 'Needs Review').length;

  const statsData = [
    { title: 'Total Inspections', value: totalInspections.toString(), trend: '+0%', up: true, icon: Search },
    { title: 'Compliant', value: compliantCount.toString(), trend: '+0%', up: true, icon: FileCheck2 },
    { title: 'Non-Compliant', value: nonCompliantCount.toString(), trend: '-0%', up: false, icon: AlertTriangle },
    { title: 'Needs Review', value: needsReviewCount.toString(), trend: '+0%', up: true, icon: Clock },
  ];

  // Group inspections by day of week for the chart
  const activityMap: Record<string, { passes: number, fails: number }> = {
    'Mon': { passes: 0, fails: 0 },
    'Tue': { passes: 0, fails: 0 },
    'Wed': { passes: 0, fails: 0 },
    'Thu': { passes: 0, fails: 0 },
    'Fri': { passes: 0, fails: 0 },
    'Sat': { passes: 0, fails: 0 },
    'Sun': { passes: 0, fails: 0 },
  };

  inspections.forEach(ins => {
    const date = new Date(ins.created_at || ins.inspection_date);
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    if (activityMap[day]) {
      if (ins.status === 'Compliant') {
        activityMap[day].passes += 1;
      } else {
        activityMap[day].fails += 1;
      }
    }
  });

  const inspectionActivity = Object.keys(activityMap).map(key => ({
    name: key,
    passes: activityMap[key].passes,
    fails: activityMap[key].fails
  }));

  // Group violations by title
  const violationCounts: Record<string, number> = {};
  violations.forEach(v => {
    violationCounts[v.title] = (violationCounts[v.title] || 0) + 1;
  });

  const colors = ['#FF6B6B', '#F5B942', '#6366F1', '#3DD6B4', '#A855F7'];
  let vIndex = 0;
  const violationBreakdown = Object.keys(violationCounts)
    .sort((a, b) => violationCounts[b] - violationCounts[a])
    .slice(0, 5)
    .map(key => {
      const color = colors[vIndex % colors.length];
      vIndex++;
      return { name: key, value: violationCounts[key], color };
    });
    
  if (violationBreakdown.length === 0) {
    violationBreakdown.push({ name: 'No Violations', value: 1, color: '#E4E7EC' });
  }

  const recentInspections = inspections.slice(0, 5);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-content tracking-tight">Good morning, {user.name}</h1>
          <p className="text-content-muted mt-1">Here\'s an overview of your compliance activity across {user.region || 'your jurisdiction'}.</p>
        </div>
        <Link to="/dashboard/inspect">
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            New Inspection
          </Button>
        </Link>
      </div>

      {/* KPI Stats Row */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statsData.map((stat, i) => (
          <motion.div key={i} variants={item}>
            <Card hoverable className="h-full">
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-content-muted">{stat.title}</p>
                    <h3 className="text-3xl font-bold text-content mt-2">{loading ? \'-\' : stat.value}</h3>
                  </div>
                  <div className={\`p-2 rounded-xl \${
                    i === 0 ? 'bg-primary/10 text-primary' : 
                    i === 1 ? 'bg-emerald-100 text-emerald-600' : 
                    i === 2 ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                  }\`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  {stat.up ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-rose-500 mr-1" />
                  )}
                  <span className={stat.up ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}>
                    {stat.trend}
                  </span>
                  <span className="text-content-muted ml-1.5">vs last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Inspection Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center text-content-muted">Loading...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inspectionActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E7EC" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 12 }} />
                      <Tooltip 
                        cursor={{ fill: '#F6F8FB' }}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #E4E7EC', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="passes" name="Compliant" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="fails" name="Violations" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Violation Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div className="h-[220px] w-full relative">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center text-content-muted">Loading...</div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={violationBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {violationBreakdown.map((entry, index) => (
                            <Cell key={\`cell-\${index}\`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          itemStyle={{ color: '#101828', fontWeight: 500 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                      <span className="text-3xl font-bold text-content">{violations.length}</span>
                      <span className="text-xs text-content-muted font-medium uppercase tracking-wider">Total</span>
                    </div>
                  </>
                )}
              </div>
              <div className="w-full mt-2 space-y-2">
                {!loading && violationBreakdown.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                      <span className="text-content-muted truncate max-w-[150px]">{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Inspections Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle>Recent Inspections</CardTitle>
            <div className="flex space-x-2">
              <Button variant="secondary" size="sm" leftIcon={<Filter className="w-4 h-4" />}>
                Filter
              </Button>
              <Button variant="secondary" size="sm" leftIcon={<Search className="w-4 h-4" />}>
                Search
              </Button>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-content-muted uppercase bg-surface-light border-y border-border">
                <tr>
                  <th className="px-6 py-3 font-medium">ID</th>
                  <th className="px-6 py-3 font-medium">Product / Brand</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Score</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-content-muted">Loading inspections...</td>
                  </tr>
                ) : recentInspections.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-content-muted">No inspections found</td>
                  </tr>
                ) : (
                  recentInspections.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-light/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-content-muted text-xs">{item.id?.substring(0, 8)}...</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-content">{item.products?.name || 'Unknown Product'}</div>
                        <div className="text-xs text-content-muted">{item.products?.brand || 'Unknown Brand'}</div>
                      </td>
                      <td className="px-6 py-4 text-content-muted">{formatDate(item.created_at)}</td>
                      <td className="px-6 py-4">
                        <span className={\`font-bold \${getScoreColor(item.compliance_score || 0)}\`}>{(item.compliance_score || 0)}/100</span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link to={\`/dashboard/inspection/\${item.id}\`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" title="View Details">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link to={\`/dashboard/report/\${item.id}\`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" title="Generate Report">
                              <FileText className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border flex justify-center">
            <Link to="/dashboard/history" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
              View all inspections &rarr;
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
`;
fs.writeFileSync('src/pages/InspectorDashboard.tsx', content);
