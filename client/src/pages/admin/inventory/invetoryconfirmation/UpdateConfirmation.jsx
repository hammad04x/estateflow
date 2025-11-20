// src/pages/admin/UpdateConfirmation.jsx
import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Breadcrumb from "../../layout/Breadcrumb";
import api from "../../../../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";

const UpdateConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const passed = location.state?.item;

  const canvasRef = useRef(null);

  const [form, setForm] = useState({
    id: passed?.id || "",
    entry_id: passed?.entry_id || "",
    confirmed_by: passed?.confirmed_by || "",
    status: passed?.status || "",
    confirmed_at: passed?.confirmed_at
      ? passed.confirmed_at.replace(" ", "T").slice(0, 16)
      : "",
    reject_reason: passed?.reject_reason || "",
    signature: passed?.signature || "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, 600, 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const canvas = canvasRef.current;
    let blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );

    const fd = new FormData();
    fd.append("entry_id", form.entry_id);
    fd.append("confirmed_by", form.confirmed_by);
    fd.append("status", form.status);
    fd.append("confirmed_at", form.confirmed_at);
    fd.append("reject_reason", form.reject_reason);

    if (blob && blob.size > 50) fd.append("signature", blob);

    try {
      await api.put(
        `http://localhost:4500/updateconfirmation/${form.id}`,
        fd
      );
      toast.success("Updated");
      navigate("/admin/getconfirmations");
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  return (
    <>
      <Breadcrumb
        title="Update Confirmation"
        breadcrumbText="Modify existing confirmation"
        isMobile={false}
        isTablet={false}
      />

      <div className="card" style={{ padding: 20, maxWidth: 760 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: 12 }}>
            <label>
              Entry ID
              <input
                name="entry_id"
                value={form.entry_id}
                onChange={handleChange}
              />
            </label>

            <label>
              Status
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="confirmed">confirmed</option>
                <option value="rejected">rejected</option>
              </select>
            </label>

            {form.status === "rejected" && (
              <label>
                Reject Reason
                <textarea
                  name="reject_reason"
                  value={form.reject_reason}
                  onChange={handleChange}
                />
              </label>
            )}

            <label>
              Confirmed At
              <input
                type="datetime-local"
                name="confirmed_at"
                value={form.confirmed_at}
                onChange={handleChange}
              />
            </label>

            <div>
              <p>Signature (draw new to replace)</p>
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                style={{
                  border: "1px solid #aaa",
                  borderRadius: 8,
                  background: "#fff",
                }}
                onMouseDown={(e) => {
                  const ctx = canvasRef.current.getContext("2d");
                  ctx.beginPath();
                  ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                  form._drawing = true;
                }}
                onMouseMove={(e) => {
                  if (!form._drawing) return;
                  const ctx = canvasRef.current.getContext("2d");
                  ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                  ctx.stroke();
                }}
                onMouseUp={() => (form._drawing = false)}
                onMouseLeave={() => (form._drawing = false)}
              ></canvas>
              <button type="button" onClick={clearCanvas} style={{ marginTop: 10 }}>
                Clear
              </button>

              {form.signature && (
                <div style={{ marginTop: 10 }}>
                  <p>Existing Signature:</p>
                  <img
                    src={`/${form.signature}`}
                    alt="old signature"
                    style={{ width: 120, height: 120, objectFit: "contain" }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn primary" type="submit">
                Save
              </button>

              <button
                className="btn"
                type="button"
                onClick={() => navigate("/admin/getconfirmations")}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>

      <ToastContainer />
    </>
  );
};

export default UpdateConfirmation;
