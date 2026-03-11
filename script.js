"use strict";

// ---------- helpers ----------
const $ = (sel) => document.querySelector(sel);

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function load(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

// ---------- theme ----------
const themeBtn = $("#themeBtn");
const root = document.documentElement;
const savedTheme = load("theme", "dark");
if (savedTheme === "light") root.dataset.theme = "light";

function updateThemeIcon() {
  const isLight = root.dataset.theme === "light";
  themeBtn.textContent = isLight ? "☀️" : "🌙";
}
updateThemeIcon();

themeBtn.addEventListener("click", () => {
  const isLight = root.dataset.theme === "light";
  root.dataset.theme = isLight ? "dark" : "light";
  save("theme", root.dataset.theme);
  updateThemeIcon();
});

// ---------- hamburger menu ----------
const hamburger = $('.hamburger');
const nav = $('.nav');
hamburger.addEventListener('click', () => {
  nav.classList.toggle('nav--open');
});

// ---------- footer year ----------
$("#year").textContent = String(new Date().getFullYear());

// ---------- hero stats ----------
const bestScore = load("bestQuizScore", 0);
$("#scoreSaved").textContent = String(bestScore);

function updateChecklistSavedStat() {
  const state = load("checklist", {});
  const total = 6;
  const done = Object.values(state).filter(Boolean).length;
  const pct = Math.round((done / total) * 100);
  $("#checkSaved").textContent = `${pct}%`;
}
updateChecklistSavedStat();

// ---------- phishing trainer ----------
const phishResult = $("#phishResult");
const mailA = $("#mailA");
const mailB = $("#mailB");

function setPhish(text, ok) {
  phishResult.textContent = text;
  phishResult.style.color = ok ? "var(--ok)" : "var(--bad)";
  phishResult.style.borderColor = ok ? "color-mix(in oklab, var(--ok), var(--line) 55%)"
                                    : "color-mix(in oklab, var(--bad), var(--line) 55%)";
}

mailA.addEventListener("click", () => {
  setPhish(
    "Это подозрительно: в адресе paypaI.com буква I вместо l + есть давление «срочно». Это типичный фишинг.",
    false
  );
});
mailB.addEventListener("click", () => {
  setPhish(
    "Это выглядит безопаснее: нормальный домен + нет просьбы перейти по «волшебной ссылке», советуют зайти вручную.",
    true
  );
});

// keyboard access
[mailA, mailB].forEach((el) => {
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") el.click();
  });
});

// ---------- password meter ----------
const pwd = $("#pwd");
const meterBar = $("#meterBar");
const pwdLevel = $("#pwdLevel");
const pwdHint = $("#pwdHint");
const togglePwd = $("#togglePwd");

togglePwd.addEventListener("click", () => {
  const isPw = pwd.type === "password";
  pwd.type = isPw ? "text" : "password";
  togglePwd.textContent = isPw ? "Скрыть" : "Показать";
});

function scorePassword(s) {
  // простая оценка (учебная)
  let score = 0;
  const len = s.length;

  if (len >= 8) score += 20;
  if (len >= 12) score += 25;
  if (len >= 16) score += 15;

  if (/[a-z]/.test(s) && /[A-Z]/.test(s)) score += 15;
  if (/\d/.test(s)) score += 10;
  if (/[^A-Za-z0-9]/.test(s)) score += 15;

  // штраф за очень частые пароли-паттерны
  const lower = s.toLowerCase();
  if (/(qwerty|12345|password|admin|1111)/.test(lower)) score -= 30;

  return clamp(score, 0, 100);
}

function renderPassword() {
  const s = pwd.value || "";
  const sc = scorePassword(s);
  meterBar.style.width = `${sc}%`;

  let level = "Слабый";
  let color = "var(--bad)";
  let hint = "Сделай длиннее (12+), добавь цифры/символы и уникальность.";

  if (sc >= 40) { level = "Норм"; color = "var(--warn)"; hint = "Неплохо. Добавь длину или уникальную фразу."; }
  if (sc >= 70) { level = "Сильный"; color = "var(--ok)"; hint = "Хорошо. Лучше использовать фразу и не повторять её нигде."; }

  meterBar.style.background = color;
  pwdLevel.textContent = `Уровень: ${level}`;
  pwdHint.textContent = hint;
}
pwd.addEventListener("input", renderPassword);
renderPassword();

// ---------- quiz ----------
const quiz = [
  {
    q: "Что безопаснее делать, если пришла «срочная» ссылка на вход?",
    a: [
      { t: "Перейти по ссылке, чтобы быстрее", ok: false },
      { t: "Открыть сайт вручную и проверить уведомления", ok: true },
      { t: "Отправить ссылку другу, пусть проверит", ok: false },
    ],
    why: "Ссылки могут вести на поддельные сайты. Лучше открыть сервис вручную."
  },
  {
    q: "Зачем нужна двухфакторная защита (2FA)?",
    a: [
      { t: "Чтобы аккаунт выглядел круче", ok: false },
      { t: "Чтобы добавить второй шаг подтверждения входа", ok: true },
      { t: "Чтобы интернет стал быстрее", ok: false },
    ],
    why: "2FA снижает риск взлома даже при утечке пароля."
  },
  {
    q: "Какой пароль лучше?",
    a: [
      { t: "maksim2008", ok: false },
      { t: "Qwerty123", ok: false },
      { t: "Kotik-2026-super! (и уникальный)", ok: true },
    ],
    why: "Лучше длинный, с разными символами, и уникальный для каждого сервиса."
  },
  {
    q: "Что нельзя сообщать никому?",
    a: [
      { t: "Код из SMS/почты для входа", ok: true },
      { t: "Любимую игру", ok: false },
      { t: "Название школы (без деталей)", ok: false },
    ],
    why: "Коды подтверждения — это ключ к аккаунту."
  },
  {
    q: "Публичный Wi-Fi в кафе — что делать?",
    a: [
      { t: "Не заходить в банк/важные аккаунты без необходимости", ok: true },
      { t: "Вводить пароли как обычно, это безопасно", ok: false },
      { t: "Раздать Wi-Fi всем подряд", ok: false },
    ],
    why: "Публичные сети могут быть небезопасны. С важными входами — осторожно."
  }
];

const qText = $("#qText");
const qAnswers = $("#qAnswers");
const qNotice = $("#qNotice");
const qNext = $("#qNext");
const qRestart = $("#qRestart");
const qProgress = $("#qProgress");
const qScore = $("#qScore");

let qi = 0;
let score = 0;
let locked = false;

function renderQuiz() {
  locked = false;
  qNext.disabled = true;
  qNotice.textContent = "";
  qNotice.style.color = "var(--muted)";
  qNotice.style.borderColor = "var(--line)";

  const item = quiz[qi];
  qText.textContent = item.q;
  qProgress.textContent = `Вопрос ${qi + 1}/${quiz.length}`;
  qScore.textContent = `${score} баллов`;

  qAnswers.innerHTML = "";
  item.a.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "answer";
    btn.type = "button";
    btn.textContent = opt.t;
    btn.addEventListener("click", () => onAnswer(btn, opt.ok, item.why));
    qAnswers.appendChild(btn);
  });
}

function onAnswer(btn, ok, why) {
  if (locked) return;
  locked = true;

  const buttons = Array.from(qAnswers.querySelectorAll("button"));
  buttons.forEach(b => b.disabled = true);

  if (ok) {
    score += 1;
    btn.classList.add("answer--ok");
    qNotice.textContent = `Верно. ${why}`;
    qNotice.style.color = "var(--ok)";
    qNotice.style.borderColor = "color-mix(in oklab, var(--ok), var(--line) 60%)";
  } else {
    btn.classList.add("answer--bad");
    qNotice.textContent = `Неверно. ${why}`;
    qNotice.style.color = "var(--bad)";
    qNotice.style.borderColor = "color-mix(in oklab, var(--bad), var(--line) 60%)";
  }

  qScore.textContent = `${score} баллов`;
  qNext.disabled = false;

  // если последний вопрос — меняем кнопку
  if (qi === quiz.length - 1) qNext.textContent = "Завершить";
  else qNext.textContent = "Дальше";
}

qNext.addEventListener("click", () => {
  if (qi < quiz.length - 1) {
    qi += 1;
    renderQuiz();
  } else {
    // финал
    const best = load("bestQuizScore", 0);
    const newBest = Math.max(best, score);
    save("bestQuizScore", newBest);
    $("#scoreSaved").textContent = String(newBest);

    qText.textContent = "Готово!";
    qAnswers.innerHTML = "";
    qNotice.textContent = `Твой результат: ${score}/${quiz.length}. Лучший: ${newBest}/${quiz.length}.`;
    qNotice.style.color = "var(--text)";
    qNotice.style.borderColor = "var(--line)";
    qNext.disabled = true;
  }
});

qRestart.addEventListener("click", () => {
  qi = 0;
  score = 0;
  renderQuiz();
});

renderQuiz();

// ---------- checklist ----------
const clList = $("#clList");
const clProgress = $("#clProgress");
const clReset = $("#clReset");

function renderChecklist() {
  const state = load("checklist", {});
  const inputs = Array.from(clList.querySelectorAll("input[type=checkbox]"));
  inputs.forEach((inp) => {
    const id = inp.dataset.id;
    inp.checked = Boolean(state[id]);
  });

  const total = inputs.length;
  const done = inputs.filter(i => i.checked).length;
  clProgress.textContent = `${done}/${total}`;
  save("checklist", state);

  const pct = Math.round((done / total) * 100);
  $("#checkSaved").textContent = `${pct}%`;
}

clList.addEventListener("change", (e) => {
  const t = e.target;
  if (!(t instanceof HTMLInputElement)) return;
  const id = t.dataset.id;
  const state = load("checklist", {});
  state[id] = t.checked;
  save("checklist", state);
  renderChecklist();
});

clReset.addEventListener("click", () => {
  save("checklist", {});
  renderChecklist();
});

renderChecklist();