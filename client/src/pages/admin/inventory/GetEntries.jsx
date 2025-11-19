import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../layout/Breadcrumb";
import { IoPencil } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
// import "../../../assets/css/admin-card.css";
import api from "../../../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeleteConfirmModal from "../../../components/modals/DeleteConfirmModal";

const GetEntries = () => {
  const [entries, setEntries] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const navigate = useNavigate();

  // fetch entries (simple)
  const fetchEntries = async () => {
    try {
      // call your backend endpoint
      const res = await api.get("http://localhost:4500/getentries");
      // if your API returns {data: rows} adjust accordingly; here we assume raw array
      setEntries(res.data || []);
    } catch (err) {
      console.error("fetchEntries:", err);
      toast.error("Failed to load entries");
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // responsive listener
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setIsTablet(w >= 768 && w < 1024);
    };
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // open confirm delete modal
  const openDeleteModal = (entry, e) => {
    e?.stopPropagation();
    setSelectedEntry(entry);
    setDeleteModalOpen(true);
  };

  // confirm delete
  const confirmDelete = async () => {
    if (!selectedEntry) return toast.error("No entry selected");
    try {
      await api.delete(`http://localhost:4500/deleteentry/${selectedEntry.id}`);
      toast.success("Deleted successfully");
      await fetchEntries();
    } catch (err) {
      console.error("delete error:", err);
      toast.error("Delete failed");
    } finally {
      setDeleteModalOpen(false);
      setSelectedEntry(null);
    }
  };

  // open details / edit
  const openDetails = (entry) => {
    // prefer sending state for quick edit; if not present UpdateEntry will fetch by id
    navigate("/admin/updateentry", { state: { item: entry } });
  };

  // simple filter tabs (All / pending / confirmed / rejected)
  const tabs = ["All", "pending", "confirmed", "rejected"];
  const filtered = entries.filter((e) => (activeTab === "All" ? true : e.status === activeTab));

  return (
    <>
      <Breadcrumb
        title="Inventory"
        breadcrumbText="Inventory Entries"
        button={{ link: "/admin/addentry", text: "Add Entry" }}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: activeTab === t ? "2px solid var(--primary-btn-bg)" : "1px solid #ddd",
              background: activeTab === t ? "rgba(0,0,0,0.04)" : "white",
              cursor: "pointer",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Desktop Table */}
      {!isMobile && !isTablet && (
        <div className="dashboard-table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Item</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((p) => (
                  <tr key={p.id} className="clickable-row" onClick={() => openDetails(p)}>
                    <td>{p.id}</td>
                    <td>{p.item_name}</td>
                    <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.description}
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{p.amount ?? "-"}</td>
                    <td>{p.payment_method ?? "-"}</td>
                    <td>
                      <span className={`status ${p.status}`}>{p.status}</span>
                    </td>
                    <td className="actions">
                      <IoPencil
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/admin/updateentry", { state: { item: p } });
                        }}
                        style={{ cursor: "pointer", fontSize: 20, color: "var(--primary-btn-bg)" }}
                        title="Edit"
                      />
                      <MdDeleteForever
                        onClick={(e) => openDeleteModal(p, e)}
                        style={{ cursor: "pointer", fontSize: 20, color: "var(--red-color)" }}
                        title="Delete"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 40, opacity: 0.6 }}>
                    No entries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile / Tablet */}
      {(isMobile || isTablet) && (
        <div className="cardlist">
          {filtered.length ? (
            filtered.map((p) => (
              <article key={p.id} className="card-row" onClick={() => openDetails(p)}>
                <div className="card-middle">
                  <div className="card-title">{p.item_name}</div>
                  <div className="card-sub">₹{p.amount ?? "-"}</div>
                  <div className="card-sub-small">{p.payment_method ?? "-"}</div>
                </div>
                <div className="card-right">
                  <div className={`count-pill ${p.status}`}>{p.status}</div>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">No entries found</div>
          )}
        </div>
      )}

      {deleteModalOpen && (
        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={() => {
            confirmDelete();
          }}
        />
      )}

      <ToastContainer position="top-right" autoClose={2500} hideProgressBar theme="colored" />
    </>
  );
};

export default GetEntries;
