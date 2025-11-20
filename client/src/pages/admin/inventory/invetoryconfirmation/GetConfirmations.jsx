// src/pages/admin/GetConfirmations.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../layout/Breadcrumb";
import { IoPencil } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
import api from "../../../../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import DeleteConfirmModal from "../../../../components/modals/DeleteConfirmModal";

const GetConfirmations = () => {
  const [items, setItems] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await api.get("http://localhost:4500/getconfirmations");
      setItems(res.data || []);
    } catch (err) {
      toast.error("Failed to load confirmations");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openDeleteModal = (row, e) => {
    e.stopPropagation();
    setSelected(row);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(
        `http://localhost:4500/deleteconfirmation/${selected.id}`
      );
      toast.success("Deleted");
      fetchData();
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setDeleteModalOpen(false);
      setSelected(null);
    }
  };

  return (
    <>
      <Breadcrumb
        title="Confirmations"
        breadcrumbText="All Confirmation Records"
        button={{ link: "/admin/addconfirmation", text: "Add Confirmation" }}
        isMobile={false}
        isTablet={false}
      />

      <div className="dashboard-table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Entry ID</th>
              <th>Status</th>
              <th>Confirmed By</th>
              <th>Signature</th>
              <th>Confirmed At</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {items.length ? (
              items.map((c) => (
                <tr
                  key={c.id}
                  className="clickable-row"
                  onClick={() =>
                    navigate("/admin/updateconfirmation", {
                      state: { item: c },
                    })
                  }
                >
                  <td>{c.id}</td>
                  <td>{c.entry_id}</td>
                  <td>{c.status}</td>
                  <td>{c.confirmed_by}</td>

                  <td>
                    {c.signature ? (
                      <img
                        src={`/uploads/${c.signature}`}
                        alt="sign"
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: "contain",
                          border: "1px solid #ddd",
                          borderRadius: 6,
                          background: "#fff",
                        }}
                      />
                    ) : (
                      "—"
                    )}
                  </td>

                  <td>{c.confirmed_at}</td>

                  <td className="actions">
                    <IoPencil
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/admin/updateconfirmation", {
                          state: { item: c },
                        });
                      }}
                      style={{
                        cursor: "pointer",
                        fontSize: 20,
                        color: "var(--primary-btn-bg)",
                      }}
                    />

                    <MdDeleteForever
                      onClick={(e) => openDeleteModal(c, e)}
                      style={{
                        cursor: "pointer",
                        fontSize: 20,
                        color: "var(--red-color)",
                      }}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: "center", padding: 40, opacity: 0.6 }}
                >
                  No confirmations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteModalOpen && (
        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
        />
      )}

      <ToastContainer />
    </>
  );
};

export default GetConfirmations;
