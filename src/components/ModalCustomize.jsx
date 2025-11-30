import React, { useState, useEffect } from "react";
import { X, Droplets, Utensils, PlusCircle } from "lucide-react";
import clsx from "clsx";

const ModalCustomize = ({ item, onClose, addToCart }) => {
  const isFood = [
    "torta",
    "baguette",
    "comida",
    "lasa",
    "banderilla",
    "elote",
    "dori",
    "dorie",
    "vaso",
  ].some((kw) =>
    String(item.category || "").toLowerCase().includes(kw) ||
    String(item.name || "").toLowerCase().includes(kw)
  );

  const milkOptions = [
    { name: "Entera", price: 0 },
    { name: "Deslactosada", price: 2 },
    { name: "Light", price: 2 },
    { name: "Almendra", price: 10 },
  ];

  const toppingOptions = [
    { name: "Tapioca extra", price: 8 },
    { name: "Explosiva", price: 10 },
    { name: "Chamoy", price: 8 },
    { name: "Combinación", price: 10 },
  ];

  const [milk, setMilk] = useState(milkOptions[0]);
  const [toppings, setToppings] = useState([]);
  const [comment, setComment] = useState("");
  const [total, setTotal] = useState(item.price);

  useEffect(() => {
    if (!isFood) {
      const t = toppings.reduce((s, t) => s + t.price, 0);
      setTotal(item.price + milk.price + t);
    } else {
      setTotal(item.price);
    }
  }, [milk, toppings, isFood, item.price]);

  const toggleTopping = (t) => {
    if (toppings.some((x) => x.name === t.name)) {
      setToppings(toppings.filter((x) => x.name !== t.name));
    } else {
      setToppings([...toppings, t]);
    }
  };

  const handleAdd = () => {
    addToCart({
      ...item,
      milk: isFood ? null : milk,
      toppings: isFood ? [] : toppings,
      comment,
      finalPrice: total,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50 animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-t-[40px] shadow-2xl p-8 relative animate-slideUp">

        {/* Header */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 bg-gray-100 hover:bg-gray-200 p-2 rounded-full"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">
            Personalizar
          </h2>
          <p className="text-lg text-gray-600 font-medium">{item.name}</p>
        </div>

        {/* IMAGE */}
        <div className="flex justify-center mb-8">
          <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center shadow-inner">
            <span className="text-7xl">{item.image}</span>
          </div>
        </div>

        {/* BEBIDAS */}
        {!isFood && (
          <>
            {/* Milk */}
            <h3 className="font-semibold text-xl text-gray-900 mb-3 flex items-center gap-2">
              <Droplets size={20} className="text-emerald-600" />
              Tipo de leche
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {milkOptions.map((m) => {
                const active = milk.name === m.name;
                return (
                  <button
                    key={m.name}
                    onClick={() => setMilk(m)}
                    className={clsx(
                      "p-4 rounded-2xl border text-left transition shadow-sm",
                      active
                        ? "bg-emerald-100 border-emerald-600 text-emerald-800 shadow-md"
                        : "bg-gray-100 border-gray-300"
                    )}
                  >
                    <p className="font-bold">{m.name}</p>
                    <p className="text-sm">
                      {m.price === 0 ? "Incluido" : `+ $${m.price}`}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Toppings */}
            <h3 className="font-semibold text-xl text-gray-900 mb-3 flex items-center gap-2">
              <PlusCircle size={20} className="text-emerald-600" />
              Toppings / Extras
            </h3>

            <div className="flex flex-wrap gap-3 mb-8">
              {toppingOptions.map((t) => {
                const active = toppings.some((x) => x.name === t.name);
                return (
                  <button
                    key={t.name}
                    onClick={() => toggleTopping(t)}
                    className={clsx(
                      "px-5 py-2 rounded-full text-sm font-semibold border transition",
                      active
                        ? "bg-emerald-600 text-white border-emerald-700 shadow"
                        : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    {t.name} · ${t.price}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* FOOD MESSAGE */}
        {isFood && (
          <div className="mb-8">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-2">
              <Utensils size={20} className="text-emerald-700" />
              Notas para cocina
            </div>
            <p className="text-gray-600 text-sm mb-2">
              Puedes especificar detalles como “sin tomate”, “extra salsa”, etc.
            </p>
          </div>
        )}

        {/* Comments */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            isFood
              ? "Ej: sin cebolla, sin tomate, extra salsa..."
              : "Notas adicionales…"
          }
          className="w-full p-4 rounded-2xl border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-emerald-500 mb-8"
          rows={3}
        />

        {/* FOOTER */}
        <div className="sticky bottom-0 bg-white pt-3">
          <button
            onClick={handleAdd}
            className="w-full bg-emerald-700 text-white py-4 rounded-2xl text-xl font-bold shadow-xl hover:bg-emerald-800 transition"
          >
            Agregar al carrito · ${total}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCustomize;