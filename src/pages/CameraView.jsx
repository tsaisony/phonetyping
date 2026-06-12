import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanText, CheckCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser, savePracticeSet } from '../lib/storage';

export default function CameraView() {
  const navigate = useNavigate();
  const [text, setText] = useState('');

  const handleSave = () => {
    if (!text.trim()) {
      alert('請先輸入或掃描文字！');
      return;
    }

    const newId = uuidv4();
    const dateStr = new Date().toISOString().split('T')[0];
    const username = getCurrentUser();
    
    // 將掃描到的文字分段，暫時先產生假資料
    // 未來可加入 Kuromoji 或 AI API 來解析此 text
    const newPractice = {
      id: newId,
      date: dateStr,
      title: `${dateStr} 的掃描練習`,
      wordsCount: 3,
      rawOcrText: text,
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
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 style={{ alignSelf: 'flex-start' }}>建立練習題</h2>
      
      <div className="card" style={{ width: '100%', marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
          <ScanText size={20} />
          <span style={{ fontWeight: 500 }}>請點擊下方輸入框</span>
        </div>
        
        <textarea 
          className="input" 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="在 iPhone 上，輕點這裡後選擇「掃描文字 (Live Text)」，即可用相機掃描日文..."
          style={{ minHeight: '200px', resize: 'vertical', fontSize: '1.125rem', lineHeight: '1.6' }}
        />
        
        <button 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: '1.5rem' }} 
          onClick={handleSave}
        >
          <CheckCircle size={18} />
          確認並產生練習題
        </button>
      </div>
      
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          💡 <strong>操作提示</strong>：在 iPhone 鍵盤上方或長按輸入框，選擇帶有框框的 <code>[=]</code> 圖示（掃描文字），即可開啟相機，瞬間捕捉日文文章或單字！
        </p>
      </div>
    </div>
  );
}
