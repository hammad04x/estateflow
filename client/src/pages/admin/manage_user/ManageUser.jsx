import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlinePlus,
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
} from "react-icons/hi";
import { IoMdArrowDropright, IoIosEye } from "react-icons/io";
import AdminProfile from "../../../assets/image/dash-profile.png";
import { MdDeleteForever } from "react-icons/md";
import { IoPencil } from "react-icons/io5";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import Breadcrumb from "../layout/Breadcrumb";
import api from "../../../api/axiosInstance";
import { useEffect } from "react";

const ManageUser = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("getUsers");
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <>
      <Sidebar />
      <Navbar />
      <main className="admin-panel-header-div">
        <Breadcrumb
          title="Admin"
          breadcrumbText="Admin List"
          button={{ link: "/admin/add-new_admin", text: "Add New Admin" }}
        />
        <div className="admin-panel-header-tabs">
          <button
            className={`admin-panel-header-tab 
                     ${activeTab === "All" ? "active" : ""}`}
            onClick={() => setActiveTab("All")}
          >
            All
          </button>
          <button
            className={`admin-panel-header-tab 
                     ${activeTab === "Active" ? "active" : ""}`}
            onClick={() => setActiveTab("Active")}
          >
            Active
          </button>
          <button
            className={`admin-panel-header-tab 
                     ${activeTab === "Blocked" ? "active" : ""}`}
            onClick={() => setActiveTab("Blocked")}
          >
            Blocked
          </button>
        </div>

        <div className="dashboard-table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: "25%" }}>Name</th>
                <th style={{ width: "16%" }}>Email</th>
                <th style={{ width: "15%" }}>Phone No</th>
                <th style={{ width: "11%" }}>Role</th>
                <th style={{ width: "10%" }}>Status</th>
                <th style={{ width: "11%" }}>Added</th>
                <th style={{ width: "12%" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, id) => (
                <tr key={id}>
                  <td className="product-info admin-profile">
                    <img src={`/uploads/${user.img}`} alt="profile_image" />
                    <span>{user.name}</span>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.number}</td>
                  <td>{JSON.parse(user.role).join(", ")}</td>

                  <td>
                    <span className="status published">{user.status}</span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString('en-GB')}</td>
                  <td className="actions">
                    <IoPencil />
                    <IoIosEye />
                    <MdDeleteForever />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="table-footer-pagination">
            <span>Showing 1-10 from 100</span>
            <ul className="pagination">
              <li className="arrow">
                <HiOutlineArrowLeft />
              </li>
              <li className="">01</li>
              <li>02</li>
              <li>03</li>
              <li>04</li>
              <li>05</li>
              <li className="arrow">
                <HiOutlineArrowRight />
              </li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
};

export default ManageUser;
