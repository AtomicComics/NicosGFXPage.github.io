// Debug message
document.body.insertAdjacentHTML("afterbegin", "<p style='color:yellow'>Profile.js loaded ✅</p>");

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD0vxLt9Lp_aY74FysXTvCSPrzehweZ_r8",
  authDomain: "nico-s-gfx-page.firebaseapp.com",   // ✅ correct
  projectId: "nico-s-gfx-page",
  storageBucket: "nico-s-gfx-page.appspot.com",    // ✅ correct
  messagingSenderId: "427573612616",
  appId: "1:427573612616:web:9ba5b99f191a154cb6887d",
  measurementId: "G-DJJ66RY3ST"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const bioEl = document.getElementById('bio');
const saveBtn = document.getElementById('saveProfile');
const loginStatus = document.getElementById('loginStatus');
const usernameDisplay = document.getElementById('usernameDisplay');
const bioDisplay = document.getElementById('bioDisplay');

const provider = new GoogleAuthProvider();

// Detect login
onAuthStateChanged(auth, async user => {
  if (user) {
    loginStatus.textContent = `✅ Logged in as: ${user.displayName}`;
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      bioEl.value = data.bio || "";
      usernameDisplay.textContent = data.displayName || user.displayName; // ✅ shows Nico_ if set
      bioDisplay.textContent = data.bio || "";
      if (data.avatar) avatarPreview.src = data.avatar;
    } else {
      usernameDisplay.textContent = user.displayName;
    }
  } else {
    loginStatus.textContent = "⚠️ Not logged in.";
    const loginBtn = document.createElement('a');
    loginBtn.textContent = 'Login with Google';
    loginBtn.className = 'btn-xl secondary';
    loginBtn.onclick = () => signInWithPopup(auth, provider);
    document.querySelector('.panel').prepend(loginBtn);
  }
});

// Save profile
saveBtn.addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user) return alert("Please log in first");

  await setDoc(doc(db, "users", user.uid), {
    displayName: user.displayName,
    bio: bioEl.value
  }, { merge: true });

  bioDisplay.textContent = bioEl.value;
  alert("✅ Profile saved!");
});