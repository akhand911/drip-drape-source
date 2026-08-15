
-- Roles enum + user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  marketing_emails BOOLEAN NOT NULL DEFAULT false,
  order_notifications BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  gender TEXT NOT NULL DEFAULT 'unisex' CHECK (gender IN ('men','women','unisex')),
  is_new BOOLEAN NOT NULL DEFAULT false,
  is_sale BOOLEAN NOT NULL DEFAULT false,
  sale_price NUMERIC(10,2),
  inventory INTEGER NOT NULL DEFAULT 0,
  features TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update products" ON public.products FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete products" ON public.products FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','shipped','delivered','cancelled')),
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','refunded')),
  shipping_full_name TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_zip TEXT NOT NULL,
  shipping_country TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users create own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Order items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "Users create own order items" ON public.order_items FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

-- Seed products
INSERT INTO public.products (name, description, price, image_url, category, gender, is_new, is_sale, sale_price, inventory, features) VALUES
('Oversized Printed Tee','Comfortable oversized t-shirt with unique graphic prints. Made from 100% organic cotton for maximum comfort and durability.',49.99,'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000','T-Shirts','unisex',true,false,NULL,25,ARRAY['100% Organic Cotton','Oversized Fit','Machine Washable']),
('Cargo Pants','Versatile cargo pants with multiple pockets. Perfect for both style and functionality.',79.99,'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?q=80&w=1000','Pants','men',false,true,59.99,15,ARRAY['Durable Material','Multiple Pockets','Adjustable Waist']),
('Graphic Hoodie','Warm and stylish hoodie with custom graphics. Features a comfortable fleece lining and adjustable hood.',89.99,'https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?q=80&w=1000','Hoodies','unisex',false,false,NULL,20,ARRAY['Fleece Lined','Front Pocket','Drawstring Hood']),
('Utility Jacket','Weather-resistant utility jacket with modern design. Perfect for layering and outdoor activities.',129.99,'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1000','Jackets','men',true,false,NULL,10,ARRAY['Water Resistant','Multiple Pockets','Adjustable Cuffs']),
('Slim Fit Jeans','Classic slim fit jeans with modern wash. Comfortable stretch denim for everyday wear.',69.99,'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1000','Jeans','men',false,false,NULL,30,ARRAY['Stretch Denim','Slim Fit','5 Pocket Design']),
('Designer Sneakers','Premium designer sneakers with unique patterns. Comfortable for all-day wear.',149.99,'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1000','Shoes','unisex',false,true,119.99,8,ARRAY['Premium Materials','Cushioned Insole','Rubber Outsole']),
('Vintage Denim Jacket','Classic denim jacket with a vintage wash and comfortable fit. Perfect for layering in any season.',89.99,'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?q=80&w=1000','Jackets','women',false,false,NULL,18,ARRAY['100% Cotton Denim','Button Closure','Multiple Pockets']),
('Relaxed Linen Shirt','Breathable linen shirt with a relaxed fit for warm weather comfort and style.',59.99,'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1000','Shirts','men',true,false,NULL,22,ARRAY['100% Linen','Breathable Fabric','Relaxed Fit']),
('High-Waisted Shorts','Trendy high-waisted shorts with a flattering fit and premium denim construction.',54.99,'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=1000','Shorts','women',false,false,NULL,15,ARRAY['High Waisted','Frayed Hem','Stretch Denim']),
('Leather Crossbody Bag','Stylish leather crossbody bag with adjustable strap and multiple compartments for organization.',79.99,'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=1000','Accessories','women',false,true,59.99,12,ARRAY['Genuine Leather','Adjustable Strap','Multiple Compartments']),
('Knit Beanie','Cozy knit beanie made from soft yarn. Perfect for keeping warm during cold weather.',29.99,'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=1000','Accessories','unisex',false,false,NULL,30,ARRAY['Soft Knit Material','Ribbed Design','One Size Fits Most']),
('Retro Sunglasses','Vintage-inspired sunglasses with UV protection and durable frames. Adds instant style to any outfit.',39.99,'https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=1000','Accessories','unisex',true,false,NULL,25,ARRAY['UV Protection','Retro Design','Durable Frame']),
('Floral Midi Dress','Flowy midi dress with vibrant floral print. Perfect for sunny days and casual outings.',74.99,'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000','Dresses','women',true,false,NULL,20,ARRAY['Flowy Fit','Floral Print','Lightweight Fabric']),
('Streetwear Joggers','Comfortable joggers with tapered fit and elastic cuffs. Ideal for a laid-back streetwear look.',64.99,'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?q=80&w=1000','Pants','men',false,false,NULL,25,ARRAY['Tapered Fit','Elastic Cuffs','Side Pockets']),
('Ribbed Crop Top','Trendy ribbed crop top with a fitted silhouette. A must-have for Gen Z wardrobes.',34.99,'https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=1000','Tops','women',false,true,24.99,28,ARRAY['Ribbed Fabric','Cropped Length','Stretch Fit']);
