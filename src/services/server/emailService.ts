import nodemailer from "nodemailer";

export interface SendInviteEmailParams {
  to: string;
  name: string;
  role: string;
  inviteToken: string;
  inviterName: string;
}

export interface EmailResult {
  success: boolean;
  error?: string;
}

// Nodemailer 설정
function createTransporter() {
  const emailConfig = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  // 개발 환경에서는 테스트 계정 사용 가능
  if (process.env.NODE_ENV === "development" && !process.env.SMTP_HOST) {
    console.warn("SMTP 설정이 없어서 테스트 모드로 실행합니다.");
    return null;
  }

  return nodemailer.createTransport(emailConfig);
}

/**
 * 역할을 한글로 변환
 */
function getRoleDisplayName(role: string): string {
  switch (role) {
    case "admin":
      return "관리자";
    case "manager":
      return "매니저";
    case "teacher":
      return "강사";
    case "assistant":
      return "조교";
    default:
      return "사용자";
  }
}

/**
 * 초대 이메일 HTML 템플릿 생성
 */
function createInviteEmailTemplate(params: SendInviteEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const { name, role, inviteToken, inviterName } = params;
  const roleDisplayName = getRoleDisplayName(role);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const signupUrl = `${baseUrl}/signup?token=${encodeURIComponent(
    inviteToken
  )}`;

  const subject = `[ZUKU 학원관리] ${roleDisplayName} 계정 초대`;

  const html = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
            .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎓 ZUKU 학원관리 시스템</h1>
                <p>계정 초대</p>
            </div>
            <div class="content">
                <h2>안녕하세요, ${name}님!</h2>
                <p><strong>${inviterName}</strong>님이 ZUKU 학원관리 시스템에 <strong>${roleDisplayName}</strong>로 초대하셨습니다.</p>
                
                <div class="warning">
                    <strong>⏰ 중요:</strong> 이 초대 링크는 <strong>7일간</strong>만 유효합니다.
                </div>
                
                <p>아래 버튼을 클릭하여 회원가입을 완료하세요:</p>
                <div style="text-align: center;">
                    <a href="${signupUrl}" class="button">회원가입 완료하기</a>
                </div>
                
                <p>또는 다음 링크를 복사하여 브라우저에 붙여넣으세요:</p>
                <p style="background: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all; font-family: monospace; font-size: 12px;">
                    ${signupUrl}
                </p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                
                <h3>회원가입 후 이용 가능한 기능:</h3>
                <ul>
                    <li>📅 시간표 관리 및 편집</li>
                    <li>👥 학생 정보 관리</li>
                    <li>📝 수업 기록 작성 및 조회</li>
                    <li>📱 학부모 알림톡 발송</li>
                    <li>📊 학원 운영 분석</li>
                </ul>
            </div>
            <div class="footer">
                <p>이 이메일은 자동으로 발송되었습니다.</p>
                <p>초대받지 않으셨다면 이 이메일을 무시하세요.</p>
                <p>© 2024 ZUKU 학원관리 시스템</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const text = `
ZUKU 학원관리 시스템 초대

안녕하세요, ${name}님!

${inviterName}님이 ZUKU 학원관리 시스템에 ${roleDisplayName}로 초대하셨습니다.

회원가입 링크: ${signupUrl}

⏰ 중요: 이 초대 링크는 7일간만 유효합니다.

이 이메일은 자동으로 발송되었습니다.
초대받지 않으셨다면 이 이메일을 무시하세요.

© 2024 ZUKU 학원관리 시스템
  `.trim();

  return { subject, html, text };
}

/**
 * 초대 이메일 발송
 */
export async function sendInviteEmail(
  params: SendInviteEmailParams
): Promise<EmailResult> {
  try {
    const transporter = createTransporter();

    // SMTP 설정이 없으면 테스트 모드로 처리
    if (!transporter) {
      console.log("테스트 모드: 초대 이메일 발송 시뮬레이션");
      console.log("받는 사람:", params.to);
      console.log("역할:", params.role);
      console.log("초대 토큰:", params.inviteToken);

      // 개발 환경에서는 성공으로 처리
      if (process.env.NODE_ENV === "development") {
        return { success: true };
      } else {
        return {
          success: false,
          error: "SMTP 설정이 필요합니다.",
        };
      }
    }

    const { subject, html, text } = createInviteEmailTemplate(params);

    const mailOptions = {
      from: {
        name: "ZUKU 학원관리",
        address:
          process.env.SMTP_FROM ||
          process.env.SMTP_USER ||
          "noreply@zuku.academy",
      },
      to: params.to,
      subject,
      html,
      text,
    };

    const result = await transporter.sendMail(mailOptions);

    console.log("초대 이메일 발송 성공:", result.messageId);
    return { success: true };
  } catch (error) {
    console.error("초대 이메일 발송 실패:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "이메일 발송 실패",
    };
  }
}
