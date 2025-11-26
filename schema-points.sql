-- 积分系统数据库表结构

-- 用户积分表
CREATE TABLE IF NOT EXISTS nanobanana_user_points (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  current_points INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES nanobanana_users(id) ON DELETE CASCADE
);

-- 积分交易记录表
CREATE TABLE IF NOT EXISTS nanobanana_point_transactions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'earn', 'spend', 'refund'
  source TEXT NOT NULL, -- 'registration', 'daily_login', 'ai_generation', 'admin_adjustment'
  description TEXT,
  metadata TEXT, -- JSON 格式的额外信息
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES nanobanana_users(id) ON DELETE CASCADE
);

-- 每日登录记录表（防止重复赠送）
CREATE TABLE IF NOT EXISTS nanobanana_daily_login_records (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  login_date DATE NOT NULL,
  points_awarded INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES nanobanana_users(id) ON DELETE CASCADE,
  UNIQUE(user_id, login_date)
);

-- 积分规则配置表
CREATE TABLE IF NOT EXISTS nanobanana_point_rules (
  id TEXT PRIMARY KEY,
  rule_name TEXT NOT NULL UNIQUE,
  rule_type TEXT NOT NULL, -- 'registration', 'daily_login', 'ai_generation'
  points_value INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 插入默认积分规则
INSERT INTO nanobanana_point_rules (id, rule_name, rule_type, points_value, description) VALUES
('rule_registration', '新用户注册', 'registration', 100, '新用户注册时赠送的积分'),
('rule_daily_login', '每日登录', 'daily_login', 10, '每天首次登录赠送的积分'),
('rule_ai_generation', 'AI 生成图片', 'ai_generation', -5, '使用 AI 生成图片扣除的积分')
ON CONFLICT (id) DO NOTHING;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_nanobanana_user_points_user_id ON nanobanana_user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_nanobanana_point_transactions_user_id ON nanobanana_point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_nanobanana_point_transactions_created_at ON nanobanana_point_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_nanobanana_daily_login_user_date ON nanobanana_daily_login_records(user_id, login_date);
CREATE INDEX IF NOT EXISTS idx_nanobanana_point_rules_type ON nanobanana_point_rules(rule_type);

-- 创建触发器函数：自动更新用户积分
CREATE OR REPLACE FUNCTION update_nanobanana_user_points_after_transaction()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE nanobanana_user_points 
  SET 
    current_points = current_points + NEW.points,
    total_earned = total_earned + CASE WHEN NEW.points > 0 THEN NEW.points ELSE 0 END,
    total_spent = total_spent + CASE WHEN NEW.points < 0 THEN ABS(NEW.points) ELSE 0 END,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS update_nanobanana_user_points_after_transaction ON nanobanana_point_transactions;
CREATE TRIGGER update_nanobanana_user_points_after_transaction
AFTER INSERT ON nanobanana_point_transactions
FOR EACH ROW
EXECUTE FUNCTION update_nanobanana_user_points_after_transaction();

-- 创建触发器函数：确保用户积分记录存在
CREATE OR REPLACE FUNCTION ensure_nanobanana_user_points_exists()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO nanobanana_user_points (id, user_id, current_points, total_earned)
  VALUES (NEW.id::TEXT || '_points', NEW.id, 100, 100)
  ON CONFLICT (id) DO NOTHING;
  
  -- 记录注册赠送积分
  INSERT INTO nanobanana_point_transactions (id, user_id, points, transaction_type, source, description)
  VALUES (NEW.id::TEXT || '_reg_' || EXTRACT(EPOCH FROM NOW())::TEXT, NEW.id, 100, 'earn', 'registration', '新用户注册赠送积分');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS ensure_nanobanana_user_points_exists ON nanobanana_users;
CREATE TRIGGER ensure_nanobanana_user_points_exists
AFTER INSERT ON nanobanana_users
FOR EACH ROW
EXECUTE FUNCTION ensure_nanobanana_user_points_exists();
