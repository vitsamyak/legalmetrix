import fs from 'fs';
const content = `import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Search, Filter, MoreVertical, PackageSearch } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const ProductsPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, inspections(created_at, compliance_score, status)')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          const formatted = data.map(product => {
            // Find most recent inspection if any
            let lastInspection = null;
            let score = 0;
            let status = 'Unknown';
            let date = 'N/A';
            
            if (product.inspections && product.inspections.length > 0) {
              const sorted = [...product.inspections].sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
              lastInspection = sorted[0];
              score = lastInspection.compliance_score || 0;
              status = lastInspection.status || 'Unknown';
              date = new Date(lastInspection.created_at).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });
            }
            
            return {
              ...product,
              score,
              status,
              lastInspection: date
            };
          });
          setProducts(formatted);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(item => {
    const matchesSearch = 
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesCategory = categoryFilter === 'All Categories' || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-content tracking-tight">Product Repository</h1>
          <p className="text-content-muted mt-1">Search, review and manage inspected packaged commodities.</p>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-faint" />
            <input 
              type="text" 
              placeholder="Search by product name, brand..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-obsidian border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm text-content"
            />
          </div>
          <div className="flex space-x-2">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-obsidian border border-border text-content rounded-xl outline-none text-sm font-medium"
            >
              <option>All Categories</option>
              <option>Packaged Food</option>
              <option>Cooking Oil</option>
              <option>Cosmetics</option>
            </select>
            <Button variant="secondary" leftIcon={<Filter className="w-4 h-4" />}>
              Filters
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-content-muted uppercase bg-obsidian border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Product / Brand</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Last Inspection</th>
                <th className="px-6 py-4 font-medium">Score</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface-secondary">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-content-muted">Loading products...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-content-muted">No products found</td>
                </tr>
              ) : (
                filteredProducts.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-obsidian flex items-center justify-center border border-border">
                        <PackageSearch className="w-5 h-5 text-content-faint" />
                      </div>
                      <div>
                        <div className="font-medium text-content">{item.name}</div>
                        <div className="text-xs text-content-muted">{item.brand || 'No brand'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-content-muted">{item.category || 'N/A'}</td>
                    <td className="px-6 py-4 text-content-muted">{item.lastInspection}</td>
                    <td className="px-6 py-4">
                      {item.lastInspection !== 'N/A' ? (
                        <span className={\`font-bold \${item.score >= 90 ? 'text-secondary' : item.score >= 70 ? 'text-warning' : 'text-danger'}\`}>{item.score}/100</span>
                      ) : (
                        <span className="text-content-muted">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.lastInspection !== 'N/A' ? (
                        <Badge variant={item.status === 'Compliant' ? 'success' : item.status === 'Non-Compliant' ? 'danger' : 'warning'}>
                          {item.status}
                        </Badge>
                      ) : (
                        <span className="text-content-muted text-xs">Uninspected</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
`;
fs.writeFileSync('src/pages/ProductsPage.tsx', content);
