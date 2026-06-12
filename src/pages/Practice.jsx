import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, Keyboard } from 'lucide-react';
import * as wanakana from 'wanakana';

export default function Practice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  
  // Mock data - 增加了 kana 欄位用於羅馬拼音轉換
  const title = id === 'mock-1' ? '日語單字練習 (N3)' : '練習測試';
  const questions = [
    { word: '確認', kana: 'かくにん', meaning: '確認, confirm' },
    { word: '練習', kana: 'れんしゅう', meaning: '練習, practice' },
    { word: '写真', kana: 'しゃしん', meaning: '照片, photo' }
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [errorAnimation, setErrorAnimation] = useState(false);

  const currentQ = questions[currentIndex];
  // Convert kana to romaji
  const targetRomaji = currentQ ? wanakana.toRomaji(currentQ.kana) : '';

  useEffect(() => {
    if (inputRef.current && !isFinished) {
      inputRef.current.focus();
    }
  }, [currentIndex, isFinished]);

  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleChange = (e) => {
    // 取得輸入值並轉換為小寫，僅允許英文字母
    const val = e.target.value.toLowerCase().replace(/[^a-z-]/g, '');
    
    if (targetRomaji.startsWith(val)) {
      setTypedText(val);
      
      // 單字完成
      if (val === targetRomaji) {
        setTimeout(() => {
          if (currentIndex < questions.length - 1) {
            setCurrentIndex(curr => curr + 1);
            setTypedText(''); // Reset for next word
          } else {
            setIsFinished(true);
          }
        }, 200); // 短暫延遲讓使用者看到打完的綠字
      }
    } else {
      // 打錯字
      setErrorAnimation(true);
      setTimeout(() => setErrorAnimation(false), 300);
    }
  };

  if (isFinished) {
    return (
      <div className="animate-fade-in card" style={{ textAlign: 'center', padding: '3rem 1rem', marginTop: '2rem' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Check size={32} color="white" />
        </div>
        <h2>完成打字練習！</h2>
        <p>太棒了，您的羅馬拼音輸入非常準確。</p>
        <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={() => navigate('/')}>
          回首頁
        </button>
      </div>
    );
  }

  const typedPart = targetRomaji.substring(0, typedText.length);
  const untypedPart = targetRomaji.substring(typedText.length);

  return (
    <div className="animate-fade-in" onClick={handleContainerClick} style={{ minHeight: '80vh', cursor: 'text' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{title}</h2>
        <span style={{ color: 'var(--text-muted)' }}>{currentIndex + 1} / {questions.length}</span>
      </div>

      <div 
        className={`card ${errorAnimation ? 'shake' : ''}`}
        style={{ 
          minHeight: '300px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative',
          transition: 'transform 0.1s'
        }}
      >
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-4px); }
            80% { transform: translateX(4px); }
          }
          .shake { animation: shake 0.3s ease-in-out; }
        `}</style>
        
        <input 
          ref={inputRef}
          type="text"
          value={typedText}
          onChange={handleChange}
          style={{ opacity: 0, position: 'absolute', top: 0, left: 0, height: '100%', width: '100%', zIndex: -1 }}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{currentQ.meaning}</p>
        <h1 style={{ fontSize: '3.5rem', margin: '0 0 0.5rem 0', fontWeight: 600 }}>{currentQ.word}</h1>
        <p style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '2.5rem', fontWeight: 500 }}>{currentQ.kana}</p>
        
        <div style={{ fontSize: '2.5rem', fontFamily: 'monospace', letterSpacing: '0.1em', display: 'flex' }}>
          <span style={{ color: '#10b981', fontWeight: 'bold' }}>{typedPart}</span>
          <span style={{ color: 'var(--border)' }}>{untypedPart}</span>
        </div>
        
        <div style={{ position: 'absolute', bottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <Keyboard size={16} /> 點擊此卡片並開始打字
        </div>
      </div>
    </div>
  );
}
