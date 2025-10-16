"use client";

import { useState, useMemo } from "react";
import { useSchools } from "@/queries/useSchools";
import {
  useExamPeriods,
  useCreateExamPeriod,
  useUpdateExamPeriod,
  useDeleteExamPeriod,
} from "@/queries/useExamPeriods";
import { ExamPeriodWithSchool } from "@/services/client/examPeriodApi";
import { Calendar, Plus, Pencil, Trash2, X, Check, Search } from "lucide-react";
import { format } from "date-fns";

export default function ExamPeriodManagement() {
  const { data: schools = [], isLoading: schoolsLoading } = useSchools();
  const { data: examPeriods = [], isLoading: periodsLoading } = useExamPeriods();
  const createMutation = useCreateExamPeriod();
  const updateMutation = useUpdateExamPeriod();
  const deleteMutation = useDeleteExamPeriod();

  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter exam periods by selected school or search query
  const filteredPeriods = useMemo(() => {
    let filtered = examPeriods;

    if (selectedSchoolId) {
      filtered = filtered.filter((p) => p.school_id === selectedSchoolId);
    }

    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.schools?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [examPeriods, selectedSchoolId, searchQuery]);

  const handleCreate = async () => {
    if (!selectedSchoolId || !startDate) {
      alert("학교와 시작일을 선택해주세요");
      return;
    }

    try {
      await createMutation.mutateAsync({
        school_id: selectedSchoolId,
        start_date: startDate,
        end_date: endDate || null,
      });
      // Reset form
      setSelectedSchoolId("");
      setStartDate("");
      setEndDate("");
    } catch (error) {
      console.error("Failed to create exam period:", error);
      alert("내신 기간 생성에 실패했습니다");
    }
  };

  const handleUpdate = async (id: string) => {
    if (!startDate) {
      alert("시작일을 입력해주세요");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id,
        params: {
          start_date: startDate,
          end_date: endDate || null,
        },
      });
      setEditingId(null);
      setStartDate("");
      setEndDate("");
    } catch (error) {
      console.error("Failed to update exam period:", error);
      alert("내신 기간 수정에 실패했습니다");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 내신 기간을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete exam period:", error);
      alert("내신 기간 삭제에 실패했습니다");
    }
  };

  const startEdit = (period: ExamPeriodWithSchool) => {
    setEditingId(period.id);
    setStartDate(period.start_date);
    setEndDate(period.end_date || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setStartDate("");
    setEndDate("");
  };

  if (schoolsLoading || periodsLoading) {
    return <div className="p-6 text-gray-500">로딩 중...</div>;
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          내신기간 관리
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          학교별 내신 기간을 등록하고 관리합니다
        </p>
      </div>

      {/* Create Form */}
      <div className="border-b border-gray-200 p-6 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          새 내신기간 등록
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              학교 <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">학교 선택</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              시작일 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              종료일 (선택)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? "등록 중..." : "등록"}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="학교명 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="w-64">
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">전체 학교</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* List Section */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredPeriods.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">등록된 내신 기간이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPeriods.map((period) => (
              <div
                key={period.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                {editingId === period.id ? (
                  // Edit mode
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        학교
                      </label>
                      <input
                        type="text"
                        value={period.schools?.name || ""}
                        disabled
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        시작일 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        종료일
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(period.id)}
                        disabled={updateMutation.isPending}
                        className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {period.schools?.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {format(new Date(period.start_date), "yyyy년 MM월 dd일")}
                        {period.end_date && (
                          <>
                            {" ~ "}
                            {format(new Date(period.end_date), "yyyy년 MM월 dd일")}
                          </>
                        )}
                        {!period.end_date && (
                          <span className="ml-2 text-xs text-amber-600">
                            (종료일 미정)
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(period)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(period.id)}
                        disabled={deleteMutation.isPending}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
