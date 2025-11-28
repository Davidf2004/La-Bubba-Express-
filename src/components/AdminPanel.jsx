import React, { useEffect, useState } from "react";
import {
  Coffee,
  List,
  Package,
  ShieldCheck,
  Trash2,
  Edit2,
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
import { uploadImage } from "../utils/uploadImage";

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
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
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders(list);
    });
    return () => unsub();
  }, [isAdmin]);

  const handleChangeProductField = (field, value) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      setImagePreview(URL.createObjectURL(file));
      const url = await uploadImage(file);
      setProductForm((prev) => ({ ...prev, image: url }));
      showNotificationMessage("Imagen subida exitosamente");
    } catch (err) {
      showNotificationMessage("Error al subir imagen");
    } finally {
      setUploadingImage(false);
    }
  };

  const resetProductForm = () => {
    setProductForm(emptyProduct);
    setEditingId(null);
    setImagePreview(null);
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
        image: productForm.image || "",
        rating: productForm.rating ? Number(productForm.rating) : 4.8,
        calories: productForm.calories ? Number(productForm.calories) : 0,
        stock: productForm.stock ? Number(productForm.stock) : 0,
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
    setImagePreview(product.image || null);
    setActiveTab("menu");
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("¿Eliminar este producto del menú?")) return;
    try {
      await deleteDoc(doc(db, "menu", id));
      showNotificationMessage("Producto eliminado");
    } catch (err) {
      showNotificationMessage("Error al eliminar producto");
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      showNotificationMessage(`Orden actualizada a "${newStatus}"`);
    } catch (err) {
      showNotificationMessage("Error al actualizar orden");
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
          <h2 className="text-2xl font-bold mb-2">Acceso restringido</h2>
          <p className="text-gray-600 mb-6">
            Este panel solo está disponible para el administrador.
          </p>
          <button
            onClick={() => setCurrentView("menu")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 text-white rounded-full font-semibold"
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
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm ${
              activeTab === "menu"
                ? "bg-emerald-700 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Coffee size={18} />
            Menú
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm ${
              activeTab === "orders"
                ? "bg-emerald-700 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <List size={18} />
            Órdenes
          </button>
        </nav>

        <div className="px-5 py-4 border-t text-sm">
          <p className="text-gray-500 mb-1">Sesión como:</p>
          <p className="font-semibold text-gray-900">
            {profile?.name || user?.email}
          </p>
          <p className="text-xs text-gray-500">Rol: {profile?.role}</p>
          <button
            onClick={() => setCurrentView("menu")}
            className="mt-3 text-emerald-700 font-semibold text-xs"
          >
            ← Volver a vista cliente
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === "menu" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="bg-white rounded-3xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingId ? "Editar Producto" : "Crear Producto"}
              </h2>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div className="space-y-2">
                  {imagePreview || productForm.image ? (
                    <img
                      src={imagePreview || productForm.image}
                      alt=""
                      className="w-32 h-32 rounded-xl object-cover border"
                    />
                  ) : (
                    <div className="w-32 h-32 border rounded-xl flex items-center justify-center text-gray-400">
                      Sin imagen
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0])}
                    className="w-full text-sm"
                  />

                  {uploadingImage && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <Loader2 className="animate-spin" size={14} />
                      Subiendo imagen...
                    </p>
                  )}
                </div>

                {[
                  "name",
                  "description",
                  "price",
                  "category",
                  "rating",
                  "calories",
                  "stock",
                ].map((field) => (
                  <input
                    key={field}
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
                    className="w-full px-4 py-2 border rounded-xl"
                  />
                ))}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={savingProduct}
                    className="flex-1 bg-emerald-700 text-white py-2 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {savingProduct && (
                      <Loader2 className="animate-spin" size={16} />
                    )}
                    {editingId ? "Guardar cambios" : "Crear producto"}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      onClick={resetProductForm}
                      className="px-4 py-2 rounded-xl border"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="bg-white rounded-3xl shadow-lg p-6 lg:col-span-2">
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Productos Existentes</h2>
                <span className="text-sm text-gray-500">
                  {products.length} productos
                </span>
              </div>

              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="border rounded-2xl p-4 flex justify-between hover:border-emerald-300"
                  >
                    <div className="flex gap-3">
                      <img
                        src={p.image || ""}
                        className="h-12 w-12 rounded-xl object-cover border"
                        alt=""
                      />
                      <div>
                        <h3 className="font-semibold">{p.name}</h3>
                        <p className="text-xs text-gray-500">
                          {p.category}
                        </p>
                        <p className="text-sm text-gray-700">
                          {p.description}
                        </p>
                        <p className="text-sm font-bold text-emerald-700">
                          ${p.price}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleEditProduct(p)}
                        className="px-3 py-1 rounded-full text-xs bg-gray-100 hover:bg-gray-200"
                      >
                        <Edit2 size={14} /> Editar
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        <Trash2 size={14} /> Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "orders" && (
          <section className="bg-white rounded-3xl shadow-lg p-6">
            <div className="flex justify-between mb-5">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Package size={20} />
                Órdenes en tiempo real
              </h2>
              <span className="text-sm text-gray-500">
                {orders.length} órdenes
              </span>
            </div>

            <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="border rounded-2xl p-5 hover:border-emerald-300"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold">
                        Orden #{o.id.slice(-5).toUpperCase()}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {o.userEmail}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {o.createdAt?.toDate
                          ? o.createdAt.toDate().toLocaleString("es-MX")
                          : ""}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-700">
                        ${o.total}
                      </p>
                      <span
                        className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                          o.status
                        )}`}
                      >
                        {o.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">
                    {o.items
                      ?.map((it) => `${it.quantity}x ${it.name}`)
                      .join(" • ")}
                  </p>

                  <div className="flex flex-wrap gap-2 border-t pt-3">
                    {o.status === "confirmado" && (
                      <>
                        <button
                          onClick={() =>
                            updateOrderStatus(o.id, "preparando")
                          }
                          disabled={updatingOrderId === o.id}
                          className="px-3 py-1.5 rounded-full text-xs bg-amber-100 hover:bg-amber-200"
                        >
                          Preparar
                        </button>
                        <button
                          onClick={() =>
                            updateOrderStatus(o.id, "cancelado")
                          }
                          disabled={updatingOrderId === o.id}
                          className="px-3 py-1.5 rounded-full text-xs bg-red-100 text-red-700 hover:bg-red-200"
                        >
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
                          className="px-3 py-1.5 rounded-full text-xs bg-emerald-100 hover:bg-emerald-200"
                        >
                          Listo para recoger
                        </button>
                        <button
                          onClick={() =>
                            updateOrderStatus(o.id, "cancelado")
                          }
                          disabled={updatingOrderId === o.id}
                          className="px-3 py-1.5 rounded-full text-xs bg-red-100 text-red-700 hover:bg-red-200"
                        >
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
                        className="px-3 py-1.5 rounded-full text-xs bg-gray-100 hover:bg-gray-200"
                      >
                        Entregado
                      </button>
                    )}

                    {(o.status === "entregado" ||
                      o.status === "cancelado") && (
                      <span className="text-xs text-gray-400">
                        Sin acciones
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;