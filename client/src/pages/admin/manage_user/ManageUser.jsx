import React, { useState, useEffect } from "react";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import Breadcrumb from "../layout/Breadcrumb";
import { IoPencil } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
import api from "../../../api/axiosInstance";
import { NavLink, useNavigate } from "react-router-dom";
import { FaRegEye } from "react-icons/fa";

const ManageUser = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [users, setUsers] = useState([]);

  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await api.get("/getUsers");
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // FILTER USERS
 const filteredUsers = users.filter((u) =>
  activeTab === "All"
    ? u.status !== "trash"
    : u.status === "trash"
);


  // MOVE TO TRASH (simple, clean)
  const trashUser = async (id) => {
    try {
      await api.put(`/trash-client/${id}`, { status: "trash" });

      // update UI instantly
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, trash: "trash" } : u
        )
      );

      alert("User moved to trash");
    } catch (error) {
      console.error(error);
      alert("Failed to delete");
    }
  };

  return (
    <>
      <Sidebar />
      <Navbar />

      <main className="admin-panel-header-div">
        <Breadcrumb
          title="Users"
          breadcrumbText="User List"
          button={{ link: "/admin/add-new-user", text: "Add New User" }}
        />

        {/* TABS */}
        <div className="admin-panel-header-tabs">
          <button
            className={`admin-panel-header-tab ${
              activeTab === "All" ? "active" : ""
            }`}
            onClick={() => setActiveTab("All")}
          >
            All
          </button>

          <button
            className={`admin-panel-header-tab ${
              activeTab === "Trash" ? "active" : ""
            }`}
            onClick={() => setActiveTab("Trash")}
          >
            Trash
          </button>
        </div>

        {/* TABLE */}
        <div className="dashboard-table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: "25%" }}>Name</th>
                <th style={{ width: "16%" }}>Email</th>
                <th style={{ width: "15%" }}>Phone</th>
                <th style={{ width: "10%" }}>Status</th>
                <th style={{ width: "10%" }}>Added</th>
                <th style={{ width: "14%" }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="product-info admin-profile">
                      <img src={`/uploads/${user.img}`} alt="profile" />
                      <span>{user.name}</span>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.number}</td>

                    <td>
                      <span
                        className={`status ${
                          user.status === "active"
                            ? "published"
                            : "out-of-stock"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td>{new Date(user.created_at).toLocaleDateString()}</td>

                    <td className="actions">
                      <FaRegEye
                        onClick={() => navigate(`/admin/viewuser/${user.id}`)}
                        style={{ cursor: "pointer", marginRight: 10 }}
                      />

                      <NavLink
                        to="/admin/edituser"
                        onClick={() =>
                          localStorage.setItem("editUserId", user.id)
                        }
                      >
                        <IoPencil />
                      </NavLink>

                      <MdDeleteForever
                        onClick={() => trashUser(user.id)}
                        style={{ cursor: "pointer", marginLeft: 10 }}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      opacity: 0.6,
                    }}
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
};

export default ManageUser;
