import React from "react";
import { ChevronRight, Clock, User, MapPin } from "lucide-react";

const OrderDetailsScreen = ({ order, setCurrentView }) => {
  if (!order) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center gap-4">
          <button
            onClick={() => setCurrentView("profile")}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight
              size={24}
              className="transform rotate-180 text-gray-700"
            />
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            Detalles del Pedido
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Cabecera */}
        <div className="bg-white rounded-3xl shadow p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pedido #{order.id.slice(-5).toUpperCase()}
          </h2>

          <div className="text-gray-600 space-y-2">
            <p>
              <Clock className="inline mr-2" size={18} />
              {order.createdAt?.toDate
                ? order.createdAt.toDate().toLocaleString("es-MX")
                : "Fecha no disponible"}
            </p>

            <p>
              <User className="inline mr-2" size={18} />
              {order.userEmail}
            </p>

            <p>
              <MapPin className="inline mr-2" size={18} />
              {order.pickupLocation}
            </p>
          </div>

          <div className="mt-4">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                order.status === "listo"
                  ? "bg-green-100 text-green-700"
                  : order.status === "preparando"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {order.status}
            </span>
          </div>
        </div>

        {/* Lista de productos */}
        <div className="bg-white rounded-3xl shadow p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Productos del Pedido
          </h3>

          <div className="space-y-6">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-b pb-4"
              >
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {item.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    Cantidad: {item.quantity}
                  </div>
                </div>

                <div className="text-xl font-bold text-gray-900">
                  ${item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totales */}
        <div className="bg-white rounded-3xl shadow p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Resumen</h3>

          <div className="text-gray-700 space-y-3">
            <p className="flex justify-between">
              <span>Subtotal</span>
              <span>${order.subtotal}</span>
            </p>
            <p className="flex justify-between">
              <span>IVA (16%)</span>
              <span>${order.tax}</span>
            </p>

            <p className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t">
              <span>Total</span>
              <span>${order.total}</span>
            </p>
          </div>
        </div>

        {/* Botón pedir de nuevo */}
        <button
          onClick={() => setCurrentView("menu")}
          className="w-full bg-emerald-700 text-white py-5 rounded-full text-lg font-bold hover:bg-emerald-800 shadow-lg"
        >
          Pedir de Nuevo
        </button>
      </div>
    </div>
  );
};

export default OrderDetailsScreen;