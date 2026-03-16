# Walkthrough - KakaoTalk Weekly Automation (Business Channel Hybrid)

관리자님이 보유하신 **비즈니스 채널(@TxkMJG)**을 활용하여 더욱 전문적인 알림을 보내는 방안을 적용했습니다.

## 1. 작동 원리
- **Vercel Cron**: 매주 금요일 14:00(KST)에 서버 로직을 실행합니다.
- **Business Message (Solapi)**: 관리자님께 **교회 공식 채널 이름**으로 알림톡을 보냅니다.
- **관리자**: 공식 채널에서 온 고퀄리티 메시지를 확인하고 단톡방으로 **'전달'**합니다.

## 2. 비즈니스 채널 연동 단계 (필요 작업)

### 1단계: 솔라피(Solapi) 계정 생성 및 채널 연동
직접 카카오 API를 구축하는 것보다 [솔라피(Solapi)](https://solapi.com/) 같은 대행사를 쓰는 것이 훨씬 빠르고 확실합니다.
1. 솔라피 회원가입 및 로그인.
2. **카카오톡 채널 관리** 메뉴에서 `@TxkMJG` 채널을 등록합니다.
3. API Key와 API Secret을 발급받습니다.

### 2단계: 환경 변수 등록 (Vercel Dashboard)
Vercel 프로젝트 설정에 다음 변수들을 추가해 주세요:
- `SOLAPI_API_KEY`: 솔라피에서 발급받은 키.
- `SOLAPI_API_SECRET`: 솔라피에서 발급받은 비밀 키.
- `ADMIN_PHONE_NUMBER`: 알림을 받을 관리자님 전화번호.
- `CRON_SECRET`: 보안용 비밀 키.

## 3. 구현된 코드 파일
- **API 경로**: `src/app/api/cron/worship-reminder/route.ts` (솔라피 연동 버전으로 업데이트 가능)
- **스케줄 설정**: `vercel.json` (매주 금요일 14:00 KST 실행)

---
비즈니스 채널을 사용하면 메시지에 교회 로고와 공식 명칭이 포함되어 성도님들께 훨씬 더 높은 신뢰감을 줄 수 있습니다. 솔라피 설정에 도움이 필요하시면 말씀해 주세요!

---
이 방식은 계정 정지 위험이 전혀 없으며, 서버 비용도 들지 않는 가장 권장되는 방식입니다. 환경 변수 등록에 어려움이 있으시면 말씀해 주세요!
