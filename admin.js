
// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyApjTiGG52lp6CiYqwUwMC7pIkcei71nqs",
  authDomain: "kiosk-c57de.firebaseapp.com",
  databaseURL: "https://kiosk-c57de-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kiosk-c57de",
  storageBucket: "kiosk-c57de.firebasestorage.app",
  messagingSenderId: "782877561691",
  appId: "1:782877561691:web:b2dca313d9ce27c238407e"
};

const ADMIN_UID = "T8c660OJKEdxeL82mIGWHj9gkgh2";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const database = firebase.database();

const message = document.getElementById("admin-message");
const ordersArea = document.getElementById("orders-area");

document.getElementById("login-button").addEventListener("click", async () => {
  const email = document.getElementById("admin-email").value.trim();
  const password = document.getElementById("admin-password").value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (error) {
    message.textContent = "로그인 실패: " + error.message;
  }
});

auth.onAuthStateChanged(user => {
  if (!user) {
    message.textContent = "관리자 로그인이 필요합니다.";
    ordersArea.replaceChildren();
    return;
  }

  if (user.uid !== ADMIN_UID) {
    message.textContent = "관리자 권한이 없습니다.";
    auth.signOut();
    return;
  }

  message.textContent = "관리자 로그인 성공!";
  document.getElementById("login-area").style.display = "none";

  loadOrders();
});

function loadOrders() {
  database.ref("orders").on("value", snapshot => {
    ordersArea.replaceChildren();

    if (!snapshot.exists()) {
      ordersArea.textContent = "접수된 주문이 없습니다.";
      return;
    }

    snapshot.forEach(child => {
      const order = child.val();

      const card = document.createElement("article");
      const heading = document.createElement("h3");
      heading.textContent = "주문 번호: " + order.orderNumber;

      const details = document.createElement("p");
      details.textContent =
        (order.items || []).map(item =>
          item.name + " x " + item.quantity
        ).join(", ");

      const total = document.createElement("p");
      total.textContent = "결제 금액: " + order.total + "원";

      const status = document.createElement("p");
      status.textContent = "상태: " + order.status;

      const button = document.createElement("button");
      button.textContent = "제조 완료 처리";

      button.addEventListener("click", async () => {
        try {
          await database.ref("orders/" + child.key + "/status")
            .set("제조 완료");
          message.textContent = "주문 상태가 변경되었습니다.";
        } catch (error) {
          message.textContent = "상태 변경 실패: " + error.message;
        }
      });

      card.append(heading, details, total, status, button);
      ordersArea.appendChild(card);
    });
  }, error => {
    message.textContent = "주문 목록 조회 실패: " + error.message;
  });
}
