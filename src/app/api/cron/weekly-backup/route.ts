import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

/**
 * GET /api/cron/weekly-backup
 * 매주 월요일 오전 1시(UTC) = 오전 10시(KST)에 실행.
 * 지난 주 worship_records를 조회하여 레코드 수를 로그로 남기고,
 * 카카오 "나에게 보내기"로 요약 리포트를 발송 (선택).
 */
export async function GET(request: NextRequest) {
  // Vercel Cron 인증
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 지난 주 날짜 범위 계산 (일요일 ~ 토요일)
    const now = new Date();
    const thisSunday = new Date(now);
    thisSunday.setDate(now.getDate() - now.getDay());
    thisSunday.setHours(0, 0, 0, 0);

    const lastSunday = new Date(thisSunday);
    lastSunday.setDate(thisSunday.getDate() - 7);

    const lastSaturday = new Date(lastSunday);
    lastSaturday.setDate(lastSunday.getDate() + 6);

    const toDateStr = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const startDate = toDateStr(lastSunday);
    const endDate = toDateStr(lastSaturday);

    // Supabase에서 지난 주 기록 조회
    const { data, error } = await supabase
      .from('worship_records')
      .select('family_name, date')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('[weekly-backup] Supabase error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const records = data || [];
    const count = records.length;
    const familyNames = [...new Set(records.map((r) => r.family_name))];

    const summary = [
      `[주간 예배 현황 리포트]`,
      `기간: ${startDate} ~ ${endDate}`,
      `제출 가정 수: ${count}건`,
      familyNames.length > 0 ? `가정 목록: ${familyNames.join(', ')}` : '제출 없음',
    ].join('\n');

    console.log('[weekly-backup] 집계 완료:', summary);

    // 카카오 나에게 보내기 (KAKAO_ACCESS_TOKEN 환경변수가 있을 경우)
    const KAKAO_ACCESS_TOKEN = process.env.KAKAO_ACCESS_TOKEN;
    if (KAKAO_ACCESS_TOKEN && count > 0) {
      try {
        await fetch('https://kapi.kakao.com/v2/api/talk/memo/default/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${KAKAO_ACCESS_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            template_object: JSON.stringify({
              object_type: 'text',
              text: summary,
              link: {
                web_url: 'https://litt.ly/meslap',
                mobile_web_url: 'https://litt.ly/meslap',
              },
              button_title: '현황 보기',
            }),
          }),
        });
      } catch (kakaoError) {
        console.error('[weekly-backup] Kakao send error:', kakaoError);
      }
    }

    return NextResponse.json({
      success: true,
      period: `${startDate} ~ ${endDate}`,
      count,
      families: familyNames,
    });
  } catch (err) {
    console.error('[weekly-backup] Unexpected error:', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
