# Automation Plan: Weekly Worship Link Notification

Plan to automatically send the https://litt.ly/meslap link to the church group chat every Friday at 14:00.

## Automation Options

### Option A: PC KakaoTalk GUI Automation (Local)
Using Python on a local PC.
- **Pros**: Free, easy setup.
- **Cons**: PC must be ON; not suitable for server-side.

### Option B: Cloud VM (Windows/Linux) Automation (Server-side workaround)
Running the GUI automation script on a cloud-based Virtual Machine (AWS, Google Cloud, or a cheap VPS).
- **Pros**: 100% server-side, runs 24/7 without a home PC.
- **Cons**: Requires a monthly server fee (approx. $10-20/mo for a Windows VPS).

### Option C: KakaoTalk Business Channel (Existing: @TxkMJG)
Using official **AlimTalk (알림톡)** or **Friend Talk (친구톡)** via a third-party API (e.g., Solapi).
- **Pros**: Most professional branding, 100% cloud-automated.
- **Cons**: **Cannot post to an existing "Group Chat" (단톡방)**. Messages are sent 1:1 to members' phone numbers.
- **Requirements**: Requires **Business License (사업자 등록증)** for AlimTalk.

### Option E: Serverless (Vercel/GitHub) + Forwarding (Official/Safe)
- **Vercel Cron / GitHub Actions**: Every Friday at 14:00, triggers a message to **YOU** (via your Business Channel or "Me" API).
- **Admin's Action**: You receive the notification and forward it to the **Group Chat**.
- **Pros**: Free (if "Me" API), Official & Safe.
- **Cons**: Requires one click to forward.

### Option F: GitHub Actions + non-official Protocol (High Risk)
- **Pros**: Fully automated posting to group chat.
- **Cons**: **High risk of account ban**; technically unstable.

## Proposed Strategy: Hybrid (Business Channel + Forwarding)
Since you already have a Business Channel, we can use it to send a professional notification to **you**, which you then forward to the **Group Chat**. This ensures the message always looks official.

### Proposed Changes

#### [NEW] [automation.py](file:///c:/Users/sjowo/OneDrive/%EB%B0%94%ED%83%95%20%ED%99%94%EB%A9%B4/%EA%B0%9C%EB%B0%9C%20%EB%B0%8F%20%EC%9E%90%EB%8F%99%ED%99%94/unix/scripts/kakao_auto.py)
A Python script that:
1. Opens KakaoTalk.
2. Searches for the specific group chat name.
3. Pastes the message: "이번 주 가정예배 안내입니다: https://litt.ly/meslap"
4. Hits Enter.

### Scheduling
- Use **Windows Task Scheduler** to trigger the script every Friday at 14:00.

## User Review Required
> [!IMPORTANT]
> **컴퓨터 사용 환경 확인**: 금요일 14시에 항상 켜져 있는 PC가 있으신가요? 
> **사업자 등록 여부**: 교회 명의의 사업자 등록번호가 있다면 공식 알림톡(비즈니스 채널) 사용도 검토 가능합니다. 다만 비용이 발생합니다.

## Verification Plan
1. **Dry Run**: Run the script manually to see if it correctly finds the chat and pastes the message.
2. **Scheduled Test**: Set a test schedule (e.g., 5 minutes from now) to ensure Task Scheduler triggers it.
