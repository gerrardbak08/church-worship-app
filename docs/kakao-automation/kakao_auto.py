import pyautogui
import pyperclip
import time
import schedule

# --- 설정 사항 ---
# 1. 카카오톡 단체톡방의 정확한 이름 (예: "우리교회 단톡방")
CHATROOM_NAME = "교회 단톡방 이름" 
# 2. 보낼 메시지 내용
MESSAGE = "이번 주 가정예배 안내입니다 ✨\nhttps://litt.ly/meslap"
# ----------------

def send_kakao_message():
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] 메시지 전송을 시작합니다...")
    
    try:
        # 1. 카카오톡 창 활성화 (이미 실행되어 있어야 함)
        # Ctrl + Alt + K 는 카카오톡 기본 단축키 (창 열기)
        pyautogui.hotkey('ctrl', 'alt', 'k')
        time.sleep(1)
        
        # 2. 친구/채팅방 검색 단축키 (Ctrl + F)
        pyautogui.hotkey('ctrl', 'f')
        time.sleep(0.5)
        
        # 3. 채팅방 이름 입력
        pyperclip.copy(CHATROOM_NAME)
        pyautogui.hotkey('ctrl', 'v')
        time.sleep(1)
        
        # 4. 엔터키로 채팅방 열기
        pyautogui.press('enter')
        time.sleep(1)
        
        # 5. 메시지 입력 및 전송
        pyperclip.copy(MESSAGE)
        pyautogui.hotkey('ctrl', 'v')
        time.sleep(0.5)
        pyautogui.press('enter')
        
        # 6. 창 닫기 (ESC)
        pyautogui.press('esc')
        
        print("✅ 메시지 전송 완료!")
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")

# 매주 금요일 14:00에 실행 예약
schedule.every().friday.at("14:00").do(send_kakao_message)

if __name__ == "__main__":
    print("🚀 카카오톡 자동화 스크립트가 실행 중입니다...")
    print(f"예약 시간: 매주 금요일 14:00")
    print("프로그램을 종료하려면 Ctrl + C를 누르세요.")
    
    # 1회 즉시 테스트를 원하시면 아래 주석을 해제하세요
    # send_kakao_message()
    
    while True:
        schedule.run_pending()
        time.sleep(60) # 1분마다 확인
