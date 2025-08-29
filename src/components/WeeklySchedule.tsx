"use client";

import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  MouseSensor,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { generateClassBlocks, defaultScheduleConfig } from '@/lib/mockData';
import { ClassBlock, EditMode, ScheduleConfig } from '@/types/schedule';
import { Clock, Users, Check, X, Plus, GripVertical } from 'lucide-react';

const days = ["일", "월", "화", "수", "목", "금", "토"];

// 드래그 가능한 클래스 블록
interface DraggableClassBlockProps {
  block: ClassBlock;
  editMode: EditMode;
  onShowModal: (block: ClassBlock) => void;
  isDragging?: boolean;
}

function DraggableClassBlock({ block, editMode, onShowModal, isDragging = false }: DraggableClassBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDraggingFromHook
  } = useDraggable({
    id: block.id,
    disabled: editMode === 'view',
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const canDrag = editMode === 'admin';

  // 수업 길이 계산 (분)
  const parseTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const duration = parseTime(block.endTime) - parseTime(block.startTime);
  const isShortClass = duration <= 30; // 30분 이하는 짧은 수업

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg cursor-pointer transition-all duration-200 text-white text-xs h-full flex flex-col justify-between overflow-hidden ${
        isDraggingFromHook || isDragging
          ? 'opacity-50 rotate-2 scale-105 z-50' 
          : 'hover:shadow-lg hover:scale-[1.02]'
      } ${
        isShortClass ? 'p-1' : 'p-2'
      }`}
      style={{
        backgroundColor: block.color,
        ...style,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onShowModal(block);
      }}
    >
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex-1 min-w-0">
          <p className={`font-medium truncate ${isShortClass ? 'text-xs leading-tight' : 'leading-tight'}`}>
            {block.title}
          </p>
        </div>
        {canDrag && (
          <div
            {...listeners}
            {...attributes}
            className="w-3 h-3 opacity-70 ml-1 flex-shrink-0 cursor-grab active:cursor-grabbing hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-3 h-3" />
          </div>
        )}
      </div>
      
      {!isShortClass && (
        <div className="text-xs opacity-90 mt-auto flex-shrink-0">
          {block.startTime} ~ {block.endTime}
        </div>
      )}
    </div>
  );
}

// 드롭 영역 컴포넌트
interface DroppableTimeSlotProps {
  dayIndex: number;
  timeSlot: string;
  children: React.ReactNode;
}

function DroppableTimeSlot({ dayIndex, timeSlot, children }: DroppableTimeSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${dayIndex}-${timeSlot}`,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`h-[20px] border-b border-gray-100 relative ${
        isOver ? 'bg-blue-100' : ''
      }`}
    >
      {children}
    </div>
  );
}

// 모달 컴포넌트
interface ClassModalProps {
  block: ClassBlock | null;
  editMode: EditMode;
  isOpen: boolean;
  onClose: () => void;
  onSave: (blockId: string, updatedData: Partial<ClassBlock>) => void;
}

function ClassModal({ block, editMode, isOpen, onClose, onSave }: ClassModalProps) {
  const [editData, setEditData] = useState({
    title: block?.title || '',
    teacherName: block?.teacherName || '',
    room: block?.room || '',
    subject: block?.subject || '',
    startTime: block?.startTime || '',
    endTime: block?.endTime || '',
  });

  React.useEffect(() => {
    if (block) {
      setEditData({
        title: block.title,
        teacherName: block.teacherName,
        room: block.room || '',
        subject: block.subject,
        startTime: block.startTime,
        endTime: block.endTime,
      });
    }
  }, [block]);

  if (!isOpen || !block) return null;

  const canEdit = editMode === 'admin' || editMode === 'edit';

  const handleSave = () => {
    onSave(block.id, editData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">수업 정보</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {canEdit ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">수업명</label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">과목</label>
                <input
                  type="text"
                  value={editData.subject}
                  onChange={(e) => setEditData({ ...editData, subject: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">강사명</label>
                <input
                  type="text"
                  value={editData.teacherName}
                  onChange={(e) => setEditData({ ...editData, teacherName: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">강의실</label>
                <input
                  type="text"
                  value={editData.room}
                  onChange={(e) => setEditData({ ...editData, room: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간</label>
                  <input
                    type="time"
                    value={editData.startTime}
                    onChange={(e) => setEditData({ ...editData, startTime: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">종료 시간</label>
                  <input
                    type="time"
                    value={editData.endTime}
                    onChange={(e) => setEditData({ ...editData, endTime: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="block text-sm font-medium text-gray-700">수업명</span>
                <p className="mt-1">{block.title}</p>
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-700">과목</span>
                <p className="mt-1">{block.subject}</p>
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-700">강사명</span>
                <p className="mt-1">{block.teacherName}</p>
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-700">강의실</span>
                <p className="mt-1">{block.room || '미정'}</p>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-sm font-medium text-gray-700">시간</span>
              <div className="flex items-center mt-1">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                <span>{block.startTime} ~ {block.endTime}</span>
              </div>
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700">학생 수</span>
              <div className="flex items-center mt-1">
                <Users className="w-4 h-4 mr-2 text-gray-400" />
                <span>{block.studentCount}{block.maxStudents && `/${block.maxStudents}`}</span>
              </div>
            </div>
          </div>

          {canEdit && (
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                저장
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                취소
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
}

interface WeeklyScheduleProps {
  editMode?: EditMode;
  config?: ScheduleConfig;
}

export default function WeeklySchedule({ 
  editMode = 'view',
  config = defaultScheduleConfig 
}: WeeklyScheduleProps) {
  const [classBlocks, setClassBlocks] = useState<ClassBlock[]>(generateClassBlocks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [modalBlock, setModalBlock] = useState<ClassBlock | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 시간 슬롯 생성
  const timeSlots: TimeSlot[] = useMemo(() => {
    const slots: TimeSlot[] = [];
    for (let hour = config.startHour; hour <= config.endHour; hour++) {
      for (let minute = 0; minute < 60; minute += config.timeSlotMinutes) {
        if (hour === config.endHour && minute > 0) break;
        slots.push({
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          hour,
          minute
        });
      }
    }
    return slots;
  }, [config]);

  // 드래그 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // 요일별 수업 블록 그룹화
  const groupedBlocks = useMemo(() => {
    const grouped: Record<number, ClassBlock[]> = {};
    classBlocks.forEach((block) => {
      if (!grouped[block.dayOfWeek]) grouped[block.dayOfWeek] = [];
      grouped[block.dayOfWeek].push(block);
    });
    return grouped;
  }, [classBlocks]);

  // 시간 위치 계산
  const getTimePosition = (startTime: string, endTime: string) => {
    const parseTime = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const startMinutes = parseTime(startTime);
    const endMinutes = parseTime(endTime);
    const configStartMinutes = config.startHour * 60;
    const slotHeightPerMinute = 2; // 1분당 2px (10분당 20px)
    
    const top = (startMinutes - configStartMinutes) * slotHeightPerMinute;
    const height = (endMinutes - startMinutes) * slotHeightPerMinute;
    
    
    return { top, height };
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const activeBlock = classBlocks.find(block => block.id === active.id);
      if (activeBlock) {
        const [targetDay, targetTime] = (over.id as string).split('-');
        const dayIndex = parseInt(targetDay);
        
        if (!isNaN(dayIndex) && dayIndex >= 0 && dayIndex <= 6 && targetTime) {
          // 시간 계산: 드롭된 위치의 시간을 새로운 시작 시간으로 설정
          const parseTime = (time: string) => {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
          };
          
          const formatTime = (minutes: number) => {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
          };
          
          // 원래 수업 길이 계산
          const originalDuration = parseTime(activeBlock.endTime) - parseTime(activeBlock.startTime);
          const newStartMinutes = parseTime(targetTime);
          const newEndMinutes = newStartMinutes + originalDuration;
          
          setClassBlocks(blocks => 
            blocks.map(block => 
              block.id === active.id 
                ? { 
                    ...block, 
                    dayOfWeek: dayIndex,
                    startTime: formatTime(newStartMinutes),
                    endTime: formatTime(newEndMinutes)
                  }
                : block
            )
          );
        }
      }
    }
    
    setActiveId(null);
  };

  const handleShowModal = (block: ClassBlock) => {
    setModalBlock(block);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalBlock(null);
  };

  const handleSave = (blockId: string, updatedData: Partial<ClassBlock>) => {
    setClassBlocks(blocks => 
      blocks.map(block => 
        block.id === blockId 
          ? { ...block, ...updatedData }
          : block
      )
    );
  };

  const activeBlock = classBlocks.find(block => block.id === activeId);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">주간 시간표</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span>수학</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-500"></div>
            <span>영어</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-500"></div>
            <span>과학</span>
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-8 border-b border-gray-200">
            <div className="p-4 bg-gray-50 border-r border-gray-200">
              <div className="font-medium text-gray-700">시간</div>
            </div>
            {days.map((day, idx) => (
              <div key={idx} className="p-4 bg-gray-50 border-r border-gray-200 last:border-r-0">
                <div className="font-medium text-gray-700 text-center">{day}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-8 min-h-[1560px]">
            {/* 시간 컬럼 */}
            <div className="border-r border-gray-200 bg-gray-50">
              {timeSlots.filter((_, index) => index % 6 === 0).map((slot) => (
                <div 
                  key={slot.time} 
                  className="h-[120px] border-b border-gray-100 flex items-start justify-center pt-2"
                >
                  <span className="text-xs text-gray-600 font-medium">{slot.time}</span>
                </div>
              ))}
            </div>

            {/* 요일 컬럼들 */}
            {days.map((day, dayIndex) => (
              <div 
                key={dayIndex} 
                className="border-r border-gray-200 last:border-r-0 relative bg-gray-50/30"
              >
                {/* 시간 그리드 라인 - 드롭 영역으로 변환 */}
                {timeSlots.map((slot) => (
                  <DroppableTimeSlot 
                    key={slot.time}
                    dayIndex={dayIndex}
                    timeSlot={slot.time}
                  >
                    <div />
                  </DroppableTimeSlot>
                ))}

                {/* 수업 블록들 */}
                <div className="absolute inset-0 p-1 pointer-events-none">
                  {groupedBlocks[dayIndex]?.map((block) => {
                    const position = getTimePosition(block.startTime, block.endTime);
                    return (
                      <div
                        key={block.id}
                        className="absolute left-1 right-1 pointer-events-auto"
                        style={{
                          top: `${position.top + 1}px`,
                          height: `${position.height - 2}px`,
                        }}
                      >
                        <DraggableClassBlock
                          block={block}
                          editMode={editMode}
                          onShowModal={handleShowModal}
                          isDragging={activeId === block.id}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeBlock ? (
            <DraggableClassBlock
              block={activeBlock}
              editMode={editMode}
              onShowModal={() => {}}
              isDragging={true}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* 모달 */}
      <ClassModal
        block={modalBlock}
        editMode={editMode}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
      />

      {editMode === 'admin' && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <Plus className="w-4 h-4" />
            <span>관리자 모드: 수업 블록을 클릭하여 정보를 보거나 드래그하여 이동할 수 있습니다.</span>
          </div>
        </div>
      )}
    </div>
  );
}
