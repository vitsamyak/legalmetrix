import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Checkbox } from '../components/ui/Checkbox';
import { Badge } from '../components/ui/Badge';
import { Search, Filter, MoreVertical, PackageSearch, Trash2, ChevronDown, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { BrandedLoader } from '../components/BrandedLoader';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { useToast } from '../components/Toast';
import { Link } from 'react-router-dom';

export const ProductsPage = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Close dropdown when clicking outside
  useEffect(() => {
    const closeDropdown = () => setActiveDropdown(null);
    window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase!
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
              score = lastInspection.compliance_score;
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedProducts.map(p => p.id)));
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
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} product(s)?`)) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase!
        .from('products')
        .delete()
        .in('id', Array.from(selectedIds));

      if (error) throw error;

      showToast(`Successfully deleted ${selectedIds.size} product(s).`, 'success');
      setProducts(prev => prev.filter(p => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
    } catch (err: any) {
      console.error('Error deleting products:', err);
      if (err.message?.includes('foreign key constraint')) {
        showToast('Cannot delete products that have existing inspections.', 'error');
      } else {
        showToast(err.message || 'Failed to delete products', 'error');
      }
    } finally {
      setIsDeleting(false);
    }
  };

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
              className="w-full pl-9 pr-4 py-2 bg-[#0F172A]/40 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm text-content"
            />
          </div>
          <div className="flex space-x-2">
            <div className="relative">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 pr-10 appearance-none bg-[#0F172A]/40 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] focus:bg-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 text-content rounded-xl outline-none text-sm font-medium"
              >
                <option>All Categories</option>
                <option>Packaged Food</option>
                <option>Cooking Oil</option>
                <option>Cosmetics</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted pointer-events-none" />
            </div>
            <Button variant="secondary" leftIcon={<Filter className="w-4 h-4" />}>
              Filters
            </Button>
          </div>
        </div>
        
        {selectedIds.size > 0 && (
          <div className="bg-primary/10 border-b border-primary/20 px-6 py-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <span className="text-sm font-medium text-primary">
              {selectedIds.size} product{selectedIds.size > 1 ? 's' : ''} selected
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
                  <Checkbox 
                    checked={paginatedProducts.length > 0 && paginatedProducts.every(item => selectedIds.has(item.id))}
                    onChange={handleSelectAll}
                  />
                </th>
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
                <>
                  {[1, 2, 3, 4, 5].map((idx) => (
                    <tr key={`skeleton-${idx}`}>
                      <td className="px-6 py-4"><SkeletonLoader className="h-4 w-4 rounded" /></td>
                      <td className="px-6 py-4 flex items-center space-x-3">
                        <SkeletonLoader className="w-10 h-10 rounded-lg" />
                        <div>
                          <SkeletonLoader className="h-4 w-32 mb-1" />
                          <SkeletonLoader className="h-3 w-20 bg-white/5" />
                        </div>
                      </td>
                      <td className="px-6 py-4"><SkeletonLoader className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><SkeletonLoader className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><SkeletonLoader className="h-4 w-12" /></td>
                      <td className="px-6 py-4"><SkeletonLoader className="h-6 w-24 rounded-full" /></td>
                      <td className="px-6 py-4 flex justify-end"><SkeletonLoader className="h-8 w-8 rounded-lg" /></td>
                    </tr>
                  ))}
                </>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-content-muted">No products found</td>
                </tr>
              ) : (
                paginatedProducts.map((item, index) => (
                  <motion.tr 
                    key={item.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className={`transition-colors ${selectedIds.has(item.id) ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-white/5'}`}
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={selectedIds.has(item.id)}
                        onChange={() => handleSelectOne(item.id)}
                      />
                    </td>
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
                        <span className={`font-bold ${item.score === null || item.score === undefined ? 'text-content-muted' : item.score >= 90 ? 'text-secondary' : item.score >= 70 ? 'text-warning' : 'text-danger'}`}>{item.score !== null && item.score !== undefined ? item.score + '/100' : '--/100'}</span>
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
                    <td className="px-6 py-4 text-right relative">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === item.id ? null : item.id);
                        }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                      
                      {activeDropdown === item.id && (
                        <div className="absolute right-8 top-10 w-48 bg-obsidian border border-border rounded-xl shadow-2xl z-50 overflow-hidden text-left" onClick={(e) => e.stopPropagation()}>
                          <Link 
                            to={`/products/${item.id}`}
                            className="w-full flex items-center px-4 py-3 text-sm text-content hover:bg-white/5 transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-3 text-primary" />
                            View Details
                          </Link>
                          <button 
                            onClick={() => {
                              setSelectedIds(new Set([item.id]));
                              setTimeout(() => handleBulkDelete(), 0);
                              setActiveDropdown(null);
                            }}
                            className="w-full flex items-center px-4 py-3 text-sm text-danger hover:bg-danger/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 mr-3" />
                            Delete Product
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-content-muted">
          <div>
            Showing {filteredProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} entries
          </div>
          <div className="flex space-x-1">
            <button 
              className="px-3 py-1 border border-border rounded-lg hover:bg-surface-light disabled:opacity-50" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              Previous
            </button>
            <button className="px-3 py-1 bg-primary text-white rounded-lg">{currentPage}</button>
            <button 
              className="px-3 py-1 border border-border rounded-lg hover:bg-surface-light disabled:opacity-50" 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
