import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type Product,
  type Gender,
} from '@/services/productService';
import { getAllOrders, updateOrderStatus, type Order } from '@/services/orderService';
import { isCurrentUserAdmin } from '@/services/userService';
import { Trash2, Pencil, Plus } from 'lucide-react';

const empty: Omit<Product, 'id'> = {
  name: '', description: '', price: 0, imageUrl: '', category: '',
  gender: 'unisex', isNew: false, isSale: false, salePrice: undefined,
  inventory: 0, features: [],
};

const STATUSES: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const Admin = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, 'id'>>(empty);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || !user) { navigate('/login'); return; }
    isCurrentUserAdmin(user.id).then((ok) => {
      setIsAdmin(ok);
      setChecking(false);
      if (!ok) toast.error('Admin access required');
    });
  }, [user, isAuthenticated, loading, navigate]);

  const refreshProducts = async () => setProducts(await getProducts());
  const refreshOrders = async () => setOrders(await getAllOrders());
  useEffect(() => { if (isAdmin) { refreshProducts(); refreshOrders(); } }, [isAdmin]);

  const startEdit = (p: Product) => { setEditing(p); setForm({ ...p }); };
  const reset = () => { setEditing(null); setForm(empty); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) await updateProduct(editing.id, form);
    else await createProduct(form);
    reset();
    refreshProducts();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await deleteProduct(id);
    refreshProducts();
  };

  const changeStatus = async (orderId: string, status: Order['status']) => {
    await updateOrderStatus(orderId, status);
    refreshOrders();
  };

  if (loading || checking) {
    return (
      <><Navbar />
        <div className="max-w-7xl mx-auto py-24 text-center">Loading…</div>
        <Footer /></>
    );
  }
  if (!isAdmin) {
    return (
      <><Navbar />
        <div className="max-w-7xl mx-auto py-24 text-center">
          <h1 className="text-2xl font-bold text-amber-600">Admin Access Required</h1>
          <p className="mt-2 text-muted-foreground">Your account is not an admin.</p>
        </div>
        <Footer /></>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        <h1 className="text-3xl font-bold text-amber-600">Admin Dashboard</h1>

        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{editing ? `Edit: ${editing.name}` : 'Add New Product'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                  <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required /></div>
                  <div className="md:col-span-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                  <div className="md:col-span-2"><Label>Image URL</Label><Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></div>
                  <div><Label>Price</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} required /></div>
                  <div><Label>Inventory</Label><Input type="number" value={form.inventory} onChange={(e) => setForm({ ...form, inventory: parseInt(e.target.value) || 0 })} /></div>
                  <div>
                    <Label>Gender</Label>
                    <select className="w-full border rounded-md h-10 px-3" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}>
                      <option value="men">Men</option><option value="women">Women</option><option value="unisex">Unisex</option>
                    </select>
                  </div>
                  <div><Label>Sale Price (optional)</Label><Input type="number" step="0.01" value={form.salePrice ?? ''} onChange={(e) => setForm({ ...form, salePrice: e.target.value ? parseFloat(e.target.value) : undefined })} /></div>
                  <div className="flex items-center gap-2"><Switch checked={form.isNew} onCheckedChange={(v) => setForm({ ...form, isNew: v })} /><Label>Mark as New</Label></div>
                  <div className="flex items-center gap-2"><Switch checked={form.isSale} onCheckedChange={(v) => setForm({ ...form, isSale: v })} /><Label>On Sale</Label></div>
                  <div className="md:col-span-2 flex gap-2">
                    <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                      <Plus className="w-4 h-4 mr-1" />{editing ? 'Update' : 'Create'}
                    </Button>
                    {editing && <Button type="button" variant="outline" onClick={reset}>Cancel</Button>}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>All Products ({products.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="divide-y">
                  {products.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-3 gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded object-cover flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium truncate">{p.name}</div>
                          <div className="text-sm text-muted-foreground">{p.category} · {p.gender} · ${p.price} · {p.inventory} in stock</div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="sm" variant="outline" onClick={() => startEdit(p)}><Pencil className="w-4 h-4" /></Button>
                        <Button size="sm" variant="outline" onClick={() => remove(p.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader><CardTitle>All Orders</CardTitle></CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-muted-foreground py-4">No orders yet.</p>
                ) : (
                  <div className="divide-y">
                    {orders.map((o) => (
                      <div key={o.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs text-muted-foreground">{o.id.slice(0, 8)}</span>
                            <Badge className="bg-amber-100 text-amber-800">{o.status}</Badge>
                            <span className="text-sm">${o.total.toFixed(2)}</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {o.shippingAddress.fullName} · {o.items.length} item{o.items.length !== 1 ? 's' : ''} · {new Date(o.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <select
                          className="border rounded-md h-9 px-2 text-sm"
                          value={o.status}
                          onChange={(e) => changeStatus(o.id, e.target.value as Order['status'])}
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  );
};

export default Admin;
