// src/components/CartScreen.jsx
import React from "react";
import {
  ChevronRight,
  Trash2,
  Plus,
  Minus,
  MapPin,
  Clock,
  Gift,
} from "lucide-react";

import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";

const CartScreen = ({
  cart,
  setCart,
  setCurrentView,
  showNotificationMessage,
  setOrder,
}) => {
  const { user } = useAuth();

  const updateQuantity = (id, delta, configKey) => {
    setCart(
      cart.map((item) =>
        item.id === id && item.configKey === configKey
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeFromCart = (id, configKey) => {
    const item = cart.find(
      (c) => c.id === id && c.configKey === configKey
    );
    setCart(
      cart.filter(
        (c) => !(c.id === id && c.configKey === configKey)
      )
    );
    showNotificationMessage(`${item.name} eliminado del carrito`);
  };

  const subtotal = cart.reduce((sum, item) => {
    const price = item.unitPrice ?? item.price;
    return sum + price * item.quantity;
  }, 0);

  const tax = Math.round(subtotal * 0.16);
  const total = subtotal + tax;

  const placeOrder = async () => {
    if (!user) {
      showNotificationMessage("Inicia sesión para hacer tu pedido");
      setCurrentView("login");
      return;
    }

    if (cart.length === 0) {
      showNotificationMessage("Tu carrito está vacío");
      return;
    }

    try {
      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,

          // precios correctos
          price: item.basePrice ?? item.price,
          unitPrice: item.unitPrice ?? item.price,
          extrasTotal: item.extrasTotal ?? 0,

          // personalización
          milk: item.milk || null,
          toppings: item.toppings || [],
          comment: item.comment || "",

          // clave para distinguir configs
          configKey: item.configKey || null,

          // básicos
          image: item.image,
          category: item.category || "Bebida",
        })),

        subtotal,
        tax,
        total,
        status: "confirmado",

        pickupLocation:
          "Universidad De La Salle Bajío - Cafetería El Rincon de la Bubba (Frente a Santander)",

        createdAt: serverTimestamp(),
      };

      const ref = await addDoc(collection(db, "orders"), orderData);

      setOrder({ id: ref.id, ...orderData });
      setCart([]);

      showNotificationMessage("¡Orden confirmada!");
      setCurrentView("order");
    } catch (error) {
      console.error("Error al guardar la orden:", error);
      showNotificationMessage("Error al confirmar la orden");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center gap-4">
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
              <h1 className="text-2xl font-bold text-gray-900">Tu Carrito</h1>
              <p className="text-sm text-gray-600">
                Revisa tu orden antes de confirmar
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-20 text-center">
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Explora nuestro menú y encuentra tu bebida perfecta
            </p>

            <button
              onClick={() => setCurrentView("menu")}
              className="bg-emerald-700 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-emerald-800 transition shadow-lg"
            >
              Explorar Menú
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LISTA */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-lg p-8 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Tus Bebidas ({cart.reduce((s, i) => s + i.quantity, 0)} items)
                </h2>

                <div className="space-y-6">
                  {cart.map((item) => {
                    const unitPrice = item.unitPrice ?? item.price;

                    return (
                      <div
                        key={item.id + item.configKey}
                        className="flex gap-5 pb-6 border-b last:border-b-0"
                      >
                        <div className="w-28 h-28 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <span className="text-6xl">{item.image}</span>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-lg text-gray-900">
                                {item.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                ${unitPrice} c/u
                              </p>
                            </div>

                            <button
                              onClick={() =>
                                removeFromCart(item.id, item.configKey)
                              }
                              className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>

                          {/* leche, toppings */}
                          <div className="text-xs text-gray-700 space-y-1">
                            {item.milk && (
                              <p>
                                🥛 Leche:{" "}
                                <span className="font-semibold">
                                  {item.milk.label || item.milk.name}
                                </span>
                              </p>
                            )}

                            {item.toppings?.length > 0 && (
                              <p>
                                🍫 Toppings:{" "}
                                <span className="font-semibold">
                                  {item.toppings
                                    .map((t) => t.label || t.name)
                                    .join(", ")}
                                </span>
                              </p>
                            )}

                            {item.comment && (
                              <p className="text-gray-600 italic">
                                📝 {item.comment}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-3 bg-gray-100 rounded-full p-1.5">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    -1,
                                    item.configKey
                                  )
                                }
                                className="bg-white p-2 rounded-full hover:bg-gray-50 shadow-sm transition"
                              >
                                <Minus size={18} />
                              </button>

                              <span className="font-bold text-lg w-10 text-center">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    1,
                                    item.configKey
                                  )
                                }
                                className="bg-white p-2 rounded-full hover:bg-gray-50 shadow-sm transition"
                              >
                                <Plus size={18} />
                              </button>
                            </div>

                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900">
                                ${unitPrice * item.quantity}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* LOCAL */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-6 border-2 border-emerald-200">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-700 p-4 rounded-2xl">
                    <MapPin className="text-white" size={28} />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-900 mb-2">
                      Punto de Recolección
                    </h3>

                    <p className="text-gray-700 font-medium mb-1">
                      Universidad De La Salle Bajío
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      Campus Campestre • El Rincon de la Bubba (Frente a
                      Santander)
                    </p>

                    <div className="flex items-center gap-2 text-emerald-700">
                      <Clock size={18} />
                      <span className="text-sm font-semibold">
                        Listo en 15-20 minutos
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RESUMEN */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-lg p-8 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Resumen del Pedido
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">${subtotal}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>IVA (16%)</span>
                    <span className="font-semibold">${tax}</span>
                  </div>

                  <div className="border-t-2 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">
                        Total a Pagar
                      </span>
                      <span className="text-4xl font-bold text-emerald-700">
                        ${total}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={placeOrder}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-5 rounded-full text-lg font-bold hover:from-emerald-700 hover:to-emerald-800 transition shadow-xl hover:shadow-2xl mb-4"
                >
                  Confirmar Orden
                </button>

                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <Gift className="text-amber-600 flex-shrink-0" size={20} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        Ganarás Rewards
                      </p>
                      <p className="text-xs text-gray-600">
                        +{Math.floor(total / 10)} puntos con esta orden
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartScreen;