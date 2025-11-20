// DashboardRoute.jsx
import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "../../pages/admin/login/Login";
import AdminLayout from "../../pages/admin/layout/AdminLayout";
import Dashboard from "../../pages/admin/dashboard/Dashboard";
import Category from "../../pages/admin/category/Category";
import Order from "../../pages/admin/orders/Order";
import Coupon from "../../pages/admin/coupon/coupon";
import ManageUser from "../../pages/admin/manage_user/ManageUser";
import AddCategory from "../../pages/admin/category/AddCategory";
import CreateCoupon from "../../pages/admin/coupon/CreateCoupon";
import AddNewUser from "../../pages/admin/manage_user/AddNewUser";
import ProtectedRoute from "../../components/PrivateRoute";
import useAuthRefresh from '../../hooks/useAuthRefresh';
import AddProperty from "../../pages/admin/properties/AddProperty";
import UpdateProperty from "../../pages/admin/properties/UpdateProperty";
import GetProperties from "../../pages/admin/properties/property";
import GetEntries from "../../pages/admin/inventory/GetEntries";
import AddEntry from "../../pages/admin/inventory/AddEntry";
import UpdateEntry from "../../pages/admin/inventory/UpdateEntry";
import GetConfirmations from "../../pages/admin/inventory/invetoryconfirmation/GetConfirmations";
import AddConfirmation from "../../pages/admin/inventory/invetoryconfirmation/AddConfirmation";
import UpdateConfirmation from "../../pages/admin/inventory/invetoryconfirmation/UpdateConfirmation";
import EditUser from "../../pages/admin/manage_user/EditUser";

const AppRoutes = () => {

  const Navigate = useNavigate()

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
        <Route path="properties" element={<GetProperties />} />
        <Route path="category" element={<Category />} />
        <Route path="orders" element={<Order />} />
        <Route path="coupon" element={<Coupon />} />
        <Route path="manage-user" element={<ManageUser />} />
        <Route path="add-new-user" element={<AddNewUser />} />
        <Route path="edituser" element={<EditUser />} />
        <Route path="add-category" element={<AddCategory />} />
        <Route path="create-coupon" element={<CreateCoupon />} />
        <Route path="addproperty" element={<AddProperty />} />
        <Route path="updateproperty" element={<UpdateProperty />} />
        
        <Route path="getentries" element={<GetEntries />} />
        <Route path="addentry" element={< AddEntry />} />
        <Route path="updateentry" element={<UpdateEntry />} />

        <Route path="/admin/getconfirmations" element={<GetConfirmations />} />
        <Route path="/admin/addconfirmation" element={<AddConfirmation />} />
        <Route path="/admin/updateconfirmation" element={<UpdateConfirmation />} />

      </Route>
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
