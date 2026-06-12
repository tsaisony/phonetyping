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
  // 目標改為平假名 (Kana)
  const targetKana = currentQ ? currentQ.kana : '';

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
    // 取得輸入值，如果是用日文鍵盤 (九宮格/Flick)，輸入的會直接是平假名
    // 若是用羅馬拼音輸入法，wanakana 會盡量將其轉換為平假名
    const rawVal = e.target.value;
    const val = wanakana.toHiragana(rawVal, { IMEMode: true });
    
    // 如果目前輸入的字串 (val) 是目標平假名 (targetKana) 的前綴
    // 例如：目標是「かくにん」，輸入「か」或「かく」都會符合
    // 注意：如果是羅馬拼音輸入法還在拼寫狀態 (例如 'k')，wanakana 轉換後仍是 'k'
    // 為了相容，我們同時檢查是否符合羅馬拼音的前綴
    const targetRomaji = wanakana.toRomaji(targetKana);
    const valRomaji = wanakana.toRomaji(val);

    if (targetKana.startsWith(val) || targetRomaji.startsWith(valRomaji)) {
      setTypedText(val);
      
      // 單字完成
      if (val === targetKana || valRomaji === targetRomaji) {
        setTimeout(() => {
          if (currentIndex < questions.length - 1) {
            setCurrentIndex(curr => curr + 1);
            setTypedText(''); // Reset for next word
          } else {
            setIsFinished(true);
          }
        }, 200); 
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

  const typedPartKana = targetKana.substring(0, typedText.length);
  const untypedPartKana = targetKana.substring(typedText.length);
  // 在下方保留小小的羅馬拼音提示，以防萬一
  const romajiHint = wanakana.toRomaji(targetKana);

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
        <h1 style={{ fontSize: '3.5rem', margin: '0 0 1rem 0', fontWeight: 600 }}>{currentQ.word}</h1>
        
        {/* 主要改為顯示平假名打字進度 */}
        <div style={{ fontSize: '3rem', letterSpacing: '0.1em', display: 'flex', marginBottom: '1rem', fontWeight: 500 }}>
          <span style={{ color: '#10b981' }}>{typedPartKana}</span>
          <span style={{ color: 'var(--border)' }}>{untypedPartKana}</span>
        </div>

        {/* 下方保留小字體的羅馬拼音輔助 */}
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          {romajiHint}
        </p>
        
        <div style={{ position: 'absolute', bottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <Keyboard size={16} /> 支援日文鍵盤 (九宮格/Flick) 或羅馬拼音輸入
        </div>
      </div>
    </div>
  );
}
