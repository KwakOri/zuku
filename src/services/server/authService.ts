import { generateInviteToken, generateTokenPair } from "@/lib/auth/jwt";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { Database } from "@/types/supabase";
import { v4 as uuidv4 } from "uuid";

type UserRow = Database["public"]["Tables"]["users"]["Row"];
type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
type SignupInvitationInsert =
  Database["public"]["Tables"]["signup_invitations"]["Insert"];

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
}

export interface LoginResult {
  success: boolean;
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

export interface SignupResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

export interface InviteResult {
  success: boolean;
  inviteToken?: string;
  error?: string;
}

/**
 * 사용자 로그인
 */
export async function loginUser(
  email: string,
  password: string
): Promise<LoginResult> {
  try {
    console.log('=== 로그인 시도 ===');
    console.log('이메일:', email);
    console.log('비밀번호 길이:', password.length);
    
    const supabase = createAdminSupabaseClient();

    // 사용자 조회
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("is_active", true)
      .single();

    console.log('DB 조회 결과:', { user: user ? '찾음' : '없음', error: userError });
    if (user) {
      console.log('사용자 정보:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_active: user.is_active,
        hasPasswordHash: !!user.password_hash
      });
    }

    if (userError || !user) {
      console.log('사용자 조회 실패:', userError);
      return {
        success: false,
        error: "이메일 또는 비밀번호가 올바르지 않습니다.",
      };
    }

    // 비밀번호 검증
    console.log('비밀번호 검증 시작...');
    const isValidPassword = await verifyPassword(password, user.password_hash);
    console.log('비밀번호 검증 결과:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('비밀번호 검증 실패');
      return {
        success: false,
        error: "이메일 또는 비밀번호가 올바르지 않습니다.",
      };
    }

    // JWT 토큰 생성
    const tokenPair = generateTokenPair({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.is_active,
    };

    return {
      success: true,
      user: authUser,
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
    };
  } catch (error) {
    console.error("로그인 실패:", error);
    return {
      success: false,
      error: "로그인 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 사용자 회원가입 (초대 토큰 필요)
 */
export async function signupUser(
  email: string,
  password: string,
  name: string,
  inviteToken: string
): Promise<SignupResult> {
  try {
    const supabase = createAdminSupabaseClient();

    // 초대 토큰으로 초대 정보 조회
    const { data: invitation, error: inviteError } = await supabase
      .from("signup_invitations")
      .select("*")
      .eq("token", inviteToken)
      .eq("email", email.toLowerCase())
      .is("used_at", null)
      .gte("expires_at", new Date().toISOString())
      .single();

    if (inviteError || !invitation) {
      return {
        success: false,
        error: "유효하지 않거나 만료된 초대 링크입니다.",
      };
    }

    // 이미 가입된 사용자인지 확인
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existingUser) {
      return {
        success: false,
        error: "이미 가입된 이메일입니다.",
      };
    }

    // 비밀번호 해시화
    const passwordHash = await hashPassword(password);

    // 사용자 생성
    const userId = uuidv4();
    const userData: UserInsert = {
      id: userId,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      name: name.trim(),
      role: invitation.role,
      is_active: true,
    };

    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert([userData])
      .select()
      .single();

    if (createError || !newUser) {
      console.error("사용자 생성 실패:", createError);
      return {
        success: false,
        error: "회원가입 중 오류가 발생했습니다.",
      };
    }

    // 초대 토큰 사용 처리
    await supabase
      .from("signup_invitations")
      .update({ used_at: new Date().toISOString() })
      .eq("id", invitation.id);

    const authUser: AuthUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      isActive: newUser.is_active,
    };

    return {
      success: true,
      user: authUser,
    };
  } catch (error) {
    console.error("회원가입 실패:", error);
    return {
      success: false,
      error: "회원가입 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 사용자 ID로 사용자 정보 조회
 */
export async function getUserById(userId: string): Promise<AuthUser | null> {
  try {
    const supabase = createAdminSupabaseClient();

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, name, role, is_active")
      .eq("id", userId)
      .eq("is_active", true)
      .single();

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.is_active,
    };
  } catch (error) {
    console.error("사용자 조회 실패:", error);
    return null;
  }
}

/**
 * 초대 토큰으로 초대 정보 검증
 */
export async function validateInviteToken(token: string): Promise<{
  isValid: boolean;
  email?: string;
  role?: string;
  error?: string;
}> {
  try {
    const supabase = createAdminSupabaseClient();

    const { data: invitation, error } = await supabase
      .from("signup_invitations")
      .select("email, role, expires_at, used_at")
      .eq("token", token)
      .single();

    if (error || !invitation) {
      return {
        isValid: false,
        error: "유효하지 않은 초대 링크입니다.",
      };
    }

    if (invitation.used_at) {
      return {
        isValid: false,
        error: "이미 사용된 초대 링크입니다.",
      };
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return {
        isValid: false,
        error: "만료된 초대 링크입니다.",
      };
    }

    return {
      isValid: true,
      email: invitation.email,
      role: invitation.role,
    };
  } catch (error) {
    console.error("초대 토큰 검증 실패:", error);
    return {
      isValid: false,
      error: "초대 링크 검증 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 관리자가 새 사용자 초대
 */
export async function createInvitation(
  email: string,
  role: string,
  invitedBy: string
): Promise<InviteResult> {
  try {
    const supabase = createAdminSupabaseClient();

    // 이미 가입된 사용자인지 확인
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existingUser) {
      return {
        success: false,
        error: "이미 가입된 이메일입니다.",
      };
    }

    // 기존에 보낸 유효한 초대가 있는지 확인
    const { data: existingInvite } = await supabase
      .from("signup_invitations")
      .select("id")
      .eq("email", email.toLowerCase())
      .is("used_at", null)
      .gte("expires_at", new Date().toISOString())
      .single();

    if (existingInvite) {
      return {
        success: false,
        error: "이미 유효한 초대가 발송되어 있습니다.",
      };
    }

    // 초대 토큰 생성
    const inviteToken = generateInviteToken(email, role);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7일 후 만료

    const invitationData: SignupInvitationInsert = {
      email: email.toLowerCase(),
      token: inviteToken,
      role,
      invited_by: invitedBy,
      expires_at: expiresAt.toISOString(),
    };

    const { error: insertError } = await supabase
      .from("signup_invitations")
      .insert([invitationData]);

    if (insertError) {
      console.error("초대 생성 실패:", insertError);
      return {
        success: false,
        error: "초대 생성 중 오류가 발생했습니다.",
      };
    }

    return {
      success: true,
      inviteToken,
    };
  } catch (error) {
    console.error("초대 생성 실패:", error);
    return {
      success: false,
      error: "초대 생성 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 모든 사용자 목록 조회 (관리자용)
 */
export async function getAllUsers(): Promise<AuthUser[]> {
  try {
    const supabase = createAdminSupabaseClient();

    const { data: users, error } = await supabase
      .from("users")
      .select("id, email, name, role, is_active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("사용자 목록 조회 실패:", error);
      return [];
    }

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.is_active,
    }));
  } catch (error) {
    console.error("사용자 목록 조회 실패:", error);
    return [];
  }
}

/**
 * 초대 목록 조회
 */
export async function getInvitations(): Promise<Array<{
  id: string;
  email: string;
  role: string;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired';
  acceptedAt?: string;
}>> {
  try {
    const supabase = createAdminSupabaseClient();

    const { data: invitations, error } = await supabase
      .from("signup_invitations")
      .select(`
        id,
        email,
        role,
        expires_at,
        used_at,
        created_at,
        invited_by
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("초대 목록 조회 실패:", error);
      return [];
    }

    return invitations.map((invitation) => {
      const now = new Date();
      const expiresAt = new Date(invitation.expires_at);
      const isExpired = now > expiresAt;
      const isAccepted = !!invitation.used_at;

      let status: 'pending' | 'accepted' | 'expired';
      if (isAccepted) {
        status = 'accepted';
      } else if (isExpired) {
        status = 'expired';
      } else {
        status = 'pending';
      }

      return {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        invitedBy: '관리자', // TODO: invited_by로 실제 초대자 이름 조회
        invitedAt: invitation.created_at,
        expiresAt: invitation.expires_at,
        status,
        acceptedAt: invitation.used_at || undefined,
      };
    });
  } catch (error) {
    console.error("초대 목록 조회 실패:", error);
    return [];
  }
}
