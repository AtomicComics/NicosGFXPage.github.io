import { auth, db, storage } from "./firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";

const OWNER_UID = "wkvXWASufnVDcd5HzTsPfyN28Im2"; // set this later for admin panel

// DOM refs
const loginStatus = document.getElementById("loginStatus");

const displayNameInput = document.getElementById("displayName");
const permanentNameInput = document.getElementById("permanentName");
const bioInput = document.getElementById("bio");
const avatarInput = document.getElementById("avatar");
const discordInput = document.getElementById("discord");
const instagramInput = document.getElementById("instagram");
const robloxInput = document.getElementById("robloxUser");

const saveProfileBtn = document.getElementById("saveProfile");

const displayNamePreview = document.getElementById("displayNamePreview");
const permanentNameDisplay = document.getElementById("permanentNameDisplay");
const bioPreview = document.getElementById("bioPreview");
const discordPreview = document.getElementById("discordPreview");
const instagramPreview = document.getElementById("instagramPreview");
const robloxBadge = document.getElementById("robloxBadge");
const titleBadge = document.getElementById("titleBadge");
const avatarPreview = document.getElementById("avatarPreview");

const adminPanel = document.getElementById("adminPanel");
const adminUserList = document.getElementById("adminUserList");
const reviewsList = document.getElementById("reviewsList");

// Helper: permanent name uniqueness
async function isPermanentNameAvailable(name, currentUid) {
  const q = query(collection(db, "users"), where("permanentName", "==", name));
  const snap = await getDocs(q);
  if (snap.empty) return true;
  if (snap.size === 1 && snap.docs[0].id === currentUid) return true;
  return false;
}

// Load reviews for current user
async function loadUserReviews(targetUid) {
  const q = query(
    collection(db, "reviews"),
    where("targetUid", "==", targetUid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  reviewsList.innerHTML = "";
  snap.forEach(docSnap => {
    const r = docSnap.data();
    const stars = "★".repeat(r.rating || 0) + "☆".repeat(5 - (r.rating || 0));
    const div = document.createElement("div");
    div.className = "review";
    div.innerHTML = `
      <div class="review-author">${r.authorName || r.authorEmail || "Unknown"} – 
        <span class="small">${stars}</span>
      </div>
      <div class="review-text">${r.text || ""}</div>
    `;
    reviewsList.appendChild(div);
  });
}

// Load admin list
async function loadAdminUsers() {
  const snap = await getDocs(collection(db, "users"));
  adminUserList.innerHTML = "";
  snap.forEach(docSnap => {
    const data = docSnap.data();
    const row = document.createElement("div");
    row.className = "admin-user-row";
    const label = document.createElement("span");
    label.textContent = data.displayName || data.permanentName || data.email || docSnap.id;
    const btn = document.createElement("button");
    btn.textContent = data.title ? `Edit (${data.title})` : "Set Title";
    btn.addEventListener("click", async () => {
      const newTitle = prompt("Enter title (e.g. OWNER, MOD, VIP):", data.title || "");
      if (!newTitle) return;
      await updateDoc(doc(db, "users", docSnap.id), { title: newTitle });
      alert("Title updated.");
      loadAdminUsers();
    });
    row.appendChild(label);
    row.appendChild(btn);
    adminUserList.appendChild(row);
  });
}

// Auth + initial load
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  loginStatus.textContent = `Logged in as: ${user.email}`;

  const userRef = doc(db, "users", user.uid);
  let snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "",
      permanentName: "",
      bio: "",
      discord: "",
      instagram: "",
      robloxUser: "",
      avatarUrl: "",
      status: "online",
      createdAt: serverTimestamp()
    });
    snap = await getDoc(userRef);
  }

  const data = snap.data();

  // Fill form
  displayNameInput.value = data.displayName || "";
  permanentNameInput.value = data.permanentName || "";
  bioInput.value = data.bio || "";
  discordInput.value = data.discord || "";
  instagramInput.value = data.instagram || "";
  robloxInput.value = data.robloxUser || "";

  // Set preview
  displayNamePreview.textContent = data.displayName || "Display Name";
  permanentNameDisplay.textContent = data.permanentName || "PermanentName";
  bioPreview.textContent = data.bio || "Your bio will show here.";
  discordPreview.textContent = data.discord ? `Discord: ${data.discord}` : "";
  instagramPreview.textContent = data.instagram ? `Instagram: ${data.instagram}` : "";

  if (data.robloxUser) {
    robloxBadge.style.display = "inline-block";
    robloxBadge.textContent = data.robloxUser;
  } else {
    robloxBadge.style.display = "none";
  }

  if (data.title) {
    titleBadge.style.display = "inline-block";
    titleBadge.textContent = data.title.toUpperCase();
  } else {
    titleBadge.style.display = "none";
  }

  if (data.avatarUrl) {
    avatarPreview.src = data.avatarUrl;
  }

  // Admin
  if (user.uid === OWNER_UID) {
    adminPanel.style.display = "block";
    loadAdminUsers().catch(console.error);
  }

  // Reviews
  loadUserReviews(user.uid).catch(console.error);
});

// Live preview bindings
displayNameInput.addEventListener("input", () => {
  displayNamePreview.textContent = displayNameInput.value.trim() || "Display Name";
});

permanentNameInput.addEventListener("input", () => {
  permanentNameDisplay.textContent = permanentNameInput.value.trim() || "PermanentName";
});

bioInput.addEventListener("input", () => {
  bioPreview.textContent = bioInput.value.trim() || "Your bio will show here.";
});

discordInput.addEventListener("input", () => {
  const v = discordInput.value.trim();
  discordPreview.textContent = v ? `Discord: ${v}` : "";
});

instagramInput.addEventListener("input", () => {
  const v = instagramInput.value.trim();
  instagramPreview.textContent = v ? `Instagram: ${v}` : "";
});

robloxInput.addEventListener("input", () => {
  const v = robloxInput.value.trim();
  if (v) {
    robloxBadge.style.display = "inline-block";
    robloxBadge.textContent = v;
  } else {
    robloxBadge.style.display = "none";
  }
});

// Avatar preview
avatarInput.addEventListener("change", () => {
  const file = avatarInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    avatarPreview.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

// Save button
saveProfileBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  const data = snap.exists() ? snap.data() : {};

  const newDisplayName = displayNameInput.value.trim();
  const newPermanentName = permanentNameInput.value.trim();
  const newBio = bioInput.value.trim();
  const newDiscord = discordInput.value.trim();
  const newInstagram = instagramInput.value.trim();
  const newRoblox = robloxInput.value.trim();

  const updateData = {
    displayName: newDisplayName,
    bio: newBio,
    discord: newDiscord,
    instagram: newInstagram,
    robloxUser: newRoblox,
    updatedAt: serverTimestamp()
  };

  // Permanent name logic: unique + cooldown
  const now = Date.now();
  const lastChanged = data.permanentNameLastChanged || 0;
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  if (newPermanentName && newPermanentName !== data.permanentName) {
    if (data.permanentName && now - lastChanged < sevenDays) {
      alert("You can only change your permanent name once every 7 days.");
    } else {
      const available = await isPermanentNameAvailable(newPermanentName, user.uid);
      if (!available) {
        alert("That permanent name is already taken.");
      } else {
        updateData.permanentName = newPermanentName;
        updateData.permanentNameLastChanged = now;
      }
    }
  }

  // Avatar upload
  if (avatarInput.files && avatarInput.files[0]) {
    const file = avatarInput.files[0];
    const storageRef = ref(storage, `avatars/${user.uid}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    updateData.avatarUrl = url;
    avatarPreview.src = url;
  }

  await updateDoc(userRef, updateData);

  // Update preview (in case some values were reverted by logic)
  displayNamePreview.textContent = newDisplayName || "Display Name";
  if (updateData.permanentName) {
    permanentNameDisplay.textContent = updateData.permanentName;
  }
  bioPreview.textContent = newBio || "Your bio will show here.";
  discordPreview.textContent = newDiscord ? `Discord: ${newDiscord}` : "";
  instagramPreview.textContent = newInstagram ? `Instagram: ${newInstagram}` : "";
  if (newRoblox) {
    robloxBadge.style.display = "inline-block";
    robloxBadge.textContent = newRoblox;
  } else {
    robloxBadge.style.display = "none";
  }

  alert("Profile saved.");
});
