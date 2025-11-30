// src/components/EditProfileScreen.jsx
import React, { useState } from "react";
import {
  ChevronRight,
  Camera,
  Trash2,
  Lock,
  Mail,
  Phone,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { db } from "../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { uploadImage } from "../utils/cloudinaryUpload";
import {
  getAuth,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

const EditProfileScreen = ({ setCurrentView, showNotificationMessage }) => {
  const { user, profile } = useAuth();

  const [name, setName] = useState(profile?.name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [photo, setPhoto] = useState(profile?.photoURL || "");
  const [uploading, setUploading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);

  const hasProfileChanges =
    (name && name !== profile?.name) ||
    (phone && phone !== profile?.phone) ||
    (photo && photo !== profile?.photoURL);

  const hasPasswordIntent =
    currentPassword.length > 0 ||
    newPassword.length > 0 ||
    confirmPassword.length > 0;

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadImage(file);
      setPhoto(url);
      showNotificationMessage("Foto actualizada ✔");
    } catch (err) {
      console.error(err);
      showNotificationMessage("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto("");
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      const userRef = doc(db, "users", user.uid);
      const updates = {};

      if (name && name !== profile?.name) updates.name = name;
      if (phone && phone !== profile?.phone) updates.phone = phone;
      if (photo && photo !== profile?.photoURL) updates.photoURL = photo;
      if (!photo && profile?.photoURL) updates.photoURL = "";

      if (Object.keys(updates).length > 0) {
        await updateDoc(userRef, updates);
      }

      if (hasPasswordIntent) {
        if (!currentPassword || !newPassword || !confirmPassword) {
          showNotificationMessage(
            "Para cambiar la contraseña llena los tres campos."
          );
          setSaving(false);
          return;
        }

        if (newPassword.length < 6) {
          showNotificationMessage(
            "La nueva contraseña debe tener al menos 6 caracteres."
          );
          setSaving(false);
          return;
        }

        if (newPassword !== confirmPassword) {
          showNotificationMessage("Las contraseñas no coinciden.");
          setSaving(false);
          return;
        }

        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser?.email) {
          const credential = EmailAuthProvider.credential(
            currentUser.email,
            currentPassword
          );
          await reauthenticateWithCredential(currentUser, credential);
          await updatePassword(currentUser, newPassword);
        }
      }

      if (!hasProfileChanges && !hasPasswordIntent) {
        showNotificationMessage("No hay cambios para guardar.");
        setSaving(false);
        return;
      }

      showNotificationMessage("Perfil actualizado correctamente ✔");
      setCurrentView("profile");
    } catch (err) {
      console.error(err);
      showNotificationMessage("Error al actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50">
      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setCurrentView("profile")}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <ChevronRight size={24} className="rotate-180 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Perfil</h1>
            <p className="text-sm text-gray-500">
              Actualiza tu información y foto de perfil
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* FOTO DE PERFIL */}
        <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center">
          <div className="relative group">
            <img
              src={photo || "/default-avatar.png"}
              alt="Foto de perfil"
              className="w-40 h-40 rounded-full object-cover border-4 border-emerald-600 shadow-xl group-hover:scale-105 transition-all"
            />

            <label className="absolute bottom-1 right-1 bg-emerald-700 hover:bg-emerald-800 p-2 rounded-full cursor-pointer text-white shadow-lg flex items-center justify-center">
              <Camera size={18} />
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageUpload}
              />
            </label>

            {photo && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute top-1 right-14 bg-white/90 hover:bg-red-50 border border-red-200 text-red-600 p-1.5 rounded-full shadow flex items-center justify-center"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Sube una foto cuadrada para que se vea mejor en la burbuja de
            perfil.
          </p>
          {uploading && (
            <p className="mt-1 text-xs text-gray-400">Subiendo foto...</p>
          )}
        </div>

        {/* DATOS BÁSICOS */}
        <div className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Información personal
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                <Mail size={16} className="text-emerald-600" />
                Correo electrónico
              </label>
              <input
                value={profile?.email || user?.email || ""}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                <Phone size={16} className="text-emerald-600" />
                Teléfono
              </label>
              <input
                maxLength={10}
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, ""))
                }
                placeholder="4771234567"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Nombre completo
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre como te gustaría verlo en la app"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* SEGURIDAD / CONTRASEÑA */}
        <div className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Lock size={20} className="text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-900">
              Seguridad de la cuenta
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Si no deseas cambiar tu contraseña, deja estos campos vacíos.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Contraseña actual
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Nueva contraseña
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Confirmar nueva contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Repite la nueva contraseña"
              />
            </div>
          </div>
        </div>

        {/* BOTÓN GUARDAR */}
        <div className="pb-10">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-emerald-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {saving ? "Guardando cambios..." : "Guardar Cambios"}
          </button>
          <p className="mt-2 text-xs text-gray-500 text-center">
            Sólo se actualizarán los campos que hayas modificado.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditProfileScreen;