// src/utils/cloudinaryUpload.js
export const CLOUDINARY_CLOUD_NAME = "bubba-rincon";
export const CLOUDINARY_UPLOAD_PRESET = "bubba_unsigned";

export const CLOUDINARY_UPLOAD_URL =
  `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!data.secure_url) {
    throw new Error("Error al subir imagen a Cloudinary");
  }

  return data.secure_url;
}