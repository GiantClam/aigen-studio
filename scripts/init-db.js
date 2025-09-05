const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 确保数据库目录存在
const dbDir = path.join(__dirname, '..', 'prisma');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 创建数据库文件
const dbPath = path.join(dbDir, 'dev.db');
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, '');
  console.log('Created database file:', dbPath);
}

// 运行 Prisma 推送
try {
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('Database schema pushed successfully!');
} catch (error) {
  console.error('Failed to push database schema:', error.message);
}
