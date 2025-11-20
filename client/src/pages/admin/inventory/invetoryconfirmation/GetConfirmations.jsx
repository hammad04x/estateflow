import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import Breadcrumb from "../layout/Breadcrumb";
import { IoPencil } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
// import "../../../assets/css/admin-card.css";
import api from "../../../../api/axiosInstance";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeleteConfirmModal from "../../../../components/modals/DeleteConfirmModal";
import Breadcrumb from "../../layout/Breadcrumb";

const GetConfirmations = () => {
  const [confirmations, setConfirmations] = useState([]);
  const [activeTab, setActiveTab] = useState("All"); // All / confirmed / rejected
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const navigate = useNavigate();

  const fetchConfirmations = async () => {
    try {
      const res = await api.get("http://localhost:4500/getconfirmations");
      setConfirmations(res.data || []);
    } catch (err) {
      console.error("fetchConfirmations:", err);
      toast.error("Failed to load confirmations");
    }
  };

  useEffect(() => {
    fetchConfirmations();
  }, []);

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

  const openDeleteModal = (item, e) => {
    e?.stopPropagation();
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return toast.error("No confirmation selected");
    try {
      await api.delete(`http://localhost:4500/deleteconfirmation/${selectedItem.id}`);
      toast.success("Deleted");
      await fetchConfirmations();
    } catch (err) {
      console.error("delete error:", err);
      toast.error("Delete failed");
    } finally {
      setDeleteModalOpen(false);
      setSelectedItem(null);
    }
  };

  const openEdit = (item) => {
    navigate("/admin/updateconfirmation", { state: { item } });
  };

  const tabs = ["All", "confirmed", "rejected"];
  const filtered = confirmations.filter((c) => (activeTab === "All" ? true : c.status === activeTab));

  return (
    <>
      <Breadcrumb
        title="Confirmations"
        breadcrumbText="Entry Confirmations"
        button={{ link: "/admin/addconfirmation", text: "Add Confirmation" }}
        isMobile={isMobile}
        isTablet={isTablet}
      />

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

      {/* Desktop */}
      {!isMobile && !isTablet && (
        <div className="dashboard-table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Entry ID</th>
                <th>Confirmed By</th>
                <th>Status</th>
                <th>Confirmed At</th>
                <th>Reject Reason</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((r) => (
                  <tr key={r.id} className="clickable-row">
                    <td>{r.id}</td>
                    <td>{r.entry_id}</td>
                    <td>{r.confirmed_by ?? "-"}</td>
                    <td>{r.status ?? "-"}</td>
                    <td>{r.confirmed_at ? new Date(r.confirmed_at).toLocaleString() : "-"}</td>
                    <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.reject_reason ?? "-"}
                    </td>
                    <td className="actions">
                      <IoPencil
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(r);
                        }}
                        style={{ cursor: "pointer", fontSize: 20, color: "var(--primary-btn-bg)" }}
                        title="Edit"
                      />
                      <MdDeleteForever
                        onClick={(e) => openDeleteModal(r, e)}
                        style={{ cursor: "pointer", fontSize: 20, color: "var(--red-color)" }}
                        title="Delete"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 40, opacity: 0.6 }}>
                    No confirmations found
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
            filtered.map((r) => (
              <article key={r.id} className="card-row">
                <div className="card-middle">
                  <div className="card-title">Entry #{r.entry_id}</div>
                  <div className="card-sub-small">{r.confirmed_by ? `By: ${r.confirmed_by}` : "-"}</div>
                  <div className="card-sub-small">{r.status}</div>
                </div>
                <div className="card-right">
                  <div className="count-pill">{r.confirmed_at ? new Date(r.confirmed_at).toLocaleString() : "-"}</div>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">No confirmations found</div>
          )}
        </div>
      )}

      {deleteModalOpen && (
        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={() => confirmDelete()}
        />
      )}

      <ToastContainer position="top-right" autoClose={2500} hideProgressBar theme="colored" />
    </>
  );
};

export default GetConfirmations;
