import { WorshipLinks, WorshipFormData } from '../../types/worship';

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
  } catch (error: any) {
    console.error('Submission error:', error);
    throw error;
  }
}
