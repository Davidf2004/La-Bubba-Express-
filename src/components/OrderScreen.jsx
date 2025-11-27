// src/components/OrderScreen.jsx
import React, { useEffect, useState } from "react";
import { CheckCircle, Clock, Truck, ChevronRight, Gift } from "lucide-react";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const OrderScreen = ({ setCurrentView, order, showNotificationMessage }) => {
  const [orderData, setOrderData] = useState(order);
  const [statusStep, setStatusStep] = useState(1);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!order?.id) return;
      try {
        const docRef = doc(db, "orders", order.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrderData({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error al obtener pedido:", error);
      }
    };
    fetchOrder();
  }, [order]);

  useEffect(() => {
    // Cambiar el paso del progreso en base al estado del pedido
    if (orderData?.status === "preparando") setStatusStep(2);
    else if (orderData?.status === "listo") setStatusStep(3);
    else setStatusStep(1);
  }, [orderData]);

  const steps = [
    { label: "Recibido", icon: <CheckCircle size={24} /> },
    { label: "Preparando", icon: <Clock size={24} /> },
    { label: "Listo para recoger", icon: <Truck size={24} /> },
  ];

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
      <div className="max-w-6xl mx-auto px-6 py-10">
        {!orderData ? (
          <div className="bg-white rounded-3xl shadow-lg p-16 text-center">
            <div className="text-8xl mb-6">🧋</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              No hay pedido activo
            </h2>
            <p className="text-gray-600 mb-8">
              Realiza un pedido y aparecerá aquí
            </p>
            <button
              onClick={() => setCurrentView("menu")}
              className="bg-emerald-700 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-emerald-800 transition shadow-lg"
            >
              Ver Menú
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-3xl shadow-lg p-8 mb-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Orden #{orderData.id.slice(-6).toUpperCase()}
                  </h2>
                  <p className="text-gray-600">
                    Total:{" "}
                    <span className="font-semibold text-emerald-700">
                      ${orderData.total}
                    </span>
                  </p>
                </div>
                <div className="bg-emerald-50 rounded-2xl px-5 py-3 border border-emerald-200 text-center">
                  <p className="text-sm font-semibold text-emerald-800 mb-1">
                    Puntos ganados
                  </p>
                  <div className="text-3xl font-bold text-amber-600 flex items-center justify-center gap-2">
                    <Gift size={22} />
                    {Math.floor(orderData.total / 10)}
                  </div>
                </div>
              </div>

              {/* Paso a paso */}
              <div className="flex justify-between items-center mt-10 relative">
                {steps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-14 h-14 flex items-center justify-center rounded-full border-4 mb-3 transition-all duration-300 ${
                        index + 1 <= statusStep
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-gray-300 bg-gray-100 text-gray-400"
                      }`}
                    >
                      {step.icon}
                    </div>
                    <p
                      className={`text-sm font-semibold ${
                        index + 1 <= statusStep
                          ? "text-emerald-700"
                          : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </p>

                    {/* Línea de progreso */}
                    {index < steps.length - 1 && (
                      <div
                        className={`absolute top-7 left-[calc(16.6%+1.5rem)] w-[66%] h-1 rounded-full transition-all duration-500 ${
                          index + 1 < statusStep
                            ? "bg-emerald-600"
                            : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* DETALLES */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Detalles del Pedido
              </h3>

              <div className="space-y-6">
                {orderData.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b pb-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-4xl">
                        {item.image}
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

              <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-200">
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Subtotal</span>
                  <span>${orderData.subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600 mb-2">
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

              <div className="mt-10 text-center">
                <Clock
                  size={22}
                  className="inline-block mr-2 text-emerald-600"
                />
                <span className="text-gray-700 font-medium">
                  Tiempo estimado: 15-20 minutos
                </span>
              </div>

              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => setCurrentView("menu")}
                  className="bg-emerald-700 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-emerald-800 transition shadow-xl"
                >
                  Realizar otro pedido
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderScreen;