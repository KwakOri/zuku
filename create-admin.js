// 초기 관리자 계정 생성 스크립트
// node create-admin.js 로 실행

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function createInitialAdmin() {
  const email = 'admin@zuku.academy';
  const password = 'admin123!';
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);
  const userId = uuidv4();

  console.log('=== 초기 관리자 계정 정보 ===');
  console.log('ID:', userId);
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('Hashed Password:', hashedPassword);
  console.log('Role: admin');
  console.log('');
  console.log('=== Supabase SQL 쿼리 ===');
  console.log(`
INSERT INTO users (id, email, password_hash, name, role, is_active, created_at, updated_at)
VALUES (
  '${userId}',
  '${email}',
  '${hashedPassword}',
  '관리자',
  'admin',
  true,
  NOW(),
  NOW()
);
  `);
}

createInitialAdmin();