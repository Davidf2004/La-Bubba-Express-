// src/components/MenuScreen.jsx
import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Plus,
  Heart,
  Star,
  Search,
  User,
  Settings,
  X,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

// ==============================
// OPCIONES DE PERSONALIZACIÓN
// ==============================
const MILK_OPTIONS = [
  { id: "entera", label: "Entera", price: 0 },
  { id: "deslactosada", label: "Deslactosada", price: 2 },
  { id: "deslac_light", label: "Deslactosada Light", price: 2 },
  { id: "almendras", label: "Almendras", price: 10 },
];

const TOPPING_OPTIONS = [
  { id: "extra_tapioca", label: "Extra tapioca", price: 8 },
  { id: "tapioca_explosiva", label: "Tapioca explosiva", price: 10 },
  { id: "chamoy", label: "Chamoy", price: 8 },
  { id: "combinacion", label: "Combinación", price: 10 },
];

const FOOD_CATEGORIES = ["Comida", "Tortas", "Baguettes", "Snacks"];

// ==============================
// COMPONENTE PRINCIPAL
// ==============================

const MenuScreen = ({
  cart,
  setCart,
  setCurrentView,
  showNotificationMessage,
  favorites,
  setFavorites,
}) => {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const isGuest = localStorage.getItem("guest") === "true";

  const [selectedCategory, setSelectedCategory] = useState("Todo");
  const [searchQuery, setSearchQuery] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(["Todo", "Popular"]);

  const [customizingItem, setCustomizingItem] = useState(null);
  const [selectedMilkId, setSelectedMilkId] = useState(MILK_OPTIONS[0].id);
  const [selectedToppingsIds, setSelectedToppingsIds] = useState([]);

  // 🟩 NUEVO — COMENTARIO
  const [comment, setComment] = useState("");

  // -----------------------------------------------------
  // CARGAR MENÚ
  // -----------------------------------------------------
  useEffect(() => {
    const loadMenu = async () => {
      const snap = await getDocs(collection(db, "menu"));
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setMenuItems(list);

      const uniqueCats = [
        "Todo",
        "Popular",
        ...Array.from(new Set(list.map((i) => i.category || "Otros"))),
      ];
      setCategories(uniqueCats);
    };

    loadMenu();
  }, []);

  // -----------------------------------------------------
  // ABRIR MODAL
  // -----------------------------------------------------
  const openCustomizeModal = (item) => {
    if (isGuest) {
      showNotificationMessage("Inicia sesión para realizar pedidos");
      return;
    }

    setCustomizingItem(item);
    setSelectedMilkId(MILK_OPTIONS[0].id);
    setSelectedToppingsIds([]);
    setComment(""); // 🟩 NUEVO: limpiar nota al abrir modal
  };

  // ¿El producto es comida?
  const isFood =
    customizingItem &&
    FOOD_CATEGORIES.includes(customizingItem.category);

  // -----------------------------------------------------
  // FAVORITOS
  // -----------------------------------------------------
  const toggleFavorite = (id) => {
    if (isGuest) return showNotificationMessage("Inicia sesión para agregar favoritos");

    if (favorites.includes(id)) {
      setFavorites(favorites.filter((f) => f !== id));
      showNotificationMessage("Eliminado de favoritos");
    } else {
      setFavorites([...favorites, id]);
      showNotificationMessage("Agregado a favoritos");
    }
  };

  // -----------------------------------------------------
  // AGREGAR AL CARRITO
  // -----------------------------------------------------
  const toggleTopping = (id) => {
    setSelectedToppingsIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const confirmAddToCart = () => {
    if (!customizingItem) return;

    const milk = isFood
      ? null
      : MILK_OPTIONS.find((m) => m.id === selectedMilkId);

    const toppings = isFood
      ? []
      : TOPPING_OPTIONS.filter((t) => selectedToppingsIds.includes(t.id));

    const extrasTotal = isFood
      ? 0
      : (milk?.price || 0) +
        toppings.reduce((sum, t) => sum + (t.price || 0), 0);

    const basePrice = Number(customizingItem.price || 0);
    const unitPrice = basePrice + extrasTotal;

    const configKey = isFood
      ? "comida_sin_variantes"
      : `${milk?.id}-${toppings.map((t) => t.id).join("_")}`;

    // Buscar si ya existe misma combinación
    const existing = cart.find(
      (c) => c.id === customizingItem.id && c.configKey === configKey
    );

    if (existing) {
      setCart(
        cart.map((c) =>
          c.id === customizingItem.id && c.configKey === configKey
            ? { ...c, quantity: c.quantity + 1 }
            : c
        )
      );
    } else {
      // 🟩 NUEVO: agregar comentario al carrito
      const newItem = {
        ...customizingItem,
        quantity: 1,
        unitPrice,
        milk,
        toppings,
        extrasTotal,
        comment: comment || "",
        configKey,
      };
      setCart([...cart, newItem]);
    }

    showNotificationMessage(
      `"${customizingItem.name}" agregado correctamente`
    );

    setCustomizingItem(null);
  };

  // -----------------------------------------------------
  // FILTRAR ÍTEMS
  // -----------------------------------------------------
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "Todo" ||
      (selectedCategory === "Popular" && item.popular) ||
      item.category === selectedCategory;

    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Precio del modal
  const currentExtrasTotal = isFood
    ? 0
    : (() => {
        const milk = MILK_OPTIONS.find((m) => m.id === selectedMilkId);
        const toppings = TOPPING_OPTIONS.filter((t) =>
          selectedToppingsIds.includes(t.id)
        );
        return (
          (milk?.price || 0) +
          toppings.reduce((sum, t) => sum + (t.price || 0), 0)
        );
      })();

  const currentFinalPrice = customizingItem
    ? Number(customizingItem.price || 0) + currentExtrasTotal
    : 0;

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------
  return (
    <div className="min-h-screen bg-white">

      {/* --- AVISO INVITADO --- */}
      {isGuest && (
        <div className="bg-amber-100 text-amber-800 text-center py-3 text-sm font-semibold">
          Estás navegando como invitado — inicia sesión para realizar pedidos.
        </div>
      )}

      {/* ---------- HEADER ---------- */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">

          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() =>
                window.open("https://instagram.com/elrincondelabubba", "_blank")
              }
              className="flex items-center gap-2 group hover:opacity-90 transition"
            >
              <span className="text-3xl">🧋</span>
              <img
                src="/logo.png"
                alt="logo"
                className="h-10 md:h-12 object-contain animate-heartbeat group-hover:scale-110 transition"
              />
            </button>

            <div className="flex items-center gap-3">
              {isAdmin && !isGuest && (
                <button
                  onClick={() => setCurrentView("admin")}
                  className="p-3 rounded-full bg-emerald-700 text-white hover:bg-emerald-800"
                >
                  <Settings size={20} />
                </button>
              )}

              {user && !isGuest && (
                <button
                  onClick={() => setCurrentView("profile")}
                  className="p-3 rounded-full hover:bg-gray-100"
                >
                  <User size={22} />
                </button>
              )}

              <button
                onClick={() =>
                  isGuest
                    ? showNotificationMessage("Inicia sesión para ver tu carrito")
                    : setCurrentView("cart")
                }
                className={`relative p-3 rounded-full shadow-md ${
                  isGuest
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-emerald-700 text-white hover:bg-emerald-800"
                }`}
              >
                <ShoppingCart size={22} />
                {!isGuest && cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">
                    {cart.reduce((s, item) => s + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* BUSCADOR */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar bebidas o comida..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border bg-gray-50 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* ---------- CATEGORÍAS ---------- */}

      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="flex overflow-x-auto gap-3 pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full font-semibold ${
                selectedCategory === cat
                  ? "bg-emerald-700 text-white shadow-md"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <h2 className="text-4xl font-bold text-gray-900 mb-2">
          {selectedCategory === "Todo" ? "Nuestro Menú" : selectedCategory}
        </h2>

        <p className="text-gray-600 mb-8">
          {filteredItems.length} productos disponibles
        </p>

        {/* ---------- PRODUCTOS ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border hover:border-emerald-300 hover:shadow-xl transition"
            >
              <div className="relative h-64 rounded-t-3xl overflow-hidden bg-gray-100">

                {String(item.image).startsWith("http") ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-9xl flex items-center justify-center h-full">
                    {item.image}
                  </div>
                )}

                {item.popular && (
                  <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1.5 rounded-full shadow">
                    <Star size={16} fill="white" />
                  </div>
                )}

                {!isGuest && (
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className="absolute top-4 right-4 bg-white p-3 rounded-full shadow hover:scale-110"
                  >
                    <Heart
                      size={22}
                      className={
                        favorites.includes(item.id)
                          ? "text-red-500 fill-red-500"
                          : "text-gray-400"
                      }
                    />
                  </button>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {item.name}
                </h3>

                <p className="text-sm text-gray-600 mb-5">{item.description}</p>

                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-gray-900">
                    ${item.price}
                  </div>

                  <button
                    onClick={() => openCustomizeModal(item)}
                    disabled={item.stock === 0 || isGuest}
                    className={`px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-lg ${
                      item.stock === 0 || isGuest
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-emerald-700 hover:bg-emerald-800 text-white"
                    }`}
                  >
                    <Plus size={20} />
                    {FOOD_CATEGORIES.includes(item.category)
                      ? "Agregar"
                      : "Personalizar"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============ MODAL PERSONALIZACIÓN ============ */}
      {customizingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-end md:items-center justify-center z-50">
          <div className="bg-white w-full md:max-w-xl rounded-t-3xl md:rounded-3xl shadow-2xl p-6 md:p-8">

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Personaliza tu {customizingItem.name}
              </h3>
              <button
                onClick={() => setCustomizingItem(null)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              {isFood
                ? "Agrega notas o indicaciones especiales 🍽️"
                : "Elige tipo de leche y toppings 🧋"}
            </p>

            {/* SOLO BEBIDAS */}
            {!isFood && (
              <>
                <h4 className="font-semibold text-gray-800 mb-2">Tipo de leche</h4>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {MILK_OPTIONS.map((milk) => (
                    <button
                      key={milk.id}
                      onClick={() => setSelectedMilkId(milk.id)}
                      className={`border rounded-2xl px-3 py-2 text-sm transition ${
                        selectedMilkId === milk.id
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                          : "border-gray-200 bg-gray-50 text-gray-700 hover:border-emerald-300"
                      }`}
                    >
                      <div className="font-semibold">{milk.label}</div>
                      <div className="text-xs">
                        {milk.price === 0 ? "Incluido" : `+ $${milk.price}`}
                      </div>
                    </button>
                  ))}
                </div>

                <h4 className="font-semibold text-gray-800 mb-2">
                  Toppings / Extras
                </h4>

                <div className="flex flex-wrap gap-2 mb-6">
                  {TOPPING_OPTIONS.map((top) => (
                    <button
                      key={top.id}
                      onClick={() => toggleTopping(top.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                        selectedToppingsIds.includes(top.id)
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-gray-50 border-gray-200 text-gray-700 hover:border-emerald-300"
                      }`}
                    >
                      {top.label} · ${top.price}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* 🟩 NOTAS / INDICACIONES ESPECIALES (COMIDA o BEBIDA) */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">
                Notas o indicaciones especiales
              </h4>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  isFood
                    ? "Ej. sin cebolla, sin tomate, extra salsa..."
                    : "Notas adicionales…"
                }
                className="w-full p-4 rounded-2xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-emerald-500"
                rows={3}
              />
            </div>

            {/* RESUMEN DEL PRECIO */}
            <div className="p-4 rounded-2xl bg-gray-50 border mb-6">
              <div className="flex justify-between">
                <span>Base</span>
                <span>${customizingItem.price}</span>
              </div>

              {!isFood && (
                <div className="flex justify-between">
                  <span>Extras</span>
                  <span>${currentExtrasTotal}</span>
                </div>
              )}

              <div className="flex justify-between font-bold border-t mt-2 pt-3">
                <span>Total</span>
                <span>${currentFinalPrice}</span>
              </div>
            </div>

            <button
              onClick={confirmAddToCart}
              className="w-full bg-emerald-700 text-white py-3 rounded-2xl text-lg font-semibold hover:bg-emerald-800 shadow-lg"
            >
              Agregar · ${currentFinalPrice}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuScreen;