import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";

// Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Init Firebase
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

// Listen for auth state
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
  } else {
    loginStatus.textContent = "Not logged in.";
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
    lastActive: new Date()
  }, { merge: true });

  // Update preview
  usernameDisplay.textContent = user.displayName;
  bioDisplay.textContent = bioEl.value;
  if (avatarURL) avatarPreview.src = avatarURL;

  alert("Profile saved!");
});