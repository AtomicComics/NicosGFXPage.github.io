// auth.js
import { auth, db } from "./firebase.js";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { 
  doc, 
  setDoc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const provider = new GoogleAuthProvider();

// Redirect rules
const path = window.location.pathname;

function redirectToLogin() {
  if (!path.includes("login.html")) {
    window.location.href = "login.html";
  }
}

function redirectToHome() {
  if (path.includes("login.html")) {
    window.location.href = "index.html";
  }
}

// Login button (only on login.html)
const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.onclick = () => signInWithPopup(auth, provider);
}

// Auth state
onAuthStateChanged(auth, async user => {
  if (!user) {
    redirectToLogin();
    return;
  }

  redirectToHome();

  // Create user doc if missing
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      displayName: user.displayName,
      avatar: user.photoURL,
      status: "online"
    });
  }

  // Export user data globally for other scripts
  window.currentUser = user;
});
