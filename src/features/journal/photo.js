const MAX_SIDE = 720;
const QUALITY = 0.7;

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image decode failed"));
    image.src = dataUrl;
  });
}

function shrink(image) {
  const scale = Math.min(1, MAX_SIDE / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", QUALITY);
}

export async function readShrunkPhoto(file) {
  const dataUrl = await toDataUrl(file);
  const image = await loadImage(dataUrl);
  return shrink(image);
}

export function mountPhotoField() {
  const input = document.querySelector("[data-photo-input]");
  const preview = document.querySelector("[data-photo-preview]");
  const image = document.querySelector("[data-photo-image]");
  const removeBtn = document.querySelector("[data-photo-remove]");
  let value = "";

  function show() {
    preview.hidden = !value;
    if (value) image.src = value;
  }

  input.addEventListener("change", async () => {
    const file = input.files[0];
    if (!file) return;
    value = await readShrunkPhoto(file);
    show();
  });

  removeBtn.addEventListener("click", () => {
    value = "";
    input.value = "";
    show();
  });

  return {
    get: () => value,
    set: (next) => {
      value = next ?? "";
      input.value = "";
      show();
    },
  };
}
