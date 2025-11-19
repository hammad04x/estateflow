import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../layout/Breadcrumb";
// import "../../../assets/css/admin-card.css";
import api from "../../../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddEntry = () => {
 const formatLocalDatetime = () => {
  const d = new Date();
  return d.toISOString().slice(0, 16);
};


  const [form, setForm] = useState({
    item_name: "",
    description: "",
    amount: "",
    payment_method: "cash",
    added_by: "", // will be auto-filled
    entry_date: formatLocalDatetime(), // default to now
    status: "pending",
  });

  const navigate = useNavigate();

useEffect(() => {
  const raw = localStorage.getItem("user");
  if (!raw) return;

  const user = JSON.parse(raw);
  if (!user.id) return;

  setForm(prev => ({
    ...prev,
    added_by: user.id
  }));
}, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // convert empty string amount to null so backend can handle if needed
    const payload = {
      ...form,
      amount: form.amount === "" ? null : form.amount,
    };

    try {
      // adjust endpoint if your server base path differs
      await api.post("http://localhost:4500/addentry", payload);
      toast.success("Entry added");
      navigate("/admin/getentries");
    } catch (err) {
      console.error("add error:", err);
      toast.error("Failed to add");
    }
  };

  return (
    <>
      <Breadcrumb title="Add Entry" breadcrumbText="Create new inventory entry" isMobile={false} isTablet={false} />

      <div className="card" style={{ padding: 20, maxWidth: 720 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: 12 }}>
            <label>
              Item name
              <input name="item_name" value={form.item_name} onChange={handleChange} required />
            </label>

            <label>
              Description
              <textarea name="description" value={form.description} onChange={handleChange} />
            </label>

            <label>
              Amount
              <input name="amount" type="number" value={form.amount} onChange={handleChange} />
            </label>

            <label>
              Payment method
              <select name="payment_method" value={form.payment_method} onChange={handleChange}>
                <option value="cash">cash</option>
                <option value="online">online</option>
                <option value="cheque">cheque</option>
                <option value="other">other</option>
              </select>
            </label>
            
              {/* Added by (user id) */}
              {/* auto-filled but editable if needed */}
              {/* <input name="added_by" value={form.added_by} onChange={handleChange} /> */}
            

            <label>
              Entry date
              <input name="entry_date" type="datetime-local" value={form.entry_date} onChange={handleChange} />
            </label>

            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="btn primary">
                Add
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

export default AddEntry;
