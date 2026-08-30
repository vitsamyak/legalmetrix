import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ArrowLeft, CheckCircle2, History, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Disclaimer } from '../components/Disclaimer';
import { supabase } from '../lib/supabase';
import { BrandedLoader } from '../components/BrandedLoader';
import { useToast } from '../components/Toast';

export const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        if (!id) return;
        
        // Fetch product
        const { data: prodData, error: prodError } = await supabase!
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
          
        if (prodError) throw prodError;
        setProduct(prodData);

        // Fetch associated inspections
        const { data: insData, error: insError } = await supabase!
          .from('inspections')
          .select('*, profiles(full_name)')
          .eq('product_id', id)
          .order('created_at', { ascending: false });
          
        if (insError) throw insError;
        if (insData) setInspections(insData);
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [id]);

  if (loading) return <BrandedLoader />;
  if (!product) return <div className="p-8 text-center text-content-muted">Product not found</div>;

  const latestInspection = inspections.length > 0 ? inspections[0] : null;
  const avgScore = inspections.length > 0 
    ? Math.round(inspections.reduce((acc, curr) => acc + (curr.compliance_score || 0), 0) / inspections.length)
    : 0;

  const getStatusVariant = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'danger';
  };

  const getStatusText = (score: number) => {
    if (score >= 90) return 'Compliant';
    if (score >= 70) return 'Review';
    return 'Non-Compliant';
  };

  // Try to use extracted data from latest inspection for standard declarations
  const extractedData = latestInspection?.extracted_data || {};
  const standardDeclarations = [
    { name: 'Net Quantity', expected: 'Metric Weight', value: extractedData['Net Quantity'] || extractedData['net_quantity'] || 'N/A' },
    { name: 'MRP', expected: 'Inclusive of all taxes', value: extractedData['MRP'] || extractedData['mrp'] || 'N/A' },
    { name: 'Manufacturer', expected: 'Name and address', value: extractedData['Manufacturer'] || extractedData['manufacturer_details'] || 'N/A' },
  ].filter(d => d.value && d.value !== 'N/A');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-4 mb-2">
        <Link to="/products">
          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full border border-border">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold font-heading text-content tracking-tight">{product.name}</h1>
            {latestInspection ? (
              <Badge variant={getStatusVariant(latestInspection.compliance_score)}>
                {latestInspection.status || getStatusText(latestInspection.compliance_score)}
              </Badge>
            ) : (
              <Badge variant="neutral">Uninspected</Badge>
            )}
          </div>
          <p className="text-content-muted mt-1">Product ID: {product.id} • Brand: {product.brand || 'Unknown'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Info & Image */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4 bg-obsidian flex justify-center border-b border-border min-h-[200px] items-center">
              {latestInspection?.image_url ? (
                <img 
                  src={latestInspection.image_url} 
                  alt="Product" 
                  className="w-48 h-48 object-contain rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-content-faint">
                  <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                  <span className="text-sm">No Image Available</span>
                </div>
              )}
            </CardContent>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-content-faint mb-1 text-xs uppercase">Category</div>
                  <div className="text-content font-medium truncate" title={product.category || 'N/A'}>{product.category || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-content-faint mb-1 text-xs uppercase">Last Scanned</div>
                  <div className="text-content font-medium">
                    {latestInspection ? new Date(latestInspection.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Never'}
                  </div>
                </div>
                <div>
                  <div className="text-content-faint mb-1 text-xs uppercase">Avg Score</div>
                  <div className={`font-bold ${avgScore >= 90 ? 'text-emerald-400' : avgScore >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                    {inspections.length > 0 ? `${avgScore}/100` : '--/100'}
                  </div>
                </div>
                <div>
                  <div className="text-content-faint mb-1 text-xs uppercase">Total Inspections</div>
                  <div className="text-content font-medium">{inspections.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Inspection History & Declarations */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b border-border py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center">
                <History className="w-4 h-4 mr-2" /> Recent Inspections
              </CardTitle>
              <Link to="/inspections">
                <Button variant="secondary" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-content-muted uppercase bg-obsidian border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Inspector</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface-secondary">
                  {inspections.length > 0 ? (
                    inspections.slice(0, 5).map((ins) => (
                      <tr key={ins.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => window.location.href = `/inspections/${ins.id}`}>
                        <td className="px-4 py-3 text-content">
                          {new Date(ins.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-content-muted">{ins.profiles?.full_name || 'Inspector'}</td>
                        <td className={`px-4 py-3 font-bold ${ins.compliance_score >= 90 ? 'text-emerald-400' : ins.compliance_score >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                          {ins.compliance_score}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={getStatusVariant(ins.compliance_score)}>
                            {ins.status || getStatusText(ins.compliance_score)}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-content-muted">
                        No inspections found for this product.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <CardHeader className="border-b border-border py-4">
              <CardTitle className="text-base">Standard Declarations (LMPC 2011)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {standardDeclarations.length > 0 ? (
                  standardDeclarations.map((decl, idx) => (
                    <div key={idx} className="p-4 flex items-start justify-between hover:bg-white/5 transition-colors">
                      <div>
                        <h4 className="font-medium text-content">{decl.name}</h4>
                        <p className="text-sm text-content-muted mt-1">Expected: {decl.expected}</p>
                      </div>
                      <div className="flex items-center text-emerald-400 text-right max-w-[50%]">
                        <CheckCircle2 className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate" title={decl.value}>Found: {decl.value}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-content-muted">
                    No standard declarations extracted yet. Please run an inspection.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Disclaimer />
    </div>
  );
};

