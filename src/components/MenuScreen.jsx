import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Plus,
  Heart,
  Star,
  Search,
  User,
  Settings,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

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

  // 🟢 Detectar usuario invitado
  const isGuest = localStorage.getItem("guest") === "true";

  const [selectedCategory, setSelectedCategory] = useState("Todo");
  const [searchQuery, setSearchQuery] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(["Todo", "Popular"]);

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

  const addToCart = (item) => {
    if (isGuest) {
      showNotificationMessage("Inicia sesión para realizar pedidos");
      return;
    }

    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      setCart(
        cart.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    showNotificationMessage(`"${item.name}" agregado al carrito`);
  };

  const toggleFavorite = (id) => {
    if (isGuest) {
      showNotificationMessage("Inicia sesión para agregar favoritos");
      return;
    }

    if (favorites.includes(id)) {
      setFavorites(favorites.filter((f) => f !== id));
      showNotificationMessage("Eliminado de favoritos");
    } else {
      setFavorites([...favorites, id]);
      showNotificationMessage("Agregado a favoritos");
    }
  };

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

  return (
    <div className="min-h-screen bg-white">

      {/* 🔶 AVISO PARA INVITADOS */}
      {isGuest && (
        <div className="bg-amber-100 text-amber-800 text-center py-3 text-sm font-semibold">
          Estás navegando como invitado — inicia sesión para realizar pedidos.
        </div>
      )}

      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">

          <div className="flex items-center justify-between mb-4">
            
            {/* LOGO + INSTAGRAM */}
            <button
              onClick={() =>
                window.open("https://instagram.com/elrincondelabubba", "_blank")
              }
              className="flex items-center gap-2 group hover:opacity-90 transition"
            >
              <span className="text-3xl">🧋</span>

              <img
                src="/logo.png"
                alt="El Rincón de la Bubba"
                className="h-10 md:h-12 object-contain animate-heartbeat group-hover:scale-110 transition-transform"
              />
            </button>

            {/* BOTONES DERECHA */}
            <div className="flex items-center gap-3">

              {isAdmin && !isGuest && (
                <button
                  onClick={() => setCurrentView("admin")}
                  className="p-3 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 transition"
                >
                  <Settings size={20} />
                </button>
              )}

              {user && !isGuest && (
                <button
                  onClick={() => setCurrentView("profile")}
                  className="p-3 rounded-full hover:bg-gray-100 transition"
                >
                  <User size={22} />
                </button>
              )}

              <button
                onClick={() => {
                  if (isGuest) {
                    showNotificationMessage("Inicia sesión para ver tu carrito");
                    return;
                  }
                  setCurrentView("cart");
                }}
                className={`relative p-3 rounded-full shadow-md ${
                  isGuest
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-emerald-700 text-white hover:bg-emerald-800"
                }`}
              >
                <ShoppingCart size={22} />

                {!isGuest && cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar bebidas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* CATEGORÍAS */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="flex overflow-x-auto gap-3 pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full whitespace-nowrap font-semibold transition ${
                selectedCategory === cat
                  ? "bg-emerald-700 text-white shadow-md"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* TÍTULO */}
        <h2 className="text-4xl font-bold text-gray-900 mb-2">
          {selectedCategory === "Todo" ? "Nuestro Menú" : selectedCategory}
        </h2>

        {/* CONTADOR PRODUCTOS */}
        <p className="text-gray-600 mb-8">
          {filteredItems.length === 0 ? (
            selectedCategory === "Todo"
              ? "No hay productos disponibles"
              : `No hay productos en ${selectedCategory}`
          ) : filteredItems.length === 1 ? (
            selectedCategory === "Todo"
              ? "1 Producto disponible"
              : `1 Producto disponible en ${selectedCategory}`
          ) : selectedCategory === "Todo" ? (
            `${filteredItems.length} Productos disponibles`
          ) : (
            `${filteredItems.length} Productos disponibles en ${selectedCategory}`
          )}
        </p>

        {/* PRODUCTOS */}
        {filteredItems.length === 0 ? (
          <p className="text-gray-500">
            No hay productos para mostrar. Si eres administrador, crea productos desde el Panel Staff.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">

            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-gray-200 hover:border-emerald-300 hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative h-64 bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 rounded-t-3xl flex items-center justify-center overflow-hidden">

                  {String(item.image).startsWith("http") ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-t-3xl"
                    />
                  ) : (
                    <div className="text-9xl">{item.image}</div>
                  )}

                  {item.popular && (
                    <div className="absolute top-4 left-4 bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      <Star size={16} fill="white" />
                    </div>
                  )}

                  {!isGuest && (
                    <button
                      onClick={() => toggleFavorite(item.id)}
                      className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-lg hover:scale-110 transition"
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
                  <h3 className="font-bold text-xl text-gray-900 mb-1">
                    {item.name}
                  </h3>

                  <p className="text-gray-600 text-sm mb-5">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-gray-900">
                      ${item.price}
                    </div>

                    <button
                      onClick={() => addToCart(item)}
                      disabled={item.stock === 0 || isGuest}
                      className={`px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-lg ${
                        item.stock === 0 || isGuest
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-emerald-700 text-white hover:bg-emerald-800"
                      }`}
                    >
                      <Plus size={20} />
                      {item.stock === 0
                        ? "Agotado"
                        : isGuest
                        ? "Restringido"
                        : "Agregar"}
                    </button>
                  </div>
                </div>
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
};

export default MenuScreen;