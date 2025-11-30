// src/components/OrderDetailsScreen.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  ChevronRight,
  Clock,
  User,
  MapPin,
  CheckCircle,
  Truck,
  Gift,
  AlertTriangle,
  XCircle,
  PackageCheck,
  Info,
} from "lucide-react";
import { db } from "../firebaseConfig";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

const OrderDetailsScreen = ({
  order,
  setCurrentView,
  showNotificationMessage,
}) => {
  const [orderData, setOrderData] = useState(order || null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!order?.id) return;
    const ref = doc(db, "orders", order.id);

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setOrderData({ id: snap.id, ...snap.data() });
      }
    });

    return () => unsub();
  }, [order]);

  const getStatusStep = (status) => {
    switch (status) {
      case "preparando":
        return 2;
      case "listo":
        return 3;
      case "entregado":
        return 4;
      default:
        return 1;
    }
  };

  const currentStep = useMemo(
    () => getStatusStep(orderData?.status),
    [orderData?.status]
  );

  const steps = [
    { key: "recibido", label: "Recibido", icon: CheckCircle },
    { key: "preparando", label: "Preparando", icon: Clock },
    { key: "listo", label: "Listo para recoger", icon: Truck },
    { key: "entregado", label: "Entregado", icon: PackageCheck },
  ];

  // Solo cancelar cuando está recién recibido/confirmado
  const canCancel =
    orderData &&
    orderData.status &&
    orderData.status === "confirmado";

  const handleCancelOrder = async () => {
    if (!orderData?.id) return;
    const confirm = window.confirm(
      "¿Seguro que deseas cancelar este pedido? Esta acción no se puede deshacer."
    );
    if (!confirm) return;

    try {
      setIsCancelling(true);
      await updateDoc(doc(db, "orders", orderData.id), {
        status: "cancelado",
      });

      showNotificationMessage?.("Pedido cancelado correctamente.");
    } catch (error) {
      console.error("Error al cancelar pedido:", error);
      showNotificationMessage?.("Error al cancelar el pedido.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-5 flex items-center gap-4">
            <button
              onClick={() => setCurrentView("profile")}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight size={24} className="rotate-180 text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Detalles del Pedido
            </h1>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="bg-white rounded-3xl shadow-lg p-16 text-center">
            <div className="text-7xl mb-4">🧋</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No se encontró el pedido
            </h2>
            <p className="text-gray-600 mb-6">
              Regresa a tu perfil y selecciona un pedido válido.
            </p>
            <button
              onClick={() => setCurrentView("profile")}
              className="bg-emerald-700 text-white px-10 py-3 rounded-full font-bold hover:bg-emerald-800 transition shadow-md"
            >
              Volver al perfil
            </button>
          </div>
        </div>
      </div>
    );
  }

  const points = Math.floor((orderData.total || 0) / 10);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center gap-4">
          <button
            onClick={() => setCurrentView("profile")}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight size={24} className="rotate-180 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Detalles del Pedido
          </h1>
        </div>
      </div>

      {/* CUERPO */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* INFO PRINCIPAL */}
        <div className="bg-white rounded-3xl shadow p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Pedido #{orderData.id.slice(-5).toUpperCase()}
              </h2>

              <div className="text-gray-600 space-y-2 text-sm">
                <p>
                  <Clock size={16} className="inline mr-2" />
                  {orderData.createdAt?.toDate
                    ? orderData.createdAt
                        .toDate()
                        .toLocaleString("es-MX", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                    : "Fecha no disponible"}
                </p>

                <p>
                  <User size={16} className="inline mr-2" />
                  {orderData.userEmail}
                </p>

                <p>
                  <MapPin size={16} className="inline mr-2" />
                  {orderData.pickupLocation}
                </p>
              </div>

              <div className="mt-4">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${
                    orderData.status === "entregado"
                      ? "bg-green-100 text-green-700"
                      : orderData.status === "listo"
                      ? "bg-emerald-100 text-emerald-700"
                      : orderData.status === "preparando"
                      ? "bg-blue-100 text-blue-700"
                      : orderData.status === "cancelado"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {orderData.status || "confirmado"}
                </span>
              </div>

              {orderData.status === "cancelado" && (
                <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-sm">
                  <AlertTriangle size={16} />
                  <span>Este pedido fue cancelado.</span>
                </div>
              )}
            </div>

            <div className="bg-emerald-50 rounded-2xl px-5 py-4 border border-emerald-200 text-center min-w-[220px]">
              <p className="text-sm font-semibold text-emerald-800 mb-1">
                Puntos generados
              </p>
              <div className="text-3xl font-bold text-amber-600 flex items-center justify-center gap-2">
                <Gift size={22} />
                {points}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Basado en el total del pedido.
              </p>
            </div>
          </div>

          {/* BARRA DE PROGRESO */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Progreso del pedido
            </h3>
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index + 1 <= currentStep;
                const isCompletedConnector = index + 1 < currentStep;
                const isLast = index === steps.length - 1;

                return (
                  <div key={step.key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 flex items-center justify-center rounded-full border-4 mb-1 transition-all ${
                          isActive
                            ? "border-emerald-600 bg-emerald-600 text-white shadow"
                            : "border-gray-300 bg-gray-100 text-gray-400"
                        }`}
                      >
                        <Icon size={20} />
                      </div>

                      <p
                        className={`text-[11px] font-semibold uppercase ${
                          isActive ? "text-emerald-700" : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>

                    {!isLast && (
                      <div
                        className={`flex-1 h-1 mx-2 rounded-full transition ${
                          isCompletedConnector
                            ? "bg-emerald-600"
                            : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* CANCELAR */}
          {canCancel && (
            <div className="mt-5 border-t pt-4 flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <AlertTriangle size={16} className="text-amber-500" />
                <span>
                  Puedes cancelar mientras esté en estado <b>Recibido</b>.
                </span>
              </div>

              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="flex items-center gap-2 bg-red-100 text-red-700 px-5 py-2.5 rounded-full font-semibold hover:bg-red-200 disabled:opacity-60"
              >
                <XCircle size={18} />
                {isCancelling ? "Cancelando..." : "Cancelar pedido"}
              </button>
            </div>
          )}
        </div>

        {/* PRODUCTOS */}
        <div className="bg-white rounded-3xl shadow p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Productos del Pedido
          </h3>

          <div className="space-y-6">
            {orderData.items?.map((item, idx) => {
              const isFood = ["Comida", "Tortas", "Baguettes"].includes(
                item.category || ""
              );

              const unitPrice = item.unitPrice ?? item.price;

              return (
                <div
                  key={`${item.id}-${idx}`}
                  className="flex justify-between items-start border-b pb-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-3xl">
                      {item.image || "🧋"}
                    </div>

                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.quantity} × ${unitPrice}
                      </div>

                      {/* BEBIDAS: leche y toppings */}
                      {!isFood && (
                        <div className="mt-2 text-sm text-gray-700 space-y-1">
                          {item.milk && (
                            <p>
                              🥛 Leche:{" "}
                              <strong>
                                {item.milk.label || item.milk.name}
                              </strong>
                            </p>
                          )}

                          {item.toppings?.length > 0 && (
                            <p>
                              🍫 Toppings:{" "}
                              <strong>
                                {item.toppings
                                  .map((t) => t.label || t.name)
                                  .join(", ")}
                              </strong>
                            </p>
                          )}
                        </div>
                      )}

                      {/* Comentario para comida o bebida */}
                      {item.comment && (
                        <p className="mt-3 text-sm text-gray-700 bg-gray-100 px-3 py-2 rounded-xl">
                          <Info
                            size={14}
                            className="inline-block mr-1 text-gray-500"
                          />
                          {item.comment}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-xl font-bold text-gray-900">
                    ${unitPrice * item.quantity}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RESUMEN */}
        <div className="bg-white rounded-3xl shadow p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Resumen</h3>

          <div className="text-gray-700 space-y-3">
            <p className="flex justify-between">
              <span>Subtotal</span>
              <span>${orderData.subtotal}</span>
            </p>
            <p className="flex justify-between">
              <span>IVA (16%)</span>
              <span>${orderData.tax}</span>
            </p>

            <p className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t">
              <span>Total</span>
              <span>${orderData.total}</span>
            </p>
          </div>
        </div>

        {/* BOTÓN PEDIR DE NUEVO */}
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