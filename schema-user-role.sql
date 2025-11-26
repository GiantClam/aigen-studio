-- 用户角色权限系统数据库更新

-- 为用户表添加 role 字段（如果不存在）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nanobanana_users' AND column_name = 'role'
  ) THEN
    ALTER TABLE nanobanana_users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
  END IF;
END $$;

-- 创建角色枚举约束
-- 注意：SQLite 不支持 CHECK 约束，但我们可以通过应用层来保证数据一致性

-- 更新现有用户的角色为 'user'
UPDATE nanobanana_users SET role = 'user' WHERE role IS NULL OR role = '';

-- 创建管理员用户（可选，用于测试）
-- 注意：这里需要根据实际的用户表结构调整
-- INSERT OR IGNORE INTO users (id, email, name, role) 
-- VALUES ('admin_user_id', 'admin@example.com', 'Administrator', 'admin');

-- 创建角色权限表
CREATE TABLE IF NOT EXISTS nanobanana_role_permissions (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  is_allowed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(role, resource, action)
);

-- 插入默认权限规则
INSERT INTO nanobanana_role_permissions (id, role, resource, action, is_allowed) VALUES
-- 普通用户权限
('user_points_read', 'user', 'points', 'read', true),
('user_points_deduct', 'user', 'points', 'deduct', true),
('user_transactions_read', 'user', 'transactions', 'read', true),
('user_profile_read', 'user', 'profile', 'read', true),
('user_profile_update', 'user', 'profile', 'update', true),

-- 管理员权限
('admin_points_read', 'admin', 'points', 'read', true),
('admin_points_write', 'admin', 'points', 'write', true),
('admin_transactions_read', 'admin', 'transactions', 'read', true),
('admin_transactions_write', 'admin', 'transactions', 'write', true),
('admin_users_read', 'admin', 'users', 'read', true),
('admin_users_write', 'admin', 'users', 'write', true),
('admin_rules_read', 'admin', 'rules', 'read', true),
('admin_rules_write', 'admin', 'rules', 'write', true),
('admin_analytics_read', 'admin', 'analytics', 'read', true)
ON CONFLICT (id) DO NOTHING;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_nanobanana_users_role ON nanobanana_users(role);
CREATE INDEX IF NOT EXISTS idx_nanobanana_role_permissions_role ON nanobanana_role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_nanobanana_role_permissions_resource ON nanobanana_role_permissions(resource);

-- 创建触发器函数：确保新用户默认为 'user' 角色
CREATE OR REPLACE FUNCTION set_default_nanobanana_user_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS NULL OR NEW.role = '' THEN
    NEW.role := 'user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS set_default_nanobanana_user_role ON nanobanana_users;
CREATE TRIGGER set_default_nanobanana_user_role
BEFORE INSERT ON nanobanana_users
FOR EACH ROW
EXECUTE FUNCTION set_default_nanobanana_user_role();
