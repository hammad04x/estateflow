import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Breadcrumb from "../layout/Breadcrumb";
// import "../../../assets/css/admin-card.css";
import api from "../../../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UpdateEntry = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const passed = location.state && location.state.item;
  const [entry, setEntry] = useState(
    passed || {
      id: null,
      item_name: "",
      description: "",
      amount: "",
      payment_method: "cash",
      added_by: "",
      entry_date: "",
      status: "pending",
    }
  );

  useEffect(() => {
    if (passed && passed.id) return;
 
  }, [passed]);

  const handleChange = (e) => setEntry({ ...entry, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!entry.id) return toast.error("No entry id found");
    try {
      await api.put(`http://localhost:4500/updateentry/${entry.id}`, entry);
      toast.success("Updated");
      navigate("/admin/getentries");
    } catch (err) {
      console.error("update error:", err);
      toast.error("Update failed");
    }
  };

  return (
    <>
      <Breadcrumb title="Update Entry" breadcrumbText="Edit inventory entry" isMobile={false} isTablet={false} />

      <div className="card" style={{ padding: 20, maxWidth: 720 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: 12 }}>
            <label>
              Item name
              <input name="item_name" value={entry.item_name} onChange={handleChange} required />
            </label>

            <label>
              Description
              <textarea name="description" value={entry.description} onChange={handleChange} />
            </label>

            <label>
              Amount
              <input name="amount" type="number" value={entry.amount} onChange={handleChange} />
            </label>

            <label>
              Payment method
              <select name="payment_method" value={entry.payment_method} onChange={handleChange}>
                <option value="cash">cash</option>
                <option value="online">online</option>
                <option value="cheque">cheque</option>
                <option value="other">other</option>
              </select>
            </label>

            <label>
              Status
              <select name="status" value={entry.status} onChange={handleChange}>
                <option value="pending">pending</option>
                <option value="confirmed">confirmed</option>
                <option value="rejected">rejected</option>
              </select>
            </label>

            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="btn primary">
                Save
              </button>
              <button type="button" className="btn" onClick={() => navigate("/admin/getentries")}>
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

export default UpdateEntry;
