import React from 'react';

function ExamEditForm({ editTitle, setEditTitle, editQuestions, handleDeleteQuestion, handleUpdateQuestion, handleAddNewQuestionToEdit, setShowImportModal, handleSaveEdit, setEditingExamId }) {
  const handleExportText = () => {
    const rawText = editQuestions.map(q => `${q.question} | ${q.options[0]} | ${q.options[1]} | ${q.options[2]} | ${q.options[3]} | ${q.correct_ans}`).join('\n');
    const blob = new Blob([rawText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${editTitle || 'De_thi'}_export.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    import('xlsx').then(XLSX => {
      const data = editQuestions.map(q => ({
        "Câu hỏi": q.question,
        "Đáp án A": q.options[0],
        "Đáp án B": q.options[1],
        "Đáp án C": q.options[2],
        "Đáp án D": q.options[3],
        "Vị trí đúng (1-4)": q.correct_ans
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Câu hỏi");
      XLSX.writeFile(wb, `${editTitle || 'De_thi'}_export.xlsx`);
    });
  };

  return (
    <div className="card shadow-sm border-0 mb-5 rounded-4 overflow-hidden">
      <div className="card-header modal-header-gradient fw-bold d-flex justify-content-between align-items-center">
        <span className="fs-5">Chỉnh sửa bài thi (Tổng: {editQuestions.length} câu)</span>
        <button className="btn btn-sm btn-light rounded-pill" onClick={() => setEditingExamId(null)}>Đóng lại</button>
      </div>
      <div className="card-body bg-light">
        <input className="form-control form-control-lg mb-4 fw-bold text-primary rounded-3" placeholder="Tên bài thi..." value={editTitle} onChange={e => setEditTitle(e.target.value)} />
        {editQuestions.map((q, idx) => (
          <div key={idx} className="card mb-3 border-secondary shadow-sm rounded-3" style={{ transform: 'none' }}>
            <div className="card-header bg-white d-flex justify-content-between py-2">
              <span className="fw-bold">Câu {idx + 1}</span>
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteQuestion(idx)}>Xóa câu này</button>
            </div>
            <div className="card-body">
              <input className="form-control mb-3 rounded-3" placeholder="Nội dung câu hỏi..." value={q.question} onChange={e => handleUpdateQuestion(idx, 'question', e.target.value)} />
              <div className="row g-2 mb-3">
                {[0, 1, 2, 3].map(optIdx => (
                  <div className="col-md-6" key={optIdx}>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text fw-bold">{String.fromCharCode(65 + optIdx)}</span>
                      <input className="form-control rounded-3" value={q.options[optIdx]} onChange={e => handleUpdateQuestion(idx, `opt${optIdx + 1}`, e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="d-flex align-items-center">
                <label className="me-2 fw-bold text-success">Đáp án đúng nằm ở vị trí số:</label>
                <select className="form-select form-select-sm w-auto border-success rounded-3" value={q.correct_ans} onChange={e => handleUpdateQuestion(idx, 'correct_ans', parseInt(e.target.value))}>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                </select>
              </div>
            </div>
          </div>
        ))}

        <div className="d-flex flex-wrap gap-2 mb-4">
          <button className="btn btn-outline-secondary flex-grow-1 border-dashed py-2" onClick={handleAddNewQuestionToEdit}>
            + Thêm 1 câu hỏi trống
          </button>
          <button className="btn btn-outline-primary flex-grow-1 border-dashed py-2 fw-bold" onClick={() => setShowImportModal(true)}>
            📥 Import nhanh (Paste)
          </button>
          <button className="btn btn-outline-info flex-grow-1 border-dashed py-2 fw-bold" onClick={handleExportText}>
            📄 Xuất Text
          </button>
          <button className="btn btn-outline-success flex-grow-1 border-dashed py-2 fw-bold" onClick={handleExportExcel}>
            📊 Xuất Excel
          </button>
        </div>

        <button className="btn btn-accent btn-lg w-100 fw-bold rounded-3" onClick={handleSaveEdit}>LƯU TẤT CẢ CẬP NHẬT</button>
      </div>
    </div>
  );
}

export default ExamEditForm;