import { NextRequest, NextResponse } from 'next/server';
import { YOUTUBE_CHANNEL_ID, NAVER_BLOG_ID } from '../../../types/worship';
import { supabase } from '../../../lib/supabase';

/**
 * GET /api/worship
 * Fetches latest YouTube and Blog information server-side to bypass CORS.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const count = searchParams.get('count');
  const startDate = searchParams.get('startDate');

  // If fetching records for dashboard
  if (count || startDate) {
    try {
      let query = supabase
        .from('worship_records')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (startDate) {
        query = query.gte('date', startDate);
      }

      if (count) {
        query = query.limit(parseInt(count));
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return NextResponse.json({ records: data || [] });
    } catch (error) {
      console.error("Error fetching records:", error);
      return NextResponse.json({ records: [] });
    }
  }

  // Default: Fetch links for main page
  const blogUrl = `https://blog.naver.com/${NAVER_BLOG_ID}`;
  let youtubeUrl = `https://www.youtube.com/channel/${YOUTUBE_CHANNEL_ID}`;
  let sermonTitle = "이번 주 주일 설교말씀";

  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
    const response = await fetch(rssUrl, { next: { revalidate: 3600 } }); 
    
    if (response.ok) {
      const text = await response.text();
      const entryMatch = text.split('<entry>')[1];
      if (entryMatch) {
         const entryLinkMatch = entryMatch.match(/<link rel="alternate" href="([^"]+)"\/>/);
         const entryTitleMatch = entryMatch.match(/<title>([^<]+)<\/title>/);
         if (entryLinkMatch && entryLinkMatch[1]) youtubeUrl = entryLinkMatch[1];
         if (entryTitleMatch && entryTitleMatch[1]) sermonTitle = entryTitleMatch[1];
      }
    }
  } catch (error) {
    console.error("Error fetching YouTube RSS:", error);
  }

  return NextResponse.json({ youtubeUrl, blogUrl, sermonTitle });
}

/**
 * POST /api/worship
 * Handles form submission directly to Supabase.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    // --- OPTION 1: Supabase DB (New & Reliable) ---
    const { error } = await supabase
      .from('worship_records')
      .insert([
        {
          date: formData.date,
          family_name: formData.familyName,
          content: formData.content,
          prayer: formData.prayer,
        }
      ]);

    if (error) {
      console.error('Supabase Error:', error);
      throw new Error(`DB Error: ${error.message}`);
    }

    return NextResponse.json({ message: "기록이 완료되었습니다. 평안한 주일 되세요!" });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ message: error.message || "전송 중 오류가 발생했습니다." }, { status: 500 });
  }
}
