import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

/**
 * GET /api/backup
 * 전체 worship_records 데이터를 CSV 형식으로 반환.
 * 브라우저에서 호출하면 파일 다운로드로 처리됨.
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('worship_records')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Backup fetch error:', error);
      return NextResponse.json({ message: '데이터 조회 실패', error: error.message }, { status: 500 });
    }

    const records = data || [];

    // CSV 헤더
    const header = ['id', '날짜', '가정명', '예배내용', '기도제목', '기록일시'].join(',');

    // CSV 행
    const rows = records.map((r) => {
      const escape = (val: string | null | undefined) => {
        if (val == null) return '';
        // 쉼표, 따옴표, 개행이 있으면 쌍따옴표로 감싸기
        const str = String(val).replace(/"/g, '""');
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str}"`
          : str;
      };
      return [
        escape(r.id),
        escape(r.date),
        escape(r.family_name),
        escape(r.content),
        escape(r.prayer),
        escape(r.created_at),
      ].join(',');
    });

    const csv = [header, ...rows].join('\n');

    // UTF-8 BOM 추가 (Excel 한글 깨짐 방지)
    const bom = '\uFEFF';
    const csvWithBom = bom + csv;

    const now = new Date().toISOString().split('T')[0];
    const filename = `worship_records_${now}.csv`;

    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error('Backup error:', err);
    return NextResponse.json({ message: '백업 오류' }, { status: 500 });
  }
}
