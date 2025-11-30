// src/components/ProfileScreen.jsx
import React, { useEffect, useState } from "react";
import {
  ChevronRight,
  LogOut,
  Mail,
  Phone,
  Gift,
  Package,
  Heart,
  CreditCard,
  Clock,
  User,
  Pencil,
} from "lucide-react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";

const ProfileScreen = ({
  setCurrentView,
  showNotificationMessage,
  setSelectedOrder,
}) => {
  const { user, profile, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [rewards, setRewards] = useState(0);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;

      const q = query(collection(db, "orders"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      list.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

      setOrders(list);
    };

    loadOrders();
  }, [user]);

  useEffect(() => {
    if (orders.length > 0) {
      const total = orders.reduce((sum, o) => sum + Math.floor(o.total / 10), 0);
      setRewards(total);
    }
  }, [orders]);

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue =
    orders.length > 0 ? Math.round(totalSpent / orders.length) : 0;

  const handleLogout = async () => {
    await logout();
    showNotificationMessage("Sesión cerrada exitosamente");
    setCurrentView("intro");
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setCurrentView("orderDetails");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentView("menu")}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition"
            >
              <ChevronRight size={24} className="transform rotate-180" />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition"
            >
              <LogOut size={18} />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>

          {/* USER HEADER */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-lg">
              {profile?.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl text-emerald-700 font-bold">
                  {profile?.name?.charAt(0).toUpperCase() || "👤"}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold mb-1">
                {profile?.name || "Usuario"}
              </h1>

              <div className="flex items-center gap-2 text-emerald-100 mb-1">
                <Mail size={16} />
                <span>{profile?.email || "—"}</span>
              </div>

              <div className="flex items-center gap-2 text-emerald-100">
                <Phone size={16} />
                <span>{profile?.phone || "Sin teléfono"}</span>
              </div>

              <p className="text-sm text-emerald-100 mt-2">
                Miembro desde{" "}
                {profile?.createdAt?.toDate
                  ? profile.createdAt.toDate().toLocaleDateString("es-MX")
                  : "—"}
              </p>

              <button
                onClick={() => setCurrentView("editProfile")}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-white text-emerald-700 font-semibold rounded-full shadow hover:bg-gray-100 transition"
              >
                <Pencil size={18} />
                Editar Perfil
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-amber-100 rounded-3xl p-6 border-2 border-amber-200">
            <div className="flex items-center gap-4">
              <Gift size={32} className="text-amber-600" />
              <div>
                <div className="text-3xl font-bold">{rewards}</div>
                <div className="text-sm text-gray-600">Puntos</div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-100 rounded-3xl p-6 border-2 border-emerald-200">
            <div className="flex items-center gap-4">
              <Package size={32} className="text-emerald-600" />
              <div>
                <div className="text-3xl font-bold">{orders.length}</div>
                <div className="text-sm text-gray-600">Órdenes</div>
              </div>
            </div>
          </div>

          <div className="bg-teal-100 rounded-3xl p-6 border-2 border-teal-200">
            <div className="flex items-center gap-4">
              <Heart size={32} className="text-teal-600" />
              <div>
                <div className="text-3xl font-bold">—</div>
                <div className="text-sm text-gray-600">Favoritos</div>
              </div>
            </div>
          </div>

          <div className="bg-purple-100 rounded-3xl p-6 border-2 border-purple-200">
            <div className="flex items-center gap-4">
              <CreditCard size={32} className="text-purple-600" />
              <div>
                <div className="text-3xl font-bold">${totalSpent}</div>
                <div className="text-sm text-gray-600">Gastado</div>
              </div>
            </div>
          </div>
        </div>

        {/* ORDERS */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Historial de Pedidos</h2>

            {orders.length > 0 && (
              <div className="text-sm">
                Promedio:{" "}
                <span className="font-bold text-emerald-700">${avgOrderValue}</span>
              </div>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold mb-2">
                No tienes órdenes aún
              </h3>
              <p className="text-gray-600 mb-6">
                Realiza tu primer pedido para verlo aquí
              </p>
              <button
                onClick={() => setCurrentView("menu")}
                className="bg-emerald-700 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-800"
              >
                Explorar Menú
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => openOrderDetails(order)}
                  className="border border-gray-200 rounded-2xl p-6 hover:border-emerald-300 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">
                        Pedido #{order.id.slice(-5).toUpperCase()}
                      </h3>
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-semibold ${
                          order.status === "listo"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {order.status}
                      </span>

                      <p className="text-sm text-gray-600 mt-2">
                        <Clock size={14} className="inline mr-1" />
                        {order.createdAt?.toDate
                          ? order.createdAt.toDate().toLocaleString("es-MX")
                          : "Fecha no disponible"}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold">${order.total}</div>
                      <p className="text-xs text-gray-500">IVA incl.</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentView("menu");
                      }}
                      className="w-full bg-emerald-700 text-white py-3 rounded-xl font-semibold hover:bg-emerald-800"
                    >
                      Pedir de Nuevo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;