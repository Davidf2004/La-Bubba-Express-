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
} from "lucide-react";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";

const ProfileScreen = ({ setCurrentView, showNotificationMessage }) => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [rewards, setRewards] = useState(0);

  // Obtener historial de pedidos
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, "orders"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const orderList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(orderList);
      } catch (error) {
        console.error("Error al obtener pedidos:", error);
      }
    };
    fetchOrders();
  }, [user]);

  useEffect(() => {
    if (orders.length > 0) {
      const totalRewards = orders.reduce(
        (sum, order) => sum + Math.floor(order.total / 10),
        0
      );
      setRewards(totalRewards);
    }
  }, [orders]);

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const avgOrderValue = orders.length > 0 ? Math.round(totalSpent / orders.length) : 0;

  const handleLogout = async () => {
    await logout();
    showNotificationMessage("Sesión cerrada exitosamente");
    setCurrentView("intro");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Encabezado */}
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

          {/* Perfil */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-5xl">
              👤
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">{user?.displayName || "Usuario"}</h1>
              <div className="flex items-center gap-2 text-emerald-100 mb-1">
                <Mail size={16} />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-100">
                <Phone size={16} />
                <span>{user?.phoneNumber || "Sin teléfono"}</span>
              </div>
              <p className="text-sm text-emerald-100 mt-2">
                Miembro desde {user?.metadata?.creationTime
                  ? new Date(user.metadata.creationTime).toLocaleDateString("es-MX")
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl p-6 border-2 border-amber-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center">
                <Gift className="text-white" size={32} />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{rewards}</div>
                <div className="text-sm text-gray-600">Puntos</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl p-6 border-2 border-emerald-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center">
                <Package className="text-white" size={32} />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{orders.length}</div>
                <div className="text-sm text-gray-600">Órdenes</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-3xl p-6 border-2 border-teal-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center">
                <Heart className="text-white" size={32} />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">—</div>
                <div className="text-sm text-gray-600">Favoritos</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-6 border-2 border-purple-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center">
                <CreditCard className="text-white" size={32} />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">${totalSpent}</div>
                <div className="text-sm text-gray-600">Gastado</div>
              </div>
            </div>
          </div>
        </div>

        {/* Historial */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Historial de Pedidos</h2>
            {orders.length > 0 && (
              <div className="text-sm text-gray-600">
                Promedio por orden:{" "}
                <span className="font-bold text-emerald-700">${avgOrderValue}</span>
              </div>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No tienes órdenes aún</h3>
              <p className="text-gray-600 mb-6">
                Realiza tu primera orden y aparecerá aquí
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
                  className="border border-gray-200 rounded-2xl p-6 hover:border-emerald-300 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-gray-900">
                          Pedido #{order.id.slice(-5).toUpperCase()}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === "listo"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        <Clock size={14} className="inline mr-1" />
                        {order.createdAt?.toDate
                          ? order.createdAt.toDate().toLocaleString("es-MX")
                          : "Fecha no disponible"}
                      </div>
                      <div className="text-sm text-gray-600">
                        <User size={14} className="inline mr-1" />
                        ID Cliente: {order.userId}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${order.total}
                      </div>
                      <div className="text-xs text-gray-500">IVA incluido</div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => setCurrentView("menu")}
                      className="flex-1 bg-emerald-700 text-white py-2.5 rounded-xl font-semibold hover:bg-emerald-800 transition"
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