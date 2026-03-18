import { WorshipLinks, WorshipFormData, WorshipRecord, SupabaseRecord } from '../../types/worship';

/**
 * Fetches the latest YouTube and Blog links via internal API to avoid CORS.
 */
export async function getLatestLinks(): Promise<WorshipLinks> {
  try {
    const response = await fetch('/api/worship');
    if (!response.ok) throw new Error('Failed to fetch links');
    return await response.json();
  } catch (error) {
    console.error("Error fetching worship links:", error);
    return {
      youtubeUrl: '',
      blogUrl: '',
      sermonTitle: '주일 설교말씀'
    };
  }
}

/**
 * Submits the worship form data to the internal API.
 */
export async function submitWorshipForm(formData: WorshipFormData): Promise<string> {
  try {
    const response = await fetch('/api/worship', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '전송 실패');
    }

    const result = await response.json();
    return result.message;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '전송 실패';
    console.error('Submission error:', error);
    throw new Error(message);
  }
}

/**
 * Fetches recent worship records for the dashboard.
 */
export async function getRecentRecords(startDate?: string, endDate?: string): Promise<WorshipRecord[]> {
  try {
    let url = '/api/worship?count=50';
    if (startDate) {
      url += `&startDate=${startDate}`;
    }
    if (endDate) {
      url += `&endDate=${endDate}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch records');
    const data = await response.json();
    
    // Map snake_case from DB to camelCase for UI
    return (data.records || []).map((record: SupabaseRecord) => ({
      id: record.id,
      date: record.date,
      familyName: record.family_name,
      content: record.content,
      prayer: record.prayer,
      created_at: record.created_at
    }));
  } catch (error) {
    console.error("Error fetching recent records:", error);
    return [];
  }
}
