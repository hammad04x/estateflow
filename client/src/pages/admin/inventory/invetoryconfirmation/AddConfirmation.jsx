// src/pages/admin/AddConfirmation.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../layout/Breadcrumb";
import api from "../../../../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";

const AddConfirmation = () => {
  const formatLocalDatetime = () => {
    const d = new Date();
    return d.toISOString().slice(0, 16);
  };
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  const [form, setForm] = useState({
    entry_id: "",
    confirmed_by: "",
    status: "confirmed",
    confirmed_at: formatLocalDatetime(),
    reject_reason: "",
  });

  // auto-fill confirmed_by from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return;
    const user = JSON.parse(raw);
    if (user?.id) {
      setForm((prev) => ({ ...prev, confirmed_by: user.id }));
    }
    setForm((prev) => ({
      ...prev,
      confirmed_at: new Date().toISOString().slice(0, 16),
    }));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // CANVAS EVENTS
  const startDraw = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setDrawing(true);
  };

  const drawingMove = ({ nativeEvent }) => {
    if (!drawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDraw = () => setDrawing(false);

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, 600, 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.entry_id) return toast.error("Entry ID required");

    // convert canvas → blob
    const canvas = canvasRef.current;
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );

    const fd = new FormData();
    fd.append("entry_id", form.entry_id);
    fd.append("confirmed_by", form.confirmed_by);
    fd.append("status", form.status);
    fd.append("confirmed_at", form.confirmed_at);
    if (form.reject_reason) fd.append("reject_reason", form.reject_reason);

    if (blob) fd.append("signature", blob, "signature.png");

    try {
      await api.post("http://localhost:4500/addconfirmation", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Confirmation added");
      navigate("/admin/getconfirmations");
    } catch (err) {
      toast.error("Failed to submit confirmation");
      console.error(err);
    }
  };

  return (
    <>
      <Breadcrumb
        title="Add Confirmation"
        breadcrumbText="Confirm Inventory Entry"
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
                required
              />
            </label>

            <label>
              Status
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
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

            {/* SIGNATURE CANVAS */}
            <div>
              <p style={{ fontWeight: 600, marginBottom: 6 }}>Signature</p>
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                style={{
                  border: "1px solid #aaa",
                  borderRadius: 8,
                  background: "#fff",
                }}
                onMouseDown={startDraw}
                onMouseMove={drawingMove}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
              ></canvas>

              <button type="button" onClick={clearCanvas} style={{ marginTop: 10 }}>
                Clear
              </button>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn primary" type="submit">
                Submit
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

export default AddConfirmation;
