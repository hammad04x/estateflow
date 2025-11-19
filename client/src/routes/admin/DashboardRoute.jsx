// DashboardRoute.jsx
import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "../../pages/admin/login/Login";
import AdminLayout from "../../pages/admin/layout/AdminLayout";
import Dashboard from "../../pages/admin/dashboard/Dashboard";
import Product from "../../pages/admin/product/Product";
import Category from "../../pages/admin/category/Category";
import Order from "../../pages/admin/orders/Order";
import Coupon from "../../pages/admin/coupon/coupon";
import ManageUser from "../../pages/admin/manage_user/ManageUser";
import AddProduct from "../../pages/admin/product/AddProduct";
import AddCategory from "../../pages/admin/category/AddCategory";
import CreateCoupon from "../../pages/admin/coupon/CreateCoupon";
import AddNewUser from "../../pages/admin/manage_user/AddNewUser";
import ProtectedRoute from "../../components/PrivateRoute";
import useAuthRefresh from '../../hooks/useAuthRefresh';

const AppRoutes = () => {

    const Navigate=useNavigate()

  useAuthRefresh();
  
  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="product" element={<Product />} />
        <Route path="category" element={<Category />} />
        <Route path="orders" element={<Order />} />
        <Route path="coupon" element={<Coupon />} />
        <Route path="manage-admins" element={<ManageUser />} />
        <Route path="add-product" element={<AddProduct />} />
        <Route path="add-category" element={<AddCategory />} />
        <Route path="create-coupon" element={<CreateCoupon />} />
        <Route path="add-new_admin" element={<AddNewUser />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
