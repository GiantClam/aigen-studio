-- Workspaces table: 用户工作区
create table if not exists public.nanobanana_workspace (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  title text default '我的工作区',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User canvas table: 用户画布
create table if not exists public.nanobanana_user_canvas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  workspace_id uuid references public.nanobanana_workspace(id) on delete cascade,
  canvas_title text,
  canvas_json jsonb,
  tasks jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Canvas task table: 画布任务
create table if not exists public.nanobanana_canvas_task (
  id uuid primary key default gen_random_uuid(),
  canvas_id uuid references public.nanobanana_user_canvas(id) on delete cascade,
  task_id text not null,
  status text not null check (status in ('pending','in_progress','failed','succeeded')),
  status_code text null,
  payload jsonb null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 简单索引
create index if not exists idx_nanobanana_workspace_user on public.nanobanana_workspace(user_id);
create index if not exists idx_nanobanana_user_canvas_user on public.nanobanana_user_canvas(user_id);
create index if not exists idx_nanobanana_user_canvas_workspace on public.nanobanana_user_canvas(workspace_id);
create index if not exists idx_nanobanana_canvas_task_canvas on public.nanobanana_canvas_task(canvas_id);

-- Templates table: 扩展的模板表
create table if not exists public.nanobanana_templates (
  id text primary key,
  name text not null,
  slug text,
  image_url text not null,
  prompt text not null,
  type text not null,
  description text, -- 模板描述
  category_id text, -- 模板分类ID
  tags text[], -- 模板标签数组
  difficulty_level text check (difficulty_level in ('beginner', 'intermediate', 'advanced')), -- 难度等级
  estimated_time integer, -- 预计完成时间（分钟）
  parameters jsonb default '{}'::jsonb, -- 模板参数配置
  preview_images text[], -- 预览图片数组
  is_featured boolean default false, -- 是否推荐
  is_premium boolean default false, -- 是否付费模板
  usage_count integer default 0, -- 使用次数
  rating numeric(2,1) default 0.0, -- 评分（0-5）
  rating_count integer default 0, -- 评分人数
  author_id text, -- 作者ID
  author_name text, -- 作者名称
  isvalid boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.nanobanana_templates
  add column if not exists slug text,
  add column if not exists category_id text,
  add column if not exists description text,
  add column if not exists parameters jsonb default '{}'::jsonb,
  add column if not exists preview_images text[],
  add column if not exists is_featured boolean default false,
  add column if not exists is_premium boolean default false,
  add column if not exists isvalid boolean default true,
  add column if not exists author_id text,
  add column if not exists usage_count integer default 0,
  add column if not exists rating numeric(2,1) default 0.0,
  add column if not exists rating_count integer default 0,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- Template categories table: 模板分类表
create table if not exists public.nanobanana_template_categories (
  id text primary key,
  name text not null,
  description text,
  icon text, -- 分类图标URL或图标名称
  color text, -- 分类颜色
  order_index integer default 0, -- 排序索引
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Template user favorites table: 用户收藏模板表
create table if not exists public.nanobanana_template_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  template_id text not null references public.nanobanana_templates(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, template_id)
);

-- Template user ratings table: 用户评分表
create table if not exists public.nanobanana_template_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  template_id text not null references public.nanobanana_templates(id) on delete cascade,
  rating integer check (rating >= 1 and rating <= 5),
  review text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, template_id)
);

-- Template usage history table: 模板使用历史表
create table if not exists public.nanobanana_template_usage_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  template_id text not null references public.nanobanana_templates(id) on delete cascade,
  canvas_id uuid references public.nanobanana_user_canvas(id) on delete set null,
  usage_type text not null check (usage_type in ('view', 'use', 'favorite', 'share')),
  created_at timestamptz not null default now()
);

-- Create indexes for better performance
create index if not exists idx_nanobanana_templates_type on public.nanobanana_templates(type);
create index if not exists idx_nanobanana_templates_category on public.nanobanana_templates(category_id);
create index if not exists idx_nanobanana_templates_featured on public.nanobanana_templates(is_featured) where is_featured = true;
create index if not exists idx_nanobanana_templates_premium on public.nanobanana_templates(is_premium) where is_premium = true;
create index if not exists idx_nanobanana_templates_valid on public.nanobanana_templates(isvalid) where isvalid = true;
create index if not exists idx_nanobanana_templates_author on public.nanobanana_templates(author_id);
create index if not exists idx_nanobanana_templates_usage on public.nanobanana_templates(usage_count desc);
create index if not exists idx_nanobanana_templates_rating on public.nanobanana_templates(rating desc);
create index if not exists idx_nanobanana_templates_created on public.nanobanana_templates(created_at desc);
create unique index if not exists idx_nanobanana_templates_slug on public.nanobanana_templates(slug);

-- RPC: increment template usage_count atomically
create or replace function public.increment_template_usage(
  tpl_id text,
  inc integer default 1
)
returns integer
language sql
security definer
as $$
  update public.nanobanana_templates
  set usage_count = coalesce(usage_count, 0) + inc,
      updated_at = now()
  where id = tpl_id
  returning usage_count;
$$;
drop index if exists public.idx_nanobanana_templates_name;

create index if not exists idx_nanobanana_template_categories_active on public.nanobanana_template_categories(is_active) where is_active = true;
create index if not exists idx_nanobanana_template_categories_order on public.nanobanana_template_categories(order_index);

create index if not exists idx_nanobanana_template_favorites_user on public.nanobanana_template_favorites(user_id);
create index if not exists idx_nanobanana_template_favorites_template on public.nanobanana_template_favorites(template_id);

create index if not exists idx_nanobanana_template_ratings_user on public.nanobanana_template_ratings(user_id);
create index if not exists idx_nanobanana_template_ratings_template on public.nanobanana_template_ratings(template_id);
create index if not exists idx_nanobanana_template_ratings_rating on public.nanobanana_template_ratings(rating);

create index if not exists idx_nanobanana_template_usage_history_user on public.nanobanana_template_usage_history(user_id);
create index if not exists idx_nanobanana_template_usage_history_template on public.nanobanana_template_usage_history(template_id);
create index if not exists idx_nanobanana_template_usage_history_type on public.nanobanana_template_usage_history(usage_type);
create index if not exists idx_nanobanana_template_usage_history_created on public.nanobanana_template_usage_history(created_at desc);

-- Insert default template categories
insert into public.nanobanana_template_categories (id, name, description, icon, color, order_index) values
('nature', '自然风景', '山水、花草、天空等自然元素模板', 'mountain', '#10B981', 1),
('portrait', '人像艺术', '人物肖像、表情、姿态等模板', 'user', '#F59E0B', 2),
('abstract', '抽象艺术', '几何图形、色彩组合、抽象概念模板', 'shapes', '#8B5CF6', 3),
('architecture', '建筑设计', '建筑、城市景观、室内设计模板', 'building', '#EF4444', 4),
('animals', '动物世界', '各种动物、宠物、野生动物模板', 'paw-print', '#06B6D4', 5),
('food', '美食料理', '食物、饮品、餐厅相关模板', 'utensils', '#F97316', 6),
('fashion', '时尚设计', '服装、配饰、时尚元素模板', 'shirt', '#EC4899', 7),
('technology', '科技未来', '科技产品、未来概念、数字艺术模板', 'microchip', '#6366F1', 8),
('minimalist', '极简主义', '简约风格、极简设计模板', 'circle', '#6B7280', 9),
('vintage', '复古怀旧', '复古风格、怀旧元素模板', 'clock', '#D97706', 10)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  color = excluded.color,
  order_index = excluded.order_index,
  updated_at = now();

-- Insert sample templates with expanded data
insert into public.nanobanana_templates (id, name, image_url, prompt, type, description, category_id, tags, difficulty_level, estimated_time, parameters, preview_images, is_featured, author_name) values
('tpl_001', '梦幻森林', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800', 'a magical forest with glowing lights, fantasy atmosphere, ethereal mood, digital art', 'nature', '一个充满魔幻色彩的森林场景，适合创作梦幻风格的作品', 'nature', array['forest', 'magical', 'fantasy', 'glowing'], 'beginner', 15, '{"style": "fantasy", "lighting": "ethereal", "color_palette": "magical"}', array['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400', 'https://images.unsplash.com/photo-1511497584788-876760111969?w=400'], true, 'AI设计师'),
('tpl_002', '现代肖像', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800', 'modern portrait photography, clean background, professional lighting, high quality', 'portrait', '现代风格的人像摄影模板，适合创作专业肖像作品', 'portrait', array['portrait', 'modern', 'professional', 'clean'], 'intermediate', 20, '{"style": "modern", "lighting": "professional", "background": "clean"}', array['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400'], true, '摄影师小王'),
('tpl_003', '抽象几何', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800', 'abstract geometric patterns, vibrant colors, modern art, creative design', 'abstract', '抽象几何图案模板，充满现代艺术感', 'abstract', array['abstract', 'geometric', 'modern', 'colorful'], 'beginner', 10, '{"style": "abstract", "shapes": "geometric", "colors": "vibrant"}', array['https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400'], false, '艺术设计师'),
('tpl_004', '城市建筑', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800', 'urban architecture, modern buildings, city skyline, architectural photography', 'architecture', '现代城市建筑模板，展现都市美学', 'architecture', array['architecture', 'urban', 'modern', 'city'], 'intermediate', 25, '{"style": "architectural", "subject": "buildings", "mood": "urban"}', array['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400'], true, '建筑摄影师'),
('tpl_005', '可爱宠物', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800', 'cute pet photography, adorable animals, heartwarming moments, high quality', 'animals', '可爱宠物摄影模板，捕捉温馨时刻', 'animals', array['pets', 'cute', 'adorable', 'heartwarming'], 'beginner', 15, '{"style": "cute", "subject": "pets", "mood": "heartwarming"}', array['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'], false, '宠物摄影师')
on conflict (id) do update set
  name = excluded.name,
  image_url = excluded.image_url,
  prompt = excluded.prompt,
  type = excluded.type,
  description = excluded.description,
  category_id = excluded.category_id,
  tags = excluded.tags,
  difficulty_level = excluded.difficulty_level,
  estimated_time = excluded.estimated_time,
  parameters = excluded.parameters,
  preview_images = excluded.preview_images,
  is_featured = excluded.is_featured,
  author_name = excluded.author_name,
  updated_at = now();

update public.nanobanana_templates
set slug = case
  when btrim(regexp_replace(regexp_replace(lower(name), '[^a-z0-9\s-]', '', 'g'), '[\s_-]+', '-', 'g'), '-') = ''
    then replace(lower(id), '_', '-')
  else btrim(regexp_replace(regexp_replace(lower(name), '[^a-z0-9\s-]', '', 'g'), '[\s_-]+', '-', 'g'), '-')
end
where slug is null;
