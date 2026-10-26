// Ứng dụng học từ vựng N3. Dữ liệu Mimikara nằm ở data/mimikara.js
const RAW = window.MIMIKARA;
let W;
const MIMI = RAW.w.map((a) => ({
  s: a[0],
  c: RAW.cats[a[1]],
  g: a[2],
  id: a[3],
  k: a[4],
  h: a[5] || a[4],
  v: a[6],
  m: a[7],
  n: a[8],
}));
const $ = (s) => document.querySelector(s);
const esc = (s) =>
  String(s == null ? "" : s).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
let CLOUD_UID = "";
const scopedKey = (k) =>
  CLOUD_UID ? "n3vocab_user_" + CLOUD_UID + "_" + k : k;
let KEY = "n3vocab_v1",
  P = {};
const ld = (k) => {
  try {
    return JSON.parse(localStorage.getItem(scopedKey(k)) || "null");
  } catch (e) {
    return null;
  }
};
const syncCloud = () => {
  try {
    if (
      window.cloudSync &&
      window.cloudSync.push &&
      typeof libraryBackup === "function"
    )
      window.cloudSync.push(libraryBackup());
  } catch (e) {}
};

const save = () => {
  try {
    localStorage.setItem(scopedKey(KEY), JSON.stringify(P));
  } catch (e) {}
  syncCloud();
};
const mergeP = (a, b) => {
  let n = 0;
  for (const id in b) {
    const e = b[id];
    if (
      !Array.isArray(e) ||
      e.length < 4 ||
      e.some((x) => typeof x !== "number")
    )
      continue;
    const c = a[id];
    if (!c || e[2] + e[3] > c[2] + c[3]) {
      a[id] = e;
      n++;
    }
  }
  return n;
};
const dayNum = () =>
  Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5);
const INT = [0, 1, 3, 7, 14, 30],
  REV = new Set([6, 12, 18, 24, 30, 36]);
const hasK = (s) => /[\u4e00-\u9fff]/.test(s);
let maxS = 40;
const t0 = new Date();
t0.setHours(0, 0, 0, 0);
const todayNo = Math.round((t0 - new Date(2026, 9, 22)) / 864e5) + 1;
const examDays = Math.round((new Date(2026, 11, 6) - t0) / 864e5);

// ---- romaji -> kana
const T = {},
  V = "aiueo";
const add = (c, a) =>
  a.forEach((k, i) => {
    if (k) T[c + V[i]] = k;
  });
add("", [..."あいうえお"]);
[
  ["k", "かきくけこ"],
  ["s", "さしすせそ"],
  ["t", "たちつてと"],
  ["n", "なにぬねの"],
  ["h", "はひふへほ"],
  ["m", "まみむめも"],
  ["r", "らりるれろ"],
  ["g", "がぎぐげご"],
  ["z", "ざじずぜぞ"],
  ["d", "だぢづでど"],
  ["b", "ばびぶべぼ"],
  ["p", "ぱぴぷぺぽ"],
  ["l", "ぁぃぅぇぉ"],
  ["x", "ぁぃぅぇぉ"],
].forEach(([c, s]) => add(c, [...s]));
add("y", ["や", 0, "ゆ", 0, "よ"]);
add("w", ["わ", 0, 0, 0, "を"]);
[
  ["ky", "き"],
  ["gy", "ぎ"],
  ["ny", "に"],
  ["hy", "ひ"],
  ["by", "び"],
  ["py", "ぴ"],
  ["my", "み"],
  ["ry", "り"],
  ["sy", "し"],
  ["ty", "ち"],
  ["zy", "じ"],
  ["jy", "じ"],
  ["dy", "ぢ"],
  ["sh", "し"],
  ["ch", "ち"],
  ["j", "じ"],
].forEach(([c, b]) => {
  T[c + "a"] = b + "ゃ";
  T[c + "u"] = b + "ゅ";
  T[c + "o"] = b + "ょ";
  T[c + "e"] = b + "ぇ";
});
Object.assign(T, {
  shi: "し",
  chi: "ち",
  tsu: "つ",
  ji: "じ",
  fu: "ふ",
  fa: "ふぁ",
  fi: "ふぃ",
  fe: "ふぇ",
  fo: "ふぉ",
  xya: "ゃ",
  xyu: "ゅ",
  xyo: "ょ",
  lya: "ゃ",
  lyu: "ゅ",
  lyo: "ょ",
  xtu: "っ",
  ltu: "っ",
  xtsu: "っ",
  ltsu: "っ",
});
// Bổ sung theo bảng e-typing (roman_matrix.pdf)
[
  ["sy", "し"],
  ["jy", "じ"],
  ["ty", "ち"],
  ["dy", "ぢ"],
  ["ky", "き"],
  ["gy", "ぎ"],
  ["ny", "に"],
  ["hy", "ひ"],
  ["by", "び"],
  ["py", "ぴ"],
  ["my", "み"],
  ["ry", "り"],
].forEach(([c, b]) => {
  T[c + "i"] = b + "ぃ"; // kyi, syi, jyi...
});
[
  ["sw", "す", "ぁぃぅぇぉ"],
  ["tw", "と", "ぁぃぅぇぉ"],
  ["dw", "ど", "ぁぃぅぇぉ"],
  ["th", "て", "ゃぃゅぇょ"],
  ["dh", "で", "ゃぃゅぇょ"],
].forEach(([c, b, sm]) => {
  [...sm].forEach((x, i) => {
    T[c + V[i]] = b + x;
  });
});
Object.assign(T, { fya: "ふゃ", fyu: "ふゅ", fyo: "ふょ" });
const KEYS = Object.keys(T);
const hiraToKata = (s) =>
  s.replace(/[\u3041-\u3096]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) + 0x60),
  );
// Chữ HOA (CapsLock, Shift, hoặc bàn phím điện thoại) -> katakana, chữ thường -> hiragana.
// Quyết định theo từng cụm romaji, dựa vào chữ cái đầu của cụm.
function toKana(s, fin) {
  s = s.normalize("NFKC");
  const lo = s.replace(/[A-Z]/g, (c) => c.toLowerCase());
  const up = (i) => s[i] !== lo[i];
  const put = (h, i) => (up(i) ? hiraToKata(h) : h);
  let o = "",
    i = 0;
  while (i < s.length) {
    const ch = lo[i],
      nx = lo[i + 1];
    if (ch === "-") {
      o += "ー";
      i++;
      continue;
    }
    if (!/[a-z']/.test(ch)) {
      o += s[i];
      i++;
      continue;
    }
    if (ch === "'") {
      i++;
      continue;
    }
    if (nx && ch === nx && /[bcdfghjkmpqrstvwxyz]/.test(ch)) {
      o += put("っ", i);
      i++;
      continue;
    }
    if (ch === "n") {
      if (nx === undefined) {
        o += fin ? put("ん", i) : s[i];
        i++;
        continue;
      }
      if (nx === "n" || nx === "'") {
        o += put("ん", i);
        i += 2;
        continue;
      }
      if (!/[aiueoy]/.test(nx)) {
        o += put("ん", i);
        i++;
        continue;
      }
    }
    let m = 0;
    for (let L = 4; L >= 1; L--) {
      const k = lo.substr(i, L);
      if (T[k]) {
        o += put(T[k], i);
        i += L;
        m = 1;
        break;
      }
    }
    if (m) continue;
    const r = lo.slice(i);
    if (!fin && r.length <= 3 && KEYS.some((k) => k.startsWith(r))) {
      o += s.slice(i);
      break;
    }
    o += s[i];
    i++;
  }
  return o;
}
const norm = (s) =>
  s
    .normalize("NFKC")
    .replace(/[\s・、。.,\/〜~]/g, "")
    .replace(/[\u30a1-\u30f6]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) - 0x60),
    )
    .toLowerCase();
const parts = (s) =>
  s
    .split(/[・\/、]/)
    .map(norm)
    .filter(Boolean);
function accepted(w, m) {
  const st = new Set([...parts(w.h), norm(w.h)]);
  if (m === "write") {
    parts(w.k).forEach((x) => st.add(x));
    st.add(norm(w.k));
  }
  return st;
}
const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
// ---- state
const defScope =
  REV.has(todayNo) || (todayNo >= 1 && todayNo <= maxS)
    ? "today"
    : todayNo > maxS
      ? "due"
      : "range";
let S = { mode: "read", scope: defScope, from: 1, to: 1, cat: "all" },
  Q = null;
let OFFLINE_MODE = false;
function accountBar() {
  const c = window.cloudSync || {},
    u = c.user;
  const avatar =
    u && u.photoURL
      ? `<img class="avatar avatar-image" src="${esc(u.photoURL)}" alt="">`
      : `<span class="avatar">${esc((u?.displayName || u?.email || "G").slice(0, 1).toUpperCase())}</span>`;
  const exDate = "<small>06/12/2026</small>";
  const exam =
    examDays > 0
      ? `<b>${examDays}</b><div><span>ngày đến kỳ thi JLPT</span>${exDate}</div>`
      : examDays === 0
        ? `<b>今日</b><div><span>Hôm nay thi JLPT</span>${exDate}</div>`
        : `<div><span>Kỳ thi JLPT đã qua</span>${exDate}</div>`;
  return `<header class="topbar"><button class="brand" id="brandHome" type="button"><img class="brand-logo" src="tangro_horizontal_logo.png" alt="TANGRO"></button><div class="exam-countdown">${exam}</div>${u ? `<div class="account"><button class="account-trigger" id="accountToggle" type="button">${avatar}<span class="account-name">${esc(u.displayName || u.email || "Tài khoản")}</span><span class="account-caret">⌄</span></button><div class="account-menu hidden" id="accountMenu"><div class="account-detail">${esc(u.displayName || "Tài khoản")}<small>${esc(u.email || "")}</small></div><button class="logout" id="logoutBtn" type="button">Đăng xuất</button></div></div>` : ""}</header>`;
}
function bindAccount() {
  const c = window.cloudSync || {};
  $("#brandHome")?.addEventListener("click", () => lib());
  const toggle = $("#accountToggle"),
    menu = $("#accountMenu");
  if (toggle && menu) toggle.onclick = () => menu.classList.toggle("hidden");
  const logout = $("#logoutBtn");
  if (logout)
    logout.onclick = () => {
      if (confirm("Bạn có chắc chắn muốn đăng xuất khỏi TANGRO không?"))
        c.signOut();
    };
}
function loginScreen() {
  const c = window.cloudSync || {};
  $("#app").innerHTML =
    `<section class="login-screen"><div class="login-orbit orbit-a"></div><div class="login-orbit orbit-b"></div><div class="login-panel"><div class="login-mark">GR</div><div class="login-kicker">VOCABULARY · SYNCED</div><h1 class="login-title">TA<span class="brand-gr">GR</span>O</h1><p class="login-subtitle">Học từ vựng Nhật ngữ theo nhịp của riêng bạn.</p>${c.configured ? `<button class="google-login" id="googleLogin" type="button"><span class="google-icon">G</span>Đăng nhập bằng Google</button><p class="login-note">Dữ liệu và tiến độ sẽ được đồng bộ trên các thiết bị.</p>` : `<p class="login-note">Firebase chưa được cấu hình. Bạn có thể tiếp tục học offline.</p><button class="google-login" id="offlineLogin" type="button">Tiếp tục offline</button>`}</div></section>`;
  if (c.configured)
    $("#googleLogin").onclick = async () => {
      const b = $("#googleLogin");
      b.disabled = true;
      b.textContent = "Đang kết nối…";
      try {
        await c.signIn();
      } catch (e) {
        b.disabled = false;
        b.innerHTML = '<span class="google-icon">G</span>Đăng nhập bằng Google';
        alert("Không thể đăng nhập. Hãy kiểm tra cấu hình Firebase.");
      }
    };
  else
    $("#offlineLogin").onclick = () => {
      OFFLINE_MODE = true;
      lib();
    };
}
function pick() {
  const t = dayNum();
  let L = W;
  if (S.scope === "today")
    L = REV.has(todayNo)
      ? W.filter((w) => w.s >= todayNo - 5 && w.s < todayNo)
      : W.filter((w) => w.s === todayNo);
  else if (S.scope === "due") L = W.filter((w) => P[w.id] && P[w.id][1] <= t);
  else if (S.scope === "wrong")
    L = W.filter((w) => P[w.id] && P[w.id][0] === 0 && P[w.id][3] > 0);
  else if (S.scope === "range")
    L = W.filter((w) => w.s >= S.from && w.s <= S.to);
  else if (S.scope.startsWith("session:")) {
    const session = +S.scope.slice(8);
    L = W.filter((w) => (+w.s || 1) === session);
  }
  else if (S.scope === "new") L = W.filter((w) => !P[w.id]);
  if (S.cat !== "all") L = L.filter((w) => w.c === S.cat);
  return L;
}
function home() {
  Q = null;
  const t = dayNum(),
    en = Object.values(P);
  const due = en.filter((e) => e[1] <= t).length,
    solid = en.filter((e) => e[0] >= 3).length;
  const sessOpts = [...new Set(W.map((w) => w.s))].sort((a, b) => a - b);
  if (
    S.scope.startsWith("session:") &&
    !sessOpts.includes(+S.scope.slice(8))
  )
    S.scope = "new";
  const list = pick();
  const sessionScopeOpts = !isMimi
    ? sessOpts
        .map(
          (n) =>
            `<option value="session:${n}"${S.scope === `session:${n}` ? " selected" : ""}>${esc(sLabel(n))} (${W.filter((w) => (+w.s || 1) === n).length})</option>`,
        )
        .join("")
    : "";
  const so = (v) =>
    sessOpts
      .map(
        (n) =>
          `<option value="${n}"${n === v ? " selected" : ""}>${esc(sLabel(n))}</option>`,
      )
      .join("");
  const todayLbl = REV.has(todayNo)
    ? `Hôm nay: ôn buổi ${todayNo - 5}–${todayNo - 1}`
    : `Hôm nay: buổi ${todayNo}`;
  $("#app").innerHTML = `
 ${accountBar()}<button id="lib">← Thư viện</button><h1 style="margin-top:12px"><span class="hanko">単語</span>${esc(FN)} · ${W.length} từ</h1>
 <div class="row" id="deckBar" style="margin-top:10px"><button id="cards">Xem flashcard</button>${isMimi ? "" : `<button id="addWords">Thêm thẻ mới</button><button id="renameDeck">Đổi tên bộ</button><button id="removeDeck">Xoá bộ từ</button>`}</div>
 <div class="stats" style="margin-top:14px">
  <div class="stat"><b>${en.length}</b><span class="mu">từ đã làm / ${W.length}</span></div>
  <div class="stat"><b>${solid}</b><span class="mu">từ nhớ chắc</span></div>
  <div class="stat"><b>${due}</b><span class="mu">từ đến hạn ôn</span></div></div>
 <div class="card"><h2>Kiểu hỏi</h2>
  <label class="opt"><input type="radio" name="mode" value="read"${S.mode === "read" ? " checked" : ""}><span><b>Đọc:</b> hiện kanji, bạn gõ cách đọc hiragana<br><span class="mu">Từ chỉ có kana sẽ tự chuyển sang kiểu Nhớ từ.</span></span></label>
  <label class="opt"><input type="radio" name="mode" value="write"${S.mode === "write" ? " checked" : ""}><span><b>Nhớ từ:</b> hiện nghĩa tiếng Việt và Hán-Việt, bạn gõ từ tiếng Nhật<br><span class="mu">Gõ cách đọc hoặc kanji đều được chấm đúng.</span></span></label></div>
 <div class="card"><h2>Từ cần học</h2><div class="row">
  <select id="scope">
   ${isMimi && todayNo >= 1 && todayNo <= maxS ? `<option value="today"${S.scope === "today" ? " selected" : ""}>${todayLbl}</option>` : ""}
   <option value="due"${S.scope === "due" ? " selected" : ""}>Từ đến hạn ôn (${due})</option>
   <option value="wrong"${S.scope === "wrong" ? " selected" : ""}>Từ hay sai</option>
   ${isMimi ? `<option value="range"${S.scope === "range" ? " selected" : ""}>Chọn buổi</option>` : sessionScopeOpts}<option value="new"${S.scope === "new" ? " selected" : ""}>Từ chưa học (${W.filter((w) => !P[w.id]).length})</option>
   <option value="all"${S.scope === "all" ? " selected" : ""}>Tất cả ${W.length} từ</option></select>
  <span id="rng" class="row${S.scope === "range" ? "" : " hidden"}"><select id="from">${so(S.from)}</select><span>đến</span><select id="to">${so(S.to)}</select></span>
  <select id="cat"><option value="all">Mọi loại từ</option>${[...new Set(W.map((w) => w.c))].map((c) => `<option${S.cat === c ? " selected" : ""}>${esc(c)}</option>`).join("")}</select></div>
  <p class="mu" style="margin:12px 0 10px">${list.length} từ trong phạm vi này.</p>
  <button class="p" id="go"${list.length ? "" : " disabled"}>Bắt đầu</button></div>
${isMimi ? "" : `<div id="imp"></div>`}`;
  if (!isMimi) {
    const bar = $("#deckBar"), f = curF();
    const share = document.createElement("button");
    share.id = "shareDeck";
    share.textContent = f?.visibility === "public" ? "Tắt công khai" : "Công khai / chia sẻ";
    share.onclick = publishCurrentDeck;
    bar?.insertBefore(share, $("#removeDeck"));
    const box = document.createElement("div");
    box.id = "community";
    box.className = "card";
    box.innerHTML = f?.libraryId && f?.visibility === "public" ? "Đang tải góp ý..." : "<h2>Góp ý cộng đồng</h2><p class='mu'>Công khai thư viện để bật comment và report.</p>";
    $("#app")?.appendChild(box);
    if (f?.libraryId && f?.visibility === "public") community(f.libraryId, true);
    else if (f?.sharedLibraryId) community(f.sharedLibraryId, false);
  }
  document.querySelectorAll("input[name=mode]").forEach(
    (r) =>
      (r.onchange = () => {
        S.mode = r.value;
      }),
  );
  $("#scope").onchange = (e) => {
    S.scope = e.target.value;
    home();
  };
  $("#from").onchange = (e) => {
    S.from = +e.target.value;
    if (S.to < S.from) S.to = S.from;
    home();
  };
  $("#to").onchange = (e) => {
    S.to = +e.target.value;
    if (S.from > S.to) S.from = S.to;
    home();
  };
  $("#cat").onchange = (e) => {
    S.cat = e.target.value;
    home();
  };
  $("#go").onclick = () => start(list);
  $("#cards").onclick = flashcards;
  $("#lib").onclick = lib;
  bindAccount();
  if (!isMimi) {
    $("#addWords").onclick = () => {
      imp(FID, true);
      $("#imp").scrollIntoView({ behavior: "smooth" });
    };
    $("#renameDeck").onclick = renameDeck;
    $("#removeDeck").onclick = () =>
      confirmBox(
        "Xoá cả bộ từ?",
        `Bạn có chắc muốn xoá bộ “${FN}” cùng ${W.length} từ và toàn bộ tiến độ học không? Không thể hoàn tác.`,
        "Xoá",
        removeDeckNow,
      );
  }
}
function flashcards(session = "all") {
  const sessions = [...new Set(W.map((w) => w.s || 1))].sort((a, b) => a - b);
  const list = session === "all" ? W : W.filter((w) => (w.s || 1) === +session);
  const cardHtml = (w) =>
    `<article class="card" data-card="${w.id}"><div class="row" style="justify-content:space-between"><span class="chip">${esc(sLabel(w.s || 1))}</span>${isMimi ? "" : `<span class="row"><button data-card-edit="${w.id}">Sửa</button><button data-card-delete="${w.id}">Xoá thẻ</button></span>`}</div><div class="big">${esc(w.k)}</div><div class="mu">${esc(w.h || "")}</div><p>${esc(w.m || "")}</p>${w.v ? `<div class="mu">Hán-Việt: ${esc(w.v)}</div>` : ""}${w.e ? `<div class="ex"><small>VÍ DỤ</small>${esc(w.e)}<br><span class="mu">${esc(w.t || "")}</span></div>` : ""}${w.p ? `<div class="mu">Mức độ: ${esc(w.p)}</div>` : ""}</article>`;
  $("#app").innerHTML =
    `<button id="backHome">← ${esc(FN)}</button><h1 style="margin-top:12px">Flashcard · ${list.length} từ</h1><div class="row" id="cardBar" style="margin:10px 0"><label>Thẻ <select id="cardSession"><option value="all">Tất cả</option>${sessions.map((n) => `<option value="${n}"${+session === n ? " selected" : ""}>${esc(sLabel(n))}</option>`).join("")}</select></label>${isMimi ? "" : `${session === "all" ? "" : `<button id="cardRename">Đổi tên thẻ</button><button class="danger" id="cardDelSes">Xoá cả thẻ này</button>`}<button id="cardAdd">Thêm thẻ mới</button>`}</div><div id="flashcardList">${list.length ? list.map(cardHtml).join("") : '<div class="card">Chưa có từ trong thẻ này.</div>'}</div>`;
  $("#backHome").onclick = home;
  const reportLibraryId = curF()?.libraryId || curF()?.sharedLibraryId;
  if (!isMimi && reportLibraryId && cloud().addReport) {
    document.querySelectorAll("[data-card]").forEach((article) => {
      const wordId = +article.dataset.card;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "report-word";
      button.textContent = "Báo lỗi";
      button.onclick = () => {
        const old = article.querySelector(".report-form");
        if (old) { old.remove(); return; }
        const form = document.createElement("div");
        form.className = "report-form";
        form.innerHTML = `<input placeholder="Mô tả lỗi sai" maxlength="300"><div class="row"><button class="p">Gửi report</button><button type="button" class="report-cancel">Huỷ</button></div>`;
        article.appendChild(form);
        form.querySelector(".report-cancel").onclick = () => form.remove();
        form.querySelector(".p").onclick = async () => {
          const content = form.querySelector("input").value.trim();
          if (!content) return form.querySelector("input").focus();
          try {
            await cloud().addReport(reportLibraryId, { wordId, content });
            form.innerHTML = `<span class="mu">Đã gửi report cho chủ thư viện.</span>`;
          } catch (_) {
            form.innerHTML = `<span class="mu">Không thể gửi report. Hãy kiểm tra đăng nhập.</span>`;
          }
        };
        form.querySelector("input").focus();
      };
      article.appendChild(button);
    });
  }
  if (!isMimi && reportLibraryId && cloud().addComment) {
    document.querySelectorAll("[data-card]").forEach((article) => {
      const wordId = +article.dataset.card;
      const reportButton = article.querySelector(".report-word");
      if (!reportButton) return;
      reportButton.className = "feedback-button report-button";
      reportButton.textContent = "Báo lỗi";
      const commentButton = document.createElement("button");
      commentButton.type = "button";
      commentButton.className = "feedback-button";
      commentButton.textContent = "Bình luận";
      reportButton.parentNode?.insertBefore(commentButton, reportButton);
      commentButton.onclick = async () => {
        const old = article.querySelector(".comment-form");
        if (old) { old.remove(); return; }
        const form = document.createElement("div");
        form.className = "comment-form";
        form.innerHTML = `<div class="feedback-heading">Góp ý cho từ này</div><div class="word-comments">Đang tải bình luận...</div><textarea placeholder="Chia sẻ góp ý hoặc cách hiểu của bạn..." maxlength="500"></textarea><div class="row feedback-actions"><button class="p">Gửi bình luận</button><button type="button" class="feedback-cancel">Huỷ</button></div>`;
        article.appendChild(form);
        try {
          const comments = (await cloud().listComments(reportLibraryId)).filter((x) => +x.wordId === wordId);
          form.querySelector(".word-comments").innerHTML = comments.length ? comments.map((x) => `<div class="word-comment"><b>${esc(x.authorName || "Người dùng")}</b><small>${fmtDate(x.createdAt)}</small><div>${esc(x.content || "")}</div></div>`).join("") : `<span class="mu">Chưa có bình luận. Hãy là người đầu tiên góp ý.</span>`;
        } catch (_) { form.querySelector(".word-comments").textContent = "Không tải được bình luận."; }
        form.querySelector(".feedback-cancel").onclick = () => form.remove();
        form.querySelector(".p").onclick = async () => {
          const content = form.querySelector("textarea").value.trim();
          if (!content) return form.querySelector("textarea").focus();
          try { await cloud().addComment(reportLibraryId, { wordId, content }); form.querySelector("textarea").value = ""; form.querySelector(".word-comments").insertAdjacentHTML("beforeend", `<div class="word-comment"><b>Bạn</b><div>${esc(content)}</div></div>`); }
          catch (_) { alert("Không thể gửi bình luận. Hãy kiểm tra đăng nhập."); }
        };
        form.querySelector("textarea").focus();
      };
    });
  }
  $("#cardSession").onchange = (e) => flashcards(e.target.value);
  if (!isMimi) {
    $("#cardAdd").onclick = () => {
      home();
      setTimeout(() => {
        $("#addWords").click();
      }, 0);
    };
    if ($("#cardRename")) {
      $("#cardRename").onclick = () => renameSession(session);
      $("#cardDelSes").onclick = () => deleteSession(session);
    }
    document
      .querySelectorAll("[data-card-delete]")
      .forEach(
        (b) => (b.onclick = () => deleteCard(+b.dataset.cardDelete, session)),
      );
    document
      .querySelectorAll("[data-card-edit]")
      .forEach(
        (b) => (b.onclick = () => editCard(+b.dataset.cardEdit, session)),
      );
  }
}
function editCard(id, session) {
  const f = curF(),
    c = f && f.w[id - 1],
    art = document.querySelector(`[data-card="${id}"]`);
  if (!c || !art) return;
  const ss = [...new Set(f.w.map((x) => +x.s || 1))].sort((a, b) => a - b);
  const v = (k) => esc(c[k] || "");
  art.innerHTML = `<div class="ed">
  <label>Từ<input id="ek" value="${v("k")}"></label>
  <div class="two"><label>Cách đọc<input id="eh" value="${v("h")}"></label><label>Hán-Việt<input id="ev" value="${v("v")}"></label></div>
  <label>Nghĩa<textarea id="em">${v("m")}</textarea></label>
  <label>Ví dụ<textarea id="ee">${v("e")}</textarea></label>
  <label>Dịch ví dụ<textarea id="et">${v("t")}</textarea></label>
  <div class="two"><label>Mức độ<input id="ep" value="${v("p")}"></label><label>Thuộc thẻ<select id="es">${ss.map((n) => `<option value="${n}"${n === (+c.s || 1) ? " selected" : ""}>${esc(sLabel(n))}</option>`).join("")}</select></label></div>
  <div class="row"><button class="p" id="esave">Lưu</button><button id="ecancel">Huỷ</button></div></div>`;
  const y = window.scrollY;
  $("#ek").focus();
  $("#ecancel").onclick = () => flashcards(session);
  $("#esave").onclick = () => {
    const k = $("#ek").value.trim();
    if (!k) {
      $("#ek").classList.add("shake");
      setTimeout(() => $("#ek").classList.remove("shake"), 300);
      return;
    }
    Object.assign(c, {
      k,
      h: $("#eh").value.trim(),
      v: $("#ev").value.trim(),
      m: $("#em").value.trim(),
      e: $("#ee").value.trim(),
      t: $("#et").value.trim(),
      p: $("#ep").value.trim(),
      s: +$("#es").value,
    });
    touch(f);
    reopenCards(session, y);
  };
}
function deleteCard(id, session) {
  const f = curF();
  if (!f || !f.w[id - 1]) return;
  confirmBox(
    "Xoá thẻ từ này?",
    `Bạn có chắc muốn xoá từ “${f.w[id - 1].k}” không? Không thể hoàn tác.`,
    "Xoá",
    () => {
      dropWords(f, new Set([id]));
      reopenCards(session);
    },
  );
}
function libraryBackup() {
  const p = {};
  FO.forEach((f) => (p[f.id] = ld("n3vocab_p_" + f.id) || {}));
  return { v: ld("n3vocab_v1") || {}, f: FO, p };
}
function restoreLibrary(o) {
  if (!o || typeof o !== "object" || !("f" in o || "p" in o || "v" in o))
    throw 0;
  const v = ld("n3vocab_v1") || {};
  mergeP(v, o.v || {});
  localStorage.setItem(scopedKey("n3vocab_v1"), JSON.stringify(v));
  (o.f || []).forEach((f) => {
    const x = FO.find((y) => y.id === f.id);
    if (!x) FO.push(f);
    else if (
      Array.isArray(f.w) &&
      ((f.u || 0) > (x.u || 0) || f.w.length > x.w.length)
    ) {
      x.w = f.w;
      if (f.name) x.name = f.name;
      if (f.sn) x.sn = f.sn;
      if (f.u) x.u = f.u;
    }
  });
  sv();
  Object.entries(o.p || {}).forEach(([id, p]) => {
    const q = ld("n3vocab_p_" + id) || {};
    mergeP(q, p);
    localStorage.setItem(scopedKey("n3vocab_p_" + id), JSON.stringify(q));
  });
}
function start(list) {
  Q = {
    mode: S.mode,
    items: shuffle(list.slice()).map((w) => ({ w, retry: false })),
    i: 0,
    total: list.length,
    ok: 0,
    ng: 0,
    wrong: [],
    phase: "ask",
    hint: 0,
  };
  quiz();
}
const qm = (w) => (Q.mode === "read" && hasK(w.k) ? "read" : "write");
function quiz() {
  if (Q.i >= Q.items.length) return summary();
  const it = Q.items[Q.i],
    w = it.w,
    m = qm(w);
  const first = [...parts(w.h)][0] || "";
  $("#app").innerHTML = `
 <div class="row" style="justify-content:space-between"><button id="back">Thoát</button><span class="mu">Đúng ${Q.ok} · Sai ${Q.ng} · ${Q.ok + Q.ng}/${Q.total}</span></div>
 <div class="bar"><i style="width:${Math.round(((Q.ok + Q.ng) / Q.total) * 100)}%"></i></div>
 <div class="card">
  <span class="chip">${esc(w.c)}</span>${w.g ? `<span class="chip">${esc(w.g)}</span>` : ""}${it.retry ? '<span class="chip">Làm lại từ vừa sai</span>' : ""}
  ${
    m === "read"
      ? `<div class="big">${esc(w.k)}</div><div class="mu">Gõ cách đọc bằng hiragana (gõ romaji sẽ tự đổi). Bật CapsLock hoặc gõ chữ HOA để ra katakana.</div>`
      : `<div class="big vi">${esc(w.m)}</div>${w.v ? `<div class="mu">Hán-Việt: ${esc(w.v)}</div>` : ""}<div class="mu">${hasK(w.k) ? "Gõ từ tiếng Nhật: cách đọc hoặc kanji." : "Gõ từ tiếng Nhật bằng kana."}</div>`
  }
  <div class="inwrap"><input id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" lang="ja" placeholder="Gõ đáp án rồi nhấn Enter"><span class="kmode" id="kmode"><b>あ</b><span>ひらがな</span></span></div>
  <div id="hint" class="mu">${Q.hint ? `Gợi ý: ${esc(first[0] || "")}…` : ""}</div>
  <div class="row" style="margin-top:8px"><button class="p" id="chk">Kiểm tra (Enter)</button><button id="hnt">Gợi ý</button><button id="skp">Chưa nhớ (Esc)</button></div>
  <div id="res"></div></div>`;
  const inp = $("#ans");
  inp.focus();
  const conv = () => {
    if (Q.phase !== "ask") return;
    const v = toKana(inp.value, false);
    if (v !== inp.value) inp.value = v;
  };
  // Nhãn chế độ: chữ HOA (CapsLock, Shift, bàn phím điện thoại) -> カタカナ, chữ thường -> ひらがな
  const km = $("#kmode");
  const setMode = (k) => {
    inp.classList.toggle("kata", k);
    km.classList.toggle("kata", k);
    km.innerHTML = k ? "<b>ア</b><span>カタカナ</span>" : "<b>あ</b><span>ひらがな</span>";
  };
  const letterMode = (ch) => {
    if (ch && /^[a-z]$/i.test(ch)) setMode(ch !== ch.toLowerCase());
  };
  inp.addEventListener("keydown", (ev) => letterMode(ev.key));
  inp.addEventListener("keyup", (ev) => {
    if (ev.key === "CapsLock") setMode(ev.getModifierState("CapsLock"));
  });
  inp.addEventListener("input", (e) => {
    letterMode(e.data);
    if (!e.isComposing) conv();
  });
  inp.addEventListener("compositionend", conv);
  $("#back").onclick = home;
  $("#chk").onclick = () => check();
  $("#skp").onclick = () => check(true);
  $("#hnt").onclick = () => {
    Q.hint = 1;
    $("#hint").textContent = "Gợi ý: " + (first[0] || "") + "…";
    inp.focus();
  };
}
function check(skip) {
  if (!Q || Q.phase !== "ask") return;
  const it = Q.items[Q.i],
    w = it.w,
    m = qm(w),
    inp = $("#ans");
  const val = skip ? "" : toKana(inp.value, true);
  inp.value = val;
  if (!skip && !val.trim()) {
    inp.classList.add("shake");
    setTimeout(() => inp.classList.remove("shake"), 300);
    return;
  }
  const ok = !skip && accepted(w, m).has(norm(val)),
    t = dayNum();
  Q.phase = "result";
  inp.readOnly = true;
  if (!it.retry) {
    const e = P[w.id] || [0, t, 0, 0];
    if (ok) {
      e[2]++;
      e[0] = Math.min(5, e[0] + 1);
      e[1] = t + INT[e[0]];
      Q.ok++;
    } else {
      e[3]++;
      e[0] = 0;
      e[1] = t;
      Q.ng++;
      Q.wrong.push(w);
      Q.items.splice(Math.min(Q.i + 4, Q.items.length), 0, { w, retry: true });
    }
    P[w.id] = e;
    save();
  }
  $("#res").innerHTML =
    `<div class="res ${ok ? "ok" : "no"}"><div class="rh"><span class="ic">${ok ? "✓" : "✗"}</span><b>${ok ? "Đúng!" : skip ? "Đáp án" : "Chưa đúng"}</b>${!ok && !skip ? `<span class="mu">Bạn gõ</span><span class="mine">${esc(val)}</span>` : ""}</div>
  <div class="det"><div class="ans"><span class="k">${esc(w.k)}</span>${w.h !== w.k ? `<span class="rd">${esc(w.h)}</span>` : ""}</div><div class="mean"><small>NGHĨA</small>${esc(w.m)}</div>${hv(w)}${w.n ? `<div class="mu" style="margin-top:8px">${esc(w.n)}</div>` : ""}${w.e ? `<div class="ex"><small>VÍ DỤ</small>${esc(w.e)}<br><span class="mu">${esc(w.t || "")}</span></div>` : ""}</div>
  <div style="margin-top:10px"><button class="p" id="nx">Tiếp (Enter)</button></div></div>`;
  $("#nx").onclick = next;
  $("#chk").disabled = $("#skp").disabled = $("#hnt").disabled = true;
}
function hv(w) {
  if (!w.v) return "";
  const ks = w.k.match(/[\u4e00-\u9fff]/g) || [],
    sy = w.v.trim().split(/\s+/);
  if (ks.length && ks.length === sy.length)
    return `<div class="hv"><small>HÁN-VIỆT</small><div class="tiles">${ks.map((c, i) => `<span class="tl"><b>${c}</b><i>${esc(sy[i])}</i></span>`).join("")}</div></div>`;
  return `<div class="hv"><small>HÁN-VIỆT</small><span class="hvt">${esc(w.v)}</span></div>`;
}
function next() {
  if (!Q || Q.phase !== "result") return;
  Q.i++;
  Q.phase = "ask";
  Q.hint = 0;
  quiz();
}
function summary() {
  const pct = Q.total ? Math.round((Q.ok / Q.total) * 100) : 0,
    wr = [...new Map(Q.wrong.map((w) => [w.id, w])).values()];
  $("#app").innerHTML =
    `<h1><span class="hanko">完</span>Hoàn thành</h1><div class="card"><div class="big" style="font-size:40px">${Q.ok}/${Q.total} đúng ngay lần đầu</div><div class="mu">${pct}%</div>
 ${wr.length ? `<h2 style="margin-top:14px">Từ cần ôn lại (${wr.length})</h2><table>${wr.map((w) => `<tr><td style="font-size:18px">${esc(w.k)}</td><td>${esc(w.h !== w.k ? w.h : "")}</td><td>${esc(w.m)}</td></tr>`).join("")}</table>` : "<p>Không có từ nào sai. Rất tốt!</p>"}
 <div class="row" style="margin-top:14px">${wr.length ? '<button class="p" id="rt">Ôn lại từ sai</button>' : ""}<button id="hm"${wr.length ? "" : ' class="p"'}>Về trang chính</button></div></div>`;
  Q.done = 1;
  $("#hm").onclick = home;
  if (wr.length) $("#rt").onclick = () => start(wr);
}
document.addEventListener("keydown", (e) => {
  if (!Q || Q.done || !$("#ans") || e.target.tagName === "BUTTON") return;
  if (e.key === "Enter") {
    e.preventDefault();
    Q.phase === "ask" ? check() : next();
  } else if (e.key === "Escape" && Q.phase === "ask") {
    e.preventDefault();
    check(true);
  }
});
let FO = ld("n3vocab_folders") || [];
let SHARED_LIBRARY = null;
const sv = () => {
  try {
    localStorage.setItem(scopedKey("n3vocab_folders"), JSON.stringify(FO));
  } catch (e) {}
  syncCloud();
};
let isMimi = true,
  FN = "",
  FID = "mimi";
// Tên thẻ (buổi): mặc định "Buổi n", có thể đổi thành "Từ vựng 1.1"...
const curF = () => FO.find((x) => x.id === FID);
const sLabel = (n) => {
  const f = isMimi ? null : curF();
  return (f && f.sn && f.sn[n]) || "Buổi " + n;
};
const touch = (f) => {
  f.u = Date.now();
  sv();
  if (f?.libraryId && f.visibility === "public" && cloud().publishLibrary)
    cloud().publishLibrary(libraryData(f)).catch(() => {});
};
const cloud = () => window.cloudSync || {};
const libraryData = (f) => ({
  id: f.libraryId || null,
  name: f.name,
  description: f.description || "",
  visibility: f.visibility || "private",
  editors: f.editors || [],
  words: f.w,
  sn: f.sn || {},
});
function publishCurrentDeck() {
  changeDeckVisibility();
}
async function changeDeckVisibility() {
  const f = curF();
  if (!f || isMimi || !cloud().publishLibrary) return;
  const makePublic = f.visibility !== "public";
  confirmBox(
    makePublic ? "Công khai thư viện?" : "Tắt công khai thư viện?",
    makePublic
      ? `Mọi người có link sẽ xem và dùng được bộ từ “${f.name}”. Bạn có muốn công khai không?`
      : `Người khác sẽ không thể mở link thư viện “${f.name}” nữa. Bạn có muốn chuyển về Không công khai không?`,
    makePublic ? "Công khai" : "Tắt công khai",
    async () => {
      try {
        f.visibility = makePublic ? "public" : "private";
        f.libraryId = await cloud().publishLibrary(libraryData(f));
        touch(f);
        const link = `${location.origin}${location.pathname}?library=${encodeURIComponent(f.libraryId)}`;
        alert(makePublic ? `Đã công khai thư viện. Link chia sẻ:\n${link}` : "Đã chuyển thư viện về chế độ không công khai.");
        home();
      } catch (e) {
        f.visibility = makePublic ? "private" : "public";
        alert("Không thể cập nhật chế độ chia sẻ. Hãy kiểm tra đăng nhập và Firestore Rules.");
      }
    },
    makePublic ? "success" : "danger",
  );
}
async function copyLibraryFromShared() {
  const x = SHARED_LIBRARY;
  if (!x || !Array.isArray(x.words)) return;
  const f = { id: "f" + Date.now().toString(36), name: x.name || "Thư viện được chia sẻ", w: x.words.map((w) => ({ ...w })), sn: x.sn || {}, sourceLibraryId: x.id, visibility: "private" };
  f.sharedLibraryId = x.id;
  FO.push(f);
  sv();
  alert("Đã thêm thư viện vào tài khoản của bạn. Tiến độ học sẽ được lưu riêng.");
  openF(f.id);
}
function fmtDate(x) {
  const d = x && x.toDate ? x.toDate() : x ? new Date(x) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleString("vi-VN") : "vừa xong";
}
const notificationSeenKey = (libraryId) => scopedKey("notification_seen_" + libraryId);
function getSeenNotificationIds(libraryId) {
  try { return new Set(JSON.parse(localStorage.getItem(notificationSeenKey(libraryId)) || "[]")); }
  catch (_) { return new Set(); }
}
function setSeenNotificationIds(libraryId, ids) {
  try { localStorage.setItem(notificationSeenKey(libraryId), JSON.stringify([...ids])); }
  catch (_) {}
}
async function refreshLibraryNotifications() {
  const userId = cloud().user?.uid;
  if (!userId || !cloud().listComments || !cloud().listReports) return;
  await Promise.all(FO.filter((f) => f.visibility === "public" && f.libraryId).map(async (f) => {
    const badge = [...document.querySelectorAll("[data-notifications]")].find((x) => x.dataset.notifications === f.id);
    if (!badge) return;
    try {
      const [comments, reports] = await Promise.all([cloud().listComments(f.libraryId), cloud().listReports(f.libraryId)]);
      const seen = getSeenNotificationIds(f.libraryId);
      const newIds = [
        ...comments.filter((x) => x.authorId !== userId).map((x) => "comment:" + x.id),
        ...reports.filter((x) => x.reporterId !== userId).map((x) => "report:" + x.id),
      ];
      const count = newIds.filter((id) => !seen.has(id)).length;
      badge.textContent = `🔔 ${count > 99 ? "99+" : count}`;
      badge.title = `${count} thông báo mới · bấm để xem`;
      badge.setAttribute("aria-label", badge.title);
      badge.classList.toggle("hidden", count === 0);
    } catch (_) { badge.classList.add("hidden"); }
  }));
}
async function community(libraryId, canManage) {
  const box = $("#community");
  if (!box || !libraryId || !cloud().listComments) return;
  try {
    const [comments, reports] = await Promise.all([cloud().listComments(libraryId), canManage && cloud().listReports ? cloud().listReports(libraryId) : []]);
    if (canManage) {
      const seen = getSeenNotificationIds(libraryId);
      comments.filter((x) => x.authorId !== cloud().user?.uid).forEach((x) => seen.add("comment:" + x.id));
      reports.filter((x) => x.reporterId !== cloud().user?.uid).forEach((x) => seen.add("report:" + x.id));
      setSeenNotificationIds(libraryId, seen);
    }
    box.innerHTML = `<h2>Góp ý cộng đồng</h2><div id="commentList">${comments.length ? comments.map((c) => `<div class="comment"><b>${esc(c.authorName || "Người dùng")}</b><small>${fmtDate(c.createdAt)}</small><div>${esc(c.content || "")}</div></div>`).join("") : `<p class="mu">Chưa có comment nào.</p>`}</div><textarea id="commentText" placeholder="Viết comment để mọi người cùng đọc..."></textarea><button class="p" id="commentSend">Gửi comment</button><div class="row" style="margin-top:12px"><select id="reportWord"><option value="">Chọn từ cần báo lỗi</option>${W.map((w) => `<option value="${w.id}">${esc(w.k)}</option>`).join("")}</select><input id="reportText" placeholder="Mô tả lỗi sai" style="flex:1;min-width:180px"><button id="reportSend">Báo lỗi</button></div>${canManage && reports.length ? `<hr><h2>Report cần xử lý</h2>${reports.map((r) => `<div class="comment"><b>${esc(r.reporterName || "Người dùng")}</b> · ${esc(r.status || "open")}<div>${esc(r.content || "")}</div><button data-resolve-report="${r.id}">Đánh dấu đã xử lý</button></div>`).join("")}` : ""}`;
    $("#commentSend").onclick = async () => { const content = $("#commentText").value.trim(); if (!content) return; await cloud().addComment(libraryId, { content }); community(libraryId, canManage); };
    $("#reportSend").onclick = async () => { const wordId = $("#reportWord").value, content = $("#reportText").value.trim(); if (!wordId || !content) return alert("Hãy chọn từ và nhập nội dung báo lỗi."); await cloud().addReport(libraryId, { wordId: +wordId, content }); alert("Đã gửi report cho chủ thư viện."); };
    box.querySelectorAll("[data-resolve-report]").forEach((b) => b.onclick = async () => { await cloud().updateReport(libraryId, b.dataset.resolveReport, { status: "resolved" }); community(libraryId, canManage); });
  } catch (e) { box.innerHTML = `<p class="mu">Không tải được phần góp ý.</p>`; }
}
async function openSharedLibrary(id) {
  if (!id || !cloud().getLibrary) return false;
  try {
    const x = await cloud().getLibrary(id);
    if (!x || x.visibility !== "public") { alert("Thư viện này không công khai hoặc không tồn tại."); return false; }
    SHARED_LIBRARY = x;
    const words = Array.isArray(x.words) ? x.words : [];
    $("#app").innerHTML = `${accountBar()}<button id="sharedBack">← Thư viện của tôi</button><h1>${esc(x.name || "Thư viện chia sẻ")}</h1><p class="mu">${esc(x.description || "Thư viện công khai · " + words.length + " từ")}</p><div class="card"><div class="row"><button class="p" id="useShared">Dùng thư viện này</button><span class="mu">Chủ thư viện: ${esc(x.ownerName || "Người dùng")}</span></div></div><div id="community" class="card">Đang tải góp ý...</div>`;
    const sharedTitle = $("#app h1");
    if (sharedTitle) {
      const badge = document.createElement("span");
      badge.className = "visibility-badge is-public";
      badge.textContent = "Đang chia sẻ công khai";
      sharedTitle.appendChild(badge);
    }
    $("#sharedBack").onclick = lib; $("#useShared").onclick = copyLibraryFromShared; bindAccount(); community(id, false); return true;
  } catch (e) { return false; }
}
function reopenCards(session, y) {
  openF(FID);
  setTimeout(() => {
    flashcards(session);
    if (y) window.scrollTo(0, y);
  }, 0);
}
// Hộp xác nhận ngay trong trang: [Huỷ] [Xoá]
function confirmBox(title, msg, okText, onOk, variant = "danger") {
  const ov = document.createElement("div");
  ov.className = "modal";
  ov.innerHTML = `<div class="dlg dlg-${variant === "success" ? "success" : "danger"}" role="alertdialog" aria-modal="true"><h2>${esc(title)}</h2><p>${esc(msg)}</p><div class="row"><button id="cfNo">Huỷ</button><button class="${variant === "success" ? "success" : "danger"}" id="cfOk">${esc(okText)}</button></div></div>`;
  document.body.appendChild(ov);
  const close = () => {
    ov.remove();
    document.removeEventListener("keydown", kd, true);
  };
  const kd = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  };
  document.addEventListener("keydown", kd, true);
  ov.onclick = (e) => {
    if (e.target === ov) close();
  };
  $("#cfNo").onclick = close;
  $("#cfOk").onclick = () => {
    close();
    onOk();
  };
  $("#cfNo").focus();
}
// Xoá nhiều từ cùng lúc, dồn lại số thứ tự và tiến độ học
function dropWords(f, drop) {
  const map = {};
  let n = 0;
  f.w = f.w.filter((x, i) => {
    if (drop.has(i + 1)) return false;
    map[i + 1] = ++n;
    return true;
  });
  const np = {};
  Object.entries(P).forEach(([k, v]) => {
    if (Number.isNaN(+k)) np[k] = v;
    else if (map[+k]) np[map[+k]] = v;
  });
  P = np;
  save();
  touch(f);
}
function deleteSession(session) {
  const f = curF();
  if (!f || session === "all") return;
  const ids = new Set();
  f.w.forEach((x, i) => {
    if ((+x.s || 1) === +session) ids.add(i + 1);
  });
  if (!ids.size) return;
  const label = sLabel(+session),
    whole = ids.size === f.w.length;
  confirmBox(
    "Xoá cả thẻ này?",
    `Bạn có chắc muốn xoá thẻ “${label}” cùng ${ids.size} từ trong đó không?${whole ? " Đây là thẻ duy nhất nên cả bộ sẽ bị xoá." : ""} Tiến độ học của các từ này cũng mất và không thể hoàn tác.`,
    "Xoá",
    () => {
      if (whole) return removeDeckNow();
      dropWords(f, ids);
      if (f.sn) delete f.sn[session];
      touch(f);
      reopenCards("all");
    },
  );
}
function removeDeckNow() {
  FO = FO.filter((f) => f.id !== FID);
  sv();
  try {
    localStorage.removeItem(scopedKey(KEY));
  } catch (e) {}
  lib();
}
// Ô nhập tên ngay trên trang (thay cho hộp thoại prompt của trình duyệt)
function askName(anchor, title, value, onSave, allowEmpty) {
  const old = document.querySelector("#renBox");
  if (old) old.remove();
  if (!anchor) return;
  const box = document.createElement("div");
  box.className = "card ed";
  box.id = "renBox";
  box.innerHTML = `<label>${esc(title)}<input id="renIn" value="${esc(value)}" maxlength="60" autocomplete="off"></label><div class="row"><button class="p" id="renOk">Lưu</button><button id="renNo">Huỷ</button></div>`;
  anchor.insertAdjacentElement("afterend", box);
  const inp = $("#renIn");
  inp.focus();
  inp.select();
  box.scrollIntoView({ block: "nearest", behavior: "smooth" });
  const done = () => {
    const t = inp.value.trim();
    if (!t && !allowEmpty) {
      inp.classList.add("shake");
      setTimeout(() => inp.classList.remove("shake"), 300);
      return;
    }
    box.remove();
    onSave(t);
  };
  $("#renOk").onclick = done;
  $("#renNo").onclick = () => box.remove();
  inp.onkeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      done();
    } else if (e.key === "Escape") box.remove();
  };
}
function renameSession(session) {
  const f = curF();
  if (!f || session === "all") return;
  askName(
    $("#cardBar"),
    "Tên thẻ (ví dụ: Từ vựng 1.1). Để trống = Buổi " + session,
    sLabel(+session),
    (t) => {
      f.sn = f.sn || {};
      if (t && t !== "Buổi " + session) f.sn[session] = t;
      else delete f.sn[session];
      touch(f);
      reopenCards(session);
    },
    true,
  );
}
function renameDeck() {
  const f = curF();
  if (!f) return;
  askName($("#deckBar"), "Tên bộ từ", f.name, (t) => {
    f.name = t;
    touch(f);
    openF(FID);
  });
}
function openF(id, skipLinkedRefresh = false) {
  FID = id;
  isMimi = id === "mimi";
  if (isMimi) {
    W = MIMI;
    KEY = "n3vocab_v1";
    FN = "Mimikara N3";
  } else {
    const f = FO.find((x) => x.id === id);
    if (!skipLinkedRefresh && f?.sourceLibraryId && cloud().getLibrary) {
      cloud().getLibrary(f.sourceLibraryId).then((remote) => {
        if (remote && remote.visibility === "public" && Array.isArray(remote.words)) {
          f.w = remote.words.map((w) => ({ ...w }));
          f.sn = remote.sn || {};
          f.name = remote.name || f.name;
          sv();
          if (FID === id) openF(id, true);
        }
      }).catch(() => {});
    }
    W = f.w.map((x, i) => ({
      s: x.s || 1,
      c: "Từ vựng",
      g: x.g || "",
      id: i + 1,
      k: x.k,
      h: x.h || x.k,
      v: x.v || "",
      m: x.m || "",
      n: "",
      e: x.e || "",
      t: x.t || "",
      p: x.p || "",
    }));
    KEY = "n3vocab_p_" + id;
    FN = f.name;
  }
  P = ld(KEY) || {};
  maxS = Math.max(...W.map((w) => w.s));
  S = {
    mode: "read",
    scope: isMimi ? defScope : "new",
    from: 1,
    to: 1,
    cat: "all",
  };
  home();
}
const QT = String.fromCharCode(34),
  TB = String.fromCharCode(9),
  NL = String.fromCharCode(10),
  CR = String.fromCharCode(13);
function parseTable(t) {
  const d = t.indexOf(TB) >= 0 ? TB : ",",
    rows = [];
  let r = [],
    f = "",
    q = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) {
      if (c === QT) {
        if (t[i + 1] === QT) {
          f += QT;
          i++;
        } else q = 0;
      } else f += c;
    } else if (c === QT && !f) q = 1;
    else if (c === d) {
      r.push(f);
      f = "";
    } else if (c === NL || c === CR) {
      if (c === CR && t[i + 1] === NL) i++;
      r.push(f);
      f = "";
      rows.push(r);
      r = [];
    } else f += c;
  }
  r.push(f);
  rows.push(r);
  return rows.filter((r) => r.some((x) => x.trim()));
}
const COLS = [
  ["k", /言葉|単語|日本語|từ vựng|word|kanji|漢字|^từ$|^tiếng nhật$|^japanese$/i],
  ["h", /読み|よみ|hiragana|cách đọc|reading|furigana/i],
  ["m", /意味|nghĩa|meaning|^ベトナム語$|^tiếng việt$|^vietnamese$/i],
  ["e", /例文|ví dụ|example/i],
  ["t", /訳|dịch|translation/i],
  ["v", /hán.?việt|漢越/i],
  ["g", /nhóm|group|分類|chủ đề/i],
  ["p", /mức độ|muc do|level|difficulty|rank|重要/i],
];
// Cột số thứ tự (No., STT, #...) luôn bị bỏ qua
const IDX = /^(no\.?|stt|#|№|số tt|số thứ tự|番号|ばんごう)$/i;
const LB = {
  k: "Từ",
  h: "Cách đọc",
  m: "Nghĩa",
  e: "Ví dụ",
  t: "Dịch ví dụ",
  v: "Hán-Việt",
  g: "Nhóm",
  p: "Mức độ",
};
function readTable(t) {
  const rows = parseTable(t);
  let map = null,
    st = 0,
    noCol = false;
  for (let i = 0; i < Math.min(6, rows.length); i++) {
    const m = {};
    rows[i].forEach((x, j) => {
      x = x.trim().replace(/^\uFEFF/, "");
      for (const [f, re] of COLS) {
        if (m[f] == null && re.test(x)) {
          m[f] = j;
          break;
        }
      }
    });
    if (m.k != null && (m.m != null || m.h != null)) {
      map = m;
      st = i + 1;
      noCol = rows[i].some((x) => IDX.test(x.trim().replace(/^\uFEFF/, "")));
      break;
    }
  }
  if (!map) {
    // Không thấy dòng tiêu đề: nếu cột đầu toàn số (1, 2, 3...) thì coi là STT và bỏ qua
    const isN = (r) => /^\d+$/.test((r[0] || "").trim());
    const idx = rows.filter(isN).length >= Math.max(2, rows.length * 0.8) ? 1 : 0;
    map = { k: idx, h: idx + 1, m: idx + 2, e: idx + 3, t: idx + 4 };
    st = idx ? Math.max(0, rows.findIndex(isN)) : 0;
    noCol = !!idx;
  }
  const g = (r, f) => (map[f] == null ? "" : (r[map[f]] || "").trim());
  return {
    map,
    noCol,
    w: rows
      .slice(st)
      .map((r) => ({
        k: g(r, "k"),
        h: g(r, "h"),
        m: g(r, "m"),
        e: g(r, "e"),
        t: g(r, "t"),
        v: g(r, "v"),
        g: g(r, "g"),
        p: g(r, "p"),
      }))
      .filter((x) => x.k),
  };
}
function imp(tid, expanded = false) {
  const f = tid && FO.find((x) => x.id === tid),
    fs =
      "font:inherit;color:var(--tx);background:var(--bg);border:1px solid var(--ln);border-radius:8px;padding:8px 10px;width:100%";
  if (!f && !expanded) {
    $("#imp").innerHTML =
      `<button id="showImp" type="button">＋ Thêm bộ từ mới</button>`;
    $("#showImp").onclick = () => imp(null, true);
    return;
  }
  const nextS = f ? Math.max(0, ...f.w.map((x) => +x.s || 1)) + 1 : 1;
  $("#imp").innerHTML =
    `<h2>${f ? "Thêm từ vào “" + esc(f.name) + "”" : "Tạo bộ từ vựng mới"}</h2>${f ? "" : `<input id='nm' placeholder='Tên bộ, ví dụ: IT日本語 – Mạng' style='${fs};margin-bottom:8px'>`}<input id='sn' placeholder='Tên thẻ, ví dụ: Từ vựng 1.1 (để trống = Buổi ${nextS})' style='${fs};margin-bottom:8px'><input id='csvFile' type='file' accept='.csv,text/csv' hidden><button id='uploadCsv' type='button'>Upload File (.csv)</button><textarea id='tb' style='${fs};height:120px' spellcheck='false' placeholder='Hoặc dán dữ liệu CSV/Google Sheets vào đây.'></textarea><p class='mu' id='pv'>Cột CSV được map thành: Từ vựng, Cách đọc, Ý nghĩa, Ví dụ, Dịch nghĩa, Mức độ. Cột số thứ tự (No., STT) sẽ tự bỏ qua.</p><button class='p' id='ok'>${f ? "Thêm vào bộ" : "Tạo bộ"}</button>`;
  const tb = $("#tb");
  $("#uploadCsv").onclick = () => $("#csvFile").click();
  $("#csvFile").onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!/\.csv$/i.test(file.name)) {
      alert("Vui lòng chọn file .csv");
      e.target.value = "";
      return;
    }
    try {
      tb.value = await file.text();
      tb.dispatchEvent(new Event("input"));
      const sn = $("#sn");
      if (sn && !sn.value.trim()) {
        // Gợi ý tên thẻ từ tên file: "..._-_7_3_LAN間接続装置.csv" -> "7.3 LAN間接続装置"
        const stem = file.name.replace(/\.csv$/i, "").split("_-_").pop();
        sn.value = stem.replace(/_+/g, " ").trim().replace(/^(\d+) (\d+) /, "$1.$2 ");
      }
    } catch (_) {
      alert("Không thể đọc file CSV.");
    }
  };
  tb.oninput = () => {
    const r = readTable(tb.value),
      nr = r.w.filter((x) => !x.h).length;
    $("#pv").textContent = r.w.length
      ? `Nhận được ${r.w.length} từ. Cột: ${Object.keys(r.map)
          .map((k) => LB[k])
          .join(", ")}.${r.noCol ? " Đã bỏ cột STT." : ""}${nr ? ` ${nr} từ chưa có cách đọc.` : ""}`
      : "Chưa nhận được từ nào.";
  };
  $("#ok").onclick = () => {
    const r = readTable(tb.value);
    if (!r.w.length) {
      $("#pv").textContent = "Chưa có từ nào để nhập.";
      return;
    }
    const targetSession = f ? Math.max(0, ...f.w.map((x) => +x.s || 1)) + 1 : 1;
    r.w.forEach((x) => {
      x.s = targetSession;
    });
    const sname = $("#sn").value.trim();
    if (f) {
      f.w.push(...r.w);
      if (sname) (f.sn = f.sn || {})[targetSession] = sname;
    } else
      FO.push({
        id: "f" + Date.now().toString(36),
        name: $("#nm").value.trim() || "Bộ mới",
        w: r.w,
        sn: sname ? { 1: sname } : {},
      });
    touch(f || FO[FO.length - 1]);
    alert(
      "Đã thêm thành công " +
        r.w.length +
        " từ vựng mới · " +
        (sname || "Buổi " + targetSession),
    );
    openF(f ? f.id : FO[FO.length - 1].id);
  };
}
function lib() {
  Q = null;
  const t = dayNum();
  const card = (id, name, n, p, isPublic = false) => {
    const en = Object.values(p),
      due = en.filter((e) => e[1] <= t).length;
    return `<div class='card library-card${isPublic ? " library-card-public" : ""}'><div class='row' style='justify-content:space-between'><div><b>${esc(name)}</b><div class='mu'>${n} từ · đã làm ${en.length} · đến hạn ôn ${due}</div></div><button class='p' data-o='${id}'>Mở</button></div></div>`;
  };
  $("#app").innerHTML =
    `${accountBar()}<section class="library-heading"><h1>THƯ VIỆN TỪ VỰNG</h1><div class="mu">Mỗi bộ có tiến độ học riêng, không ảnh hưởng lẫn nhau.</div></section>${card("mimi", "Mimikara N3", MIMI.length, ld("n3vocab_v1") || {})}${FO.map((f) => card(f.id, f.name, f.w.length, ld("n3vocab_p_" + f.id) || {}, f.visibility === "public")).join("")}<div class='card' id='imp'></div>`;
  document
    .querySelectorAll("[data-o]")
    .forEach((b) => {
      b.onclick = () => openF(b.dataset.o);
      const f = FO.find((x) => x.id === b.dataset.o);
      const title = b.closest(".row")?.querySelector("b");
      if (f && title) {
        const badge = document.createElement("span");
        badge.className = `visibility-badge ${f.visibility === "public" ? "is-public" : "is-private"}`;
        badge.textContent = f.visibility === "public" ? "Công khai" : "Không công khai";
        title.insertAdjacentElement("afterend", badge);
        if (f.visibility === "public" && f.libraryId && cloud().user?.uid) {
          const notify = document.createElement("button");
          notify.type = "button";
          notify.className = "notification-badge hidden";
          notify.dataset.notifications = f.id;
          notify.textContent = "🔔 0";
          notify.onclick = () => {
            openF(f.id);
            setTimeout(() => $("#community")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
          };
          b.parentNode?.insertBefore(notify, b);
        }
      }
    });
  bindAccount();
  imp();
  refreshLibraryNotifications();
}
function clearGuestData(backup) {
  try {
    localStorage.removeItem("n3vocab_folders");
    localStorage.removeItem("n3vocab_v1");
    ((backup && backup.f) || []).forEach((f) =>
      localStorage.removeItem("n3vocab_p_" + f.id),
    );
  } catch (e) {}
}
window.onCloudUserChanged = async (uid) => {
  const guest =
    !CLOUD_UID &&
    uid &&
    !localStorage.getItem("n3vocab_guest_migrated") &&
    (FO.length || Object.keys(ld("n3vocab_v1") || {}).length)
      ? libraryBackup()
      : null;
  CLOUD_UID = uid || "";
  FO = ld("n3vocab_folders") || [];
  if (uid || OFFLINE_MODE || !(window.cloudSync || {}).configured)
    openF("mimi");
  return guest;
};
window.onCloudData = async (data) => {
  try {
    restoreLibrary(data);
    clearGuestData();
    localStorage.setItem("n3vocab_guest_migrated", CLOUD_UID);
    if (!Q) lib();
  } catch (e) {
    console.error("Không thể đồng bộ dữ liệu cloud", e);
  }
};
window.onCloudInitialData = async (data) => {
  try {
    restoreLibrary(data);
    clearGuestData(data);
    localStorage.setItem("n3vocab_guest_migrated", CLOUD_UID);
    if (!Q) lib();
  } catch (e) {
    console.error("Không thể chuyển dữ liệu local lên cloud", e);
  }
};
window.onCloudAuthChanged = async (user) => {
  if (Q) return;
  const sharedId = new URLSearchParams(location.search).get("library");
  if (user && sharedId && await openSharedLibrary(sharedId)) return;
  if (user || OFFLINE_MODE || !(window.cloudSync || {}).configured) lib();
  else loginScreen();
};
if ((window.cloudSync || {}).configured && !(window.cloudSync || {}).user)
  loginScreen();
else lib();
