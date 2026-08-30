import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, FileCheck2, AlertTriangle, TrendingDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BrandedLoader } from '../components/BrandedLoader';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { BlurText } from '../components/ui/BlurText';

export const AnalyticsPage = () => {
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data, error } = await supabase!
          .from('inspections')
          .select('*, violations(id)');
          
        if (error) throw error;
        
        if (data) {
          setInspections(data);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  const calculateMetrics = () => {
    if (inspections.length === 0) {
      return {
        complianceRate: 0,
        totalViolations: 0,
        averageScore: 0,
        trendData: []
      };
    }

    const compliantCount = inspections.filter(i => i.status === 'Compliant').length;
    const complianceRate = ((compliantCount / inspections.length) * 100).toFixed(1);
    
    let totalViolations = 0;
    inspections.forEach(i => {
      if (i.violations && i.violations.length > 0) {
        totalViolations += i.violations.length;
      } else if (i.status === 'Non-Compliant') {
        totalViolations += 1;
      }
    });

    const inspectionsWithScore = inspections.filter(i => i.compliance_score !== null && i.compliance_score !== undefined);
    const totalScore = inspectionsWithScore.reduce((acc, curr) => acc + curr.compliance_score, 0);
    const averageScore = inspectionsWithScore.length > 0 ? Math.round(totalScore / inspectionsWithScore.length) : '--';

    // Build trend data by month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyStats: Record<string, { total: number, compliant: number, violations: number }> = {};
    
    inspections.forEach(i => {
      const date = new Date(i.created_at);
      const monthName = months[date.getMonth()];
      
      if (!monthlyStats[monthName]) {
        monthlyStats[monthName] = { total: 0, compliant: 0, violations: 0 };
      }
      
      monthlyStats[monthName].total += 1;
      if (i.status === 'Compliant') {
        monthlyStats[monthName].compliant += 1;
      } else {
        monthlyStats[monthName].violations += 1;
      }
    });

    const trendData = Object.keys(monthlyStats).map(month => {
      const stats = monthlyStats[month];
      const compPct = (stats.compliant / stats.total) * 100;
      const violPct = (stats.violations / stats.total) * 100;
      return {
        name: month,
        compliance: Math.round(compPct),
        violations: Math.round(violPct)
      };
    });

    return {
      complianceRate,
      totalViolations,
      averageScore,
      trendData
    };
  };

  const { complianceRate, totalViolations, averageScore, trendData } = calculateMetrics();

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <BlurText 
          text="Compliance Analytics" 
          delay={50} 
          className="text-2xl font-bold font-heading text-content tracking-tight mb-2" 
        />
        <p className="text-content-muted mt-1">Monitor inspection trends, violations and enforcement activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-content-muted">Compliance Rate</p>
                {loading ? (
                  <SkeletonLoader className="h-8 w-16 mt-2" />
                ) : (
                  <h3 className="text-3xl font-bold text-content mt-2">{`${complianceRate}%`}</h3>
                )}
              </div>
              <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
                <FileCheck2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 text-sm text-secondary flex items-center font-medium">
              <TrendingUp className="w-4 h-4 mr-1" /> Dynamic Data
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-content-muted">Total Violations</p>
                {loading ? (
                  <SkeletonLoader className="h-8 w-16 mt-2" />
                ) : (
                  <h3 className="text-3xl font-bold text-content mt-2">{totalViolations}</h3>
                )}
              </div>
              <div className="p-3 bg-danger/10 rounded-xl text-danger">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 text-sm text-content-muted flex items-center font-medium">
              Calculated from inspections
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-content-muted">Average Score</p>
                {loading ? (
                  <SkeletonLoader className="h-8 w-16 mt-2" />
                ) : (
                  <h3 className="text-3xl font-bold text-content mt-2">{averageScore === '--' ? '--/100' : `${averageScore}/100`}</h3>
                )}
              </div>
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 text-sm text-content-muted flex items-center">
              Based on all records
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inspection Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            {loading ? (
              <SkeletonLoader className="w-full h-full rounded-xl bg-white/5" />
            ) : trendData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-content-muted">Not enough data to display trends</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8' }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ backgroundColor: '#090C15', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#F8FAFC', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                  />
                  <Bar dataKey="compliance" name="Compliant (%)" fill="#3DD6B4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="violations" name="Violations (%)" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
