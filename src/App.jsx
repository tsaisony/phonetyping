import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import CameraView from './pages/CameraView';
import OcrResult from './pages/OcrResult';
import Practice from './pages/Practice';
import './index.css';

function App() {
  return (
    <HashRouter>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/camera" element={<CameraView />} />
            <Route path="/result" element={<OcrResult />} />
            <Route path="/practice/:id" element={<Practice />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
