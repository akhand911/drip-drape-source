import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type Gender = 'men' | 'women' | 'unisex';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  gender: Gender;
  isNew?: boolean;
  isSale?: boolean;
  salePrice?: number;
  inventory: number;
  features?: string[];
}

type DbProduct = {
  id: string;
  name: string;
  description: string;
  price: number | string;
  image_url: string;
  category: string;
  gender: string;
  is_new: boolean;
  is_sale: boolean;
  sale_price: number | string | null;
  inventory: number;
  features: string[] | null;
};

const fromDb = (p: DbProduct): Product => ({
  id: p.id,
  name: p.name,
  description: p.description,
  price: Number(p.price),
  imageUrl: p.image_url,
  category: p.category,
  gender: (p.gender as Gender) ?? 'unisex',
  isNew: p.is_new,
  isSale: p.is_sale,
  salePrice: p.sale_price != null ? Number(p.sale_price) : undefined,
  inventory: p.inventory,
  features: p.features ?? [],
});

export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return (data as DbProduct[]).map(fromDb);
};

export const getProductsByGender = async (gender: Gender): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .in('gender', gender === 'unisex' ? ['unisex'] : [gender, 'unisex']);
  if (error) { console.error(error); return []; }
  return (data as DbProduct[]).map(fromDb);
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  if (!id) return undefined;
  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
  if (error) { console.error(error); return undefined; }
  return data ? fromDb(data as DbProduct) : undefined;
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  const { data, error } = await supabase.from('products').select('*').eq('category', category);
  if (error) { console.error(error); return []; }
  return (data as DbProduct[]).map(fromDb);
};

// Admin operations
export const createProduct = async (p: Omit<Product, 'id'>): Promise<Product | null> => {
  const { data, error } = await supabase.from('products').insert({
    name: p.name,
    description: p.description,
    price: p.price,
    image_url: p.imageUrl,
    category: p.category,
    gender: p.gender,
    is_new: !!p.isNew,
    is_sale: !!p.isSale,
    sale_price: p.salePrice ?? null,
    inventory: p.inventory,
    features: p.features ?? [],
  }).select().single();
  if (error) { toast.error(error.message); return null; }
  toast.success('Product created');
  return fromDb(data as DbProduct);
};

export const updateProduct = async (id: string, p: Partial<Product>): Promise<void> => {
  const payload: {
    name?: string; description?: string; price?: number; image_url?: string;
    category?: string; gender?: string; is_new?: boolean; is_sale?: boolean;
    sale_price?: number | null; inventory?: number; features?: string[];
  } = {};
  if (p.name !== undefined) payload.name = p.name;
  if (p.description !== undefined) payload.description = p.description;
  if (p.price !== undefined) payload.price = p.price;
  if (p.imageUrl !== undefined) payload.image_url = p.imageUrl;
  if (p.category !== undefined) payload.category = p.category;
  if (p.gender !== undefined) payload.gender = p.gender;
  if (p.isNew !== undefined) payload.is_new = p.isNew;
  if (p.isSale !== undefined) payload.is_sale = p.isSale;
  if (p.salePrice !== undefined) payload.sale_price = p.salePrice ?? null;
  if (p.inventory !== undefined) payload.inventory = p.inventory;
  if (p.features !== undefined) payload.features = p.features;
  const { error } = await supabase.from('products').update(payload).eq('id', id);
  if (error) { toast.error(error.message); return; }
  toast.success('Product updated');
};

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) { toast.error(error.message); return; }
  toast.success('Product deleted');
};

// Cart (localStorage - client-side)
export const addToCart = async (productId: string, quantity: number = 1): Promise<void> => {
  try {
    const cartJson = localStorage.getItem('cart');
    const cart: { productId: string; quantity: number }[] = cartJson ? JSON.parse(cartJson) : [];
    const idx = cart.findIndex((i) => i.productId === productId);
    if (idx >= 0) cart[idx].quantity += quantity;
    else cart.push({ productId, quantity });
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success('Added to cart');
  } catch (e) {
    console.error(e);
    toast.error('Failed to add to cart');
  }
};

export const getCartWithProducts = async (): Promise<{ product: Product; quantity: number }[]> => {
  const cartJson = localStorage.getItem('cart');
  if (!cartJson) return [];
  const cart: { productId: string; quantity: number }[] = JSON.parse(cartJson);
  const results = await Promise.all(
    cart.map(async (item) => {
      const product = await getProductById(item.productId);
      return product ? { product, quantity: item.quantity } : null;
    })
  );
  return results.filter(Boolean) as { product: Product; quantity: number }[];
};

export const updateCartItemQuantity = (productId: string, quantity: number): void => {
  const cartJson = localStorage.getItem('cart');
  if (!cartJson) return;
  let cart: { productId: string; quantity: number }[] = JSON.parse(cartJson);
  if (quantity <= 0) {
    cart = cart.filter((i) => i.productId !== productId);
    toast.info('Item removed from cart');
  } else {
    const idx = cart.findIndex((i) => i.productId === productId);
    if (idx >= 0) cart[idx].quantity = quantity;
  }
  localStorage.setItem('cart', JSON.stringify(cart));
};

export const clearCart = (): void => {
  localStorage.removeItem('cart');
};
