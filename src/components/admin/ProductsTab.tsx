import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Loader2, Package, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Product } from './types';

const emptyProduct = {
  name: '', description: '', price: 0, category: 'coffee', temperature: 'hot', intensity: 3, image: '',
};

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('category').order('name');
    setProducts((data as Product[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.price) { toast.error('Name and price required'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        price: Number(form.price),
        category: form.category,
        temperature: form.temperature || null,
        intensity: form.intensity ? Number(form.intensity) : null,
        image: form.image || null,
      };

      if (editingId) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Product updated');
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
        toast.success('Product added');
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyProduct);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category,
      temperature: product.temperature || 'hot',
      intensity: product.intensity || 3,
      image: product.image || '',
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); return; }
    toast.success('Product deleted');
    fetchProducts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl text-secondary">Products</h2>
        <motion.button
          onClick={() => { setForm(emptyProduct); setEditingId(null); setShowForm(true); }}
          className="px-4 py-2 bg-accent text-accent-foreground rounded-full font-display text-sm flex items-center gap-2"
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={16} /> Add Product
        </motion.button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 max-w-md w-full space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg text-secondary">{editingId ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div><Label className="text-foreground text-xs">Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-muted/50 border-border" /></div>
              <div><Label className="text-foreground text-xs">Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-muted/50 border-border" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-foreground text-xs">Price (₦)</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="bg-muted/50 border-border" /></div>
                <div>
                  <Label className="text-foreground text-xs">Category</Label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full h-10 rounded-md bg-muted/50 border border-border px-3 text-foreground text-sm">
                    <option value="coffee">Coffee</option>
                    <option value="tea">Tea</option>
                    <option value="pastry">Pastry</option>
                    <option value="smoothie">Smoothie</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-foreground text-xs">Temperature</Label>
                  <select value={form.temperature || ''} onChange={e => setForm({ ...form, temperature: e.target.value })} className="w-full h-10 rounded-md bg-muted/50 border border-border px-3 text-foreground text-sm">
                    <option value="hot">Hot</option>
                    <option value="cold">Cold</option>
                    <option value="">N/A</option>
                  </select>
                </div>
                <div><Label className="text-foreground text-xs">Intensity (1-5)</Label><Input type="number" min={1} max={5} value={form.intensity || ''} onChange={e => setForm({ ...form, intensity: Number(e.target.value) })} className="bg-muted/50 border-border" /></div>
              </div>
              <div><Label className="text-foreground text-xs">Image URL</Label><Input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." className="bg-muted/50 border-border" /></div>
            </div>
            <motion.button onClick={handleSave} disabled={saving} className="w-full py-3 bg-accent text-accent-foreground rounded-full font-display flex items-center justify-center gap-2" whileTap={{ scale: 0.98 }}>
              {saving ? <Loader2 className="animate-spin" size={16} /> : null}
              {editingId ? 'Update Product' : 'Add Product'}
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* Products Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-display text-sm text-muted-foreground">Product</th>
                <th className="text-left p-4 font-display text-sm text-muted-foreground hidden sm:table-cell">Category</th>
                <th className="text-left p-4 font-display text-sm text-muted-foreground">Price</th>
                <th className="text-left p-4 font-display text-sm text-muted-foreground hidden md:table-cell">Temp</th>
                <th className="text-right p-4 font-display text-sm text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground"><Loader2 className="animate-spin mx-auto" size={24} /></td></tr>
              ) : products.map(product => (
                <tr key={product.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {product.image && <img src={product.image} alt={product.name} className="w-8 h-8 rounded-md object-cover" />}
                      <div>
                        <p className="text-foreground text-sm">{product.name}</p>
                        {product.description && <p className="text-muted-foreground text-xs truncate max-w-[200px]">{product.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell"><span className="px-2 py-1 rounded-full text-xs capitalize bg-muted text-muted-foreground">{product.category}</span></td>
                  <td className="p-4 font-display text-accent">₦{Number(product.price).toLocaleString('en-NG')}</td>
                  <td className="p-4 hidden md:table-cell text-muted-foreground text-sm capitalize">{product.temperature || '—'}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleEdit(product)} className="text-muted-foreground hover:text-accent transition-colors mr-2"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(product.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && products.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="mx-auto mb-3" size={40} />
              <p>No products yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
