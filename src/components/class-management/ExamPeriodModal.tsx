"use client";

import { useSchools } from "@/queries/useSchools";
import { ExamPeriodWithSchool } from "@/services/client/examPeriodApi";
import { ScrollPicker, ScrollPickerOption } from "@/components/common/input";
import { Check, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface ExamPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExamPeriodFormData) => Promise<void>;
  editingPeriod: ExamPeriodWithSchool | null;
  isSubmitting: boolean;
}

export interface ExamPeriodFormData {
  school_id: string;
  start_date: string;
  end_date: string | null;
  year: number;
  semester: 1 | 2;
  exam_round: 1 | 2;
}

export default function ExamPeriodModal({
  isOpen,
  onClose,
  onSubmit,
  editingPeriod,
  isSubmitting,
}: ExamPeriodModalProps) {
  const { data: schools = [], isLoading: schoolsLoading } = useSchools();

  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [selectedSchoolName, setSelectedSchoolName] = useState<string>("");
  const [schoolSearchQuery, setSchoolSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const [startMonth, setStartMonth] = useState<number>(new Date().getMonth() + 1);
  const [startDay, setStartDay] = useState<number>(new Date().getDate());
  const [endMonth, setEndMonth] = useState<number>(new Date().getMonth() + 1);
  const [endDay, setEndDay] = useState<number>(new Date().getDate());
  const [isEndDateUndecided, setIsEndDateUndecided] = useState(false);
  const [semester, setSemester] = useState<1 | 2>(1);
  const [examRound, setExamRound] = useState<1 | 2>(1);

  // Refs
  const schoolDropdownRef = useRef<HTMLDivElement>(null);

  // Initialize form when editing or opening
  useEffect(() => {
    if (isOpen) {
      if (editingPeriod) {
        setSelectedSchoolId(editingPeriod.school_id);
        setSelectedSchoolName(editingPeriod.schools?.name || "");
        setSchoolSearchQuery(editingPeriod.schools?.name || "");

        const [sYear, sMonth, sDay] = editingPeriod.start_date.split('-').map(Number);
        setStartMonth(sMonth);
        setStartDay(sDay);

        if (editingPeriod.end_date) {
          const [eYear, eMonth, eDay] = editingPeriod.end_date.split('-').map(Number);
          setEndMonth(eMonth);
          setEndDay(eDay);
          setIsEndDateUndecided(false);
        } else {
          setIsEndDateUndecided(true);
        }

        setSemester(editingPeriod.semester as 1 | 2);
        setExamRound(editingPeriod.exam_round as 1 | 2);
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingPeriod]);


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showSchoolDropdown && !target.closest('.school-search-container')) {
        setShowSchoolDropdown(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSchoolDropdown]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(schoolSearchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [schoolSearchQuery]);

  // Reset highlighted index when search query changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [debouncedSearchQuery]);

  // Auto-scroll to highlighted item
  useEffect(() => {
    if (highlightedIndex >= 0 && schoolDropdownRef.current) {
      const dropdown = schoolDropdownRef.current;
      const highlightedItem = dropdown.children[highlightedIndex] as HTMLElement;

      if (highlightedItem) {
        const dropdownRect = dropdown.getBoundingClientRect();
        const itemRect = highlightedItem.getBoundingClientRect();

        if (itemRect.bottom > dropdownRect.bottom) {
          highlightedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else if (itemRect.top < dropdownRect.top) {
          highlightedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    }
  }, [highlightedIndex]);

  // Filter schools
  const filteredSchools = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return schools.slice(0, 5);
    }
    return schools
      .filter(school =>
        school.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      )
      .slice(0, 5);
  }, [schools, debouncedSearchQuery]);

  // Create options for ScrollPicker
  const monthOptions: ScrollPickerOption[] = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}월`,
  }));

  const dayOptions: ScrollPickerOption[] = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}일`,
  }));

  const handleSchoolSelect = (school: { id: string; name: string }) => {
    setSelectedSchoolId(school.id);
    setSelectedSchoolName(school.name);
    setSchoolSearchQuery(school.name);
    setShowSchoolDropdown(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSchoolDropdown || filteredSchools.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredSchools.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredSchools.length) {
          handleSchoolSelect(filteredSchools[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSchoolDropdown(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const resetForm = () => {
    setSelectedSchoolId("");
    setSelectedSchoolName("");
    setSchoolSearchQuery("");
    setDebouncedSearchQuery("");
    setShowSchoolDropdown(false);
    setHighlightedIndex(-1);
    const now = new Date();
    setStartMonth(now.getMonth() + 1);
    setStartDay(now.getDate());
    setEndMonth(now.getMonth() + 1);
    setEndDay(now.getDate());
    setIsEndDateUndecided(false);
    setSemester(1);
    setExamRound(1);
  };

  const handleSubmit = async () => {
    if (!selectedSchoolId) {
      alert("학교를 선택해주세요");
      return;
    }

    const currentYear = new Date().getFullYear();
    const startDate = `${currentYear}-${String(startMonth).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
    const endDate = isEndDateUndecided ? null : `${currentYear}-${String(endMonth).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;

    await onSubmit({
      school_id: selectedSchoolId,
      start_date: startDate,
      end_date: endDate,
      year: currentYear,
      semester,
      exam_round: examRound,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md mx-4 bg-white shadow-2xl rounded-xl">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingPeriod ? "내신기간 수정" : "새 내신기간 등록"}
          </h3>
        </div>
        <div className="p-6 space-y-4">
          {/* 학교 선택 */}
          <div className="relative">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              학교 <span className="text-red-500">*</span>
            </label>
            <div className="relative school-search-container">
              {/* Selected School Display or Search Input */}
              {selectedSchoolId && selectedSchoolName ? (
                <div className="flex items-center justify-between px-4 py-3 border-2 rounded-lg border-primary-500 bg-primary-50">
                  <span className="font-medium text-primary-700">
                    {selectedSchoolName}
                  </span>
                  {!editingPeriod && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSchoolId("");
                        setSelectedSchoolName("");
                        setSchoolSearchQuery("");
                        setShowSchoolDropdown(true);
                      }}
                      className="p-1 transition-colors rounded-md hover:bg-primary-100"
                    >
                      <X className="w-4 h-4 text-primary-600" />
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <div className="relative">
                    <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="text"
                      value={schoolSearchQuery}
                      onChange={(e) => {
                        setSchoolSearchQuery(e.target.value);
                        setShowSchoolDropdown(true);
                      }}
                      onFocus={() => setShowSchoolDropdown(true)}
                      onKeyDown={handleKeyDown}
                      placeholder="학교명으로 검색... (↑↓ 이동, Enter 선택)"
                      className="w-full py-3 pl-10 pr-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  {/* School Search Results Dropdown */}
                  {showSchoolDropdown && (
                    <div className="absolute z-50 w-full mt-1 overflow-hidden bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-40">
                      {filteredSchools.length > 0 ? (
                        <div
                          ref={schoolDropdownRef}
                          className="overflow-y-auto max-h-40"
                        >
                          {filteredSchools.map((school, index) => (
                            <button
                              key={school.id}
                              type="button"
                              onClick={() => handleSchoolSelect(school)}
                              onMouseEnter={() => setHighlightedIndex(index)}
                              className={`w-full px-4 py-2 text-left transition-colors ${
                                highlightedIndex === index
                                  ? 'bg-primary-100 text-primary-800'
                                  : 'hover:bg-primary-50'
                              }`}
                            >
                              <span className="text-sm font-medium">
                                {school.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-3 text-sm text-center text-gray-500">
                          {schoolSearchQuery
                            ? "검색 결과가 없습니다"
                            : "학교명을 입력하세요"}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 시작일 */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              시작일 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <ScrollPicker
                options={monthOptions}
                value={startMonth}
                onChange={(value) => setStartMonth(value as number)}
                autoScroll={isOpen}
              />
              <ScrollPicker
                options={dayOptions}
                value={startDay}
                onChange={(value) => setStartDay(value as number)}
                autoScroll={isOpen}
              />
            </div>
          </div>

          {/* 종료일 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                종료일
              </label>
              <button
                type="button"
                onClick={() => setIsEndDateUndecided(!isEndDateUndecided)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  isEndDateUndecided
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isEndDateUndecided ? '✓ 미정' : '미정'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ScrollPicker
                options={monthOptions}
                value={endMonth}
                onChange={(value) => setEndMonth(value as number)}
                disabled={isEndDateUndecided}
                autoScroll={isOpen && !isEndDateUndecided}
              />
              <ScrollPicker
                options={dayOptions}
                value={endDay}
                onChange={(value) => setEndDay(value as number)}
                disabled={isEndDateUndecided}
                autoScroll={isOpen && !isEndDateUndecided}
              />
            </div>
          </div>

          {/* 학기 및 차수 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                학기 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSemester(1)}
                  className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                    semester === 1
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-25'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>1학기</span>
                    {semester === 1 && (
                      <Check className="w-4 h-4 text-primary-600" />
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSemester(2)}
                  className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                    semester === 2
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-25'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>2학기</span>
                    {semester === 2 && (
                      <Check className="w-4 h-4 text-primary-600" />
                    )}
                  </div>
                </button>
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                차수 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setExamRound(1)}
                  className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                    examRound === 1
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-25'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>1차</span>
                    {examRound === 1 && (
                      <Check className="w-4 h-4 text-primary-600" />
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setExamRound(2)}
                  className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                    examRound === 2
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-25'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>2차</span>
                    {examRound === 2 && (
                      <Check className="w-4 h-4 text-primary-600" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
          >
            {isSubmitting
              ? "처리 중..."
              : editingPeriod
              ? "수정"
              : "등록"}
          </button>
        </div>
      </div>
    </div>
  );
}
