import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera as CameraIcon, Image as ImageIcon, X } from 'lucide-react';

export default function CameraView() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [image, setImage] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    navigate('/result', { state: { image } });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 style={{ alignSelf: 'flex-start' }}>拍攝日文</h2>
      
      {!image ? (
        <div 
          className="card" 
          style={{ 
            width: '100%', 
            height: '60vh', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderStyle: 'dashed',
            borderWidth: '2px',
            marginTop: '1rem',
            gap: '1rem'
          }}
        >
          <CameraIcon size={48} color="var(--text-muted)" />
          <p>請拍攝或上傳圖片</p>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              className="btn btn-primary"
              onClick={() => {
                fileInputRef.current.removeAttribute('capture');
                fileInputRef.current.setAttribute('capture', 'environment');
                fileInputRef.current.click();
              }}
            >
              <CameraIcon size={18} />
              開啟相機
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={() => {
                fileInputRef.current.removeAttribute('capture');
                fileInputRef.current.click();
              }}
            >
              <ImageIcon size={18} />
              從相簿選取
            </button>
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div style={{ width: '100%', marginTop: '1rem' }}>
          <div style={{ position: 'relative', width: '100%', borderRadius: '1rem', overflow: 'hidden' }}>
            <img src={image} alt="Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
            <button 
              onClick={() => setImage(null)}
              style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
          
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setImage(null)}>
              重拍
            </button>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleAnalyze}>
              開始辨識 (OCR)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
