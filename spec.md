# 프로젝트 타임라인 캘린더 웹앱 사양 (초안)

## 1. UX / 와이어프레임 개요

Toss 스타일의 핵심인 넓은 여백, 정돈된 타이포그래피, 미묘한 음영·그라데이션만으로 강조하는 톤을 기준으로 구성합니다.

### 1.1 상단 헤더 바
- **좌측:** 서비스 로고/텍스트와 현재 선택된 프로젝트 그룹명.
- **중앙:** 뷰 토글 (월 / 주 / 타임라인 / 리스트). Segmented control 형태, hover 시 살짝 밝아지는 표현.
- **우측:** 글로벌 필터(태그, 담당자), 공유 링크 버튼, "새 이벤트" 프라이머리 버튼.

### 1.2 좌측 사이드 패널
- 프로젝트/태그 트리 리스트. 토글형 아코디언 구조.
- 각 항목은 토글 스위치로 on/off(필터링). 활성 항목만 메인 뷰에 등장.
- 패널 하단에 웹훅 구독 상태/관리 버튼.

### 1.3 메인 뷰
- **월/주 보기:** 넓은 그리드, 이벤트 카드는 둥근 사각형에 얇은 선·파스텔 배경.
- **타임라인 보기:** 가로 스크롤 가능한 바 형태. 프로젝트별 행(Row) + 기간 바.
- **리스트(Agenda) 보기:** 날짜별 그룹핑 + 카드.
- Hover 시 미세 그림자, 클릭 시 우측 플로팅 상세 패널 열림.

### 1.4 우측 상세 패널
- 이벤트 기본 정보 + 태그/담당자/상태 배지.
- 액션 버튼: 편집, 복제, 삭제.
- 웹훅 전송 기록(최근 5개) 요약.

### 1.5 입력 모달
- 제목 입력 시 자동으로 프로젝트/기간 추천.
- 반복 이벤트 옵션은 Collapsible 섹션에 배치.
- 빠른 입력용 "Command Palette" (⌘+K) 지원: 자연어로 "3/18~3/20 디자인 QA" 등을 입력하면 파싱.

## 2. 주요 컴포넌트 트리 (요약)

```
<AppShell>
  <Header>
    <Logo />
    <ViewToggle />
    <GlobalFilters />
    <ShareButton />
    <NewEventButton />
  </Header>
  <Body>
    <Sidebar>
      <ProjectFilterTree />
      <WebhookStatusCard />
    </Sidebar>
    <MainView>
      <CalendarGrid /> | <TimelineView /> | <AgendaList />
    </MainView>
    <DetailPanel />
  </Body>
  <Modals>
    <EventEditorModal />
    <ShareLinkModal />
    <WebhookConfigModal />
  </Modals>
  <CommandPalette />
</AppShell>
```

## 3. 데이터 스키마 (초안)

### 3.1 Event
| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | string (UUID) | 이벤트 ID |
| `title` | string | 제목 |
| `description` | string | 설명 |
| `projectId` | string | 프로젝트 식별자 |
| `tags` | string[] | 태그 리스트 |
| `owner` | string | 담당자/팀 |
| `status` | enum(`planned`,`in-progress`,`blocked`,`done`) | 상태 배지 |
| `start` / `end` | ISO datetime | 일정 범위 |
| `allDay` | boolean | 종일 여부 |
| `recurrence` | object 
| `color` | string | 카드 색상 (선택) |
| `updatedAt` / `updatedBy` | datetime/string | 로그용 |

### 3.2 Project / Tag / Filter 메타
- `Project { id, name, color, order }`
- `Tag { id, label, color }`

### 3.3 ShareLink
| 필드 | 타입 | 설명 |
| `id` | string |
| `urlToken` | string |
| `permissions` | enum(`edit`,`view`) — 기본 edit |
| `expiresAt` | datetime? (선택) |
| `createdBy`, `createdAt` |

### 3.4 WebhookSubscription
| 필드 | 타입 |
| --- | --- |
| `id` | string |
| `endpoint` | URL |
| `secret` | string (HMAC 시드) |
| `events` | string[] (예: `event.created`, `event.updated`, `event.deleted`) |
| `createdBy`, `createdAt`, `lastDeliveredAt`, `status` |

## 4. 웹훅 계약 (초안)

- **전송 시점:** 이벤트 생성/수정/삭제, 반복 인스턴스 변경, 공유 링크 생성/만료 등.
- **HTTP 메서드:** POST
- **헤더:**
  - `Content-Type: application/json`
  - `X-Calendar-Signature: sha256=<HMAC>` (비밀키 기반)
- **Payload 예시 (`event.updated`)**
```json
{
  "type": "event.updated",
  "timestamp": "2026-03-09T03:10:00Z",
  "data": {
    "id": "evt_123",
    "title": "Design Delivery",
    "projectId": "proj_marketing",
    "tags": ["launch"],
    "status": "in-progress",
    "start": "2026-03-10T01:00:00Z",
    "end": "2026-03-12T09:00:00Z",
    "updatedBy": "haneul"
  }
}
```
- 실패 시 지수 백오프로 최대 5회 재시도, 모두 실패하면 `status=failed` 로 표시.

## 5. 구현 로드맵 (제안)
1. UI 컴포넌트 스켈레톤 + 라우팅 세팅 (React + Vite/Next 등).
2. 데이터 모델/상태 관리 (zustand, jotai 혹은 Redux Toolkit).
3. 캘린더/타임라인 뷰 구현 (FullCalendar 커스터마이즈 vs 자체 구현 결정).
4. 이벤트 CRUD + 공유 링크 API.
5. 웹훅 관리/전송 파이프라인.
6. Command Palette & 자연어 입력, 반복 이벤트 편집.

필요 시 세부 화면별 Figma 와이어프레임이나 컴포넌트 토큰(컬러, 타이포 등)을 추가로 정리할 예정입니다.
