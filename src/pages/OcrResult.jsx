import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Tesseract from 'tesseract.js';
import { Loader2, Edit3, CheckCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser, savePracticeSet } from '../lib/storage';

export default function OcrResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const image = location.state?.image;
  
  const [text, setText] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!image) {
      navigate('/camera');
      return;
    }

    const recognizeText = async () => {
      try {
        const worker = await Tesseract.createWorker('jpn', 1, {
          logger: m => {
            if (m.status === 'recognizing text') {
              setProgress(parseInt(m.progress * 100));
            }
          }
        });
        
        const { data: { text } } = await worker.recognize(image);
        setText(text.replace(/\s+/g, '')); // Basic cleanup for Japanese
        await worker.terminate();
      } catch (err) {
        console.error("OCR Error:", err);
        setText('辨識失敗，請確認圖片清晰並重試。');
      } finally {
        setIsRecognizing(false);
      }
    };

    recognizeText();
  }, [image, navigate]);

  const handleSave = () => {
    // 未來這裡可以接 AI API 分析 OCR 原始文字，現在我們直接給予測試用的假資料單字
    const newId = uuidv4();
    const dateStr = new Date().toISOString().split('T')[0];
    const username = getCurrentUser();
    
    const newPractice = {
      id: newId,
      date: dateStr,
      title: `${dateStr} 的拍照練習`,
      wordsCount: 3,
      rawOcrText: text, // 將原始辨識的文字存起來，未來備用
      questions: [
        { word: '確認', kana: 'かくにん', meaning: '確認, confirm' },
        { word: '練習', kana: 'れんしゅう', meaning: '練習, practice' },
        { word: '写真', kana: 'しゃしん', meaning: '照片, photo' }
      ]
    };

    savePracticeSet(username, newPractice);
    
    alert('已儲存至您的練習本！');
    navigate(`/practice/${newId}`);
  };

  return (
    <div className="animate-fade-in">
      <h2>辨識結果</h2>
      
      {isRecognizing ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1rem' }}>
          <Loader2 size={40} color="var(--primary)" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ marginTop: '1rem', fontWeight: 500 }}>正在分析圖片...</p>
          <div style={{ width: '100%', backgroundColor: 'var(--border)', height: '6px', borderRadius: '3px', marginTop: '1rem' }}>
            <div style={{ width: `${progress}%`, backgroundColor: 'var(--primary)', height: '100%', borderRadius: '3px', transition: 'width 0.2s' }}></div>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{progress}%</p>
        </div>
      ) : (
        <div className="animate-fade-in">
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit3 size={18} color="var(--primary)" /> 編輯辨識文字
              </span>
            </div>
            <textarea 
              className="input" 
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ minHeight: '150px', resize: 'vertical', fontSize: '1rem', lineHeight: '1.6' }}
            />
          </div>
          
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>
            <CheckCircle size={18} />
            確認並產生練習題
          </button>
        </div>
      )}
    </div>
  );
}
