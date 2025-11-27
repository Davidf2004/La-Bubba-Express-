// src/components/BubbaExpressApp.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import LoginScreen from "./LoginScreen";
import MenuScreen from "./MenuScreen";
import CartScreen from "./CartScreen";
import ProfileScreen from "./ProfileScreen";
import OrderScreen from "./OrderScreen";
import { CheckCircle2 } from "lucide-react";

const BubbaExpressApp = () => {
  const { user, loading } = useAuth();

  // Estado global
  const [currentView, setCurrentView] = useState(user ? "menu" : "login");
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [notification, setNotification] = useState(null);

  // Notificación flotante
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
      {/* Notificación animada */}
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
            <CheckCircle2 size={20} className="text-white" />
            <span className="font-medium">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transiciones entre pantallas */}
      <AnimatePresence mode="wait">
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
              isLoggedIn={!!user}
              favorites={favorites}
              setFavorites={setFavorites}
            />
          </motion.div>
        )}

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
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BubbaExpressApp;