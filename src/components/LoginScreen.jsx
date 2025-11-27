import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const LoginScreen = ({ setCurrentView, showNotificationMessage }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "El correo es requerido";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Correo inválido";

    if (!formData.password) newErrors.password = "La contraseña es requerida";
    else if (formData.password.length < 6) newErrors.password = "Mínimo 6 caracteres";

    if (!isLogin) {
      if (!formData.name) newErrors.name = "El nombre es requerido";
      if (!formData.phone) newErrors.phone = "El teléfono es requerido";
      else if (!/^\d{10}$/.test(formData.phone))
        newErrors.phone = "Debe tener 10 dígitos";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (isLogin) {
        const res = await login(formData.email, formData.password);
        if (!res.ok) throw new Error(res.error);
        showNotificationMessage("¡Bienvenido de nuevo!");
      } else {
        const res = await register(
          formData.name,
          formData.phone,
          formData.email,
          formData.password
        );
        if (!res.ok) throw new Error(res.error);
        showNotificationMessage("¡Cuenta creada exitosamente!");
      }

      setCurrentView("menu");
    } catch (error) {
      const firebaseCode = String(error.message).replace("Firebase:", "").trim();

      const loginErrors = [
        "auth/invalid-credential",
        "auth/invalid-email",
        "auth/user-not-found",
        "auth/wrong-password",
      ];

      if (loginErrors.includes(firebaseCode)) {
        showNotificationMessage("Credenciales incorrectas.");
      } else {
        const otherMessages = {
          "auth/email-already-in-use": "Este correo ya está registrado.",
          "auth/weak-password": "La contraseña es muy débil.",
        };

        showNotificationMessage(otherMessages[firebaseCode] || firebaseCode);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">🧋</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">La Bubba Express</h1>
          <p className="text-gray-600">Sistema de Pedidos en Línea</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex gap-2 mb-8 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => {
                setIsLogin(true);
                setErrors({});
              }}
              className={`flex-1 py-3 rounded-full font-semibold transition ${
                isLogin ? "bg-emerald-700 text-white" : "text-gray-600"
              }`}
            >
              Iniciar Sesión
            </button>

            <button
              onClick={() => {
                setIsLogin(false);
                setErrors({});
              }}
              className={`flex-1 py-3 rounded-full font-semibold transition ${
                !isLogin ? "bg-emerald-700 text-white" : "text-gray-600"
              }`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre Completo*
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={`w-full px-4 py-3 border ${
                      errors.name ? "border-red-500" : "border-gray-200"
                    } rounded-xl`}
                    placeholder="Juan Pérez García"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Teléfono*
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className={`w-full px-4 py-3 border ${
                      errors.phone ? "border-red-500" : "border-gray-200"
                    } rounded-xl`}
                    placeholder="4771234567"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs">{errors.phone}</p>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Correo Electrónico*
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`w-full px-4 py-3 border ${
                  errors.email ? "border-red-500" : "border-gray-200"
                } rounded-xl`}
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña*
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className={`w-full px-4 py-3 border ${
                  errors.password ? "border-red-500" : "border-gray-200"
                } rounded-xl`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-emerald-800 transition shadow-lg"
            >
              {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
            </button>
          </form>

          <button
            onClick={() => setCurrentView("intro")}
            className="w-full mt-4 text-gray-600 hover:text-gray-800 font-medium"
          >
            Continuar como invitado
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;