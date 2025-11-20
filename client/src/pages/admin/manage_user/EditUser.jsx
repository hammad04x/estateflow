import React, { useState, useEffect } from "react";
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import { MdSave } from "react-icons/md";
import { HiXMark } from "react-icons/hi2";
import { IoMdArrowDropright } from "react-icons/io";
import { Link, NavLink, useNavigate } from "react-router-dom";
import api from "../../../api/axiosInstance";

const EditUser = () => {
    const navigate = useNavigate();

    const loggedUser = JSON.parse(localStorage.getItem("user"));
    const loggedRoles = loggedUser.role ? JSON.parse(loggedUser.role) : [];

    const editId = localStorage.getItem("editUserId") || loggedUser.id;
    const isAdmin = loggedRoles.includes("admin");

    const [form, setForm] = useState({
        name: "",
        email: "",
        number: "",
        alt_number: "",
        status: "active",
        role: [],
        img: null,
        old_password: "",
        password: "",
    });

    const [preview, setPreview] = useState(null);

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await api.get(`/getuserbyid/${editId}`);
                const u = res.data;

                setForm({
                    name: u.name,
                    email: u.email,
                    number: u.number,
                    alt_number: u.alt_number || "",
                    status: u.status,
                    role: JSON.parse(u.role),
                    img: null,
                    old_password: "",
                    password: "",
                });

                if (u.img) setPreview(`/uploads/${u.img}`);
            } catch (e) {
                console.log(e);
                navigate("/admin/manage-admins");
            }
        }

        fetchUser();
    }, [editId, navigate]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const toggleRole = (role) => {
        if (!isAdmin) return;

        setForm((prev) => {
            const exists = prev.role.includes(role);
            return {
                ...prev,
                role: exists ? prev.role.filter((r) => r !== role) : [...prev.role, role],
            };
        });
    };

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        setForm({ ...form, img: f });
        setPreview(URL.createObjectURL(f));
    };

    const updateUser = async () => {
        try {
            const data = new FormData();
            data.append("id", editId);
            data.append("name", form.name);
            data.append("email", form.email);
            data.append("number", form.number);
            data.append("alt_number", form.alt_number);
            data.append("status", form.status);

            if (isAdmin) data.append("roles", JSON.stringify(form.role));
            if (form.img) data.append("img", form.img);

            if (form.old_password) data.append("old_password", form.old_password);
            if (form.password) data.append("password", form.password);

            await api.put(`/editUser`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert("User updated!");
            localStorage.removeItem("editUserId");
            navigate("/admin/manage-user");

        } catch (e) {
            console.log(e);

            if (e.response?.data?.error) {
                alert(e.response.data.error);
            } else {
                alert("Failed to update");
            }
        }
    };


    return (
        <>
            <Sidebar />
            <Navbar />

            <main className="admin-panel-header-div">
                <div className="admin-dashboard-main-header">
                    <div>
                        <h5>Edit User</h5>
                        <div className="admin-panel-breadcrumb">
                            <Link to="/admin/dashboard" className="breadcrumb-link active">
                                Dashboard
                            </Link>
                            <IoMdArrowDropright />
                            <Link to="/admin/manage-admins" className="breadcrumb-link active">
                                User List
                            </Link>
                            <IoMdArrowDropright />
                            <span>Edit User</span>
                        </div>
                    </div>

                    <div className="admin-panel-header-add-buttons">
                        <NavLink to="/admin/manage-user" className="cancel-btn dashboard-add-product-btn">
                            <HiXMark /> Cancel
                        </NavLink>
                        <button onClick={updateUser} className="primary-btn dashboard-add-product-btn">
                            <MdSave /> Update User
                        </button>
                    </div>
                </div>

                <div className="dashboard-add-content-card-div">

                    {/* LEFT SIDE */}
                    <div className="dashboard-add-content-left-side">

                        {/* GENERAL INFO */}
                        <div className="dashboard-add-content-card">
                            <h6>General Information</h6>
                            <div className="add-product-form-container">
                                <label>Name</label>
                                <input name="name" value={form.name} onChange={handleChange} />

                                <label>Email</label>
                                <input name="email" value={form.email} onChange={handleChange} />

                                <label>Phone</label>
                                <input name="number" value={form.number} onChange={handleChange} />

                                <label>Alt Number</label>
                                <input name="alt_number" value={form.alt_number} onChange={handleChange} />

                                {isAdmin && (
                                    <>
                                        <label>Status</label>
                                        <select name="status" value={form.status} onChange={handleChange}>
                                            <option value="active">Active</option>
                                            <option value="block">Blocked</option>
                                        </select>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* ROLES (Admin Only) */}
                        {isAdmin && (
                            <div className="dashboard-add-content-card">
                                <h6>Roles</h6>
                                <div className="add-product-form-container">
                                    <label>
                                        <input type="checkbox"
                                            checked={form.role.includes("buyer")}
                                            onChange={() => toggleRole("buyer")}
                                        /> Buyer
                                    </label>

                                    <label>
                                        <input type="checkbox"
                                            checked={form.role.includes("seller")}
                                            onChange={() => toggleRole("seller")}
                                        /> Seller
                                    </label>

                                    <label>
                                        <input type="checkbox"
                                            checked={form.role.includes("broker")}
                                            onChange={() => toggleRole("broker")}
                                        /> Broker
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* PASSWORD UPDATE */}
                        <div className="dashboard-add-content-card">
                            <h6>Change Password (Optional)</h6>
                            <div className="add-product-form-container">

                                {!isAdmin && (
                                    <>
                                        <label>Old Password</label>
                                        <input
                                            type="password"
                                            name="old_password"
                                            value={form.old_password}
                                            onChange={handleChange}
                                        />
                                    </>
                                )}

                                <label>New Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                />

                            </div>
                        </div>

                    </div>

                    {/* RIGHT SIDE */}
                    <div className="dashboard-add-content-right-side">
                        <div className="dashboard-add-content-card">
                            <h6>Profile Photo</h6>

                            <div style={{ border: "1px solid #eee", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                                <div
                                    style={{
                                        height: 200,
                                        borderRadius: 12,
                                        overflow: "hidden",
                                        marginBottom: 12,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        background: "#f4f4f4",
                                    }}
                                >
                                    {preview ? (
                                        <img src={preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <img src="https://cdn-icons-png.flaticon.com/512/1829/1829586.png" width={60} />
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => document.getElementById("editFileInput").click()}
                                    className="add-product-upload-btn secondary-btn"
                                >
                                    Select Image
                                </button>

                                <input
                                    type="file"
                                    id="editFileInput"
                                    name="img"
                                    style={{ display: "none" }}
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </>
    );
};

export default EditUser;
