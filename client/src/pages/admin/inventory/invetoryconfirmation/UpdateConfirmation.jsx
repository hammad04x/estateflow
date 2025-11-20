import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// import Breadcrumb from "../layout/Breadcrumb";
// import "../../../assets/css/admin-card.css";
import api from "../../../../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "../../layout/Breadcrumb";

const UpdateConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const passed = location.state && location.state.item;

  const formatLocalDatetime = (d) => {
    if (!d) return "";
    const date = new Date(d);
    const pad = (n) => (n < 10 ? "0" + n : n);
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const mins = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${mins}`;
  };

  const [form, setForm] = useState(
    passed || {
      id: null,
      entry_id: "",
      confirmed_by: "",
      status: "confirmed",
      confirmed_at: "",
      reject_reason: "",
    }
  );

  // if no state passed, you can fetch by id if your route provides :id (optional)
  useEffect(() => {
    if (passed && passed.confirmed_at) {
      setForm((s) => ({ ...s, confirmed_at: formatLocalDatetime(passed.confirmed_at) }));
    }
  }, [passed]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id && !passed?.id) return toast.error("No confirmation id found");

    const id = form.id || passed.id;
    try {
      await api.put(`http://localhost:4500/updateconfirmation/${id}`, {
        entry_id: form.entry_id || null,
        confirmed_by: form.confirmed_by || null,
        status: form.status || null,
        confirmed_at: form.confirmed_at || null,
        reject_reason: form.reject_reason || null,
      });
      toast.success("Updated");
      navigate("/admin/getconfirmations");
    } catch (err) {
      console.error("updateConfirmation error:", err);
      toast.error("Update failed");
    }
  };

  return (
    <>
      <Breadcrumb title="Update Confirmation" breadcrumbText="Edit confirmation" isMobile={false} isTablet={false} />
      <div className="card" style={{ padding: 20, maxWidth: 720 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: 12 }}>
            <label>
              Entry ID
              <input name="entry_id" value={form.entry_id} onChange={handleChange} />
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
                Save
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

export default UpdateConfirmation;
