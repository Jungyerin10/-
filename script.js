
// ==========================================
// 카페 키오스크 전체 JavaScript
// ==========================================

const ADMIN_UID = "T8c660OJKEdxeL82mIGWHj9gkgh2";

// 1. Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyApjTiGG52lp6CiYqwUwMC7pIkcei71nqs",
  authDomain: "kiosk-c57de.firebaseapp.com",
  databaseURL: "https://kiosk-c57de-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kiosk-c57de",
  storageBucket: "kiosk-c57de.firebasestorage.app",
  messagingSenderId: "782877561691",
  appId: "1:782877561691:web:b2dca313d9ce27c238407e"
};

let database = null;
let auth = null;
let authReady = null;

try {
  if (window.firebase) {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    database = firebase.database();
    auth = firebase.auth();

    authReady = auth.signInAnonymously()
      .then(() => {
        console.log("익명 로그인 성공!");
      })
      .catch(error => {
        console.error("익명 로그인 실패:", error);
        throw error;
      });
  }
} catch (error) {
  console.error("Firebase 연결 오류:", error);
}


// 2. 기본 상태
let cart = [];
let currentCategory = "전체";
let currentLanguage = "ko";
let orderType = "";
let currentOrder = null;
let isLargeText = false;


// 3. 가격 표시
function money(number) {
  return number.toLocaleString("ko-KR") + "원";
}


// 4. 메뉴 정보
const menus = [
  {
    id: 1,
    name: "아메리카노",
    category: "커피",
    price: 3500,
    description: "에스프레소에 물을 더해 깔끔하고 고소하게 즐기는 커피입니다.",
    translations: {
      en: ["Americano", "Coffee", "A clean and smooth espresso-based coffee."],
      zh: ["美式咖啡", "咖啡", "加入水的浓缩咖啡，口感清爽。"],
      ja: ["アメリカーノ", "コーヒー", "エスプレッソにお湯を加えたコーヒーです。"]
    },
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500"
  },
  {
    id: 2,
    name: "카페라떼",
    category: "커피",
    price: 4000,
    description: "에스프레소와 부드러운 우유가 어우러진 커피입니다.",
    translations: {
      en: ["Cafe Latte", "Coffee", "Espresso blended with smooth milk."],
      zh: ["拿铁咖啡", "咖啡", "浓缩咖啡与顺滑牛奶的组合。"],
      ja: ["カフェラテ", "コーヒー", "エスプレッソとミルクのコーヒーです。"]
    },
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500"
  },
  {
    id: 3,
    name: "바닐라라떼",
    category: "커피",
    price: 4500,
    description: "에스프레소와 우유에 달콤한 바닐라 향을 더한 커피입니다.",
    translations: {
      en: ["Vanilla Latte", "Coffee", "Espresso and milk with sweet vanilla flavor."],
      zh: ["香草拿铁", "咖啡", "加入香草风味的浓缩咖啡与牛奶。"],
      ja: ["バニララテ", "コーヒー", "バニラ風味のエスプレッソとミルクです。"]
    },
    image: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=500"
  },
  {
    id: 4,
    name: "딸기라떼",
    category: "음료",
    price: 4800,
    description: "달콤한 딸기와 우유가 어우러진 부드러운 음료입니다.",
    translations: {
      en: ["Strawberry Latte", "Drink", "A smooth drink made with strawberries and milk."],
      zh: ["草莓牛奶", "饮料", "由草莓和牛奶制成的饮品。"],
      ja: ["いちごラテ", "ドリンク", "イチゴとミルクを合わせた飲み物です。"]
    },
    image: "images/strawberry-latte.jpg"
  },
  {
    id: 5,
    name: "말차라떼",
    category: "음료",
    price: 4800,
    description: "말차 특유의 쌉싸름한 풍미와 우유의 부드러움을 느낄 수 있습니다.",
    translations: {
      en: ["Matcha Latte", "Drink", "A creamy drink with the gentle bitterness of matcha."],
      zh: ["抹茶拿铁", "饮料", "带有抹茶风味的奶饮。"],
      ja: ["抹茶ラテ", "ドリンク", "抹茶の風味とミルクのまろやかさを楽しめます。"]
    },
    image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=500"
  },
  {
    id: 6,
    name: "초코라떼",
    category: "음료",
    price: 4500,
    description: "초콜릿의 달콤하고 진한 맛을 우유와 함께 즐기는 음료입니다.",
    translations: {
      en: ["Chocolate Latte", "Drink", "A rich and sweet chocolate milk drink."],
      zh: ["巧克力牛奶", "饮料", "浓郁香甜的巧克力牛奶。"],
      ja: ["チョコラテ", "ドリンク", "チョコレートの甘い味わいを楽しめます。"]
    },
    image: "images/choco-latte.jpg"
  },
  {
    id: 7,
    name: "치즈케이크",
    category: "디저트",
    price: 5500,
    description: "크림치즈의 진한 풍미와 부드러운 식감이 특징인 디저트입니다.",
    translations: {
      en: ["Cheesecake", "Dessert", "A dessert with rich cream cheese flavor."],
      zh: ["芝士蛋糕", "甜点", "奶油奶酪风味浓郁的甜点。"],
      ja: ["チーズケーキ", "デザート", "クリームチーズの濃厚な風味が特徴です。"]
    },
    image: "https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=500"
  },
  {
    id: 8,
    name: "크루아상",
    category: "디저트",
    price: 3500,
    description: "겹겹이 쌓인 반죽을 구워 바삭한 겉면과 부드러운 속을 살린 빵입니다.",
    translations: {
      en: ["Croissant", "Dessert", "A flaky pastry with a crisp outside and soft inside."],
      zh: ["可颂面包", "甜点", "外层酥脆、内部柔软的面包。"],
      ja: ["クロワッサン", "デザート", "外はサクサク、中はふんわりしたパンです。"]
    },
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500"
  },
  {
    id: 9,
    name: "아샷추",
    category: "음료",
    price: 4000,
    description: "아이스티에 에스프레소 샷을 더한 음료입니다.",
    translations: {
      en: ["Iced Tea with Espresso", "Drink", "Sweet iced tea with an espresso shot."],
      zh: ["浓缩咖啡冰茶", "饮料", "加入浓缩咖啡的甜味冰茶。"],
      ja: ["エスプレッソ入りアイスティー", "ドリンク", "エスプレッソを加えた甘いアイスティーです。"]
    },
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500"
  },
  {
    id: 10,
    name: "버블티",
    category: "음료",
    price: 4800,
    description: "달콤한 차와 쫀득한 타피오카 펄을 함께 즐기는 음료입니다.",
    translations: {
      en: ["Bubble Tea", "Drink", "Sweet tea with chewy tapioca pearls."],
      zh: ["珍珠奶茶", "饮料", "搭配珍珠的甜茶饮品。"],
      ja: ["タピオカティー", "ドリンク", "タピオカ入りの甘いお茶です。"]
    },
    image: "https://images.unsplash.com/photo-1558857563-b371033873b8?w=500"
  },
  {
    id: 11,
    name: "아포가토",
    category: "디저트",
    price: 5000,
    description: "차가운 바닐라 아이스크림에 따뜻한 에스프레소를 부어 먹는 디저트입니다.",
    translations: {
      en: ["Affogato", "Dessert", "Vanilla ice cream topped with espresso."],
      zh: ["阿芙佳朵", "甜点", "在香草冰淇淋上淋上浓缩咖啡。"],
      ja: ["アフォガート", "デザート", "バニラアイスにエスプレッソをかけたデザートです。"]
    },
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500"
  },
  {
    id: 12,
    name: "흑임자 스무디",
    category: "음료",
    price: 5500,
    description: "고소한 흑임자를 부드럽게 갈아 만든 시원한 스무디입니다.",
    translations: {
      en: ["Black Sesame Smoothie", "Drink", "A cool smoothie made with black sesame."],
      zh: ["黑芝麻冰沙", "饮料", "用黑芝麻制成的冰爽饮品。"],
      ja: ["黒ごまスムージー", "ドリンク", "黒ごまを使った冷たいスムージーです。"]
    },
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500"
  }
];


// 5. 화면 번역
const translations = {
  ko: {
    "메뉴 주문하기": "메뉴 주문하기",
    "매장에서 먹고 가기": "매장에서 먹고 가기",
    "포장하기": "포장하기",
    "전체": "전체",
    "커피": "커피",
    "음료": "음료",
    "디저트": "디저트",
    "설명 보기": "설명 보기",
    "담기": "담기",
    "장바구니": "장바구니",
    "주문하기": "주문하기",
    "결제하기": "결제하기",
    "처음으로": "처음으로",
    "작은 글씨": "작은 글씨",
    "큰 글씨": "큰 글씨",
    "접근성 모드": "접근성 모드",
    "장바구니가 비어 있습니다.": "장바구니가 비어 있습니다.",
    "주문 방식": "주문 방식",
    "매장": "매장",
    "포장": "포장",
    "총 금액": "총 금액",
    "주문 번호": "주문 번호",
    "주문 상태 확인": "주문 상태 확인",
    "주문 접수": "주문 접수"
  },
  en: {
    "메뉴 주문하기": "Start Order",
    "매장에서 먹고 가기": "Dine In",
    "포장하기": "Takeout",
    "전체": "All",
    "커피": "Coffee",
    "음료": "Drinks",
    "디저트": "Desserts",
    "설명 보기": "Details",
    "담기": "Add",
    "장바구니": "Cart",
    "주문하기": "Order",
    "결제하기": "Payment",
    "처음으로": "Home",
    "작은 글씨": "Small Text",
    "큰 글씨": "Large Text",
    "접근성 모드": "Accessibility",
    "장바구니가 비어 있습니다.": "Your cart is empty.",
    "주문 방식": "Order Type",
    "매장": "Dine In",
    "포장": "Takeout",
    "총 금액": "Total",
    "주문 번호": "Order Number",
    "주문 상태 확인": "Check Order Status",
    "주문 접수": "Order Received"
  },
  zh: {
    "메뉴 주문하기": "开始点餐",
    "매장에서 먹고 가기": "堂食",
    "포장하기": "打包",
    "전체": "全部",
    "커피": "咖啡",
    "음료": "饮料",
    "디저트": "甜点",
    "설명 보기": "查看介绍",
    "담기": "添加",
    "장바구니": "购物车",
    "주문하기": "下单",
    "결제하기": "付款",
    "처음으로": "首页",
    "작은 글씨": "小字体",
    "큰 글씨": "大字体",
    "접근성 모드": "无障碍模式",
    "장바구니가 비어 있습니다.": "购物车是空的。",
    "주문 방식": "订单类型",
    "매장": "堂食",
    "포장": "打包",
    "총 금액": "总金额",
    "주문 번호": "订单号码",
    "주문 상태 확인": "查看订单状态",
    "주문 접수": "已接收订单"
  },
  ja: {
    "메뉴 주문하기": "注文する",
    "매장에서 먹고 가기": "店内で食べる",
    "포장하기": "持ち帰り",
    "전체": "すべて",
    "커피": "コーヒー",
    "음료": "ドリンク",
    "디저트": "デザート",
    "설명 보기": "説明を見る",
    "담기": "追加",
    "장바구니": "カート",
    "주문하기": "注文する",
    "결제하기": "お支払い",
    "처음으로": "ホーム",
    "작은 글씨": "小さい文字",
    "큰 글씨": "大きい文字",
    "접근성 모드": "アクセシビリティ",
    "장바구니가 비어 있습니다。": "カートは空です。",
    "장바구니가 비어 있습니다.": "カートは空です。",
    "주문 방식": "注文方法",
    "매장": "店内",
    "포장": "持ち帰り",
    "총 금액": "合計金額",
    "주문 번호": "注文番号",
    "주문 상태 확인": "注文状況を確認",
    "주문 접수": "注文受付"
  }
};


// 6. 번역 문구 가져오기
function t(koreanText) {
  return translations[currentLanguage]?.[koreanText] || koreanText;
}


// 7. 화면 전환
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.add("hidden");
    screen.style.display = "";
  });

  const target = document.getElementById(screenId);

  if (target) {
    target.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    console.error("화면을 찾을 수 없습니다:", screenId);
  }
}



// 8. 메뉴 이름과 설명 번역
function getMenuText(menu) {
  const data = menu.translations?.[currentLanguage];

  return {
    name: data ? data[0] : menu.name,
    category: data ? data[1] : t(menu.category),
    description: data ? data[2] : menu.description
  };
}


// 9. 메뉴 카드 만들기
function createMenuCard(menu, mobile = false) {
  const translated = getMenuText(menu);

  const item = document.createElement("article");
  item.className = "menu-item";

  const image = document.createElement("img");
  image.src = menu.image;
  image.alt = translated.name;
  image.onerror = () => {
    image.style.display = "none";
  };

  const content = document.createElement("div");
  content.className = "menu-item-content";

  const name = document.createElement("h3");
  name.textContent = translated.name;

  const category = document.createElement("p");
  category.textContent = translated.category;

  const price = document.createElement("strong");
  price.textContent = money(menu.price);

  const actions = document.createElement("div");
  actions.className = "menu-actions";

  const detailButton = document.createElement("button");
  detailButton.className = "detail-button";
  detailButton.textContent = t("설명 보기");
  detailButton.addEventListener("click", () => {
    showMenuDetail(menu);
  });

  const addButton = document.createElement("button");
  addButton.className = "add-button";
  addButton.textContent = t("담기");
  addButton.addEventListener("click", () => {
    addToCart(menu.id, mobile);
  });

  actions.append(detailButton, addButton);
  content.append(name, category, price, actions);
  item.append(image, content);

  return item;
}


// 10. 메뉴 화면 표시
function renderMenus() {
  const desktopList = document.getElementById("menu-list");
  const mobileList = document.getElementById("mobile-menu-list");

  const filteredMenus = currentCategory === "전체"
    ? menus
    : menus.filter(menu => menu.category === currentCategory);

  if (desktopList) {
    desktopList.replaceChildren();

    filteredMenus.forEach(menu => {
      desktopList.appendChild(createMenuCard(menu));
    });
  }

  if (mobileList) {
    mobileList.replaceChildren();

    menus.forEach(menu => {
      mobileList.appendChild(createMenuCard(menu, true));
    });
  }
}


// 11. 메뉴 설명
function showMenuDetail(menu) {
  const translated = getMenuText(menu);
  const modal = document.getElementById("menu-detail-modal");
  const content = document.getElementById("menu-detail-content");

  if (!modal || !content) {
    alert(translated.name + "\n\n" + translated.description);
    return;
  }

  content.replaceChildren();

  const title = document.createElement("h2");
  title.textContent = translated.name;

  const description = document.createElement("p");
  description.textContent = translated.description;

  const price = document.createElement("strong");
  price.textContent = money(menu.price);

  content.append(title, description, price);
  modal.classList.remove("hidden");
}


// 12. 장바구니에 추가
function addToCart(menuId, mobile = false) {
  const menu = menus.find(item => item.id === menuId);
  if (!menu) return;

  const existing = cart.find(item => item.id === menuId);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      id: menu.id,
      name: menu.name,
      price: menu.price,
      quantity: 1
    });
  }

  updateCart();

  if (mobile) {
    alert(getMenuText(menu).name + " - " + t("담기"));
  }
}


// 13. 수량 변경
function changeQuantity(menuId, amount) {
  const item = cart.find(menu => menu.id === menuId);
  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    cart = cart.filter(menu => menu.id !== menuId);
  }

  updateCart();
}


// 14. 총액과 수량
function getCartTotal() {
  return cart.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
}

function getCartCount() {
  return cart.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
}


// 15. 장바구니 표시
function renderCartList(elementId) {
  const list = document.getElementById(elementId);
  if (!list) return;

  list.replaceChildren();

  if (cart.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = t("장바구니가 비어 있습니다.");
    list.appendChild(empty);
    return;
  }

  cart.forEach(item => {
    const row = document.createElement("div");
    row.className = "cart-item";

    const menu = menus.find(m => m.id === item.id);
    const name = document.createElement("strong");
    name.textContent = menu ? getMenuText(menu).name : item.name;

    const price = document.createElement("span");
    price.textContent = money(item.price * item.quantity);

    const controls = document.createElement("div");
    controls.className = "quantity-controls";

    const minus = document.createElement("button");
    minus.textContent = "−";
    minus.setAttribute("aria-label", "수량 줄이기");
    minus.addEventListener("click", () => changeQuantity(item.id, -1));

    const quantity = document.createElement("span");
    quantity.textContent = item.quantity;

    const plus = document.createElement("button");
    plus.textContent = "+";
    plus.setAttribute("aria-label", "수량 늘리기");
    plus.addEventListener("click", () => changeQuantity(item.id, 1));

    controls.append(minus, quantity, plus);
    row.append(name, price, controls);
    list.appendChild(row);
  });
}


// 16. 장바구니 전체 업데이트
function updateCart() {
  const count = getCartCount();
  const total = money(getCartTotal());

  const elements = {
    "cart-count": count,
    "cart-total": total,
    "cart-page-total": total,
    "mobile-cart-count": count,
    "mobile-cart-total": total
  };

  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });

  renderCartList("cart-list");
  renderCartList("mobile-cart-list");
}


// 17. 주문 번호 만들기
function makeOrderNumber() {
  const date = new Date();

  const dateText =
    String(date.getFullYear()).slice(-2) +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0");

  const random = Math.floor(1000 + Math.random() * 9000);

  return dateText + "-" + random;
}


// 18. QR 코드 만들기
function makeQRCode(elementId, text) {
  const container = document.getElementById(elementId);
  if (!container) return;

  container.replaceChildren();

  if (typeof QRCode === "undefined") {
    container.textContent = "QR 코드 기능을 불러오지 못했습니다.";
    console.error("QRCode 라이브러리가 없습니다.");
    return;
  }

  try {
    new QRCode(container, {
      text: text,
      width: 160,
      height: 160,
      correctLevel: QRCode.CorrectLevel.M
    });
  } catch (error) {
    console.error("QR 코드 생성 오류:", error);
    container.textContent = "QR 코드 생성에 실패했습니다.";
  }
}


// 19. 첫 화면 QR 코드
function createWelcomeQR() {
  const mobileURL = new URL(window.location.href);
  mobileURL.searchParams.set("mode", "mobile");

  makeQRCode("kiosk-qr-code", mobileURL.href);
}



// 20. Firebase 주문
async function saveOrderToFirebase(order) {
  console.log("주문 저장 함수 실행됨!", order);

  if (!database || !auth || !authReady) {
    console.warn("Firebase 연결 또는 인증이 준비되지 않았습니다.");
    return false;
  }

  try {
    await authReady;

    const user = auth.currentUser;

    if (!user) {
      console.error("로그인된 사용자가 없습니다.");
      return false;
    }

    order.userId = user.uid;

    await database.ref("orders/" + order.orderNumber).set(order);

    console.log("주문 저장 성공!");
    return true;

  } catch (error) {
    console.error("Firebase 주문 저장 실패:", error);
    return false;
  }
}

// 21. 주문 완료
async function completeOrder() {
  if (cart.length === 0) {
    alert("메뉴를 먼저 선택해 주세요.");
    return;
  }

  if (!orderType) {
    alert("매장 또는 포장을 선택해 주세요.");
    showScreen("dining-screen");
    return;
  }

  const orderNumber = makeOrderNumber();

  currentOrder = {
    orderNumber,
    orderType,
    userId: auth?.currentUser ? auth.currentUser.uid : null,
    items: cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    })),
    total: getCartTotal(),
    status: "주문 접수",
    createdAt: new Date().toISOString()
  };

  const orderNumberElement = document.getElementById("order-number");
  const completedItems = document.getElementById("completed-items");
  const paymentTotal = document.getElementById("payment-total");

  if (orderNumberElement) {
    orderNumberElement.textContent = orderNumber;
  }

  if (completedItems) {
    completedItems.textContent = currentOrder.items.map(item => {
      const menu = menus.find(m => m.id === item.id);
      const name = menu ? getMenuText(menu).name : item.name;
      return name + " × " + item.quantity;
    }).join(", ");
  }

  if (paymentTotal) {
    paymentTotal.textContent = money(currentOrder.total);
  }

  const mobileOrderNumber = document.getElementById("mobile-order-number");
  if (mobileOrderNumber) {
    mobileOrderNumber.textContent = orderNumber;
  }

  showScreen("payment-screen");
  
const statusURL = new URL(window.location.href);
statusURL.searchParams.set("order", orderNumber);
statusURL.searchParams.set("mode", "status");

makeQRCode("order-status-qr", statusURL.href);
  const saved = await saveOrderToFirebase(currentOrder);
  const result = document.getElementById("payment-result");

  if (result) {
    result.classList.remove("hidden");

    const payButton = document.getElementById("pay-button");
    if (payButton) {
      payButton.classList.add("hidden");
    }

    const message = document.createElement("p");
    message.textContent = saved
      ? "주문 정보가 저장되었습니다. 실제 결제는 진행되지 않았습니다."
      : "주문 화면은 표시되지만 서버 저장은 확인되지 않았습니다.";

    result.prepend(message);
  }
}

// 22. 언어 변경
function changeLanguage(language) {
  if (!translations[language]) return;

  currentLanguage = language;

  document.documentElement.lang = language;

  document.querySelectorAll(".language-button").forEach(button => {
    button.classList.toggle("active", button.dataset.lang === language);
  });

  // 버튼 문구 번역
  document.querySelectorAll("button").forEach(button => {
    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent.trim();
    }

    const original = button.dataset.originalText;

    if (translations[language][original]) {
      button.textContent = translations[language][original];
    }
  });

  // data-translate가 지정된 요소 번역
  document.querySelectorAll("[data-translate]").forEach(element => {
    const key = element.dataset.translate;
    if (translations[language][key]) {
      element.textContent = translations[language][key];
    }
  });

  renderMenus();
  updateCart();
}


// 23. 글자 크기
function setLargeText(enabled) {
  isLargeText = enabled;
  document.body.classList.toggle("large-text", enabled);

  const button = document.getElementById("accessibility-button");

  if (button) {
    button.setAttribute("aria-pressed", String(enabled));
  }
}


// 24. 매장 / 포장 선택
function chooseOrderType(type) {
  orderType = type;
  showScreen("menu-screen");
}


// 25. 버튼 연결
function connectButtons() {

  const startOrder = document.getElementById("start-order");

  if (startOrder) {
    startOrder.addEventListener("click", () => {
      showScreen("dining-screen");
    });
  } else {
    console.error("start-order 버튼을 HTML에서 찾을 수 없습니다.");
  }

  const dineIn = document.getElementById("dine-in-button");

  if (dineIn) {
    dineIn.addEventListener("click", () => {
      chooseOrderType("매장");
    });
  }

  const takeout = document.getElementById("takeout-button");

  if (takeout) {
    takeout.addEventListener("click", () => {
      chooseOrderType("포장");
    });
  }

  document.querySelectorAll("[data-category]").forEach(button => {
    button.addEventListener("click", () => {
      currentCategory = button.dataset.category;

      document.querySelectorAll("[data-category]").forEach(item => {
        item.classList.toggle("active", item === button);
      });

      renderMenus();
    });
  });

  const goCart = document.getElementById("go-cart");

  if (goCart) {
    goCart.addEventListener("click", () => {
      updateCart();
      showScreen("cart-screen");
    });
  }

  const backMenu = document.getElementById("back-menu");

  if (backMenu) {
    backMenu.addEventListener("click", () => showScreen("menu-screen"));
  }

  const goOptions = document.getElementById("go-options");

  if (goOptions) {
    goOptions.addEventListener("click", () => showScreen("options-screen"));
  }

  const skipOptions = document.getElementById("skip-options");

  if (skipOptions) {
    skipOptions.addEventListener("click", completeOrder);
  }

  const continueOptions = document.getElementById("continue-options");

  if (continueOptions) {
    continueOptions.addEventListener("click", completeOrder);
  }

  const payButton = document.getElementById("pay-button");
  if (payButton) {
  payButton.addEventListener("click", () => {
    completeOrder();
  });
}

  const homeButton = document.getElementById("home-button");

  if (homeButton) {
    homeButton.addEventListener("click", () => {
      cart = [];
      orderType = "";
      currentOrder = null;
      updateCart();
      showScreen("start-screen");
    });
  }

  const backOptions = document.getElementById("back-options");

  if (backOptions) {
    backOptions.addEventListener("click", () => showScreen("options-screen"));
  }

  const closeDetail = document.getElementById("close-menu-detail");

  if (closeDetail) {
    closeDetail.addEventListener("click", () => {
      document.getElementById("menu-detail-modal")?.classList.add("hidden");
    });
  }

  const smallText = document.getElementById("small-text");

  if (smallText) {
    smallText.addEventListener("click", () => setLargeText(false));
  }

  const largeText = document.getElementById("large-text");

  if (largeText) {
    largeText.addEventListener("click", () => setLargeText(true));
  }

  const accessibility = document.getElementById("accessibility-button");

  if (accessibility) {
    accessibility.addEventListener("click", () => {
      setLargeText(!isLargeText);
    });
  }

  document.querySelectorAll(".language-button").forEach(button => {
    button.addEventListener("click", () => {
      changeLanguage(button.dataset.lang);
    });
  });

  const mobileGoCart = document.getElementById("mobile-go-cart");

  if (mobileGoCart) {
    mobileGoCart.addEventListener("click", () => {
      updateCart();
      showScreen("mobile-cart-screen");
    });
  }

  const mobileBackMenu = document.getElementById("mobile-back-menu");

  if (mobileBackMenu) {
    mobileBackMenu.addEventListener("click", () => showScreen("mobile-order-screen"));
  }

  const mobileGoOrder = document.getElementById("mobile-go-order");

  if (mobileGoOrder) {
    mobileGoOrder.addEventListener("click", () => {
      if (!orderType) {
        alert("매장 또는 포장을 먼저 선택해 주세요.");
        return;
      }

      completeOrder();
    });
  }
}


// 26. 모바일 주문 화면
function setupMobileOrder() {
  const params = new URLSearchParams(window.location.search);

  if (params.get("mode") !== "mobile") return;

  showScreen("mobile-order-screen");

  const mobileScreen = document.getElementById("mobile-order-screen");
  if (!mobileScreen) return;

  if (!document.getElementById("mobile-order-type")) {
    const choice = document.createElement("div");
    choice.id = "mobile-order-type";
    choice.className = "dining-options";

    const title = document.createElement("h2");
    title.textContent = "주문 방식을 선택해 주세요.";

    const dineButton = document.createElement("button");
    dineButton.textContent = "매장에서 먹고 가기";
    dineButton.addEventListener("click", () => {
      orderType = "매장";
      title.textContent = "매장 식사를 선택했습니다.";
    });

    const takeoutButton = document.createElement("button");
    takeoutButton.textContent = "포장하기";
    takeoutButton.addEventListener("click", () => {
      orderType = "포장";
      title.textContent = "포장을 선택했습니다.";
    });

    choice.append(title, dineButton, takeoutButton);
    mobileScreen.prepend(choice);
  }

  renderMenus();
}

// 27. 주문 상태 화면
function setupStatusMode() {
  const params = new URLSearchParams(window.location.search);
  const orderNumber = params.get("order");

  if (params.get("mode") !== "status" || !orderNumber) return;

  const statusScreen = document.createElement("section");
  statusScreen.id = "status-screen";

  const title = document.createElement("h1");
  title.textContent = "주문 상태 확인";

  const number = document.createElement("p");
  number.textContent = "주문 번호: " + orderNumber;

  const statusText = document.createElement("p");
  statusText.textContent = "주문 상태를 불러오는 중입니다.";

  statusScreen.append(title, number, statusText);
  document.body.prepend(statusScreen);

  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.add("hidden");
  });

  if (!database || !auth || !authReady) {
    statusText.textContent = "서버 연결에 실패했습니다.";
    return;
  }

  authReady.then(() => {
    database.ref("orders/" + orderNumber + "/status")
      .on("value", snapshot => {
        statusText.textContent = snapshot.exists()
          ? "현재 주문 상태: " + snapshot.val()
          : "주문 정보를 찾을 수 없습니다.";
      });
  }).catch(error => {
    console.error(error);
    statusText.textContent = "로그인 또는 서버 연결에 실패했습니다.";
  });
}

// 28. 프로그램 시작
document.addEventListener("DOMContentLoaded", () => {
  console.log("카페 키오스크 시작");

  renderMenus();
  updateCart();
  connectButtons();
  createWelcomeQR();
  setupMobileOrder();
  setupStatusMode();

  console.log("키오스크 초기화 완료");
})