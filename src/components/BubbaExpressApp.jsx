// src/components/BubbaExpressApp.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";

import LoginScreen from "./LoginScreen";
import MenuScreen from "./MenuScreen";
import CartScreen from "./CartScreen";
import ProfileScreen from "./ProfileScreen";
import OrderScreen from "./OrderScreen";
import AdminPanel from "./AdminPanel";
import OrderDetailsScreen from "./OrderDetailsScreen";
import EditProfileScreen from "./EditProfileScreen"; // ← NUEVO

import { CheckCircle2 } from "lucide-react";

const BubbaExpressApp = () => {
  const { user, profile, loading } = useAuth();

  const [currentView, setCurrentView] = useState("login");
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [notification, setNotification] = useState(null);

  const isLoggedIn = !!user;
  const isAdmin =
    user &&
    (user.email === "bubba@cafeteria.mx" || profile?.role === "admin");

  // 🔥 Control de invitado
  useEffect(() => {
    if (loading) return;

    const isGuest = localStorage.getItem("guest") === "true";

    if (!isLoggedIn && !isGuest) {
      if (currentView !== "login") setCurrentView("login");
      return;
    }

    if (isLoggedIn && currentView === "login") {
      setCurrentView("menu");
      return;
    }

  }, [loading, isLoggedIn, currentView]);

  const showNotificationMessage = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 2500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-emerald-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-700 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="relative font-sans">
      
      {/* GLOBAL NOTIFICATION */}
      <AnimatePresence>
        {notification && (
          <motion.div
            key="notif"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-6 right-6 bg-emerald-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 z-50"
          >
            <CheckCircle2 size={20} />
            <span className="font-medium">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ROUTER INTERNO */}
      <AnimatePresence mode="wait">

        {/* LOGIN */}
        {currentView === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoginScreen
              setCurrentView={setCurrentView}
              showNotificationMessage={showNotificationMessage}
            />
          </motion.div>
        )}

        {/* MENÚ */}
        {currentView === "menu" && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MenuScreen
              cart={cart}
              setCart={setCart}
              setCurrentView={setCurrentView}
              showNotificationMessage={showNotificationMessage}
              favorites={favorites}
              setFavorites={setFavorites}
            />
          </motion.div>
        )}

        {/* CARRITO */}
        {currentView === "cart" && (
          <motion.div
            key="cart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CartScreen
              cart={cart}
              setCart={setCart}
              setCurrentView={setCurrentView}
              showNotificationMessage={showNotificationMessage}
              userData={user}
              setOrder={setOrder}
            />
          </motion.div>
        )}

        {/* ORDEN */}
        {currentView === "order" && (
          <motion.div
            key="order"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <OrderScreen
              setCurrentView={setCurrentView}
              order={order}
              showNotificationMessage={showNotificationMessage}
            />
          </motion.div>
        )}

        {/* PERFIL */}
        {currentView === "profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProfileScreen
              setCurrentView={setCurrentView}
              showNotificationMessage={showNotificationMessage}
              setSelectedOrder={setSelectedOrder}
            />
          </motion.div>
        )}

        {/* EDITAR PERFIL */}
        {currentView === "editProfile" && (
          <motion.div
            key="editProfile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EditProfileScreen
              setCurrentView={setCurrentView}
              showNotificationMessage={showNotificationMessage}
            />
          </motion.div>
        )}

        {/* DETALLES DE ORDEN */}
        {currentView === "orderDetails" && (
          <motion.div
            key="orderDetails"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <OrderDetailsScreen
              order={selectedOrder}
              setCurrentView={setCurrentView}
              showNotificationMessage={showNotificationMessage}
            />
          </motion.div>
        )}

        {/* ADMIN */}
        {currentView === "admin" && isAdmin && (
          <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AdminPanel
              setCurrentView={setCurrentView}
              showNotificationMessage={showNotificationMessage}
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default BubbaExpressApp;