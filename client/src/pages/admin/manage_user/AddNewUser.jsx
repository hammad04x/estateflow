import React, { useState } from "react";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import { MdSave } from "react-icons/md";
import { HiXMark } from "react-icons/hi2";
import { IoMdArrowDropright } from "react-icons/io";
import { Link, NavLink, useNavigate } from "react-router-dom";
import api from "../../../api/axiosInstance";

const AddNewUser = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    number: "",
    alt_number: "",
    password: "",
    status: "active",
    roles: [],
    img: null,
  });
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleRole = (role) => {
    setForm((prev) => {
      const exists = prev.roles.includes(role);
      return {
        ...prev,
        roles: exists ? prev.roles.filter((r) => r !== role) : [...prev.roles, role],
      };
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, img: file });

      // Generate preview
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };
  const submitUser = async () => {
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("email", form.email);
      data.append("number", form.number);
      data.append("alt_number", form.alt_number);
      data.append("password", form.password);
      data.append("status", form.status);
      data.append("roles", JSON.stringify(form.roles));
      data.append("img", form.img);


      const res = await api.post("/addUser", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("User added!");
      navigate("/admin/manage-user");
    } catch (err) {
      console.error(err);
      alert("Failed to add user.");
    }
  };

  return (
    <>
      <Sidebar />
      <Navbar />
      <main className="admin-panel-header-div">
        <div className="admin-dashboard-main-header" style={{ marginBottom: "24px" }}>
          <div>
            <h5>Add User</h5>
            <div className="admin-panel-breadcrumb">
              <Link to="/admin/dashboard" className="breadcrumb-link active">
                Dashboard
              </Link>
              <IoMdArrowDropright />
              <Link to="/admin/manage-admins" className="breadcrumb-link active">
                User List
              </Link>
              <IoMdArrowDropright />
              <span className="breadcrumb-text">Add User</span>
            </div>
          </div>

          <div className="admin-panel-header-add-buttons">
            <NavLink to="/admin/manage-user" className="cancel-btn dashboard-add-product-btn">
              <HiXMark /> Cancel
            </NavLink>
            <button onClick={submitUser} className="primary-btn dashboard-add-product-btn">
              <MdSave /> Save User
            </button>
          </div>
        </div>

        <div className="dashboard-add-content-card-div">
          {/* LEFT */}
          <div className="dashboard-add-content-left-side">
            <div className="dashboard-add-content-card">
              <h6>General Information</h6>
              <div className="add-product-form-container">
                <label>Name</label>
                <input name="name" onChange={handleChange} required/>

                <label>Email</label>
                <input name="email" onChange={handleChange}  required/>

                <label>Phone Number</label>
                <input name="number" onChange={handleChange} required />

                <label>Alt Number (Optional)</label>
                <input name="alt_number" onChange={handleChange} />

                <label>Password</label>
                <input name="password" type="password" onChange={handleChange} required/>

                <label>Status</label>
                <select name="status" onChange={handleChange}>
                  <option value="active">Active</option>
                  <option value="block">Blocked</option>
                </select>
              </div>
            </div>

            {/* ROLE ASSIGNMENT */}
            <div className="dashboard-add-content-card">
              <h6>Roles</h6>
              <div className="add-product-form-container">
                <label>
                  <input type="checkbox" onChange={() => toggleRole("buyer")} /> Buyer
                </label>
                <label>
                  <input type="checkbox" onChange={() => toggleRole("seller")} /> Seller
                </label>
                <label>
                  <input type="checkbox" onChange={() => toggleRole("broker")} /> Broker
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="dashboard-add-content-right-side">
            <div className="dashboard-add-content-card">
              <h6>Profile Photo (Optional)</h6>

              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "16px",
                  background: "#fff",
                  textAlign: "center",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                }}
              >
              

                {/* Image Preview */}
                <div
                  style={{
                    width: "100%",
                    height: "200px",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "1px solid #e5e7eb",
                    marginBottom: "16px",
                    background: "#f8f8f8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/1829/1829586.png"
                      alt="Upload Icon"
                      style={{ width: "60px", opacity: 0.5 }}
                    />
                  )}
                </div>

                {/* Button */}
                <button
                  type="button"
                  className="add-product-upload-btn secondary-btn"
                  onClick={() => document.getElementById("imageInputFile").click()}
                  style={{
                    padding: "10px 18px",
                    border: "1px solid #374ef4",
                    background: "#fff",
                    borderRadius: "8px",
                    color: "#374ef4",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "0.2s",
                  }}
                >
                  Select Image
                </button>

                <input
                  type="file"
                  id="imageInputFile"
                  name="profile"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>
            </div>


          </div>
        </div>
      </main>
    </>
  );
};

export default AddNewUser;
