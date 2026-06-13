import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, Keyboard } from 'lucide-react';
import * as wanakana from 'wanakana';
import { getCurrentUser, getPracticeSetById } from '../lib/storage';

// 產生多種羅馬拼音的變體 (如 chi 與 ti)
const generateRomajiVariants = (kana) => {
  const std = wanakana.toRomaji(kana);
  const replacements = [
    { from: 'chi', to: 'ti' }, { from: 'cha', to: 'tya' }, { from: 'chu', to: 'tyu' }, { from: 'cho', to: 'tyo' },
    { from: 'shi', to: 'si' }, { from: 'sha', to: 'sya' }, { from: 'shu', to: 'syu' }, { from: 'sho', to: 'syo' },
    { from: 'ji', to: 'zi' }, { from: 'ja', to: 'zya' }, { from: 'ju', to: 'zyu' }, { from: 'jo', to: 'zyo' },
    { from: 'tsu', to: 'tu' }, { from: 'fu', to: 'hu' }
  ];

  let variants = [std];
  
  // 處理長音符號變體 (將 - 替換為重複母音)
  if (std.includes('-')) {
    const longVowelVariant = std.replace(/([aeiou])-/g, '$1$1');
    if (longVowelVariant !== std) {
      variants.push(longVowelVariant);
    }
    // 特別處理 o- 可以拼作 ou 的情況
    if (std.includes('o-')) {
      const ouVariant = std.replace(/o-/g, 'ou');
      if (ouVariant !== std && ouVariant !== longVowelVariant) {
        variants.push(ouVariant);
      }
    }
  }

  replacements.forEach(r => {
    const newVariants = [];
    variants.forEach(v => {
      if (v.includes(r.from)) {
        newVariants.push(v.split(r.from).join(r.to));
      }
    });
    variants = [...variants, ...newVariants];
  });
  return variants;
};

export default function Practice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const isComposing = useRef(false);
  
  const username = getCurrentUser();
  const practiceSet = getPracticeSetById(username, id);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [errorAnimation, setErrorAnimation] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [questions] = useState(() => {
    if (!practiceSet) return [];
    return [...practiceSet.questions].sort(() => Math.random() - 0.5);
  });

  const showHint = errorCount >= 3;

  if (!practiceSet) {
    return (
      <div className="card animate-fade-in" style={{ textAlign: 'center', padding: '3rem 1rem', marginTop: '2rem' }}>
        <h2>找不到此練習紀錄</h2>
        <button className="btn btn-primary" onClick={() => navigate('/')}>回首頁</button>
      </div>
    );
  }

  const title = practiceSet.title;
  const currentQ = questions[currentIndex];
  
  const targetKana = currentQ && currentQ.kana 
    ? currentQ.kana.trim()
        .replace(/[-—―－_]/g, 'ー')
        .replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60))
    : '';
  const removePunctuation = (str) => str.replace(/[.,!?、。！？「」『』（）()\s]/g, '');
  const romajiVariants = currentQ ? generateRomajiVariants(removePunctuation(targetKana)) : [];

  useEffect(() => {
    if (inputRef.current && !isFinished) {
      inputRef.current.focus();
    }
  }, [currentIndex, isFinished]);

  const handleChange = (e) => {
    const rawVal = e.target.value;

    if (isComposing.current) {
      // 正在使用輸入法 (IME) 組字中，不要干涉 DOM value，直接原封不動存起來
      setTypedText(rawVal);
      return;
    }

    const rawValLower = rawVal.toLowerCase();
    // 將輸入的字串即時轉換為平假名，並防止將英文減號強轉為片假名長音符號
    const valKana = wanakana.toHiragana(rawValLower, { 
      IMEMode: true,
      customKanaMapping: { '-': '-' }
    });
    // 將輸入的字串全部轉為羅馬拼音，以解決半形英文與平假名混合時的比對問題
    const rawRomaji = wanakana.toRomaji(rawValLower);
    
    // 統一將所有形式的減號與長音符號視為相同，並過濾掉標點符號 (比對專用)
    const normalizeDash = (str) => str.replace(/[-—―－_~〜]/g, 'ー');
    const cleanTargetKana = removePunctuation(normalizeDash(targetKana));
    const cleanValKana = removePunctuation(normalizeDash(valKana));
    
    // 檢查是否符合平假名前綴 (日文鍵盤輸入)
    const isKanaPrefix = cleanTargetKana.startsWith(cleanValKana);
    // 檢查是否符合任何一種羅馬拼音變體的前綴 (英文鍵盤輸入)
    const isRomajiPrefix = romajiVariants.some(v => v.startsWith(rawRomaji));

    // 無條件允許使用者進行「刪除」操作 (避免打錯字後被卡死無法刪除)
    const isDeletion = rawVal.length < typedText.length;

    if (isKanaPrefix || isRomajiPrefix || isDeletion) {
      // 若為刪除，保留原始輸入，避免轉換引擎干擾；若為新增，則轉換為平假名
      setTypedText(isDeletion ? rawValLower : valKana);
    } else {
      setErrorAnimation(true);
      setErrorCount(prev => prev + 1);
      setTimeout(() => setErrorAnimation(false), 300);
    }
  };

  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = (e) => {
    isComposing.current = false;
    handleChange(e); // 組字完成後，立刻手動觸發一次驗證
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.nativeEvent.isComposing || isComposing.current) {
        return; // 這是輸入法選字的 Enter，不要觸發跳題
      }
      
      const valKana = wanakana.toHiragana(typedText.trim(), { 
        IMEMode: true,
        customKanaMapping: { '-': '-' }
      });
      const rawRomaji = wanakana.toRomaji(typedText.trim());
      
      // 統一將所有形式的減號與長音符號視為相同，並過濾掉標點符號 (比對專用)
      const normalizeDash = (str) => str.replace(/[-—―－_~〜]/g, 'ー');
      const cleanTargetKana = removePunctuation(normalizeDash(targetKana));
      const cleanValKana = removePunctuation(normalizeDash(valKana));
      
      // 只有在輸入完全正確時，按 Enter 才會跳到下一題
      if (cleanValKana === cleanTargetKana || romajiVariants.includes(rawRomaji)) {
        setTypedText(targetKana); // 確保顯示完美的平假名
        setTimeout(() => {
          if (currentIndex < questions.length - 1) {
            setCurrentIndex(curr => curr + 1);
            setTypedText('');
            setErrorCount(0);
          } else {
            setIsFinished(true);
          }
        }, 50); // 給一點極短的延遲讓畫面更新
      } else {
        // 如果還沒打完就按 Enter，就震動提示並增加錯誤次數
        setErrorAnimation(true);
        setErrorCount(prev => prev + 1);
        setTimeout(() => setErrorAnimation(false), 300);
      }
    }
  };

  if (isFinished) {
    return (
      <div className="animate-fade-in card" style={{ textAlign: 'center', padding: '3rem 1rem', marginTop: '2rem' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Check size={32} color="white" />
        </div>
        <h2>完成打字練習！</h2>
        <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={() => navigate('/')}>
          回首頁
        </button>
      </div>
    );
  }

  // 動態計算字體大小，避免長單字破版
  const getDynamicFontSize = (text) => {
    if (!text) return '3.5rem';
    const len = text.length;
    if (len >= 12) return 'clamp(1rem, 5vw, 1.5rem)';
    if (len >= 9) return 'clamp(1.25rem, 6vw, 1.75rem)';
    if (len >= 6) return 'clamp(1.5rem, 7vw, 2.25rem)';
    return 'clamp(2rem, 8vw, 3.5rem)';
  };

  return (
    <div className="animate-fade-in" onClick={() => inputRef.current?.focus()} style={{ minHeight: '80vh', cursor: 'text' }}>
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
        
        {wanakana.isKana(currentQ.word.replace(/[\s\-\~\.\,\!\?]/g, '')) ? (
          <h1 style={{ fontSize: getDynamicFontSize(currentQ.meaning), margin: '0 0 1rem 0', fontWeight: 600, transition: 'font-size 0.2s' }}>{currentQ.meaning}</h1>
        ) : (
          <>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{currentQ.meaning}</p>
            <h1 style={{ fontSize: getDynamicFontSize(currentQ.word), margin: '0 0 1rem 0', fontWeight: 600, transition: 'font-size 0.2s' }}>{currentQ.word}</h1>
          </>
        )}
        
        {/* 輸入錯誤三次後顯示提示 (固定高度避免版面跳動干擾輸入法) */}
        <div 
          style={{ 
            opacity: showHint ? 1 : 0, 
            transition: 'opacity 0.3s ease-in-out',
            textAlign: 'center', 
            height: '60px', 
            marginBottom: '1rem',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ fontSize: getDynamicFontSize(targetKana), letterSpacing: '0.1em', display: 'flex', justifyContent: 'center', fontWeight: 500, transition: 'font-size 0.2s' }}>
            {showHint && <span style={{ color: 'var(--text-muted)' }}>{targetKana}</span>}
          </div>
        </div>

        {/* 實體可見的輸入框 */}
        <input 
          ref={inputRef}
          type="text"
          value={typedText}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          className="input"
          style={{ 
            fontSize: getDynamicFontSize(targetKana), 
            transition: 'font-size 0.2s',
            textAlign: 'center', 
            padding: '1rem 1.5rem', 
            width: '90%', 
            maxWidth: '600px',
            borderRadius: '1rem',
            border: '2px solid var(--primary)',
            color: '#10b981', 
            fontWeight: 'bold',
            letterSpacing: '0.1em',
            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
          }}
          placeholder="點擊此處輸入..."
          autoComplete="new-password"
          name="practice_input"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        
        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <Keyboard size={16} /> 支援日文鍵盤 (九宮格/Flick) 或羅馬拼音輸入
        </div>
      </div>
    </div>
  );
}
