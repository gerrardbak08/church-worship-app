# 사랑과 평안의 교회 — 앱 패밀리 디자인 시스템

여러 교회 앱(worship-app, malsseum 암송말씀 등)을 하나의 가족처럼 보이게 하기 위한 공유 디자인 토큰 문서.
구조(shadcn 토큰, 라운드, 그림자, 타이포그래피)는 완전히 통일하고, **primary 색상만 앱마다 다르게** 가져간다.

방향: **shadcn 구조 완전 정렬** — worship-app을 malsseum과 동일한 토큰 체계로 다시 만들었다. 이전에 있던 유기적 글래스모피즘(블러, 강한 그라디언트, 무거운 그림자)은 전부 제거했다.

## 1. 토큰 체계 (공유, malsseum과 동일 구조)

| 토큰 | worship-app | malsseum | 비고 |
| --- | --- | --- | --- |
| `--background` | `#ffffff` | `#ffffff` | |
| `--foreground` | `#142720` | `#0f1729` | 앱 accent 계열로 살짝 틴트 |
| `--card` | `#ffffff` | `#ffffff` | |
| `--primary` | **`#1c5e3d`** | `#1e488a` | **앱마다 다른 유일한 값** |
| `--primary-foreground` | `#ffffff` | `#ffffff` | |
| `--muted` | `#f1f4f2` | `#f3f4f6` | |
| `--muted-foreground` | `#5c6b62` | `#6b7280` | |
| `--success` | `#1d8644` | `#1d8644` | 의미색이라 공유 |
| `--destructive` | `#dc2828` | `#dc2828` | 의미색이라 공유 |
| `--border` / `--input` | `#e2e7e3` | `#e5e7eb` | |
| `--ring` | `#1c5e3d` | `#1e488a` | `--primary`와 동일 |
| `--radius` | `0.75rem` | `0.75rem` | **완전 동일** |

`--primary`의 `#1c5e3d`는 박상혁 목사의 다른 프로젝트(MeslapBooks)에서 이미 쓰고 있는 그린 팔레트(`#1C5E3D` 기본 / `#134A33` 다크 / `#2E8A57` 라이트)와 같다. 교회 관련 여러 프로젝트에 걸쳐 이미 검증된 브랜드 그린이라 그대로 가져왔다.

버튼 등에서 hover 시 더 어두운 톤이 필요하면 `--color-accent-strong: #134a33`을 사용한다 (globals.css에 정의됨).

## 2. 타이포그래피

| 역할 | 폰트 스택 | 사용처 |
| --- | --- | --- |
| 제목(세리프) | `'Lora', 'Noto Serif KR', 'Nanum Myeongjo', serif` | 앱 이름, 카드 제목, 완료 화면 헤드라인, 말씀 인용 |
| 본문/UI(산세리프) | `'Pretendard', 'SUIT', 'Noto Sans KR', sans-serif` | 라벨, 입력창, 버튼, 본문 |

세리프는 말씀/문구를 인용하는 자리에만 쓴다 — malsseum도 암송 구절에 세리프를 쓰는 동일한 패턴이라 자연스럽게 맞는다.

## 3. 구조 규칙

- **flat card만 사용한다.** `background: var(--card)` + `border: 1px solid var(--border)` + `border-radius: var(--radius)`. 반투명(rgba) 표면이나 `backdrop-filter` 블러는 쓰지 않는다.
- **그림자는 최소한으로.** 기본 카드/입력창은 그림자가 거의 없거나 `0 1px 2px rgba(ink,0.05)` 수준. 강한 `blur/spread` 그림자(예: `0 20px 60px`)는 쓰지 않는다.
- **그라디언트 배경 금지.** body/card 배경에 radial-gradient로 분위기를 주던 방식은 제거. 배경은 `var(--background)` 단색.
- **버튼은 solid color.** `linear-gradient`로 입체감을 주지 않고 `background: var(--primary)`, hover 시 `--color-accent-strong`로 톤만 바꾼다.
- **라운드 스케일**: 카드 `var(--radius)`(0.75rem), 버튼/입력창은 `calc(var(--radius) - 2px)` / `calc(var(--radius) - 4px)`로 한 단계씩 작게.

## 4. 적용 현황

- **worship-app** — 이 저장소에 shadcn 구조로 전면 재작성 완료 (`src/app/globals.css`, `src/app/worship/WorshipPage.css`).
- **malsseum** — 별도 배포된 사이트라 이 저장소에서 직접 수정 불가. malsseum은 이미 이 구조 그 자체이므로 추가 작업 없이 헤더 폰트만 세리프로 통일하면 패밀리 완성.

## 5. 새 앱을 패밀리에 합류시키는 법

1. 위 토큰 표를 그대로 가져온다 (`--background/--card/--muted/--border/--radius`는 고정값, `--primary`만 새로 정의).
2. "구조 규칙"(플랫 카드, 그림자 최소, 그라디언트 금지, solid 버튼)을 지킨다.
3. 세리프 헤더 + Pretendard 본문 조합을 적용한다.
4. 이 문서의 "적용 현황" 표에 새 앱을 추가한다.
