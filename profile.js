document.body.insertAdjacentHTML("afterbegin", "<p style='color:yellow'>Profile.js loaded!</p>");
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
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

const bioEl = document.getElementById('bio');
const avatarEl = document.getElementById('avatar');
const saveBtn = document.getElementById('saveProfile');
const loginStatus = document.getElementById('loginStatus');

const usernameDisplay = document.getElementById('usernameDisplay');
const bioDisplay = document.getElementById('bioDisplay');
const avatarPreview = document.getElementById('avatarPreview');

const provider = new GoogleAuthProvider();

// Detect login state
onAuthStateChanged(auth, async user => {
  if (user) {
    loginStatus.textContent = `Logged in as: ${user.displayName}`;
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      bioEl.value = data.bio || "";
      usernameDisplay.textContent = data.displayName || user.displayName;
      bioDisplay.textContent = data.bio || "";
      if (data.avatar) avatarPreview.src = data.avatar;
    } else {
      usernameDisplay.textContent = user.displayName;
    }

    // Mark user online
    await updateDoc(userRef, { status: "online", lastActive: new Date() }).catch(() => {});
  } else {
    loginStatus.textContent = "Not logged in.";
    const loginBtn = document.createElement('a');
    loginBtn.textContent = 'Login with Google';
    loginBtn.className = 'btn-xl secondary';
    loginBtn.onclick = () => signInWithPopup(auth, provider);
    document.querySelector('.panel').prepend(loginBtn);
  }
});

// Save profile info
saveBtn.addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user) return alert("Please log in first");

  const userRef = doc(db, "users", user.uid);
  let avatarURL = null;

  const file = avatarEl.files[0];
  if (file) {
    const storageRef = ref(storage, `avatars/${user.uid}`);
    await uploadBytes(storageRef, file);
    avatarURL = await getDownloadURL(storageRef);
  }

  await setDoc(userRef, {
    displayName: user.displayName,
    bio: bioEl.value,
    avatar: avatarURL || avatarPreview.src || null,
    status: "online",
    lastActive: new Date()
  }, { merge: true });

  // Update preview immediately
  usernameDisplay.textContent = user.displayName;
  bioDisplay.textContent = bioEl.value;
  if (avatarURL) avatarPreview.src = avatarURL;

  alert("Profile saved!");
});