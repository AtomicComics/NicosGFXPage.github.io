import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "nico-s-gfx-page.firebaseapp.com",
  projectId: "nico-s-gfx-page",
  storageBucket: "nico-s-gfx-page.appspot.com",
  messagingSenderId: "427573612616",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const bioEl = document.getElementById('bio');
const avatarEl = document.getElementById('avatar');
const saveBtn = document.getElementById('saveProfile');
const usernameEl = document.getElementById('username');

const provider = new GoogleAuthProvider();

// Detect login
onAuthStateChanged(auth, async user => {
  if (user) {
    usernameEl.textContent = `Logged in as: ${user.displayName}`;
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      const data = snap.data();
      bioEl.value = data.bio || "";
    }
  } else {
    usernameEl.textContent = "Not logged in.";
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

  alert("Profile saved!");
});