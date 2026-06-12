import { Camera, FileText, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  // Mock history data
  const history = [
    { id: 'mock-1', date: '2026-06-12', title: '日語單字練習 (N3)', wordsCount: 15 },
    { id: 'mock-2', date: '2026-06-11', title: '旅行實用短句', wordsCount: 8 },
  ];

  return (
    <div className="animate-fade-in">
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
          <h3>我的練習本</h3>
        </div>
        
        {history.map(item => (
          <div key={item.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              <button className="btn btn-secondary" style={{ padding: '0.5rem', color: 'var(--text-muted)' }} onClick={() => alert('複製分享連結！')}>
                <Share2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
