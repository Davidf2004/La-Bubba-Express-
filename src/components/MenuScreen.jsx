// src/components/MenuScreen.jsx
import React, { useState } from "react";
import {
  ShoppingCart,
  Plus,
  Heart,
  Star,
  Search,
  User,
} from "lucide-react";

const MenuScreen = ({
  cart,
  setCart,
  setCurrentView,
  showNotificationMessage,
  isLoggedIn,
  favorites,
  setFavorites,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("Todo");
  const [searchQuery, setSearchQuery] = useState("");

  // 🧋 Menú base (local)
  const menuItems = [
    { id: 1, name: "Bubble Tea Clásico", description: "Té negro con perlas de tapioca y leche cremosa", price: 65, category: "Bubble Tea", image: "🧋", popular: true, rating: 4.8, calories: 280, stock: 50 },
    { id: 2, name: "Matcha Latte Premium", description: "Matcha japonés orgánico con leche de almendra", price: 75, category: "Especiales", image: "🍵", popular: true, rating: 4.9, calories: 220, stock: 45 },
    { id: 3, name: "Taro Milk Tea", description: "Cremoso té de taro con boba y toque de vainilla", price: 70, category: "Bubble Tea", image: "🧋", popular: false, rating: 4.7, calories: 300, stock: 40 },
    { id: 4, name: "Café Frappé Caramelo", description: "Café helado con caramelo belga y crema batida", price: 68, category: "Café", image: "☕", popular: true, rating: 4.6, calories: 340, stock: 55 },
    { id: 5, name: "Thai Tea Especial", description: "Té tailandés tradicional con leche condensada", price: 72, category: "Especiales", image: "🥤", popular: false, rating: 4.8, calories: 310, stock: 38 },
    { id: 6, name: "Strawberry Cloud", description: "Smoothie de fresa natural con crema batida", price: 78, category: "Smoothies", image: "🍓", popular: true, rating: 4.9, calories: 250, stock: 42 },
    { id: 7, name: "Mango Passion Blast", description: "Mango, maracuyá tropical y hielo frappe", price: 80, category: "Smoothies", image: "🥭", popular: false, rating: 4.7, calories: 270, stock: 35 },
    { id: 8, name: "Brown Sugar Boba", description: "Leche fresca con jarabe artesanal de azúcar morena", price: 75, category: "Bubble Tea", image: "🧋", popular: true, rating: 4.9, calories: 320, stock: 48 },
    { id: 9, name: "Iced Americano", description: "Espresso doble intenso con hielo", price: 55, category: "Café", image: "☕", popular: false, rating: 4.5, calories: 15, stock: 60 },
    { id: 10, name: "Lavender Latte", description: "Latte aromático con jarabe de lavanda francesa", price: 72, category: "Especiales", image: "☕", popular: true, rating: 4.8, calories: 240, stock: 30 },
  ];

  const categories = ["Todo", "Popular", "Bubble Tea", "Café", "Especiales", "Smoothies"];

  // ✅ Agregar producto al carrito
  const addToCart = (item) => {
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
    showNotificationMessage("Agregado al carrito");
  };

  // ❤️ Agregar / quitar favoritos
  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((f) => f !== id));
      showNotificationMessage("Eliminado de favoritos");
    } else {
      setFavorites([...favorites, id]);
      showNotificationMessage("Agregado a favoritos");
    }
  };

  // 🔍 Filtrado dinámico
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
      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentView("intro")}
              className="text-3xl hover:scale-110 transition"
            >
              🧋
            </button>

            <div className="flex items-center gap-3">
              {isLoggedIn && (
                <button
                  onClick={() => setCurrentView("profile")}
                  className="p-3 rounded-full hover:bg-gray-100 transition"
                >
                  <User size={22} />
                </button>
              )}
              <button
                onClick={() => setCurrentView("cart")}
                className="relative bg-emerald-700 text-white p-3 rounded-full hover:bg-emerald-800 transition shadow-md"
              >
                <ShoppingCart size={22} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* BARRA DE BÚSQUEDA */}
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

      {/* NOTIFICACIÓN */}
      <div className="fixed top-24 right-6 z-50">
        <div
          className={`${
            showNotificationMessage
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          } transition-opacity duration-300`}
        ></div>
      </div>

      {/* CATEGORÍAS */}
      <div className="bg-white border-b sticky top-28 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex gap-3 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-full whitespace-nowrap font-semibold transition ${
                  selectedCategory === cat
                    ? "bg-emerald-700 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MENÚ */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">
          {selectedCategory === "Todo" ? "Nuestro Menú" : selectedCategory}
        </h2>
        <p className="text-gray-600 mb-8">
          {filteredItems.length} bebidas disponibles
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-gray-200 hover:border-emerald-300 hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-64 bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 rounded-t-3xl flex items-center justify-center">
                <div className="text-9xl transform hover:scale-110 transition-transform duration-500">
                  {item.image}
                </div>

                {item.popular && (
                  <div className="absolute top-4 left-4 bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                    <Star size={16} fill="white" />
                    Popular
                  </div>
                )}

                <button
                  onClick={() => toggleFavorite(item.id)}
                  className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
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
              </div>

              <div className="p-6">
                <h3 className="font-bold text-xl text-gray-900 mb-1">
                  {item.name}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={16} fill="currentColor" />
                    <span className="text-sm font-semibold text-gray-700">
                      {item.rating}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    • {item.calories} cal
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      ${item.price}
                    </div>
                    <div className="text-xs text-gray-500">MXN</div>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    disabled={item.stock === 0}
                    className={`px-6 py-3 rounded-full font-semibold transition flex items-center gap-2 shadow-lg ${
                      item.stock === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-emerald-700 text-white hover:bg-emerald-800 hover:shadow-xl"
                    }`}
                  >
                    <Plus size={20} />
                    {item.stock === 0 ? "Agotado" : "Agregar"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuScreen;