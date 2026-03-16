import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * GET /api/cron/worship-reminder
 * This endpoint is triggered by Vercel Cron every Friday at 14:00 (KST).
 * It sends a notification to the Admin using either Solapi (Business Channel) or Kakao "Me" API.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const SOLAPI_API_KEY = process.env.SOLAPI_API_KEY;
  const SOLAPI_API_SECRET = process.env.SOLAPI_API_SECRET;
  const ADMIN_PHONE = process.env.ADMIN_PHONE_NUMBER;
  const KAKAO_ACCESS_TOKEN = process.env.KAKAO_ACCESS_TOKEN;
  
  const worshipLink = "https://litt.ly/meslap";
  const message = `[가정예배 알림] ✨\n오늘 14:00입니다. 아래 링크를 성도님들 단톡방에 전달해 주세요!\n\n${worshipLink}`;

  // Priority 1: Solapi (Business Channel Official Notification)
  if (SOLAPI_API_KEY && SOLAPI_API_SECRET && ADMIN_PHONE) {
    try {
      const date = new Date().toISOString();
      const salt = crypto.randomBytes(16).toString('hex');
      const signature = crypto
        .createHmac('sha256', SOLAPI_API_SECRET)
        .update(date + salt)
        .digest('hex');

      const response = await fetch('https://api.solapi.com/messages/v4/send-many', {
        method: 'POST',
        headers: {
          'Authorization': `HMAC-SHA256 apiKey=${SOLAPI_API_KEY}, date=${date}, salt=${salt}, signature=${signature}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              to: ADMIN_PHONE,
              from: '01012345678', // This is just a placeholder, Solapi requires a verified sender number or PFID
              text: message,
              kakaoOptions: {
                pfId: 'KA01PF240316094814123ABC', // Placeholder PFID for @TxkMJG
                // if AlimTalk, templateId is required. For Friend Talk, it can be free form.
              }
            }
          ]
        }),
      });

      const result = await response.json();
      console.log('Solapi result:', result);
      return NextResponse.json({ success: true, platform: 'Solapi', result });
    } catch (error) {
      console.error('Solapi Error:', error);
      // Fallback to Kakao "Me" if Solapi fails? Or just return error.
    }
  }

  // Priority 2: Kakao "Me" API (Free, but requires refreshing tokens)
  if (KAKAO_ACCESS_TOKEN) {
    try {
      const response = await fetch('https://kapi.kakao.com/v2/api/talk/memo/default/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${KAKAO_ACCESS_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          template_object: JSON.stringify({
            object_type: 'text',
            text: message,
            link: { web_url: worshipLink, mobile_web_url: worshipLink },
            button_title: '전달하기',
          }),
        }),
      });

      const result = await response.json();
      return NextResponse.json({ success: true, platform: 'KakaoMe', result });
    } catch (error) {
      console.error('Kakao Me Error:', error);
    }
  }

  return NextResponse.json({ success: false, error: 'No active messaging configuration found' }, { status: 400 });
}
