import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser, savePracticeSet } from '../lib/storage';

export default function OcrResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const image = location.state?.image;
  
  const [isRecognizing, setIsRecognizing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [rawText, setRawText] = useState('');

  // 預設標題
  const today = new Date();
  const defaultTitle = `單字表 (${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()})`;
  const [title, setTitle] = useState(defaultTitle);

  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (!image) {
      navigate('/camera');
      return;
    }

    const recognizeText = async () => {
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error("Missing Gemini API Key in environment variables");
        }

        let mimeType, base64Data;
        if (image.startsWith('data:')) {
          mimeType = image.split(';')[0].split(':')[1];
          base64Data = image.split(',')[1];
        } else {
          // If it's a blob:http or http URL (happens with Vite HMR preserving old state)
          const blobRes = await fetch(image);
          const blob = await blobRes.blob();
          mimeType = blob.type;
          base64Data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }

        // We use a progressive fake loader just for visual feedback since fetch doesn't give upload progress
        const progressInterval = setInterval(() => {
          setProgress(p => (p < 90 ? p + 10 : p));
        }, 300);

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: "Extract EVERY SINGLE Japanese vocabulary word or phrase from this image. DO NOT miss any words. DO NOT omit anything. DO NOT summarize. Output the COMPLETE list of ALL extracted words as ONLY a valid JSON array of objects without any markdown formatting. Each object must have exactly these keys: 'word' (the kanji/word, or '-' if none), 'kana' (hiragana), and 'meaning' (traditional chinese meaning)." },
                { inline_data: { mime_type: mimeType, data: base64Data } }
              ]
            }],
            generationConfig: {
              responseMimeType: "application/json",
              maxOutputTokens: 8192
            }
          })
        });

        clearInterval(progressInterval);
        setProgress(100);

        const result = await response.json();
        if (result.error) {
          throw new Error(result.error.message);
        }

        const textData = result.candidates[0].content.parts[0].text;
        
        let parsedData;
        try {
          parsedData = JSON.parse(textData);
        } catch (e) {
          // Fallback if markdown block is returned despite instructions
          const cleanedText = textData.replace(/```json/g, '').replace(/```/g, '');
          parsedData = JSON.parse(cleanedText);
        }

        // Give each item a unique ID
        const mappedQuestions = parsedData.map((item, idx) => ({
          id: uuidv4(),
          kana: item.kana || '',
          word: item.word || '-',
          meaning: item.meaning || ''
        }));

        setQuestions(mappedQuestions);
        setRawText("Processed by Gemini AI");
      } catch (err) {
        console.error("Gemini AI Error:", err);
        alert(`AI 分析失敗：${err.message}`);
        // Fallback or empty state
        setQuestions([]);
      } finally {
        setIsRecognizing(false);
      }
    };

    recognizeText();
  }, [image, navigate]);

  const handleQuestionChange = (id, field, value) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleSave = () => {
    const newId = uuidv4();
    const dateStr = new Date().toISOString().split('T')[0];
    const username = getCurrentUser();
    
    // 如果漢字欄位是 '-'，在打字畫面上就把假名當成主要單字顯示
    const processedQuestions = questions.map(q => ({
      ...q,
      word: q.word === '-' ? q.kana : q.word
    }));
    
    const newPractice = {
      id: newId,
      date: dateStr,
      title: title,
      wordsCount: questions.length,
      rawOcrText: rawText,
      questions: processedQuestions
    };

    savePracticeSet(username, newPractice);
    navigate(`/practice/${newId}`);
  };

  if (isRecognizing) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={48} color="var(--primary)" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        <p style={{ marginTop: '2rem', fontSize: '1.25rem', fontWeight: 500 }}>正在解析圖片中的文字...</p>
        <div style={{ width: '80%', maxWidth: '300px', backgroundColor: 'var(--border)', height: '8px', borderRadius: '4px', marginTop: '1rem' }}>
          <div style={{ width: `${progress}%`, backgroundColor: 'var(--primary)', height: '100%', borderRadius: '4px', transition: 'width 0.2s' }}></div>
        </div>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{progress}%</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
          為這份單字表命名：
        </label>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1.25rem',
            fontWeight: 600,
            border: '1px solid var(--border)',
            borderRadius: '0.75rem',
            backgroundColor: 'var(--surface)',
            color: 'var(--text-main)'
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
          檢查提取結果 <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-muted)' }}>(點擊表格修改)</span>
        </label>
        
        <div style={{ 
          backgroundColor: '#e2e8f0', // 類似截圖的外框背景色
          borderRadius: '0.75rem',
          overflow: 'hidden',
          border: '1px solid var(--border)'
        }}>
          {/* 表格標題 */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '30px 1fr 1fr 1fr', 
            padding: '1rem 0.5rem',
            fontWeight: 600,
            color: '#475569',
            fontSize: '0.875rem',
            gap: '0.5rem'
          }}>
            <div style={{ textAlign: 'center' }}>#</div>
            <div>假名</div>
            <div>漢字</div>
            <div>中文</div>
          </div>

          {/* 表格內容 */}
          {questions.map((q, index) => (
            <div key={q.id} style={{ 
              display: 'grid', 
              gridTemplateColumns: '30px 1fr 1fr 1fr', 
              padding: '1rem 0.5rem',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: 'var(--surface)',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>
                {index + 1}
              </div>
              <input 
                value={q.kana} 
                onChange={(e) => handleQuestionChange(q.id, 'kana', e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1rem', width: '100%', fontWeight: 600, color: 'var(--text-main)' }}
              />
              <input 
                value={q.word} 
                onChange={(e) => handleQuestionChange(q.id, 'word', e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1rem', width: '100%', color: 'var(--text-main)' }}
              />
              <input 
                value={q.meaning} 
                onChange={(e) => handleQuestionChange(q.id, 'meaning', e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1rem', width: '100%', color: 'var(--text-main)' }}
              />
            </div>
          ))}
        </div>
      </div>
      
      <button 
        className="btn btn-primary" 
        style={{ width: '100%', marginTop: '2rem', padding: '1rem', fontSize: '1.125rem' }} 
        onClick={handleSave}
      >
        <CheckCircle size={20} />
        確認並開始練習
      </button>
    </div>
  );
}
