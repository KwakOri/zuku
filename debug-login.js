// 로그인 디버깅 스크립트
// node debug-login.js 로 실행

const bcrypt = require('bcryptjs');

async function debugLogin() {
  console.log('=== 로그인 디버깅 ===');
  
  // 1. 테스트 비밀번호 해시 생성
  const testPassword = 'admin123!';
  const testHash = await bcrypt.hash(testPassword, 12);
  
  console.log('1. 비밀번호 해시 테스트');
  console.log('원본 비밀번호:', testPassword);
  console.log('생성된 해시:', testHash);
  
  // 2. 비밀번호 검증 테스트
  const isValid = await bcrypt.compare(testPassword, testHash);
  console.log('해시 검증 결과:', isValid);
  
  console.log('\n=== DB 확인 쿼리 ===');
  console.log('사용자 조회:');
  console.log(`SELECT id, email, name, role, is_active, password_hash FROM users WHERE email = 'admin@zuku.academy';`);
  
  console.log('\n=== 수동 비밀번호 해시 업데이트 (필요시) ===');
  console.log(`UPDATE users SET password_hash = '${testHash}' WHERE email = 'admin@zuku.academy';`);
}

debugLogin();