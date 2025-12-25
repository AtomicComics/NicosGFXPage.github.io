// Firebase imports (same as before)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyD0vxLt9Lp_aY74FysXTvCSPrzehweZ_r8",
  authDomain: "nico-s-gfx-page.firebaseapp.com",
  projectId: "nico-s-gfx-page",
  storageBucket: "nico-s-gfx-page.appspot.com", // ✅ FIXED
  messagingSenderId: "427573612616",
  appId: "1:427573612616:web:9ba5b99f191a154cb6887d",
  measurementId: "G-DJJ66RY3ST"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const titleEl = document.getElementById('title');
const descEl = document.getElementById('description');
const priceEl = document.getElementById('price');
const imageEl = document.getElementById('image');
const postBtn = document.getElementById('postService');
const servicesList = document.getElementById('servicesList');

// Post service
postBtn.addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user) return alert("Please log in first");

  let imageURL = null;
  const file = imageEl.files[0];
  if (file) {
    const storageRef = ref(storage, `services/${user.uid}_${Date.now()}`);
    await uploadBytes(storageRef, file);
    imageURL = await getDownloadURL(storageRef);
  }

  await addDoc(collection(db, "services"), {
    ownerUID: user.uid,
    title: titleEl.value,
    description: descEl.value,
    price: parseFloat(priceEl.value),
    imageURL,
    createdAt: new Date()
  });

  alert("Service posted!");
  loadServices();
});

// Load services (community feed)
async function loadServices() {
  servicesList.innerHTML = "";
  const q = query(collection(db, "services"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  snap.forEach(docSnap => {
    const data = docSnap.data();
    const card = document.createElement('div');
    card.className = "service-card";
    card.innerHTML = `
      <h4>${data.title}</h4>
      <p>${data.description}</p>
      <p><strong>Price:</strong> $${data.price}</p>
      ${data.imageURL ? `<img src="${data.imageURL}" width="200">` : ""}
    `;
    servicesList.appendChild(card);
  });
}

loadServices();