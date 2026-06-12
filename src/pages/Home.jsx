import { useState, useEffect } from 'react';
import { Camera, FileText, Share2, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCurrentUser, setCurrentUser, getPracticeSets } from '../lib/storage';

export default function Home() {
  const [username, setUsername] = useState(getCurrentUser());
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(getPracticeSets(username));
  }, [username]);

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setUsername(newName);
    setCurrentUser(newName);
  };

  return (
    <div className="animate-fade-in">
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.75rem' }}>
        <User size={20} color="var(--primary)" />
        <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>目前使用者：</span>
        <input 
          type="text" 
          value={username} 
          onChange={handleNameChange} 
          className="input" 
          style={{ flex: 1, padding: '0.5rem' }} 
          placeholder="輸入您的名字以切換身分"
        />
      </div>

      <section style={{ textAlign: 'center', margin: '2rem 0' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>隨拍即練，輕鬆學日文</h2>
        <p style={{ marginBottom: '2rem' }}>拍下想練習的單字或文章，自動轉換為專屬測驗。</p>
        
        <Link to="/camera" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }}>
          <Camera size={24} />
          立即拍照建立練習
        </Link>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <FileText size={20} color="var(--primary)" />
          <h3>{username} 的練習本</h3>
        </div>
        
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 1rem', border: '2px dashed var(--border)', borderRadius: '1rem' }}>
            <p>目前還沒有練習紀錄。</p>
            <p style={{ fontSize: '0.875rem' }}>點擊上方的「拍照」開始建立第一份練習吧！</p>
          </div>
        ) : (
          history.map(item => (
            <div key={item.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <h4 style={{ margin: 0 }}>{item.title}</h4>
                <p style={{ fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                  {item.date} · {item.wordsCount} 個單字
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to={`/practice/${item.id}`} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
                  練習
                </Link>
                <button className="btn btn-secondary" style={{ padding: '0.5rem', color: 'var(--text-muted)' }} onClick={() => alert('複製分享連結！(待實作)')}>
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
