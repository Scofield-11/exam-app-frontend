import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axiosConfig';
import confetti from 'canvas-confetti';

function ExamTaking({ examData, isInstantFeedback, backToList, fetchHistory, openSaveModal, startExam }) {
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmBack, setShowConfirmBack] = useState(false);

  const handleBackClick = () => {
    if (!isSubmitted && Object.keys(answers).length > 0) {
      setShowConfirmBack(true);
    } else {
      backToList();
    }
  };

  const handleSelect = (qId, optIndex) => {
    if (isSubmitted) return;
    setAnswers({ ...answers, [qId]: optIndex });
  };

  const scrollToQuestion = (idx) => {
    const element = document.getElementById(`question-${idx}`);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);
    const wrongQs = examData.questions.filter(q => answers[q.id] !== q.correct_ans);
    const scoreCount = examData.questions.length - wrongQs.length;

    if (scoreCount / examData.questions.length >= 0.8) {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    }

    const wrongDetails = wrongQs.map(q => ({
      question: q.question,
      options: [...q.options],
      correct_ans: q.correct_ans,
      user_ans: answers[q.id]
    }));

    const newRecord = {
      id: Date.now(),
      examId: examData.id,
      title: examData.title,
      score: scoreCount,
      total: examData.questions.length,
      date: new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
      wrongDetails: wrongDetails
    };

    const currentHistory = JSON.parse(localStorage.getItem('scofieldExamHistory') || '[]');
    const updatedHistory = [newRecord, ...currentHistory].slice(0, 50);
    localStorage.setItem('scofieldExamHistory', JSON.stringify(updatedHistory));

    fetchHistory();
  };

  const handleCreateFromCurrentMistakes = async () => {
    const wrongQs = examData.questions.filter(q => answers[q.id] !== q.correct_ans);
    const newTitle = window.prompt("Vui lòng nhập tên cho đề ôn tập:", `Ôn tập câu sai - ${examData.title}`);
    if (!newTitle || !newTitle.trim()) return;

    const rawText = wrongQs.map(q =>
      `${q.question} | ${q.options[0]} | ${q.options[1]} | ${q.options[2]} | ${q.options[3]} | ${q.correct_ans}`
    ).join('\n');

    try {
      await api.post("/exams/import", { title: newTitle.trim(), raw_text: rawText });
      toast.success(`Đã tạo thành công đề thi: ${newTitle.trim()}`);
      backToList();
      window.scrollTo(0, 0);
    } catch (error) {
      toast.error("Lỗi khi tạo bài test ôn tập.");
    }
  };

  const wrongQuestions = examData.questions.filter(q => answers[q.id] !== q.correct_ans);
  const score = examData.questions.length - wrongQuestions.length;
  const totalQuestions = examData.questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="container-fluid mt-3">
      {/* Confirm Back Modal */}
      {showConfirmBack && (
        <div className="modal d-block modal-backdrop-blur" style={{ zIndex: 1050, padding: '10px' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header bg-danger text-white border-0">
                <h5 className="modal-title fw-bold">⚠️ Xác nhận thoát</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowConfirmBack(false)}></button>
              </div>
              <div className="modal-body p-4 text-center">
                <h5 className="mb-3 text-dark">Bạn đang làm dở bài thi!</h5>
                <p className="text-muted mb-4">Nếu thoát bây giờ, tiến trình của bạn sẽ không được lưu lại. Bạn có muốn nộp bài luôn không?</p>
                <div className="d-flex flex-column gap-2">
                  <button className="btn btn-accent fw-bold rounded-pill" onClick={() => { setShowConfirmBack(false); handleSubmit(); }}>
                    📤 Nộp bài ngay
                  </button>
                  <button className="btn btn-outline-danger fw-bold rounded-pill" onClick={backToList}>
                    🗑️ Hủy bài & Thoát
                  </button>
                  <button className="btn btn-light fw-bold rounded-pill text-muted" onClick={() => setShowConfirmBack(false)}>
                    Tiếp tục làm bài
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <button className="btn btn-outline-secondary rounded-pill fw-bold px-4 mb-4 d-print-none" onClick={handleBackClick}>
        ← Quay lại
      </button>
      
      <div className="row">
        <div className="col-lg-8">
          <h3 className="mb-4 fw-bold d-flex align-items-center gap-2 flex-wrap">
            {examData.title}
            {isSubmitted 
              ? <span className="badge bg-success fs-6 fw-normal">✅ Đã nộp</span>
              : <span className="badge bg-accent-light fs-6 fw-normal" style={{color: 'var(--accent)'}}>Đang làm</span>
            }
          </h3>

          {!isSubmitted ? (
            <>
              {examData.questions.map((q, idx) => (
                <div id={`question-${idx}`} key={q.id} className="bg-white rounded-4 shadow-sm mb-4 p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <span className="question-number">{idx + 1}</span>
                      <h5 className="mb-0 fw-bold">{q.question}</h5>
                    </div>
                    <button className="btn btn-sm btn-outline-warning d-print-none" onClick={() => openSaveModal(q)}>
                      ⭐ Lưu
                    </button>
                  </div>
                  <div className="row">
                    {q.options.map((opt, oIdx) => {
                      const optNumber = oIdx + 1;
                      const letter = String.fromCharCode(64 + optNumber);
                      let btnClass = "btn-outline-secondary";
                      if (answers[q.id] === optNumber) {
                        btnClass = isInstantFeedback 
                          ? (optNumber === q.correct_ans ? 'btn-success text-white' : 'btn-danger text-white') 
                          : 'btn-primary text-white';
                      }
                      if (isInstantFeedback && answers[q.id] && optNumber === q.correct_ans) {
                        btnClass = 'btn-success text-white';
                      }
                      
                      return (
                        <div className="col-sm-6 mb-3" key={oIdx}>
                          <button 
                            className={`btn w-100 answer-option ${btnClass}`} 
                            onClick={() => handleSelect(q.id, optNumber)}
                            style={{ textAlign: 'left', position: 'relative' }}
                          >
                            <span className="answer-letter">{letter}</span>
                            {opt}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <button className="btn btn-accent btn-lg w-100 mb-5 shadow d-print-none rounded-3" onClick={handleSubmit}>
                📤 Nộp bài
              </button>
            </>
          ) : (
            <div className="mb-5 animate-in">
              <div className={`score-card mb-4 animate-in ${
                score/totalQuestions >= 0.8 ? 'score-card-success' :
                score/totalQuestions >= 0.5 ? 'score-card-warning' : 'score-card-danger'
              }`}>
                <div style={{fontSize: '2.5rem', marginBottom: '8px'}}>
                  {score === totalQuestions ? '🏆' : score/totalQuestions >= 0.8 ? '🎉' : score/totalQuestions >= 0.5 ? '💪' : '📖'}
                </div>
                <h3 className="fw-bold mb-1">{score} / {totalQuestions}</h3>
                <p className="mb-0 small" style={{opacity: 0.9}}>
                  {score === totalQuestions ? 'Tuyệt vời! Điểm tuyệt đối!' :
                   score/totalQuestions >= 0.8 ? 'Xuất sắc! Tiếp tục phát huy!' :
                   score/totalQuestions >= 0.5 ? 'Khá tốt! Cần ôn thêm một chút.' :
                   'Cần ôn luyện thêm nhiều hơn nữa.'}
                </p>
              </div>

              <h4 className="fw-bold mb-4 gradient-text">Chi tiết bài làm:</h4>
              {examData.questions.map((q, idx) => {
                const isCorrect = answers[q.id] === q.correct_ans;
                const cardClass = isCorrect ? 'correct-answer-card' : 'wrong-answer-card';
                return (
                  <div id={`question-${idx}`} key={q.id} className={`bg-white ${cardClass} shadow-sm mb-4 p-4`}>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <span className="question-number">{idx + 1}</span>
                        <h5 className="mb-0 fw-bold">{q.question}</h5>
                      </div>
                      {!isCorrect && (
                        <button className="btn btn-sm btn-outline-warning d-print-none" onClick={() => openSaveModal(q)}>
                          ⭐ Lưu
                        </button>
                      )}
                    </div>
                    <div className="row">
                      {q.options.map((opt, oIdx) => {
                        const optNumber = oIdx + 1;
                        const letter = String.fromCharCode(64 + optNumber);
                        let btnClass = "btn-outline-secondary";
                        if (optNumber === q.correct_ans) btnClass = 'btn-success text-white';
                        else if (answers[q.id] === optNumber) btnClass = 'btn-danger text-white';

                        return (
                          <div className="col-sm-6 mb-3" key={oIdx}>
                            <button 
                              className={`btn w-100 answer-option ${btnClass}`}
                              style={{ textAlign: 'left', position: 'relative', cursor: 'default' }}
                              disabled
                            >
                              <span className="answer-letter">{letter}</span>
                              {opt}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              
              <div className="d-flex flex-wrap gap-3 mt-4 d-print-none">
                <button className="btn btn-warning fw-bold px-4 rounded-pill" onClick={() => startExam(examData.id)}>
                  🔄 Làm lại
                </button>
                <button className="btn btn-accent fw-bold px-4 rounded-pill" onClick={handleCreateFromCurrentMistakes}>
                  📝 Tạo đề từ câu sai
                </button>
                <button className="btn btn-outline-secondary fw-bold px-4 rounded-pill" onClick={() => window.print()}>
                  🖨️ In kết quả
                </button>
                <button className="btn btn-secondary fw-bold px-4 rounded-pill" onClick={backToList}>
                  ← Quay lại danh sách
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="col-lg-4 d-print-none order-first order-lg-last mb-4 mb-lg-0">
          <div className="card border-0 sticky-lg-top glass-card shadow" style={{ top: '12px', zIndex: 1000 }}>
            <div className="card-body">
              <h6 className="mb-3 text-center fw-bold text-muted text-uppercase" style={{fontSize: '0.75rem', letterSpacing: '1px'}}>Bảng điều hướng</h6>
              <div className="d-flex justify-content-between mb-2 small text-muted">
                <span>Đã chọn: {answeredCount}/{totalQuestions}</span>
                <span>{Math.round((answeredCount / totalQuestions) * 100)}%</span>
              </div>
              <div className="progress-accent shadow-sm mb-4">
                <div className="progress-bar" role="progressbar" style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}></div>
              </div>
              <div className="question-navigator d-flex flex-wrap gap-2 justify-content-center">
                {examData.questions.map((q, idx) => {
                  let btnClass = "btn-outline-secondary";
                  if (isSubmitted) {
                    btnClass = answers[q.id] === q.correct_ans ? 'btn-success text-white' : (answers[q.id] ? 'btn-danger text-white' : 'btn-outline-secondary');
                  } else if (answers[q.id]) {
                    if (isInstantFeedback) {
                      btnClass = answers[q.id] === q.correct_ans ? 'btn-success text-white' : 'btn-danger text-white';
                    } else {
                      btnClass = 'btn-primary text-white';
                    }
                  }
                  return (
                    <button
                      key={q.id}
                      onClick={() => scrollToQuestion(idx)}
                      className={`btn nav-question-btn p-0 d-flex align-items-center justify-content-center fw-bold ${btnClass}`}
                      style={{ width: '44px', height: '44px' }}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExamTaking;