import { NextRequest, NextResponse } from 'next/server';
import { YOUTUBE_CHANNEL_ID, NAVER_BLOG_ID } from '../../../types/worship';

/**
 * GET /api/worship
 * Fetches latest YouTube and Blog information server-side to bypass CORS.
 */
export async function GET() {
  const blogUrl = `https://blog.naver.com/${NAVER_BLOG_ID}`;
  let youtubeUrl = `https://www.youtube.com/channel/${YOUTUBE_CHANNEL_ID}`;
  let sermonTitle = "이번 주 주일 설교말씀";

  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
    const response = await fetch(rssUrl, { next: { revalidate: 3600 } }); // Cache for 1 hour
    
    if (response.ok) {
      const text = await response.text();
      // Simple regex to extract link and title from XML to avoid heavy XML parser dependencies server-side
      const linkMatch = text.match(/<link rel="alternate" href="([^"]+)"\/>/);
      const titleMatch = text.match(/<title>([^<]+)<\/title>/);
      
      // The first <link> and <title> in the feed are usually the channel's. 
      // We want the first <entry>'s link and title.
      const entryMatch = text.split('<entry>')[1];
      if (entryMatch) {
         const entryLink = entryMatch.match(/<link rel="alternate" href="([^"]+)"\/>/);
         const entryTitle = entryMatch.match(/<title>([^<]+)<\/title>/);
         if (entryLink) youtubeUrl = entryLink[1];
         if (entryTitle) sermonTitle = entryTitle[1];
      }
    }
  } catch (error) {
    console.error("Error fetching YouTube RSS:", error);
  }

  return NextResponse.json({ youtubeUrl, blogUrl, sermonTitle });
}

/**
 * POST /api/worship
 * Handles form submission.
 * Note: For production use with Google Sheets, you should install 'googleapis'
 * and set up a Service Account.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    // --- OPTION 1: Google Apps Script Web App (Easiest transition) ---
    // If you have your original code.gs deployed as a Web App, 
    // you can simply proxy the request to it.
    /*
    const GAS_WEB_APP_URL = 'YOUR_DEPLOYED_GAS_URL';
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    const result = await response.text();
    return NextResponse.json({ message: result });
    */

    // --- OPTION 2: Native Google Sheets API (Premium) ---
    // Requires: npm install googleapis
    /*
    const { google } = require('googleapis');
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.NEXT_PUBLIC_SPREADSHEET_ID,
      range: 'Data!A:E',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[formData.date, formData.familyName, formData.content, formData.prayer, new Date().toISOString()]],
      },
    });
    return NextResponse.json({ message: "기록이 완료되었습니다. 평안한 주일 되세요!" });
    */

    // For now, let's simulate success to keep the UI functional
    console.log('Received worship data:', formData);
    return NextResponse.json({ 
      message: "기록이 성공적으로 완료되었습니다. 평안한 주일 되세요!" 
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: "전송 중 오류가 발생했습니다." }, { status: 500 });
  }
}
