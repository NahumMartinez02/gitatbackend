import React from 'react';
import { Routes, Route } from 'react-router-dom'; // 1. Importa Routes y Route
import Login from './pages/Login';
import Register from './pages/register';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import ViewUsers from './pages/ViewUsers';
import UsersCrud from './pages/UsersCrud';
import Perfil from './pages/Perfil';
import InventoryManagement from './pages/InventoryManagement';
import ResetPassword from './pages/ResetPassword';
import CreateReservation from './pages/CreateReservation';  
import ReservationManagement from './pages/ReservationManagement';
import AdminDashboard from './pages/AdminDashboard';


function App() {
  return (
    <div className="App">
      <Routes>


        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/view-users" element={<ViewUsers />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/inventory-management" element={<InventoryManagement />} />
        <Route path='/test' element={<UsersCrud/>}/>
        <Route path="/create-reservation" element={<CreateReservation />} />
        <Route path="/reservas" element={<ReservationManagement />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

      </Routes>
    </div>
  );
}

export default App;