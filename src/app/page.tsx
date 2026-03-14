'use client';

import React, { useState, useEffect } from 'react';
import { Noto_Sans_KR, Lora } from 'next/font/google';
import { WorshipFormData, WorshipLinks, FAMILY_OPTIONS } from '../types/worship';
import { getLatestLinks, submitWorshipForm } from '../lib/worship/service';
import './worship/WorshipPage.css';

const notoLinks = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
});

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '700'],
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
  const [showDirectInput, setShowDirectInput] = useState<boolean>(false);
  const [directFamilyName, setDirectFamilyName] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [lastSubmission, setLastSubmission] = useState<any>(null);
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'form' | 'success' | 'dashboard'>('form');
  const [dashFilter, setDashFilter] = useState<'weekly' | 'monthly' | 'all'>('weekly');

  useEffect(() => {
    async function loadLinks() {
      const latestLinks = await getLatestLinks();
      setLinks(latestLinks);
    }
    loadLinks();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'familyName') {
      if (value === '__DIRECT__') {
        setShowDirectInput(true);
        setFormData(prev => ({ ...prev, familyName: '' }));
      } else {
        setShowDirectInput(false);
        setFormData(prev => ({ ...prev, familyName: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalFamilyName = showDirectInput ? directFamilyName : formData.familyName;
    
    if (!finalFamilyName) {
      alert('가정명을 입력하거나 선택해주세요!');
      return;
    }

    setIsSubmitting(true);
    setStatus('🕊 은혜의 소식을 전송하고 있습니다...');

    try {
      const submissionData = { ...formData, familyName: finalFamilyName };
      await submitWorshipForm(submissionData);
      setLastSubmission(submissionData);
      setSubmitted(true);
      setViewMode('success');
      setFormData(prev => ({
        ...prev,
        content: '',
        prayer: ''
      }));
      if (showDirectInput) setDirectFamilyName('');
    } catch (error) {
      setStatus('⚠️ 전송 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setViewMode('form');
    setStatus('');
    setFormData(prev => ({
      ...prev,
      date: new Date().toISOString().split('T')[0],
      familyName: ''
    }));
    setShowDirectInput(false);
  };

  const getStartDate = (filter: 'weekly' | 'monthly' | 'all') => {
    const now = new Date();
    if (filter === 'weekly') {
      const day = now.getDay(); // 0 is Sunday
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
      const monday = new Date(now.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      return monday.toISOString().split('T')[0];
    } else if (filter === 'monthly') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return firstDay.toISOString().split('T')[0];
    }
    return undefined;
  };

  const loadDashboard = async (filter: 'weekly' | 'monthly' | 'all' = 'weekly') => {
    setIsSubmitting(true);
    setDashFilter(filter);
    const { getRecentRecords } = await import('../lib/worship/service');
    const startDate = getStartDate(filter);
    const records = await getRecentRecords(startDate);
    setRecentRecords(records);
    setViewMode('dashboard');
    setIsSubmitting(false);
  };


  if (viewMode === 'success') {
    return (
      <div className={`worship-container ${notoLinks.className}`}>
        <div className="worship-card success-card">
          <div className="success-icon"></div>
          <h2 className={`success-title ${lora.className}`}>기록이 완료되었습니다!</h2>
          
          <div className="sumamry-box">
             <div className="summary-item"><strong>제출 가정</strong> {lastSubmission.familyName}</div>
             <div className="summary-item"><strong>예배 일자</strong> {lastSubmission.date}</div>
             {lastSubmission.prayer && <div className="summary-item"><strong>기도 제목</strong> {lastSubmission.prayer}</div>}
          </div>

          <p className="success-description">
            가족과 함께한 소중한 시간들이<br />
            아름답게 기록되었습니다.
          </p>
          
          <div className="success-blessing">
            <span className="blessing-reference">빌립보서 2장 13~14절</span>
            <p className="blessing-text">
              너희 안에서 행하시는 이는 하나님이시니 자기의 기쁘신 뜻을 위하여 너희에게 소원을 두고 행하게 하시나니 모든 일을 원망과 시비가 없이 하라
            </p>
          </div>

          <div className="success-actions">
            <button onClick={() => loadDashboard('weekly')} className="dashboard-btn">
              예배현황 보러가기
            </button>
            <button onClick={handleReset} className="reset-btn-link">
              다른 기록 남기기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'dashboard') {
    return (
      <div className={`worship-container ${notoLinks.className}`}>
        <div className="worship-card dashboard-card">
          <header className="dashboard-header">
            <h2>가정예배 현황</h2>
            <div className="dashboard-tabs">
              <button 
                className={`tab-btn ${dashFilter === 'weekly' ? 'active' : ''}`}
                onClick={() => loadDashboard('weekly')}
              >이번 주</button>
              <button 
                className={`tab-btn ${dashFilter === 'monthly' ? 'active' : ''}`}
                onClick={() => loadDashboard('monthly')}
              >이번 달</button>
              <button 
                className={`tab-btn ${dashFilter === 'all' ? 'active' : ''}`}
                onClick={() => loadDashboard('all')}
              >전체</button>
            </div>
          </header>

          <div className="dashboard-list">
            {recentRecords.length > 0 ? (
              recentRecords.map((record, index) => (
                <div key={record.id || index} className="dashboard-item">
                  <div className="item-main">
                    <span className="item-family">{record.family_name}</span>
                    <span className="item-date">{record.date}</span>
                  </div>
                  {record.prayer && <p className="item-prayer">{record.prayer}</p>}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>아직 기록된 예배가 없습니다.</p>
              </div>
            )}
          </div>

          <button onClick={handleReset} className="back-btn">
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`worship-container ${notoLinks.className}`}>
      <div className="worship-card">
        <header className="worship-header">
          <h1 className={lora.className}>사랑과 평안의 교회</h1>
          <p className="worship-subtitle">가족과 함께하는 은혜로운 예배 기록</p>
        </header>

        <section className="worship-links">
          <a href={links.youtubeUrl} target="_blank" rel="noopener noreferrer" className="worship-link-btn btn-youtube">
            <span>설교말씀 보기</span>
            <small style={{ fontSize: '10px', opacity: 0.8 }}>{links.sermonTitle}</small>
          </a>
          <a href={links.blogUrl} target="_blank" rel="noopener noreferrer" className="worship-link-btn btn-blog">
            <span>교회 소식</span>
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
              value={showDirectInput ? '__DIRECT__' : formData.familyName}
              onChange={handleChange}
              required
            >
              <option value="">-- 가정 선택 --</option>
              {FAMILY_OPTIONS.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
              <option value="__DIRECT__">➕ 직접 입력하기...</option>
            </select>
          </div>

          {showDirectInput && (
            <div className="form-group" style={{ animation: 'fadeIn 0.3s ease' }}>
              <label htmlFor="directInput">가정명 직접 입력</label>
              <input 
                type="text" 
                id="directInput"
                className="custom-input"
                placeholder="가정 성함이나 명칭을 입력하세요"
                value={directFamilyName}
                onChange={(e) => setDirectFamilyName(e.target.value)}
                required
              />
            </div>
          )}

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
          {status && <span className={status.includes('완료') || status.includes('기록') ? 'success-text' : ''}>{status}</span>}
        </div>
      </div>
    </div>
  );
}