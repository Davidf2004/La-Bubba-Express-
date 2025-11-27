// src/components/AdminPanel.jsx
import React, { useEffect, useState } from "react";
import {
  Coffee,
  List,
  Package,
  ShieldCheck,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";

const emptyProduct = {
  name: "",
  description: "",
  price: "",
  category: "",
  image: "",
  rating: "",
  calories: "",
  stock: "",
};

const AdminPanel = ({ setCurrentView, showNotificationMessage }) => {
  const { user, profile } = useAuth();
  const isAdmin =
    user &&
    (user.email === "bubba@cafeteria.mx" || profile?.role === "admin");

  const [activeTab, setActiveTab] = useState("menu");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, "menu"), orderBy("name", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(list);
    });

    return () => unsub();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;

    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders(list);
    });

    return () => unsub();
  }, [isAdmin]);

  const handleChangeProductField = (field, value) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetProductForm = () => {
    setProductForm(emptyProduct);
    setEditingId(null);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      showNotificationMessage("Nombre y precio son obligatorios");
      return;
    }

    setSavingProduct(true);
    try {
      const data = {
        name: productForm.name,
        description: productForm.description || "",
        price: Number(productForm.price),
        category: productForm.category || "General",
        image: productForm.image || "🧋",
        rating: productForm.rating ? Number(productForm.rating) : 4.8,
        calories: productForm.calories
          ? Number(productForm.calories)
          : 0,
        stock: productForm.stock ? Number(productForm.stock) : 0,
        popular: productForm.popular ?? false,
      };

      if (editingId) {
        await updateDoc(doc(db, "menu", editingId), data);
        showNotificationMessage("Producto actualizado");
      } else {
        await addDoc(collection(db, "menu"), data);
        showNotificationMessage("Producto creado");
      }

      resetProductForm();
    } catch (err) {
      console.error(err);
      showNotificationMessage("Error al guardar producto");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingId(product.id);
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      category: product.category || "",
      image: product.image || "",
      rating: product.rating?.toString() || "",
      calories: product.calories?.toString() || "",
      stock: product.stock?.toString() || "",
    });
    setActiveTab("menu");
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("¿Eliminar este producto del menú?")) return;
    try {
      await deleteDoc(doc(db, "menu", id));
      showNotificationMessage("Producto eliminado");
    } catch (err) {
      console.error(err);
      showNotificationMessage("Error al eliminar producto");
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
      });
      showNotificationMessage(`Orden actualizada a "${newStatus}"`);
    } catch (err) {
      console.error(err);
      showNotificationMessage("Error al actualizar la orden");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "confirmado":
        return "bg-blue-100 text-blue-700";
      case "preparando":
        return "bg-amber-100 text-amber-700";
      case "listo":
        return "bg-emerald-100 text-emerald-700";
      case "entregado":
        return "bg-gray-100 text-gray-700";
      case "cancelado":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <ShieldCheck size={40} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            Acceso restringido
          </h2>
          <p className="text-gray-600 mb-6">
            Este panel solo está disponible para el administrador de la
            cafetería.
          </p>
          <button
            onClick={() => setCurrentView("menu")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 text-white rounded-full font-semibold hover:bg-emerald-800 transition"
          >
            <ArrowLeft size={18} />
            Volver al menú
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-72 bg-white border-r shadow-lg flex flex-col">
        <div className="px-6 py-5 border-b flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-700 flex items-center justify-center text-2xl">
            🧋
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">
              Panel Staff
            </p>
            <h1 className="font-bold text-lg text-gray-900">
              La Bubba Express
            </h1>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <button
            onClick={() => setActiveTab("menu")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition ${
              activeTab === "menu"
                ? "bg-emerald-700 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Coffee
              size={18}
              className={activeTab === "menu" ? "text-white" : "text-emerald-700"}
            />
            Menú
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition ${
              activeTab === "orders"
                ? "bg-emerald-700 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <List
              size={18}
              className={
                activeTab === "orders" ? "text-white" : "text-emerald-700"
              }
            />
            Órdenes
          </button>
        </nav>

        <div className="px-5 py-4 border-t text-sm">
          <p className="text-gray-500 mb-1">Sesión como:</p>
          <p className="font-semibold text-gray-900">
            {profile?.name || user?.email}
          </p>
          <p className="text-xs text-gray-500">
            Rol: {profile?.role || "admin"}
          </p>
          <button
            onClick={() => setCurrentView("menu")}
            className="mt-3 text-emerald-700 hover:text-emerald-900 text-xs font-semibold"
          >
            ← Volver a vista cliente
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === "menu" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="bg-white rounded-3xl shadow-lg p-6 lg:col-span-1">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingId ? "Editar Producto" : "Crear Producto"}
              </h2>

              <form onSubmit={handleSaveProduct} className="space-y-3">
                {[
                  "name",
                  "description",
                  "price",
                  "category",
                  "image",
                  "rating",
                  "calories",
                  "stock",
                ].map((field) => (
                  <div key={field}>
                    <input
                      type={
                        ["price", "rating", "calories", "stock"].includes(field)
                          ? "number"
                          : "text"
                      }
                      step={
                        ["price", "rating"].includes(field) ? "0.1" : "1"
                      }
                      placeholder={field}
                      value={productForm[field]}
                      onChange={(e) =>
                        handleChangeProductField(field, e.target.value)
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                ))}

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={savingProduct}
                    className="flex-1 bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-800 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {savingProduct && (
                      <Loader2 className="animate-spin" size={16} />
                    )}
                    {editingId ? "Guardar cambios" : "Crear Producto"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetProductForm}
                      className="px-4 py-2.5 rounded-xl border text-sm font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="bg-white rounded-3xl shadow-lg p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Productos Existentes
                </h2>
                <span className="text-sm text-gray-500">
                  {products.length} productos
                </span>
              </div>

              {products.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No hay productos en el menú. Crea el primero en el
                  formulario de la izquierda.
                </p>
              ) : (
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="border border-gray-200 rounded-2xl p-4 flex items-start justify-between hover:border-emerald-300 transition"
                    >
                      <div className="flex gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl">
                          {p.image || "🧋"}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {p.name}
                          </h3>
                          <p className="text-xs text-gray-500 mb-1">
                            {p.category} • {p.calories || 0} cal
                          </p>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {p.description}
                          </p>
                          <p className="text-sm font-bold text-emerald-700 mt-1">
                            ${p.price} MXN • Stock: {p.stock || 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => handleEditProduct(p)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 hover:bg-gray-200"
                        >
                          <Edit2 size={14} />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          <Trash2 size={14} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === "orders" && (
          <section className="bg-white rounded-3xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Package size={20} />
                Órdenes en tiempo real
              </h2>
              <span className="text-sm text-gray-500">
                {orders.length} órdenes
              </span>
            </div>

            {orders.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Aún no hay órdenes en el sistema.
              </p>
            ) : (
              <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                {orders.map((o) => {
                  const points = Math.floor((o.total || 0) / 10);
                  return (
                    <div
                      key={o.id}
                      className="border border-gray-200 rounded-2xl p-5 hover:border-emerald-300 transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900">
                            Orden #{o.id.slice(-5).toUpperCase()}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {o.userEmail || "Cliente invitado"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {o.createdAt?.toDate
                              ? o.createdAt
                                  .toDate()
                                  .toLocaleString("es-MX")
                              : "Fecha no disponible"}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-emerald-700">
                            ${o.total}
                          </div>
                          <div className="text-xs text-gray-500">
                            Puntos: {points}
                          </div>
                          <span
                            className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                              o.status
                            )}`}
                          >
                            {o.status || "sin estado"}
                          </span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-700 mb-3">
                        {o.items &&
                          o.items
                            .map(
                              (it) => `${it.quantity}x ${it.name} ($${it.price})`
                            )
                            .join(" • ")}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-3 border-t">
                        {o.status === "confirmado" && (
                          <>
                            <button
                              onClick={() =>
                                updateOrderStatus(o.id, "preparando")
                              }
                              disabled={updatingOrderId === o.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 hover:bg-amber-200 disabled:opacity-60"
                            >
                              {updatingOrderId === o.id ? (
                                <Loader2
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : (
                                <CheckCircle2 size={14} />
                              )}
                              Preparar
                            </button>
                            <button
                              onClick={() =>
                                updateOrderStatus(o.id, "cancelado")
                              }
                              disabled={updatingOrderId === o.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-60"
                            >
                              <XCircle size={14} />
                              Cancelar
                            </button>
                          </>
                        )}

                        {o.status === "preparando" && (
                          <>
                            <button
                              onClick={() =>
                                updateOrderStatus(o.id, "listo")
                              }
                              disabled={updatingOrderId === o.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-60"
                            >
                              <CheckCircle2 size={14} />
                              Listo para recoger
                            </button>
                            <button
                              onClick={() =>
                                updateOrderStatus(o.id, "cancelado")
                              }
                              disabled={updatingOrderId === o.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-60"
                            >
                              <XCircle size={14} />
                              Cancelar
                            </button>
                          </>
                        )}

                        {o.status === "listo" && (
                          <button
                            onClick={() =>
                              updateOrderStatus(o.id, "entregado")
                            }
                            disabled={updatingOrderId === o.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-60"
                          >
                            <CheckCircle2 size={14} />
                            Marcar como entregado
                          </button>
                        )}

                        {(o.status === "entregado" ||
                          o.status === "cancelado") && (
                          <span className="text-xs text-gray-400">
                            Sin acciones disponibles
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;