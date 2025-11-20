import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import Breadcrumb from "../layout/Breadcrumb";
// import "../../../assets/css/admin-card.css";
import api from "../../../../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "../../layout/Breadcrumb";

const AddConfirmation = () => {
  const formatLocalDatetime = (d = new Date()) => {
    const pad = (n) => (n < 10 ? "0" + n : n);
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const mins = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${mins}`;
  };

  const [form, setForm] = useState({
    entry_id: "",
    confirmed_by: "", // try auto fill below
    status: "confirmed",
    confirmed_at: formatLocalDatetime(),
    reject_reason: "",
  });

  const navigate = useNavigate();

  // try get current user id from localStorage if present
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user") || localStorage.getItem("authUser");
      if (raw) {
        const parsed = JSON.parse(raw);
        const id = parsed?.id || parsed?.userId || parsed?.user?.id || parsed?.user_id;
        if (id) setForm((s) => ({ ...s, confirmed_by: id }));
      }
    } catch (err) {
      // ignore
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.entry_id) return toast.error("entry_id is required");

    try {
      await api.post("http://localhost:4500/addconfirmation", {
        ...form,
        confirmed_at: form.confirmed_at || null,
        reject_reason: form.reject_reason || null,
      });
      toast.success("Confirmation created");
      navigate("/admin/getconfirmations");
    } catch (err) {
      console.error("addConfirmation error:", err);
      toast.error("Failed to create");
    }
  };

  return (
    <>
      <Breadcrumb title="Add Confirmation" breadcrumbText="Confirm or reject an entry" isMobile={false} isTablet={false} />
      <div className="card" style={{ padding: 20, maxWidth: 720 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: 12 }}>
            <label>
              Entry ID
              <input name="entry_id" value={form.entry_id} onChange={handleChange} required />
            </label>

            <label>
              Confirmed by (user id)
              <input name="confirmed_by" value={form.confirmed_by} onChange={handleChange} />
            </label>

            <label>
              Status
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="confirmed">confirmed</option>
                <option value="rejected">rejected</option>
              </select>
            </label>

            <label>
              Confirmed at
              <input name="confirmed_at" type="datetime-local" value={form.confirmed_at} onChange={handleChange} />
            </label>

            {form.status === "rejected" && (
              <label>
                Reject reason
                <textarea name="reject_reason" value={form.reject_reason} onChange={handleChange} />
              </label>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="btn primary">
                Add
              </button>
              <button type="button" className="btn" onClick={() => navigate("/admin/getconfirmations")}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>

      <ToastContainer position="top-right" autoClose={2500} hideProgressBar theme="colored" />
    </>
  );
};

export default AddConfirmation;
