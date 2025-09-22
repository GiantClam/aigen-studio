-- 用户角色权限系统数据库更新

-- 为用户表添加 role 字段
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';

-- 创建角色枚举约束
-- 注意：SQLite 不支持 CHECK 约束，但我们可以通过应用层来保证数据一致性

-- 更新现有用户的角色为 'user'
UPDATE users SET role = 'user' WHERE role IS NULL OR role = '';

-- 创建管理员用户（可选，用于测试）
-- 注意：这里需要根据实际的用户表结构调整
-- INSERT OR IGNORE INTO users (id, email, name, role) 
-- VALUES ('admin_user_id', 'admin@example.com', 'Administrator', 'admin');

-- 创建角色权限表
CREATE TABLE IF NOT EXISTS role_permissions (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  is_allowed BOOLEAN NOT NULL DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role, resource, action)
);

-- 插入默认权限规则
INSERT OR IGNORE INTO role_permissions (id, role, resource, action, is_allowed) VALUES
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
('admin_analytics_read', 'admin', 'analytics', 'read', true);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_resource ON role_permissions(resource);

-- 创建触发器：确保新用户默认为 'user' 角色
CREATE TRIGGER IF NOT EXISTS set_default_user_role
AFTER INSERT ON users
WHEN NEW.role IS NULL OR NEW.role = ''
BEGIN
  UPDATE users SET role = 'user' WHERE id = NEW.id;
END;
