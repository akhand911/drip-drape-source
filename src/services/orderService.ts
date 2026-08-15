import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getProductById } from "./productService";

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
}

export const createOrder = async (
  userId: string,
  items: { productId: string; quantity: number }[],
  shippingAddress: ShippingAddress,
  paymentMethod: string
): Promise<Order> => {
  const enriched = await Promise.all(
    items.map(async (i) => {
      const product = await getProductById(i.productId);
      if (!product) throw new Error(`Product ${i.productId} not found`);
      const price = product.isSale && product.salePrice ? product.salePrice : product.price;
      return { productId: i.productId, productName: product.name, price, quantity: i.quantity };
    })
  );
  const total = enriched.reduce((s, it) => s + it.price * it.quantity, 0);

  const { data: orderRow, error: orderErr } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      total,
      status: 'pending',
      payment_method: paymentMethod,
      payment_status: 'pending',
      shipping_full_name: shippingAddress.fullName,
      shipping_address: shippingAddress.address,
      shipping_city: shippingAddress.city,
      shipping_state: shippingAddress.state,
      shipping_zip: shippingAddress.zipCode,
      shipping_country: shippingAddress.country,
    })
    .select()
    .single();
  if (orderErr || !orderRow) {
    toast.error(orderErr?.message || 'Failed to place order');
    throw orderErr;
  }

  const { error: itemsErr } = await supabase.from('order_items').insert(
    enriched.map((it) => ({
      order_id: orderRow.id,
      product_id: it.productId,
      product_name: it.productName,
      price: it.price,
      quantity: it.quantity,
    }))
  );
  if (itemsErr) {
    toast.error(itemsErr.message);
    throw itemsErr;
  }

  toast.success('Order placed successfully');
  return {
    id: orderRow.id,
    userId,
    items: enriched,
    total,
    status: 'pending',
    createdAt: orderRow.created_at,
    updatedAt: orderRow.updated_at,
    shippingAddress,
    paymentMethod,
    paymentStatus: 'pending',
  };
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return (data ?? []).map((o): Order => ({
    id: o.id,
    userId: o.user_id,
    total: Number(o.total),
    status: o.status as Order['status'],
    createdAt: o.created_at,
    updatedAt: o.updated_at,
    paymentMethod: o.payment_method,
    paymentStatus: o.payment_status as Order['paymentStatus'],
    shippingAddress: {
      fullName: o.shipping_full_name,
      address: o.shipping_address,
      city: o.shipping_city,
      state: o.shipping_state,
      zipCode: o.shipping_zip,
      country: o.shipping_country,
    },
    items: (o.order_items ?? []).map((it: {
      product_id: string | null;
      product_name: string;
      quantity: number;
      price: number | string;
    }) => ({
      productId: it.product_id ?? '',
      productName: it.product_name,
      quantity: it.quantity,
      price: Number(it.price),
    })),
  }));
};

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<void> => {
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
  if (error) { toast.error(error.message); return; }
  toast.success(`Order status updated to ${status}`);
};

const mapOrderRow = (o: {
  id: string; user_id: string; total: number | string; status: string;
  created_at: string; updated_at: string; payment_method: string; payment_status: string;
  shipping_full_name: string; shipping_address: string; shipping_city: string;
  shipping_state: string; shipping_zip: string; shipping_country: string;
  order_items?: { product_id: string | null; product_name: string; quantity: number; price: number | string }[];
}): Order => ({
  id: o.id,
  userId: o.user_id,
  total: Number(o.total),
  status: o.status as Order['status'],
  createdAt: o.created_at,
  updatedAt: o.updated_at,
  paymentMethod: o.payment_method,
  paymentStatus: o.payment_status as Order['paymentStatus'],
  shippingAddress: {
    fullName: o.shipping_full_name,
    address: o.shipping_address,
    city: o.shipping_city,
    state: o.shipping_state,
    zipCode: o.shipping_zip,
    country: o.shipping_country,
  },
  items: (o.order_items ?? []).map((it) => ({
    productId: it.product_id ?? '',
    productName: it.product_name,
    quantity: it.quantity,
    price: Number(it.price),
  })),
});

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .maybeSingle();
  if (error) { console.error(error); return null; }
  return data ? mapOrderRow(data) : null;
};

export const getAllOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return (data ?? []).map(mapOrderRow);
};
