// ==============================
//  MODE CONNECTÉ / DÉCONNECTÉ
// ==============================

const API_BASE_URL = "http://localhost:5678/api";

const token = sessionStorage.getItem("token");

const editBar = document.querySelector("#editBar");
const loginLink = document.querySelector("#loginLink");
const logoutLink = document.querySelector("#logoutLink");
const editProjectsBtn = document.querySelector("#editProjectsBtn");
const filters = document.querySelector(".filters");

if (token) {
  if (editBar) editBar.style.display = "block";
  if (loginLink) loginLink.style.display = "none";
  if (logoutLink) logoutLink.style.display = "inline";
  if (editProjectsBtn) editProjectsBtn.style.display = "inline-block";

  
  if (filters) filters.style.display = "none";
} else {
  if (editBar) editBar.style.display = "none";
  if (loginLink) loginLink.style.display = "inline";
  if (logoutLink) logoutLink.style.display = "none";
  if (editProjectsBtn) editProjectsBtn.style.display = "none";

  if (filters) filters.style.display = "flex";
}

if (logoutLink) {
  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    sessionStorage.clear();
    window.location.href = "index.html";
  });
}

// ==============================
//  PROJETS (API) + FILTRES
// ==============================

const gallery = document.querySelector(".gallery");
const buttons = document.querySelectorAll(".filter-btn");

let allWorks = [];

async function getWorks() {
  const res = await fetch(`${API_BASE_URL}/works`);
  if (!res.ok) throw new Error(`Impossible de récupérer les projets (${res.status})`);
  return res.json();
}

async function getCategories() {
  const res = await fetch(`${API_BASE_URL}/categories`);
  if (!res.ok) throw new Error(`Impossible de récupérer les catégories (${res.status})`);
  return res.json();
}

function renderGallery(list) {
  if (!gallery) return;
  gallery.innerHTML = "";

  list.forEach((work) => {
    const figure = document.createElement("figure");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = work.title;

    figure.appendChild(img);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
  });
}

function setupFilters() {
  if (!buttons || buttons.length === 0) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const category = btn.dataset.category; // "all" ou "1"/"2"/"3"

      if (category === "all") {
        renderGallery(allWorks);
        return;
      }

      const categoryId = Number(category);
      const filtered = allWorks.filter((w) => w.categoryId === categoryId);
      renderGallery(filtered);
    });
  });
}

// ==============================
//  MODALE (OC) : Galerie + Ajout
// ==============================

const modalOverlay = document.querySelector("#modalOverlay");
const modalCloseBtn = document.querySelector("#modalCloseBtn");
const modalBackBtn = document.querySelector("#modalBackBtn");
const modalTitle = document.querySelector("#modalTitle");

const modalGalleryView = document.querySelector("#modalGalleryView");
const modalAddView = document.querySelector("#modalAddView");

const modalGallery = document.querySelector("#modalGallery");
const openAddPhotoBtn = document.querySelector("#openAddPhotoBtn");

const addPhotoForm = document.querySelector("#addPhotoForm");
const photoInput = document.querySelector("#photoInput");
const uploadPreview = document.querySelector("#uploadPreview");
const uploadPlaceholder = document.querySelector("#uploadPlaceholder");
const photoTitle = document.querySelector("#photoTitle");
const photoCategory = document.querySelector("#photoCategory");
const validateAddBtn = document.querySelector("#validateAddBtn");

let categoriesCache = [];

function openModal() {
  if (!modalOverlay) return;
  modalOverlay.style.display = "flex";
  modalOverlay.setAttribute("aria-hidden", "false");
  showGalleryView();
  renderModalGallery();
}

function closeModal() {
  if (!modalOverlay) return;
  modalOverlay.style.display = "none";
  modalOverlay.setAttribute("aria-hidden", "true");
}

function showGalleryView() {
  if (modalGalleryView) modalGalleryView.style.display = "block";
  if (modalAddView) modalAddView.style.display = "none";
  if (modalBackBtn) modalBackBtn.style.visibility = "hidden";
  if (modalTitle) modalTitle.textContent = "Galerie photo";
}

function showAddView() {
  if (modalGalleryView) modalGalleryView.style.display = "none";
  if (modalAddView) modalAddView.style.display = "block";
  if (modalBackBtn) modalBackBtn.style.visibility = "visible";
  if (modalTitle) modalTitle.textContent = "Ajout photo";
}

function resetAddForm() {
  if (addPhotoForm) addPhotoForm.reset();
  if (uploadPreview) {
    uploadPreview.src = "";
    uploadPreview.style.display = "none";
  }
  if (uploadPlaceholder) uploadPlaceholder.style.display = "block";
  if (validateAddBtn) validateAddBtn.disabled = true;
}

function computeAddFormValidity() {
  const fileOk = photoInput?.files && photoInput.files[0];
  const titleOk = photoTitle?.value?.trim().length > 0;
  const catOk = photoCategory?.value?.trim().length > 0;

  if (validateAddBtn) validateAddBtn.disabled = !(fileOk && titleOk && catOk);
}

function renderModalGallery() {
  if (!modalGallery) return;
  modalGallery.innerHTML = "";

  allWorks.forEach((work) => {
    const item = document.createElement("div");
    item.className = "modal-item";

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const trash = document.createElement("button");
    trash.type = "button";
    trash.className = "trash-btn";
    trash.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    trash.addEventListener("click", async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/works/${work.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Suppression impossible (${res.status})`);

        // refresh
        allWorks = await getWorks();
        renderGallery(allWorks);
        renderModalGallery();
      } catch (err) {
        console.error(err);
        alert("Impossible de supprimer ce projet.");
      }
    });

    item.appendChild(trash);
    item.appendChild(img);
    modalGallery.appendChild(item);
  });
}

async function ensureCategoriesLoaded() {
  if (categoriesCache.length > 0) return;
  categoriesCache = await getCategories();

  if (!photoCategory) return;
  // options
  photoCategory.innerHTML = '<option value=""> </option>';
  categoriesCache.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = String(cat.id);
    opt.textContent = cat.name;
    photoCategory.appendChild(opt);
  });
}

// Ouverture de la modale via "modifier" (uniquement si connecté)
if (editProjectsBtn && token) {
  editProjectsBtn.addEventListener("click", async () => {
    try {
      // Toujours rafraîchir les works au moment d'ouvrir
      allWorks = await getWorks();
      renderGallery(allWorks);
      openModal();
    } catch (err) {
      console.error(err);
      alert("Impossible de charger les projets.");
    }
  });
}

if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
if (modalBackBtn) modalBackBtn.addEventListener("click", () => {
  showGalleryView();
  resetAddForm();
});

// fermer en cliquant sur l'overlay
if (modalOverlay) {
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}

// fermer au clavier
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalOverlay?.style.display === "flex") {
    closeModal();
  }
});

if (openAddPhotoBtn) {
  openAddPhotoBtn.addEventListener("click", async () => {
    try {
      await ensureCategoriesLoaded();
      resetAddForm();
      showAddView();
    } catch (err) {
      console.error(err);
      alert("Impossible de charger les catégories.");
    }
  });
}

if (photoInput) {
  photoInput.addEventListener("change", () => {
    const file = photoInput.files?.[0];
    if (!file) {
      computeAddFormValidity();
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Veuillez choisir une image.");
      photoInput.value = "";
      computeAddFormValidity();
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (uploadPreview) {
        uploadPreview.src = String(evt.target?.result || "");
        uploadPreview.style.display = "block";
      }
      if (uploadPlaceholder) uploadPlaceholder.style.display = "none";
    };
    reader.readAsDataURL(file);

    computeAddFormValidity();
  });
}

if (photoTitle) photoTitle.addEventListener("input", computeAddFormValidity);
if (photoCategory) photoCategory.addEventListener("change", computeAddFormValidity);

if (addPhotoForm) {
  addPhotoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!token) return;

    const file = photoInput?.files?.[0];
    const title = photoTitle?.value?.trim();
    const category = photoCategory?.value?.trim();

    if (!file || !title || !category) return;

    try {
      const payload = new FormData();
      payload.append("image", file);
      payload.append("title", title);
      payload.append("category", category);

      const res = await fetch(`${API_BASE_URL}/works`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });

      if (!res.ok) throw new Error(`Ajout impossible (${res.status})`);

      // Refresh works
      allWorks = await getWorks();
      renderGallery(allWorks);

      // Retour modale galerie
      showGalleryView();
      renderModalGallery();
      closeModal();
      resetAddForm();
    } catch (err) {
      console.error(err);
      alert("Impossible d'ajouter la photo. Vérifie le backend et le token.");
    }
  });
}

// ==============================
//  INIT
// ==============================

(async function init() {
  try {
    allWorks = await getWorks();
    renderGallery(allWorks);
    setupFilters();
  } catch (err) {
    console.error(err);
    // fallback simple : on n'affiche rien si l'API est off
  }
})();
