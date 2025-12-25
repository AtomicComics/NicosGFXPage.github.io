  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
  import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
  import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const firebaseConfig = { apiKey: "AIzaSyD0vxLt9Lp_aY74FysXTvCSPrzehweZ_r8", authDomain: "nico-s-gfx-page.firebaseapp.com", projectId: "nico-s-gfx-page", storageBucket: "nico-s-gfx-page.appspot.com", messagingSenderId: "427573612616", appId: "1:427573612616:web:9ba5b99f191a154cb6887d", measurementId: "G-DJJ66RY3ST" };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const provider = new GoogleAuthProvider();
  const userArea = document.getElementById('userArea');

  let currentStatus = "online"; // default

  function renderStatus(name) {
    userArea.innerHTML = `
      <strong>${name}</strong>
      <select id="statusSelect" style="margin-left:10px">
        <option value="online" ${currentStatus==="online"?"selected":""}>Online</option>
        <option value="offline" ${currentStatus==="offline"?"selected":""}>Offline</option>
        <option value="dnd" ${currentStatus==="dnd"?"selected":""}>Do Not Disturb</option>
      </select>
    `;
    document.getElementById('statusSelect').addEventListener('change', async e => {
      currentStatus = e.target.value;
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, "users", user.uid), { status: currentStatus }, { merge: true });
      }
    });
  }

  onAuthStateChanged(auth, async user => {
    if (user) {
      const snap = await getDoc(doc(db, "users", user.uid));
      const name = snap.exists() ? snap.data().displayName : user.displayName;
      renderStatus(name);
    } else {
      const loginBtn = document.createElement('a');
      loginBtn.textContent = 'Login with Google';
      loginBtn.className = 'btn secondary';
      loginBtn.onclick = () => signInWithPopup(auth, provider);
      userArea.innerHTML = '';
      userArea.appendChild(loginBtn);
    }
  });
