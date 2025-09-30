"use client";

import { useInvitations, useInviteUser } from "@/queries/useAuth";
import { InviteUserRequest } from "@/services/client/authApi";
import {
  CheckCircle,
  Clock,
  GraduationCap,
  Home,
  Mail,
  Plus,
  Settings,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// 초대 상태 타입
type InviteStatus = "pending" | "accepted" | "expired";

// 초대 정보 타입
interface Invitation {
  id: string;
  email: string;
  role: "admin" | "manager" | "teacher" | "assistant";
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: InviteStatus;
  acceptedAt?: string;
}

export default function AdminInvitesPage() {
  // React Query 훅 사용
  const { data: invitations = [], isLoading, error } = useInvitations();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [formData, setFormData] = useState<{
    email: string;
    role: "admin" | "manager" | "teacher" | "assistant";
  }>({
    email: "",
    role: "teacher",
  });
  const [filterStatus, setFilterStatus] = useState<InviteStatus | "all">("all");

  // 역할 표시명 변환
  const getRoleDisplayName = (role: string) => {
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
  };

  // 상태별 스타일
  const getStatusStyle = (status: InviteStatus) => {
    switch (status) {
      case "pending":
        return "flat-surface bg-warning-50 text-warning-700 border-0";
      case "accepted":
        return "flat-surface bg-success-50 text-success-700 border-0";
      case "expired":
        return "flat-surface bg-error-50 text-error-700 border-0";
    }
  };

  // 상태별 아이콘
  const getStatusIcon = (status: InviteStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "accepted":
        return <CheckCircle className="w-4 h-4" />;
      case "expired":
        return <XCircle className="w-4 h-4" />;
    }
  };

  // React Query 훅 사용
  const inviteMutation = useInviteUser();

  // 초대 보내기
  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.role) {
      alert("이메일과 역할을 모두 입력해주세요.");
      return;
    }

    const inviteData: InviteUserRequest = {
      email: formData.email,
      role: formData.role,
      name: formData.email.split("@")[0], // 이메일 앞부분을 이름으로 사용
    };

    inviteMutation.mutate(inviteData, {
      onSuccess: () => {
        alert("초대 이메일이 발송되었습니다!");
        setFormData({ email: "", role: "teacher" });
        setShowInviteForm(false);
        // React Query의 onSuccess에서 자동으로 캐시 무효화됨
      },
    });
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">초대 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-error-600">초대 목록을 불러오는데 실패했습니다.</p>
          <p className="text-gray-600 mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  // 필터링된 초대 목록
  const filteredInvitations = invitations.filter(
    (invite) => filterStatus === "all" || invite.status === filterStatus
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="flat-surface bg-gray-50 border-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 flat-card text-gray-500 hover:text-gray-700 rounded-2xl hover:flat-pressed transition-all duration-200"
              >
                <Home className="w-5 h-5" />
              </Link>

              <div>
                <h1 className="text-xl font-bold text-gray-800">초대 관리</h1>
                <p className="text-sm text-gray-600">
                  시스템 사용자를 초대하고 관리하세요
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowInviteForm(true)}
                className="px-4 py-2 flat-card bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />새 초대
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="flat-card rounded-2xl p-6 border-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-md flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">전체 초대</p>
                <p className="text-2xl font-bold text-gray-800">
                  {invitations.length}
                </p>
              </div>
            </div>
          </div>

          <div className="flat-card rounded-2xl p-6 border-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl shadow-md flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">대기 중</p>
                <p className="text-2xl font-bold text-gray-800">
                  {invitations.filter((i) => i.status === "pending").length}
                </p>
              </div>
            </div>
          </div>

          <div className="flat-card rounded-2xl p-6 border-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-success-500 to-success-600 rounded-xl shadow-md flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">완료</p>
                <p className="text-2xl font-bold text-gray-800">
                  {invitations.filter((i) => i.status === "accepted").length}
                </p>
              </div>
            </div>
          </div>

          <div className="flat-card rounded-2xl p-6 border-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-error-500 to-error-600 rounded-xl shadow-md flex items-center justify-center">
                <XCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">만료</p>
                <p className="text-2xl font-bold text-gray-800">
                  {invitations.filter((i) => i.status === "expired").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 필터 */}
        <div className="flat-card rounded-2xl border-0 p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                filterStatus === "all"
                  ? "flat-surface bg-gradient-to-r from-primary-500 to-primary-600 text-white"
                  : "flat-card bg-neu-100 text-gray-600 hover:flat-pressed"
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                filterStatus === "pending"
                  ? "flat-surface bg-gradient-to-r from-warning-500 to-warning-600 text-white"
                  : "flat-card bg-neu-100 text-gray-600 hover:flat-pressed"
              }`}
            >
              대기 중
            </button>
            <button
              onClick={() => setFilterStatus("accepted")}
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                filterStatus === "accepted"
                  ? "flat-surface bg-gradient-to-r from-success-500 to-success-600 text-white"
                  : "flat-card bg-neu-100 text-gray-600 hover:flat-pressed"
              }`}
            >
              완료
            </button>
            <button
              onClick={() => setFilterStatus("expired")}
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                filterStatus === "expired"
                  ? "flat-surface bg-gradient-to-r from-error-500 to-error-600 text-white"
                  : "flat-card bg-neu-100 text-gray-600 hover:flat-pressed"
              }`}
            >
              만료
            </button>
          </div>
        </div>

        {/* 초대 목록 */}
        <div className="flat-card rounded-2xl border-0">
          <div className="p-6 flat-surface rounded-t-2xl bg-neu-100">
            <h2 className="text-lg font-semibold text-gray-800">초대 목록</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="flat-surface bg-neu-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이메일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    역할
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    초대일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    만료일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    초대자
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-50 divide-y divide-neu-200">
                {filteredInvitations.map((invite) => (
                  <tr key={invite.id} className="hover:bg-neu-100 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-800">
                          {invite.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {invite.role === "teacher" && (
                          <GraduationCap className="w-4 h-4 text-blue-500" />
                        )}
                        {invite.role === "assistant" && (
                          <UserCheck className="w-4 h-4 text-green-500" />
                        )}
                        {invite.role === "manager" && (
                          <Users className="w-4 h-4 text-purple-500" />
                        )}
                        {invite.role === "admin" && (
                          <Settings className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm text-gray-800">
                          {getRoleDisplayName(invite.role)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(
                          invite.status
                        )}`}
                      >
                        {getStatusIcon(invite.status)}
                        <span>
                          {invite.status === "pending" && "대기 중"}
                          {invite.status === "accepted" && "완료"}
                          {invite.status === "expired" && "만료"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(invite.invitedAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(invite.expiresAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {invite.invitedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredInvitations.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-neu-300 mx-auto mb-4" />
                <p className="text-gray-500">초대 내역이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 초대 모달 */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-neu-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="flat-card rounded-3xl border-0 max-w-md w-full">
            <div className="p-6 flat-surface rounded-t-3xl bg-neu-100">
              <h3 className="text-lg font-semibold text-gray-800">
                새 사용자 초대
              </h3>
            </div>

            <form onSubmit={handleSendInvite} className="p-6">
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  이메일 주소
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-3 py-2 flat-surface rounded-2xl text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  역할
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      role: e.target.value as typeof formData.role,
                    }))
                  }
                  className="w-full px-3 py-2 flat-surface rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                >
                  <option value="teacher">강사</option>
                  <option value="assistant">조교</option>
                  <option value="manager">매니저</option>
                  <option value="admin">관리자</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className="flex-1 px-4 py-2 flat-card text-gray-700 rounded-2xl hover:flat-pressed transition-all duration-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 flat-card bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  초대 보내기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
