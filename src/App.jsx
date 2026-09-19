import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ExamMode from './components/ExamMode';

function App() {
  return (
    <div className="container-fluid py-4" style={{ maxWidth: '1200px' }}>
      <header className="text-center mb-4">
        <h1 className="fw-bold display-6 gradient-text">📝 Thi Trắc Nghiệm</h1>
        <p className="text-muted mb-0 mt-1">Ôn luyện hiệu quả — Ghi nhớ lâu dài</p>
      </header>
      <ExamMode />
      <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
    </div>
  );
}

export default App;