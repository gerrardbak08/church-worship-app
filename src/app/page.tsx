'use client';

import React, { useState, useEffect } from 'react';
import { Noto_Sans_KR } from 'next/font/google';
import { WorshipFormData, WorshipLinks, FAMILY_OPTIONS } from '../types/worship';
import { getLatestLinks, submitWorshipForm } from '../lib/worship/service';
import './worship/WorshipPage.css';

const notoLinks = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
});

export default function WorshipPage() {
  const [links, setLinks] = useState<WorshipLinks>({
    youtubeUrl: '',
    blogUrl: '',
    sermonTitle: '주일 설교말씀'
  });
  
  const [formData, setFormData] = useState<WorshipFormData>({
    date: new Date().toISOString().split('T')[0],
    familyName: '',
    content: '',
    prayer: ''
  });

  const [status, setStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    async function loadLinks() {
      const latestLinks = await getLatestLinks();
      setLinks(latestLinks);
    }
    loadLinks();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.familyName) {
      alert('가정명을 선택해주세요!');
      return;
    }

    setIsSubmitting(true);
    setStatus('🕊 은혜의 소식을 전송하고 있습니다...');

    try {
      const result = await submitWorshipForm(formData);
      setStatus(result);
      setFormData(prev => ({
        ...prev,
        content: '',
        prayer: ''
      }));
    } catch (error) {
      setStatus('⚠️ 전송 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`worship-container ${notoLinks.className}`}>
      <div className="worship-card">
        <header className="worship-header">
          <div className="worship-logo">⛪</div>
          <h1>사랑과 평안의 교회</h1>
          <p>가족과 함께하는 은혜로운 예배 기록</p>
        </header>

        <section className="worship-links">
          <a href={links.youtubeUrl} target="_blank" rel="noopener noreferrer" className="worship-link-btn btn-youtube">
            <span>📽 설교말씀 보기</span>
            <small style={{ fontSize: '10px', opacity: 0.8 }}>{links.sermonTitle}</small>
          </a>
          <a href={links.blogUrl} target="_blank" rel="noopener noreferrer" className="worship-link-btn btn-blog">
            <span>📝 교회 소식</span>
            <small style={{ fontSize: '10px', opacity: 0.8 }}>네이버 블로그</small>
          </a>
        </section>

        <form onSubmit={handleSubmit} className="worship-form">
          <div className="form-group">
            <label htmlFor="date">예배 날짜</label>
            <input 
              type="date" 
              id="date" 
              name="date"
              className="custom-input"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="familyName">우리 가정</label>
            <select 
              id="familyName" 
              name="familyName"
              className="custom-select"
              value={formData.familyName}
              onChange={handleChange}
              required
            >
              <option value="">-- 가정 선택 --</option>
              {FAMILY_OPTIONS.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="content">예배 내용</label>
            <textarea 
              id="content" 
              name="content"
              rows={2}
              className="custom-textarea"
              placeholder="예) 찬송 123장, 요한복음 3:16 나누기"
              value={formData.content}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="prayer">기도 제목</label>
            <textarea 
              id="prayer" 
              name="prayer"
              rows={2}
              className="custom-textarea"
              placeholder="가족들의 소중한 기도 제목을 적어주세요."
              value={formData.prayer}
              onChange={handleChange}
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={isSubmitting}
          >
            {isSubmitting ? '전송 중...' : '은혜로 기록하기'}
          </button>
        </form>

        <div className="status-message">
          {status && <span className={status.includes('성공') || status.includes('기록') ? 'success-text' : ''}>{status}</span>}
        </div>
      </div>
    </div>
  );
}