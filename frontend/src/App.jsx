import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePublic from "./pages/HomePublic";
import "./index.css";
import AdminCrud from "./pages/AdminCrud.jsx";
import DetalleDestino from "./pages/DetalleDestino";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/login.jsx";
import Register from "./pages/Register.jsx";

function App() {
  return (
    <BrowserRouter basename="/turismo_web">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePublic />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/destino/:id" element={<DetalleDestino />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminCrud />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
