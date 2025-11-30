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
  Info,
} from "lucide-react";
import { db } from "../firebaseConfig";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

const FOOD_CATEGORIES = ["Comida", "Tortas", "Baguettes", "Snacks"];

const OrderScreen = ({ setCurrentView, order, showNotificationMessage }) => {
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

  // ======================
  // PROGRESO DEL PEDIDO
  // ======================
  const getStatusStep = (status) => {
    switch (status) {
      case "preparando":
        return 2;
      case "listo":
        return 3;
      case "entregado":
        return 4;
      default:
        return 1; // "confirmado"/"recibido"
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

  // ======================
  // CANCELACIÓN
  // ======================
  const canCancel = orderData?.status === "confirmado";

  const handleCancelOrder = async () => {
    if (!orderData?.id) return;

    const confirm = window.confirm("¿Seguro que deseas cancelar este pedido?");
    if (!confirm) return;

    try {
      setIsCancelling(true);
      await updateDoc(doc(db, "orders", orderData.id), {
        status: "cancelado",
      });
      showNotificationMessage("Pedido cancelado correctamente.");
    } catch (e) {
      console.error(e);
      showNotificationMessage("Error al cancelar el pedido.");
    } finally {
      setIsCancelling(false);
    }
  };

  // ======================
  // SIN PEDIDO
  // ======================
  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="px-6 py-5 flex items-center gap-4 max-w-6xl mx-auto">
            <button
              onClick={() => setCurrentView("menu")}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight
                size={24}
                className="rotate-180 text-gray-700"
              />
            </button>

            <h1 className="text-2xl font-bold">Seguimiento de Pedido</h1>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="bg-white shadow-lg rounded-3xl p-16 text-center">
            <div className="text-8xl mb-6">🧋</div>
            <h2 className="text-3xl font-bold">No hay pedido activo</h2>
            <p className="text-gray-600 mb-8">
              Realiza un pedido para verlo aquí.
            </p>

            <button
              onClick={() => setCurrentView("menu")}
              className="bg-emerald-700 text-white px-10 py-4 rounded-full font-bold hover:bg-emerald-800"
            >
              Ver Menú
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ======================
  // CALCULAR PUNTOS
  // ======================
  const points = Math.floor((orderData.total || 0) / 10);

  // ======================
  // RENDER PRINCIPAL
  // ======================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="px-6 py-5 flex items-center gap-4 max-w-6xl mx-auto">
          <button
            onClick={() => setCurrentView("menu")}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight
              size={24}
              className="rotate-180 text-gray-700"
            />
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            Seguimiento de Pedido
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* ====================== */}
        {/* RESUMEN DE LA ORDEN */}
        {/* ====================== */}
        <div className="bg-white rounded-3xl shadow p-8 flex flex-col md:flex-row md:justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Orden #{orderData.id.slice(-6).toUpperCase()}
            </h2>

            <p className="text-gray-600 mb-1">
              Total:{" "}
              <span className="font-bold text-emerald-700">
                ${orderData.total}
              </span>
            </p>

            <p className="text-sm text-gray-500">
              Estado:{" "}
              <span className="font-semibold capitalize">
                {orderData.status}
              </span>
            </p>

            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              <MapPin size={18} />
              {orderData.pickupLocation}
            </div>

            {orderData.status === "cancelado" && (
              <div className="mt-4 px-4 py-2 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl">
                <AlertTriangle size={18} />
                Pedido cancelado.
              </div>
            )}
          </div>

          <div className="bg-amber-50 px-6 py-4 rounded-2xl border border-amber-200 text-center min-w-[240px]">
            <p className="text-sm font-semibold text-amber-800">Puntos ganados</p>

            <div className="text-4xl font-bold text-amber-600 flex justify-center gap-2">
              <Gift size={26} /> {points}
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Se sumarán a tu perfil al finalizar el pedido.
            </p>
          </div>
        </div>

        {/* ====================== */}
        {/* PROGRESO */}
        {/* ====================== */}
        <div className="bg-white rounded-3xl shadow p-8 space-y-6">
          <h3 className="text-xl font-bold text-gray-900">Progreso del Pedido</h3>

          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index + 1 <= currentStep;
              const doneConnector = index + 1 < currentStep;
              const isLast = index === steps.length - 1;

              return (
                <div key={step.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-14 h-14 flex items-center justify-center rounded-full border-4 shadow transition-all ${
                        isActive
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "bg-gray-100 border-gray-300 text-gray-400"
                      }`}
                    >
                      <Icon size={24} />
                    </div>

                    <span
                      className={`text-xs font-semibold mt-1 ${
                        isActive ? "text-emerald-700" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>

                  {!isLast && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                        doneConnector ? "bg-emerald-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {canCancel && (
            <div className="mt-6 border-t pt-4 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <AlertTriangle size={16} className="text-amber-600" />
                Puedes cancelar mientras esté en estado “Recibido”.
              </div>

              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="bg-red-100 text-red-700 px-6 py-2.5 rounded-full font-semibold hover:bg-red-200 disabled:opacity-50 flex items-center gap-2"
              >
                <XCircle size={18} />
                {isCancelling ? "Cancelando..." : "Cancelar pedido"}
              </button>
            </div>
          )}
        </div>

        {/* ====================== */}
        {/* DETALLES DEL PEDIDO */}
        {/* ====================== */}
        <div className="bg-white rounded-3xl shadow p-8 space-y-8 border">
          <h3 className="text-2xl font-bold text-gray-900">
            Detalles del Pedido
          </h3>

          {/* PRODUCTOS */}
          {orderData.items.map((item, idx) => {
            const isFood = FOOD_CATEGORIES.includes(item.category || "");
            const unitPrice = item.unitPrice ?? item.price;

            return (
              <div
                key={`${item.id}-${idx}`}
                className="flex items-start justify-between border-b pb-5"
              >
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-emerald-50 rounded-xl flex items-center justify-center text-4xl">
                    {item.image || "🧋"}
                  </div>

                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {item.name}
                    </div>

                    <p className="text-gray-600 text-sm mb-1">
                      {item.quantity} × ${unitPrice}
                    </p>

                    {/* BEBIDAS */}
                    {!isFood && (
                      <div className="text-sm text-gray-700 space-y-1">
                        {item.milk && (
                          <div>
                            🥛 Leche:{" "}
                            <span className="font-semibold">
                              {item.milk.label}
                            </span>
                          </div>
                        )}

                        {item.toppings?.length > 0 && (
                          <div>
                            🍫 Toppings:{" "}
                            <span className="font-semibold">
                              {item.toppings.map((t) => t.label).join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 👇 Comentarios siempre visibles */}
                    {item.comment && (
                      <p className="mt-2 text-sm bg-gray-100 px-3 py-1.5 rounded-xl text-gray-700">
                        <Info
                          size={14}
                          className="inline-block mr-1 text-gray-500"
                        />
                        {item.comment}
                      </p>
                    )}
                  </div>
                </div>

                <div className="font-bold text-xl text-gray-900">
                  ${(unitPrice * item.quantity).toFixed(2)}
                </div>
              </div>
            );
          })}

          {/* RESUMEN DE COSTOS */}
          <div className="border-t pt-6 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${orderData.subtotal}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>IVA (16%)</span>
              <span>${orderData.tax}</span>
            </div>

            <div className="flex justify-between text-xl font-bold pt-4">
              <span>Total</span>
              <span className="text-emerald-700">
                ${orderData.total}
              </span>
            </div>

            <p className="text-center mt-4 text-sm text-gray-600">
              <Clock
                size={16}
                className="inline text-emerald-600 mr-1"
              />
              Tiempo estimado: 15–20 minutos
            </p>

            <button
              onClick={() => setCurrentView("menu")}
              className="w-full bg-emerald-700 text-white py-4 mt-6 rounded-full font-bold hover:bg-emerald-800"
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