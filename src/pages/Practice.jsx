import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Check } from 'lucide-react';

export default function Practice() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Mock data based on ID
  const title = id === 'mock-1' ? '日語單字練習 (N3)' : '練習測試';
  const questions = [
    { word: '確認', reading: 'かくにん', meaning: '確認, confirm' },
    { word: '練習', reading: 'れんしゅう', meaning: '練習, practice' },
    { word: '写真', reading: 'しゃしん', meaning: '照片, photo' }
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = questions[currentIndex];

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(curr => curr + 1);
      setShowAnswer(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="animate-fade-in card" style={{ textAlign: 'center', padding: '3rem 1rem', marginTop: '2rem' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Check size={32} color="white" />
        </div>
        <h2>完成練習！</h2>
        <p>太棒了，您已經完成所有的單字。</p>
        <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={() => navigate('/')}>
          回首頁
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{title}</h2>
        <span style={{ color: 'var(--text-muted)' }}>{currentIndex + 1} / {questions.length}</span>
      </div>

      <div 
        className="card" 
        style={{ 
          minHeight: '300px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative',
          cursor: 'pointer'
        }}
        onClick={() => setShowAnswer(!showAnswer)}
      >
        <h1 style={{ fontSize: '3rem', margin: 0 }}>{currentQ.word}</h1>
        
        {showAnswer ? (
          <div className="animate-fade-in" style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 500 }}>{currentQ.reading}</p>
            <p style={{ fontSize: '1.125rem' }}>{currentQ.meaning}</p>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', position: 'absolute', bottom: '1rem' }}>點擊卡片顯示解答</p>
        )}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={handleNext}>
          {currentIndex < questions.length - 1 ? '下一個' : '完成'}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
