import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * 비밀번호를 해시화합니다.
 * @param password 원본 비밀번호
 * @returns 해시화된 비밀번호
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 6) {
    throw new Error("비밀번호는 최소 6자 이상이어야 합니다.");
  }

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error("비밀번호 해시화 실패:", error);
    throw new Error("비밀번호 해시화 중 오류가 발생했습니다.");
  }
}

/**
 * 입력받은 비밀번호와 해시된 비밀번호를 비교합니다.
 * @param password 입력받은 원본 비밀번호
 * @param hashedPassword 저장된 해시된 비밀번호
 * @returns 일치 여부
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  if (!password || !hashedPassword) {
    return false;
  }

  try {
    const isValid = await bcrypt.compare(password, hashedPassword);
    return isValid;
  } catch (error) {
    console.error("비밀번호 검증 실패:", error);
    return false;
  }
}

/**
 * 비밀번호 강도를 검증합니다.
 * @param password 검증할 비밀번호
 * @returns 검증 결과 객체
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
  score: number; // 0-100
} {
  const errors: string[] = [];
  let score = 0;

  // 기본 길이 검사
  if (password.length < 6) {
    errors.push("비밀번호는 최소 6자 이상이어야 합니다.");
  } else if (password.length >= 8) {
    score += 20;
  }

  // 숫자 포함 검사
  if (/\d/.test(password)) {
    score += 20;
  } else {
    errors.push("숫자를 포함해야 합니다.");
  }

  // 소문자 포함 검사
  if (/[a-z]/.test(password)) {
    score += 20;
  } else {
    errors.push("소문자를 포함해야 합니다.");
  }

  // 대문자 포함 검사
  if (/[A-Z]/.test(password)) {
    score += 20;
  } else {
    errors.push("대문자를 포함해야 합니다.");
  }

  // 특수문자 포함 검사
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 20;
  } else {
    errors.push("특수문자를 포함해야 합니다.");
  }

  // 기본적으로 6자 이상이면 유효한 것으로 처리 (학원 환경에 맞게 완화)
  const isValid = password.length >= 6 && errors.length <= 3;

  return {
    isValid,
    errors,
    score,
  };
}
