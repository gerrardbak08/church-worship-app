# 회원가입 / 로그인 (user-auth) Planning Document

> **Summary**: 이메일+비밀번호 기반 회원가입 및 로그인, JWT 토큰 인증 구현
>
> **Project**: unix
> **Version**: 0.1.0
> **Author**: -
> **Date**: 2026-03-12
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 서비스 이용자를 식별하고 개인화된 경험을 제공하기 위한 인증 시스템이 없음 |
| **Solution** | bkend.ai BaaS의 내장 Auth API를 활용한 이메일 회원가입/로그인 + JWT 토큰 관리 |
| **Function/UX Effect** | 로그인 페이지, 회원가입 페이지, 로그인 상태 유지, 보호된 라우트 접근 제어 |
| **Core Value** | 사용자 계정 기반의 개인화 서비스 제공 — 추가 백엔드 없이 bkend.ai로 즉시 구현 |

---

## 1. Overview

### 1.1 Purpose

서비스 이용자가 계정을 만들고 로그인하여 인증된 상태로 서비스를 이용할 수 있도록 한다.
bkend.ai의 내장 인증 시스템을 사용하여 백엔드 구현 없이 빠르게 완성한다.

### 1.2 Background

unix 프로젝트는 개인화된 기능을 제공하는 웹 서비스다.
사용자 식별이 없으면 개인 데이터 저장, 설정, 권한 관리가 불가능하다.
bkend.ai의 `/auth/email/signup`, `/auth/email/signin` API를 직접 활용한다.

### 1.3 Related Documents

- bkend.ai Auth 문서: https://docs.bkend.ai/auth
- 프로젝트 초기화 문서: CLAUDE.md

---

## 2. Scope

### 2.1 In Scope

- [ ] 이메일 + 비밀번호 회원가입 페이지 (`/register`)
- [ ] 이메일 + 비밀번호 로그인 페이지 (`/login`)
- [ ] JWT Access Token 저장 및 관리 (localStorage)
- [ ] 로그아웃 기능
- [ ] 보호된 라우트 (`/dashboard` 등) — 미인증 시 `/login` 리다이렉트
- [ ] 로그인 상태 전역 관리 (Zustand `useAuth`)
- [ ] 폼 유효성 검사 (이메일 형식, 비밀번호 최소 8자)
- [ ] 에러 메시지 표시 (이메일 중복, 잘못된 비밀번호 등)

### 2.2 Out of Scope

- 소셜 로그인 (Google, Kakao 등) — 별도 기능으로 추가 가능
- 이메일 인증 (이메일 발송)
- 비밀번호 재설정
- 2FA(이중 인증)
- Refresh Token 자동 갱신 로직 (초기 버전 제외)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 사용자는 이메일과 비밀번호로 회원가입할 수 있다 | High | Pending |
| FR-02 | 사용자는 이메일과 비밀번호로 로그인할 수 있다 | High | Pending |
| FR-03 | 로그인 성공 시 accessToken을 localStorage에 저장한다 | High | Pending |
| FR-04 | 로그아웃 시 토큰을 삭제하고 `/login`으로 이동한다 | High | Pending |
| FR-05 | 비인증 사용자가 보호된 라우트 접근 시 `/login`으로 리다이렉트 | High | Pending |
| FR-06 | 폼 입력값 유효성 검사 (이메일 형식, 비밀번호 8자 이상) | Medium | Pending |
| FR-07 | API 에러 시 사용자에게 한국어 에러 메시지 표시 | Medium | Pending |
| FR-08 | 로그인 상태는 페이지 새로고침 후에도 유지된다 (persist) | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 로그인 API 응답 < 500ms | 네트워크 탭 확인 |
| Security | 토큰은 localStorage (HTTPS 환경에서만 사용) | 코드 리뷰 |
| UX | 로딩 중 버튼 비활성화 및 스피너 표시 | 수동 테스트 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 회원가입 → 로그인 → 대시보드 접근 전체 플로우 동작
- [ ] 비인증 상태에서 `/dashboard` 접근 시 `/login` 리다이렉트 동작
- [ ] 잘못된 비밀번호 입력 시 에러 메시지 표시 동작
- [ ] 로그아웃 후 보호된 페이지 접근 불가 확인

### 4.2 Quality Criteria

- [ ] TypeScript 타입 에러 없음
- [ ] ESLint 에러 없음
- [ ] 빌드 성공 (`npm run build`)

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| bkend.ai 프로젝트 ID 미설정 | High | Medium | `.env.local`에 실제 PROJECT_ID 설정 필수, README에 명시 |
| localStorage XSS 취약점 | Medium | Low | HTTPS 환경 배포, Content-Security-Policy 헤더 설정 |
| 토큰 만료 처리 미흡 | Medium | Medium | 401 응답 시 자동 로그아웃 처리 추가 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites | ☐ |
| **Dynamic** | Feature-based, BaaS integration | Web apps, SaaS MVPs | ✅ |
| **Enterprise** | Microservices, strict layers | High-traffic systems | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Framework | Next.js / React | Next.js 14 (App Router) | 이미 설정됨 |
| State Management | Context / Zustand / Redux | Zustand (persist) | 경량, 영속성 지원 |
| API Client | fetch / axios | fetch (bkend.ts) | 이미 구현된 bkend.ts 활용 |
| Form Handling | react-hook-form / native | native state | 간단한 폼, 의존성 최소화 |
| Styling | Tailwind | Tailwind CSS | 이미 설정됨 |
| Backend | bkend.ai | bkend.ai Auth API | BaaS로 즉시 구현 |

### 6.3 File Structure

```
src/
  app/
    (auth)/
      login/page.tsx          # 로그인 페이지
      register/page.tsx       # 회원가입 페이지
    (main)/
      dashboard/page.tsx      # 보호된 페이지 (예시)
      layout.tsx              # ProtectedLayout
  components/
    features/auth/
      LoginForm.tsx           # 로그인 폼 컴포넌트
      RegisterForm.tsx        # 회원가입 폼 컴포넌트
  hooks/
    useAuth.ts                # 이미 생성됨 (수정 필요)
  lib/
    bkend.ts                  # 이미 생성됨
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` 존재 (Dynamic 레벨 명시)
- [x] ESLint 설정 (`.eslint.config.mjs`)
- [x] TypeScript 설정 (`tsconfig.json`)
- [ ] Prettier 설정 없음 (선택사항)

### 7.2 Conventions to Define

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **컴포넌트 명명** | 없음 | PascalCase, `Feature.tsx` | High |
| **훅 명명** | 없음 | `use` 접두사, camelCase | High |
| **에러 처리** | 없음 | try/catch + toast 알림 패턴 | Medium |

### 7.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `NEXT_PUBLIC_BKEND_API_URL` | bkend.ai API URL | Client | ✅ 있음 |
| `NEXT_PUBLIC_BKEND_PROJECT_ID` | bkend.ai 프로젝트 ID | Client | ⬜ 실제 값 입력 필요 |
| `NEXT_PUBLIC_BKEND_ENV` | 환경 (dev/prod) | Client | ✅ 있음 |

---

## 8. Next Steps

1. [ ] `/pdca design user-auth` — 상세 설계 문서 작성
2. [ ] bkend.ai 콘솔에서 프로젝트 생성 및 PROJECT_ID 확인
3. [ ] `.env.local` 실제 값으로 업데이트
4. [ ] 구현 시작

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-12 | Initial draft | - |
