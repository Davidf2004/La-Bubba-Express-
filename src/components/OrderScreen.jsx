// src/components/OrderScreen.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  CheckCircle,
  Clock,
  Truck,
  PackageCheck,
  ChevronRight,
  Gift,
  MapPin,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { db } from "../firebaseConfig";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

const OrderScreen = ({ setCurrentView, order, showNotificationMessage }) => {
  const [orderData, setOrderData] = useState(order || null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!order?.id) return;
    const ref = doc(db, "orders", order.id);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setOrderData({ id: snap.id, ...snap.data() });
        }
      },
      (err) => {
        console.error("Error en onSnapshot de OrderScreen:", err);
      }
    );
    return () => unsub();
  }, [order]);

  // ⬇⬇⬇ NUEVO: soporte a ENTREGADO (4 pasos)
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

  // ⬇⬇⬇ NUEVO: se agrega ENTREGADO al final
  const steps = [
    { key: "recibido", label: "Recibido", icon: CheckCircle },
    { key: "preparando", label: "Preparando", icon: Clock },
    { key: "listo", label: "Listo para recoger", icon: Truck },
    { key: "entregado", label: "Entregado", icon: PackageCheck },
  ];

  const canCancel =
    orderData &&
    orderData.status &&
    orderData.status !== "cancelado" &&
    orderData.status !== "listo" &&
    orderData.status !== "entregado" &&
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
      showNotificationMessage("Pedido cancelado correctamente.");
    } catch (error) {
      console.error("Error al cancelar pedido:", error);
      showNotificationMessage("Error al cancelar el pedido.");
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
              onClick={() => setCurrentView("menu")}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ChevronRight
                size={24}
                className="transform rotate-180 text-gray-700"
              />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Seguimiento de Pedido
              </h1>
              <p className="text-sm text-gray-600">
                No hay pedido activo actualmente
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="bg-white rounded-3xl shadow-lg p-16 text-center">
            <div className="text-8xl mb-6">🧋</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              No hay pedido activo
            </h2>
            <p className="text-gray-600 mb-8">
              Realiza un pedido en el menú para verlo aquí.
            </p>
            <button
              onClick={() => setCurrentView("menu")}
              className="bg-emerald-700 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-emerald-800 transition shadow-lg"
            >
              Ver Menú
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
            onClick={() => setCurrentView("menu")}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ChevronRight
              size={24}
              className="transform rotate-180 text-gray-700"
            />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Seguimiento de Pedido
            </h1>
            <p className="text-sm text-gray-600">
              Monitorea el estado de tu orden en tiempo real
            </p>
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* RESUMEN PRINCIPAL */}
        <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Orden #{orderData.id.slice(-6).toUpperCase()}
            </h2>
            <p className="text-gray-600 mb-1">
              Total:{" "}
              <span className="font-semibold text-emerald-700">
                ${orderData.total}
              </span>
            </p>
            <p className="text-sm text-gray-500">
              Estado actual:{" "}
              <span className="font-semibold capitalize">
                {orderData.status || "confirmado"}
              </span>
            </p>

            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-sm text-emerald-800">
              <MapPin size={16} />
              <span>{orderData.pickupLocation}</span>
            </div>

            {orderData.status === "cancelado" && (
              <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-2xl px-4 py-2 text-sm">
                <AlertTriangle size={16} />
                <span>Este pedido fue cancelado.</span>
              </div>
            )}
          </div>

          <div className="bg-emerald-50 rounded-2xl px-5 py-4 border border-emerald-200 text-center min-w-[220px]">
            <p className="text-sm font-semibold text-emerald-800 mb-1">
              Puntos ganados
            </p>
            <div className="text-3xl font-bold text-amber-600 flex items-center justify-center gap-2">
              <Gift size={22} />
              {points}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Se acumulan en tu perfil al completar el pedido.
            </p>
          </div>
        </div>

        {/* PROGRESO + CANCELAR */}
        <div className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Progreso del Pedido
          </h3>

          {/* Barra con estado ENTREGADO */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index + 1 <= currentStep;
              const isLast = index === steps.length - 1;
              const isCompletedConnector = index + 1 < currentStep;

              return (
                <div key={step.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-14 h-14 flex items-center justify-center rounded-full border-4 mb-2 transition-all duration-300 ${
                        isActive
                          ? "border-emerald-600 bg-emerald-600 text-white shadow-md"
                          : "border-gray-300 bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Icon size={24} />
                    </div>
                    <p
                      className={`text-xs font-semibold uppercase tracking-wide ${
                        isActive ? "text-emerald-700" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>

                  {!isLast && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${
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

          <p className="text-sm text-gray-600 mt-2">
            Te avisaremos cuando tu pedido esté listo para recoger en la
            cafetería.
          </p>

          {canCancel && (
            <div className="mt-6 border-t pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <AlertTriangle size={16} className="text-amber-500" />
                <span>
                  Puedes cancelar tu pedido mientras aún no está en preparación.
                </span>
              </div>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-60"
              >
                <XCircle size={18} />
                {isCancelling ? "Cancelando..." : "Cancelar pedido"}
              </button>
            </div>
          )}
        </div>

        {/* DETALLES DEL PEDIDO */}
        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-200 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">
              Detalles del Pedido
            </h3>
            {orderData.createdAt?.toDate && (
              <p className="text-xs text-gray-500">
                Realizado el{" "}
                {orderData.createdAt
                  .toDate()
                  .toLocaleString("es-MX", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
              </p>
            )}
          </div>

          <div className="space-y-6">
            {orderData.items?.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="flex items-center justify-between border-b pb-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-4xl">
                    {item.image || "🧋"}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-500">
                      {item.quantity} × ${item.price}
                    </p>
                  </div>
                </div>
                <div className="font-semibold text-gray-900">
                  ${item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-6 border-t-2 border-dashed border-gray-200 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${orderData.subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>IVA (16%)</span>
              <span>${orderData.tax}</span>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="font-bold text-xl text-gray-900">Total</span>
              <span className="text-3xl font-bold text-emerald-700">
                ${orderData.total}
              </span>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            <Clock size={18} className="inline-block mr-2 text-emerald-600" />
            Tiempo estimado: 15–20 minutos
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setCurrentView("menu")}
              className="bg-emerald-700 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-emerald-800 transition shadow-xl"
            >
              Realizar otro pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderScreen;