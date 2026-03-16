export interface WorshipFormData {
  date: string;
  familyName: string;
  content: string;
  prayer: string;
}

export interface WorshipRecord extends WorshipFormData {
  id: string;
  created_at?: string;
}

export interface SupabaseRecord {
  id: string;
  date: string;
  family_name: string;
  content: string;
  prayer: string;
  created_at: string;
}

export interface WorshipLinks {
  youtubeUrl: string;
  blogUrl: string;
  sermonTitle: string;
}

export const YOUTUBE_CHANNEL_ID = 'UCXUHra_EuT3T2vD8j3BDuJQ';
export const NAVER_BLOG_ID = 'meslap3';
export const SPREADSHEET_ID = '19U6jrkHQaWVBNLjMqEl0rdiac_aums6Tb4cmmWn7G7w';

export const FAMILY_OPTIONS = [
  "백박삼 권영숙 가정",
  "노정희 유진 가정",
  "박명랑 가정",
  "이수정 가정",
  "김화경 노경은 가정",
  "김영 박은실 가정",
  "최도선 임희석 가정",
  "정창수 정선화 가정",
  "패트릭 정명순 가정",
  "장민호 김은영 가정",
  "김판경 조아라 가정",
  "김선우 고강미 가정",
  "이현민 유선영 가정",
  "이재영 정상원 가정",
  "최인호 김은혜 가정",
  "최훈 신세명 가정",
  "정철헌 이지영 가정",
  "황병건 경소희 가정",
  "신동현 장보라 가정",
  "박찬욱 진숙현 가정",
  "유동진 김민지 가정",
  "김성구 조예진 가정",
  "김형주 박다솜 가정",
  "최규태 박예희 가정"
];
