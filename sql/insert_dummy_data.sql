-- ==================================================
-- 학원 시간표 관리 앱 더미 데이터 삽입 SQL 스크립트
-- 파일명: insert_dummy_data.sql
-- 작성일: 2025-01-13
-- ==================================================

-- 1. 학생 테이블 데이터 삽입 (students 테이블)
-- 필드: id(number-자동증가), name(string), grade(number), phone(string|null), parent_phone(string|null), email(string|null)
INSERT INTO students (name, grade, phone, parent_phone, email) VALUES
('정우진', 8, '010-1234-5678', '010-9876-5432', 'woojin.jeong@example.com'),
('김서윤', 8, '010-2345-6789', '010-8765-4321', 'seoyoon.kim@example.com'),
('이민서', 9, '010-3456-7890', '010-7654-3210', 'minseo.lee@example.com'),
('박하은', 8, '010-4567-8901', '010-6543-2109', 'haeun.park@example.com'),
('최도윤', 8, '010-5678-9012', '010-5432-1098', 'doyoon.choi@example.com'),
('강민규', 8, '010-6789-0123', '010-4321-0987', 'mingyu.kang@example.com'),
('조서현', 9, '010-7890-1234', '010-3210-9876', 'seohyun.jo@example.com'),
('윤지훈', 9, '010-8901-2345', '010-2109-8765', 'jihun.yoon@example.com'),
('송은서', 8, '010-9012-3456', '010-1098-7654', 'eunseo.song@example.com'),
('한준서', 8, '010-0123-4567', '010-0987-6543', 'junseo.han@example.com'),
('임유진', 9, '010-1122-3344', '010-9988-7766', 'yujin.im@example.com'),
('고민준', 9, '010-2233-4455', '010-8877-6655', 'minjun.go@example.com'),
('오지우', 9, '010-3344-5566', '010-7766-5544', 'jiwoo.oh@example.com'),
('노채은', 8, '010-4455-6677', '010-6655-4433', 'chaeun.no@example.com'),
('전수빈', 8, '010-5566-7788', '010-5544-3322', 'subin.jeon@example.com'),
('이서준', 8, '010-6677-8899', '010-4433-2211', 'seojun.lee@example.com'),
('박서율', 9, '010-7788-9900', '010-3322-1100', 'seoyul.park@example.com'),
('최민지', 9, '010-8899-0011', '010-2211-0099', 'minji.choi@example.com'),
('김서진', 8, '010-9900-1122', '010-1100-9988', 'seojin.kim@example.com'),
('이지우', 8, '010-0011-2233', '010-0099-8877', 'jiwoo.lee@example.com'),
('황지민', 9, '010-1212-3434', '010-5656-7878', 'jimin.hwang@example.com'),
('서예준', 8, '010-2323-4545', '010-6767-8989', 'yejun.seo@example.com'),
('정하윤', 9, '010-3434-5656', '010-7878-9090', 'hayoon.jeong@example.com'),
('문지호', 8, '010-4545-6767', '010-8989-0101', 'jiho.moon@example.com'),
('손서아', 9, '010-5656-7878', '010-9090-1212', 'seoa.son@example.com'),
('배준우', 8, '010-6767-8989', '010-0101-2323', 'junwoo.bae@example.com'),
('윤아인', 9, '010-7878-9090', '010-1212-3434', 'ain.yoon@example.com'),
('신시우', 8, '010-8989-0101', '010-2323-4545', 'siwoo.shin@example.com'),
('허유나', 9, '010-9090-1212', '010-3434-5656', 'yuna.heo@example.com'),
('장선우', 8, '010-0101-2323', '010-4545-6767', 'sunwoo.jang@example.com'),
('권다은', 9, '010-1111-2222', '010-3333-4444', 'daeun.kwon@example.com'),
('임건우', 8, '010-2222-3333', '010-4444-5555', 'geonwoo.im@example.com'),
('류지아', 9, '010-3333-4444', '010-5555-6666', 'jia.ryu@example.com'),
('홍은우', 8, '010-4444-5555', '010-6666-7777', 'eunwoo.hong@example.com'),
('백하린', 9, '010-5555-6666', '010-7777-8888', 'harin.baek@example.com'),
('송지환', 8, '010-6666-7777', '010-8888-9999', 'jihwan.song@example.com'),
('안수아', 9, '010-7777-8888', '010-9999-0000', 'sua.ahn@example.com'),
('정태윤', 8, '010-8888-9999', '010-0000-1111', 'taeyoon.jung@example.com'),
('나소율', 9, '010-9999-0000', '010-1111-2222', 'soyul.na@example.com'),
('차은성', 8, '010-0000-1111', '010-2222-3333', 'eunseong.cha@example.com');

-- 2. 강사 테이블 데이터 삽입 (teachers 테이블)
-- 필드: id(string), name(string), subjects(string[]), phone(string|null), email(string|null), user_id(string|null)
INSERT INTO teachers (id, name, subjects, phone, email) VALUES
('teacher-1', '김수학', ARRAY['수학', '물리'], '010-1111-2222', 'kim.math@academy.com'),
('teacher-2', '박영어', ARRAY['영어', '영문법'], '010-3333-4444', 'park.english@academy.com'),
('teacher-3', '이과학', ARRAY['화학', '생물'], '010-5555-6666', 'lee.science@academy.com');

-- 3. 조교 테이블 데이터 삽입 (assistants 테이블)
-- 필드: id(string), name(string), teacher_id(string|null), subjects(string[]), phone(string|null), email(string|null), assigned_grades(number[]), user_id(string|null)
INSERT INTO assistants (id, name, teacher_id, subjects, phone, email, assigned_grades) VALUES
('assistant-1', '김조교', 'teacher-1', ARRAY['수학'], '010-1111-1111', 'kim.assistant@academy.com', ARRAY[10, 11, 12]),
('assistant-2', '이조교', 'teacher-2', ARRAY['영어'], '010-2222-2222', 'lee.assistant@academy.com', ARRAY[10, 11, 12]),
('assistant-3', '박조교', 'teacher-3', ARRAY['화학', '생물'], '010-3333-3333', 'park.assistant@academy.com', ARRAY[10, 11]);

-- 4. 수업 테이블 데이터 삽입 (classes 테이블)
-- 필드: id(string), title(string), subject(string), teacher_id(string|null), teacher_name(string), start_time(string), end_time(string), day_of_week(number), color(string), room(string|null), max_students(number|null), description(string|null), rrule(string|null)
INSERT INTO classes (id, title, subject, teacher_id, teacher_name, start_time, end_time, day_of_week, color, room, max_students, description, rrule) VALUES
('class-1', '중2 수학 A반', '수학', 'teacher-1', '김수학', '14:00', '15:30', 1, '#3B82F6', 'A101', 8, '중학교 2학년 수학 기본반', 'FREQ=WEEKLY;BYDAY=MO'),
('class-2', '중2 영어 A반', '영어', 'teacher-2', '박영어', '16:00', '17:30', 3, '#10B981', 'B201', 8, '중학교 2학년 영어 기본반', 'FREQ=WEEKLY;BYDAY=WE'),
('class-3', '중2 수학 B반', '수학', 'teacher-1', '김수학', '15:30', '17:00', 1, '#3B82F6', 'A102', 8, '중학교 2학년 수학 심화반', 'FREQ=WEEKLY;BYDAY=MO'),
('class-4', '중3 화학 실험반', '화학', 'teacher-3', '이과학', '19:00', '20:30', 5, '#F59E0B', '실험실', 6, '중학교 3학년 화학 실험반', 'FREQ=WEEKLY;BYDAY=FR'),
('class-5', '중2 영어 B반', '영어', 'teacher-2', '박영어', '18:00', '19:30', 2, '#10B981', 'B202', 8, '중학교 2학년 영어 심화반', 'FREQ=WEEKLY;BYDAY=TU'),
('class-6', '중3 수학 A반', '수학', 'teacher-1', '김수학', '17:00', '18:30', 3, '#3B82F6', 'A103', 8, '중학교 3학년 수학 기본반', 'FREQ=WEEKLY;BYDAY=WE'),
('class-7', '중3 영어 A반', '영어', 'teacher-2', '박영어', '14:00', '15:30', 4, '#10B981', 'B203', 8, '중학교 3학년 영어 기본반', 'FREQ=WEEKLY;BYDAY=TH'),
('class-8', '중2 물리 입문반', '물리', 'teacher-1', '김수학', '19:30', '21:00', 2, '#8B5CF6', 'A104', 6, '중학교 2학년 물리 입문반', 'FREQ=WEEKLY;BYDAY=TU');

-- 5. 수업-학생 관계 테이블 데이터 삽입 (class_students 테이블)
-- 필드: id(string), class_id(string), student_id(number), enrolled_date(string), status(string)
INSERT INTO class_students (id, class_id, student_id, enrolled_date, status) VALUES
('cs-1', 'class-1', 1, '2024-01-01', 'active'),
('cs-2', 'class-2', 2, '2024-01-01', 'active'),
('cs-3', 'class-4', 3, '2024-01-01', 'active'),
('cs-4', 'class-3', 4, '2024-02-01', 'active'),
('cs-5', 'class-5', 5, '2024-02-15', 'active'),
('cs-6', 'class-6', 6, '2024-01-01', 'active'),
('cs-7', 'class-7', 7, '2024-03-01', 'active'),
('cs-8', 'class-8', 8, '2024-01-01', 'active'),
('cs-9', 'class-1', 9, '2024-01-15', 'active'),
('cs-10', 'class-2', 10, '2024-02-01', 'active'),
('cs-11', 'class-6', 11, '2024-01-01', 'active'),
('cs-12', 'class-7', 12, '2024-04-01', 'active'),
('cs-13', 'class-4', 13, '2024-01-01', 'active'),
('cs-14', 'class-3', 14, '2024-01-01', 'active'),
('cs-15', 'class-5', 15, '2024-04-10', 'active');

-- 6. 학생 개인 일정 테이블 데이터 삽입 (student_schedules 테이블) - 첫 30개
-- 필드: id(string), student_id(number), title(string), description(string|null), start_time(string), end_time(string), day_of_week(number), color(string), type(string), location(string|null), recurring(boolean|null), rrule(string|null), created_date(string), status(string)
INSERT INTO student_schedules (id, student_id, title, description, start_time, end_time, day_of_week, color, type, location, recurring, created_date, status) VALUES
('ss-1', 1, '피아노 레슨', '개인 피아노 레슨', '16:00', '17:00', 0, '#8B5CF6', 'extracurricular', '음악학원', true, '2024-01-01', 'active'),
('ss-2', 1, '수영 강습', '개인 수영 강습', '18:00', '19:30', 2, '#EF4444', 'extracurricular', '수영장', true, '2024-03-01', 'active'),
('ss-3', 2, '태권도 수련', '품새와 겨루기', '17:30', '18:30', 1, '#06B6D4', 'extracurricular', '태권도장', true, '2024-01-01', 'active'),
('ss-4', 2, '미술학원', '드로잉 수업', '19:00', '20:00', 4, '#14B8A6', 'extracurricular', '미술학원', true, '2024-02-15', 'active'),
('ss-5', 3, '코딩 스터디', '파이썬 기초', '16:30', '18:00', 3, '#64748B', 'study', '스터디카페', true, '2024-04-10', 'active'),
('ss-6', 3, '농구 훈련', '개인 농구 스킬 연습', '20:00', '21:00', 5, '#F97316', 'extracurricular', '체육관', true, '2024-05-20', 'active'),
('ss-7', 4, '첼로 레슨', '개인 첼로 레슨', '17:00', '18:30', 0, '#8B5CF6', 'extracurricular', '음악학원', true, '2024-01-01', 'active'),
('ss-8', 4, '과학 실험', '주말 과학 실험 교실', '16:00', '17:00', 6, '#EF4444', 'extracurricular', '과학실험실', true, '2024-03-10', 'active'),
('ss-9', 5, '중국어 회화', '그룹 중국어 회화', '18:00', '19:00', 1, '#06B6D4', 'study', '외국어학원', true, '2024-02-20', 'active'),
('ss-10', 5, '복싱', '개인 복싱 훈련', '20:30', '22:00', 3, '#14B8A6', 'extracurricular', '복싱 체육관', true, '2024-06-01', 'active'),
('ss-11', 6, '요가', '성장 요가 수업', '16:00', '17:30', 2, '#64748B', 'extracurricular', '요가 스튜디오', true, '2024-01-10', 'active'),
('ss-12', 6, '기타 레슨', '통기타 초급', '19:00', '20:00', 4, '#F97316', 'extracurricular', '음악학원', true, '2024-02-25', 'active'),
('ss-13', 7, '축구 동아리', '축구 스킬 훈련', '17:00', '18:00', 0, '#8B5CF6', 'extracurricular', '운동장', true, '2024-03-05', 'active'),
('ss-14', 7, '입시 미술', '대학 입시 포트폴리오 준비', '19:30', '21:00', 6, '#EF4444', 'study', '미술학원', true, '2024-04-15', 'active'),
('ss-15', 8, '바이올린 레슨', '개인 바이올린 레슨', '16:30', '17:30', 1, '#06B6D4', 'extracurricular', '음악 스튜디오', true, '2024-01-01', 'active'),
('ss-16', 8, '토론 수업', '사회 이슈 토론', '18:00', '19:30', 5, '#14B8A6', 'study', '문화센터', true, '2024-02-01', 'active'),
('ss-17', 9, '필라테스', '체형 교정 필라테스', '19:00', '20:00', 2, '#64748B', 'extracurricular', '필라테스 스튜디오', true, '2024-05-01', 'active'),
('ss-18', 9, '밴드 연습', '주말 밴드 연습', '20:00', '21:30', 6, '#F97316', 'extracurricular', '연습실', true, '2024-06-10', 'active'),
('ss-19', 10, '성악 레슨', '개인 성악 레슨', '17:30', '19:00', 0, '#8B5CF6', 'extracurricular', '성악 스튜디오', true, '2024-01-01', 'active'),
('ss-20', 10, '체스 동아리', '전략 체스 학습', '20:00', '21:00', 4, '#EF4444', 'extracurricular', '체스 클럽', true, '2024-03-20', 'active'),
('ss-21', 11, '클라리넷 레슨', '개인 클라리넷 레슨', '16:00', '17:00', 1, '#06B6D4', 'extracurricular', '음악학원', true, '2024-01-01', 'active'),
('ss-22', 11, '테니스', '테니스 개인 코칭', '18:00', '19:30', 3, '#14B8A6', 'extracurricular', '테니스장', true, '2024-02-01', 'active'),
('ss-23', 12, '독서 모임', '문학 작품 토론', '19:00', '20:00', 2, '#64748B', 'study', '도서관', true, '2024-04-01', 'active'),
('ss-24', 12, '배드민턴', '배드민턴 클럽 활동', '20:30', '22:00', 6, '#F97316', 'extracurricular', '체육관', true, '2024-05-10', 'active'),
('ss-25', 13, '피아노 레슨', '개인 피아노 레슨', '16:00', '17:00', 0, '#8B5CF6', 'extracurricular', '음악학원', true, '2024-01-01', 'active'),
('ss-26', 13, '축구 훈련', '개인 축구 스킬 연습', '18:00', '19:30', 2, '#EF4444', 'extracurricular', '운동장', true, '2024-03-01', 'active'),
('ss-27', 14, '태권도 수련', '품새와 겨루기', '17:30', '18:30', 1, '#06B6D4', 'extracurricular', '태권도장', true, '2024-01-01', 'active'),
('ss-28', 14, '미술학원', '드로잉 수업', '19:00', '20:00', 4, '#14B8A6', 'extracurricular', '미술학원', true, '2024-02-15', 'active'),
('ss-29', 15, '코딩 스터디', '파이썬 기초', '16:30', '18:00', 3, '#64748B', 'study', '스터디카페', true, '2024-04-10', 'active'),
('ss-30', 15, '농구 훈련', '개인 농구 스킬 연습', '20:00', '21:00', 5, '#F97316', 'extracurricular', '체육관', true, '2024-05-20', 'active');

-- ==================================================
-- 데이터 삽입 완료 후 확인 쿼리
-- ==================================================

-- 각 테이블별 데이터 개수 확인
SELECT '학생 수' as category, COUNT(*) as count FROM students
UNION ALL
SELECT '강사 수' as category, COUNT(*) as count FROM teachers  
UNION ALL
SELECT '조교 수' as category, COUNT(*) as count FROM assistants
UNION ALL
SELECT '수업 수' as category, COUNT(*) as count FROM classes
UNION ALL
SELECT '수업-학생 관계 수' as category, COUNT(*) as count FROM class_students
UNION ALL
SELECT '개인 일정 수' as category, COUNT(*) as count FROM student_schedules;

-- 수업별 수강 학생 현황 확인
SELECT 
    c.title as "수업명",
    c.teacher_name as "강사명",
    c.room as "강의실",
    COUNT(cs.student_id) as "수강생 수",
    c.max_students as "최대 인원"
FROM classes c
LEFT JOIN class_students cs ON c.id = cs.class_id AND cs.status = 'active'
GROUP BY c.id, c.title, c.teacher_name, c.room, c.max_students
ORDER BY c.title;

-- 학생별 수업 및 개인 일정 현황
SELECT 
    s.name as "학생명",
    s.grade as "학년",
    COUNT(DISTINCT cs.class_id) as "수강 수업 수",
    COUNT(DISTINCT ss.id) as "개인 일정 수"
FROM students s
LEFT JOIN class_students cs ON s.id = cs.student_id AND cs.status = 'active'
LEFT JOIN student_schedules ss ON s.id = ss.student_id AND ss.status = 'active'
GROUP BY s.id, s.name, s.grade
ORDER BY s.name;

-- ==================================================
-- 사용 가이드
-- ==================================================
/*
1. 이 SQL 파일을 Supabase 대시보드의 SQL Editor에서 실행하세요.
2. 또는 psql 클라이언트를 통해 실행할 수 있습니다:
   psql -h your-host -p 5432 -d your-database -U your-username -f insert_dummy_data.sql

3. 실행 후 확인 쿼리를 통해 데이터가 올바르게 삽입되었는지 확인하세요.

4. 더 많은 학생 일정 데이터가 필요하다면, studentSchedules.ts 파일의 
   나머지 120개 데이터를 참조하여 추가 INSERT문을 작성할 수 있습니다.
*/