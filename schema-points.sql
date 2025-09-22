-- 积分系统数据库表结构

-- 用户积分表
CREATE TABLE IF NOT EXISTS user_points (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  current_points INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 积分交易记录表
CREATE TABLE IF NOT EXISTS point_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'earn', 'spend', 'refund'
  source TEXT NOT NULL, -- 'registration', 'daily_login', 'ai_generation', 'admin_adjustment'
  description TEXT,
  metadata TEXT, -- JSON 格式的额外信息
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 每日登录记录表（防止重复赠送）
CREATE TABLE IF NOT EXISTS daily_login_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  login_date DATE NOT NULL,
  points_awarded INTEGER NOT NULL DEFAULT 10,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, login_date)
);

-- 积分规则配置表
CREATE TABLE IF NOT EXISTS point_rules (
  id TEXT PRIMARY KEY,
  rule_name TEXT NOT NULL UNIQUE,
  rule_type TEXT NOT NULL, -- 'registration', 'daily_login', 'ai_generation'
  points_value INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认积分规则
INSERT OR IGNORE INTO point_rules (id, rule_name, rule_type, points_value, description) VALUES
('rule_registration', '新用户注册', 'registration', 100, '新用户注册时赠送的积分'),
('rule_daily_login', '每日登录', 'daily_login', 10, '每天首次登录赠送的积分'),
('rule_ai_generation', 'AI 生成图片', 'ai_generation', -5, '使用 AI 生成图片扣除的积分');

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_login_user_date ON daily_login_records(user_id, login_date);
CREATE INDEX IF NOT EXISTS idx_point_rules_type ON point_rules(rule_type);

-- 创建触发器：自动更新用户积分
CREATE TRIGGER IF NOT EXISTS update_user_points_after_transaction
AFTER INSERT ON point_transactions
BEGIN
  UPDATE user_points 
  SET 
    current_points = current_points + NEW.points,
    total_earned = total_earned + CASE WHEN NEW.points > 0 THEN NEW.points ELSE 0 END,
    total_spent = total_spent + CASE WHEN NEW.points < 0 THEN ABS(NEW.points) ELSE 0 END,
    updated_at = CURRENT_TIMESTAMP
  WHERE user_id = NEW.user_id;
END;

-- 创建触发器：确保用户积分记录存在
CREATE TRIGGER IF NOT EXISTS ensure_user_points_exists
AFTER INSERT ON users
BEGIN
  INSERT OR IGNORE INTO user_points (id, user_id, current_points, total_earned)
  VALUES (NEW.id || '_points', NEW.id, 100, 100);
  
  -- 记录注册赠送积分
  INSERT INTO point_transactions (id, user_id, points, transaction_type, source, description)
  VALUES (NEW.id || '_reg_' || strftime('%s', 'now'), NEW.id, 100, 'earn', 'registration', '新用户注册赠送积分');
END;
