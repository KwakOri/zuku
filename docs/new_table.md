# 수업 시간표 및 앞/뒤 타임 구성 설계

## 개요

- classes table에 새로운 type column 추가. 수업이 앞/뒤타임으로 구분되어 있는지 아닌지 여부를 저장.
- 기존 수업 시간표에서 **수업 시간 부분**을 분리하여 새로운 테이블(`class_composition`)로 관리.
- **앞 타임**은 `class`, **뒤 타임**은 `clinic`으로 구분.
- 학생은 수업 등록 시 **강의 선택 -> 앞/뒤타임으로 나뉘는 수업인지 단일 수업인지 선택 → 시간 선택 (앞 타임/뒤 타임 이라면 두 가지 모두 선택)** 구조로 진행.
- 수업 생성 시 시간/학생을 즉시 설정할 수도 있고, 추후에 설정할 수도 있도록 유연하게 설계.

---

## 테이블 설계

### 1. `class_composition` (신규 테이블)

수업 시간 및 가능한 시간대를 관리.  
`class_id`는 강의(`class`) 테이블과 **외래키**로 연결.

| 컬럼명        | 설명                                |
| ------------- | ----------------------------------- |
| `id`          | PK (랜덤 UUID)                      |
| `class_id`    | FK → class 테이블                   |
| `type`        | `class`(앞 타임), `clinic`(뒤 타임) |
| `day_of_week` | 요일 (0=월, 6=일)                   |
| `start_time`  | 시작 시간                           |
| `end_time`    | 종료 시간                           |

**예시 데이터**

| id      | class_id   | type   | day_of_week | start_time | end_time |
| ------- | ---------- | ------ | ----------- | ---------- | -------- |
| random1 | class_uuid | class  | 0           | 16:00      | 18:00    |
| random2 | class_uuid | class  | 0           | 18:00      | 20:00    |
| random3 | class_uuid | clinic | 2           | 16:00      | 18:00    |
| random4 | class_uuid | clinic | 2           | 18:00      | 20:00    |

---

### 2. `class_students`

학생과 수업의 관계를 관리.  
`composition_id`를 통해 학생이 수강 중인 **앞 타임/뒤 타임 시간대**를 기록.

| 컬럼명           | 설명                          |
| ---------------- | ----------------------------- |
| `id`             | PK                            |
| `student_id`     | FK → student 테이블           |
| `class_id`       | FK → class 테이블             |
| `composition_id` | FK → class_composition 테이블 |

---

## 기능 흐름

1. **수업 개설**

   - 강의를 생성할 때 앞 타임/뒤 타임(`class_composition`)을 함께 설정 가능.
   - 시간대는 추후에 따로 추가/수정 가능.

2. **학생 수강 등록**

   - 강의 선택 후 → 앞 타임/뒤 타임 선택.
   - `class_students` 테이블에 기록 (`composition_id` 저장).

3. **관리 페이지**
   - 강의 생성 및 관리 시 → 앞 타임/뒤 타임 선택 UI 제공.
   - 학생 등록 시 → 강의와 시간대 매칭 가능.

---

## 설계 원칙

- **유연성 보장**
  - 수업 시간, 학생 등록을 필수로 동시에 하지 않아도 됨.
  - 추후 별도로 설정 가능.
- **데이터 정규화**
  - 시간대(`class_composition`)와 학생(`class_students`)을 별도 **join table**로 관리.
