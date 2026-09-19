import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axiosConfig';
import EmptyState from './EmptyState';

function ExamList({ exams, fetchExamsList, startExam, handleEditClick, handleDeleteExam, isInstantFeedback, setIsInstantFeedback }) {
  const [rawText, setRawText] = useState("");
  const [title, setTitle] = useState("");

  const handleCreate = async () => {
    if (!title.trim() || !rawText.trim()) return toast.warning("Vui lòng nhập đủ tên và nội dung bài test!");
    try {
      await api.post("/exams/import", { title, raw_text: rawText });
      toast.success("Tạo bài test thành công!");
      setRawText("");
      setTitle("");
      fetchExamsList();
    } catch (error) {
      const detail = error.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail.map(e => e.msg).join('; ') : detail || "Lỗi kết nối server";
      toast.error(msg);
    }
  };

  return (
    <>
      <div className="card shadow-sm p-4 mb-5 border-0 rounded-4 border-accent-top" style={{ transform: 'none' }}>
        <h3 className="mb-2 fw-bold">✏️ Tạo bài kiểm tra mới</h3>
        <p className="text-muted small mb-3">
          Dán nhanh theo định dạng: <code>Câu hỏi | A | B | C | D | đáp án đúng</code>
        </p>
        <input
          className="form-control mb-2 rounded-3"
          placeholder="Tên bài kiểm tra..."
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          className="form-control mb-3 rounded-3"
          rows="3"
          placeholder="Câu hỏi | Đáp án 1 | Đáp án 2 | Đáp án 3 | Đáp án 4 | 1"
          value={rawText}
          onChange={e => setRawText(e.target.value)}
        ></textarea>
        <button className="btn btn-accent w-100 rounded-3" onClick={handleCreate}>
          🚀 Lưu Đề Thi Mới
        </button>
      </div>

      <div className="section-header mt-2">
        <h4 className="m-0 fw-bold">📚 Danh sách bài kiểm tra</h4>
      </div>

      {exams.length === 0 ? (
        <EmptyState
          title="Chưa có bài kiểm tra"
          message="Hãy tạo bài kiểm tra mới bằng cách điền thông tin phía trên nhé."
        />
      ) : (
        <div className="row mb-5">
          {exams.map(exam => (
            <div className="col-md-6 mb-3" key={exam.id}>
              <div className="card shadow-sm border-0 h-100 card-hover border-accent-left">
                <div className="card-body d-flex flex-column justify-content-between">
                  <h5 className="card-title" style={{ color: 'var(--accent)' }}>
                    {exam.title}
                  </h5>
                  <div>
                    <div className="d-flex gap-2 mt-3">
                      <button
                        className="btn btn-accent flex-grow-1 rounded-3"
                        onClick={() => startExam(exam.id)}
                      >
                        ▶ Làm bài
                      </button>
                      <button
                        className="btn btn-outline-secondary rounded-3"
                        onClick={() => handleEditClick(exam.id)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-outline-danger rounded-3"
                        onClick={() => handleDeleteExam(exam.id)}
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="form-check form-switch mt-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`switch-${exam.id}`}
                        checked={isInstantFeedback}
                        onChange={() => setIsInstantFeedback(!isInstantFeedback)}
                      />
                      <label
                        className="form-check-label text-primary"
                        htmlFor={`switch-${exam.id}`}
                        style={{ fontSize: '0.9rem' }}
                      >
                        ⚡ Hiện đáp án ngay khi chọn
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default ExamList;