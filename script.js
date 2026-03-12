"use strict";

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

const hamburger = $('.hamburger');
const nav = $('.nav');
hamburger.addEventListener('click', () => {
  nav.classList.toggle('nav--open');
});

const donateBtn = $('#donateBtn');

donateBtn.addEventListener('click', () => {
  const donateSection = document.getElementById('support');
  if (donateSection) {
    donateSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

const registerBtn = $('#registerBtn');
const registerModal = $('#registerModal');
const closeRegister = $('#closeRegister');
const cancelRegister = $('#cancelRegister');
const registerForm = $('#registerForm');
const registerMessage = $('#registerMessage');

function openRegisterModal() {
  registerModal.setAttribute('aria-hidden', 'false');
  registerModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  registerForm.reset();
  clearRegisterMessage();
}

function closeRegisterModal() {
  registerModal.setAttribute('aria-hidden', 'true');
  registerModal.classList.remove('open');
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
  registerForm.reset();
  clearRegisterMessage();
}

function clearRegisterMessage() {
  registerMessage.textContent = '';
  registerMessage.className = 'register-message';
}

function showErrorMessage(text) {
  registerMessage.textContent = '❌ ' + text;
  registerMessage.className = 'register-message error';
}

function showSuccessMessage(text) {
  registerMessage.textContent = '✅ ' + text;
  registerMessage.className = 'register-message success';
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateUsername(username) {
  return username.length >= 3 && /^[a-zA-Z0-9_-]+$/.test(username);
}

function getFieldValue(fieldId) {
  return $(fieldId).value.trim();
}

function showFieldError(fieldId, errorText) {
  const field = $(fieldId);
  const errorElement = document.getElementById(fieldId.substring(1) + '-error');
  if (errorElement) {
    errorElement.textContent = errorText;
  }
}

function clearFieldErrors() {
  ['#register-username', '#register-email', '#register-password', '#register-confirm'].forEach(fieldId => {
    $(fieldId).classList.remove('error');
    const errorId = fieldId.substring(1) + '-error';
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      errorElement.textContent = '';
    }
  });
}

registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  clearFieldErrors();
  clearRegisterMessage();

  const username = getFieldValue('#register-username');
  const email = getFieldValue('#register-email');
  const password = getFieldValue('#register-password');
  const confirmPassword = getFieldValue('#register-confirm');

  let hasError = false;

  if (!username) {
    showFieldError('register-username', 'Введи имя пользователя');
    hasError = true;
  } else if (!validateUsername(username)) {
    showFieldError('register-username', 'От 3 символов, только буквы, цифры, тире и подчеркивание');
    hasError = true;
  }

  if (!email) {
    showFieldError('register-email', 'Введи email');
    hasError = true;
  } else if (!validateEmail(email)) {
    showFieldError('register-email', 'Некорректный email адрес');
    hasError = true;
  }

  if (!password) {
    showFieldError('register-password', 'Введи пароль');
    hasError = true;
  } else if (password.length < 8) {
    showFieldError('register-password', 'Минимум 8 символов');
    hasError = true;
  }

  if (!confirmPassword) {
    showFieldError('register-confirm', 'Подтверди пароль');
    hasError = true;
  } else if (password !== confirmPassword) {
    showFieldError('register-confirm', 'Пароли не совпадают');
    hasError = true;
  }

  if (hasError) {
    showErrorMessage('Проверь форму');
    return;
  }

  const users = load('users', []);
  const userExists = users.some(u => u.email === email || u.username === username);

  if (userExists) {
    showErrorMessage('Этот email или имя уже зарегистрировано');
    return;
  }

  const newUser = {
    id: Date.now(),
    username,
    email,
    password,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  save('users', users);
  save('currentUser', newUser);

  showSuccessMessage('Регистрация успешна! Добро пожаловать!');

  setTimeout(() => {
    closeRegisterModal();
    registerBtn.textContent = '✓';
    registerBtn.setAttribute('aria-label', 'Вы вошли в систему');
  }, 1500);
});

registerBtn.addEventListener('click', openRegisterModal);
closeRegister.addEventListener('click', closeRegisterModal);
cancelRegister.addEventListener('click', closeRegisterModal);

registerModal.addEventListener('click', (e) => {
  if (e.target === registerModal || e.target.classList.contains('modal__overlay')) {
    closeRegisterModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && registerModal.getAttribute('aria-hidden') === 'false') {
    closeRegisterModal();
  }
});

const currentUser = load('currentUser', null);
if (currentUser) {
  registerBtn.textContent = '✓';
  registerBtn.setAttribute('aria-label', `Вы вошли как ${currentUser.username}`);
}

$("#year").textContent = String(new Date().getFullYear());

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

[mailA, mailB].forEach((el) => {
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") el.click();
  });
});

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
  let score = 0;
  const len = s.length;

  if (len >= 8) score += 20;
  if (len >= 12) score += 25;
  if (len >= 16) score += 15;

  if (/[a-z]/.test(s) && /[A-Z]/.test(s)) score += 15;
  if (/\d/.test(s)) score += 10;
  if (/[^A-Za-z0-9]/.test(s)) score += 15;

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


  if (qi === quiz.length - 1) qNext.textContent = "Завершить";
  else qNext.textContent = "Дальше";
}

qNext.addEventListener("click", () => {
  if (qi < quiz.length - 1) {
    qi += 1;
    renderQuiz();
  } else {
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

const feedbackForm = $(".feedback-form");
if (feedbackForm) {
  const submitBtn = feedbackForm.querySelector("button[type='submit']");
  
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  function getFormData() {
    const name = feedbackForm.querySelector("input[name='name']");
    const email = feedbackForm.querySelector("input[name='email']");
    const message = feedbackForm.querySelector("textarea[name='message']");
    
    return {
      name: name ? name.value.trim() : "",
      email: email ? email.value.trim() : "",
      message: message ? message.value.trim() : ""
    };
  }
  
  function clearErrors() {
    Array.from(feedbackForm.querySelectorAll(".form-group")).forEach(group => {
      group.classList.remove("form-group--error", "form-group--success");
    });
    Array.from(feedbackForm.querySelectorAll(".form-error")).forEach(err => {
      err.remove();
    });
  }
  
  function showError(inputName, message) {
    const input = feedbackForm.querySelector(`input[name='${inputName}'], textarea[name='${inputName}']`);
    if (!input) return;
    
    const group = input.closest(".form-group");
    if (!group) return;
    
    group.classList.add("form-group--error");
    
    const errorDiv = document.createElement("div");
    errorDiv.className = "form-error";
    errorDiv.textContent = message;
    group.appendChild(errorDiv);
  }
  
  function showSuccess(inputName) {
    const input = feedbackForm.querySelector(`input[name='${inputName}'], textarea[name='${inputName}']`);
    if (!input) return;
    
    const group = input.closest(".form-group");
    if (group) {
      group.classList.add("form-group--success");
    }
  }
  
  function validateForm(data) {
    clearErrors();
    let valid = true;
    
    if (!data.name) {
      showError("name", "Введи имя");
      valid = false;
    } else {
      showSuccess("name");
    }
    
    if (!data.email) {
      showError("email", "Введи email");
      valid = false;
    } else if (!validateEmail(data.email)) {
      showError("email", "Некорректный email");
      valid = false;
    } else {
      showSuccess("email");
    }
    
    if (!data.message) {
      showError("message", "Напиши своё мнение");
      valid = false;
    } else {
      showSuccess("message");
    }
    
    return valid;
  }
  
  function showSuccessMessage() {
    const messageDiv = document.createElement("div");
    messageDiv.className = "notice";
    messageDiv.style.marginTop = "16px";
    messageDiv.style.background = "color-mix(in oklab, var(--ok), transparent 85%)";
    messageDiv.style.borderColor = "color-mix(in oklab, var(--ok), var(--line) 60%)";
    messageDiv.style.color = "var(--ok)";
    messageDiv.textContent = "Спасибо! Твой отзыв отправлен.";
    feedbackForm.appendChild(messageDiv);
    
    setTimeout(() => {
      messageDiv.remove();
    }, 4000);
  }
  
  if (submitBtn) {
    submitBtn.addEventListener("click", (e) => {
      e.preventDefault();
      
      const data = getFormData();
      
      if (!validateForm(data)) {
        return;
      }
      
      showSuccessMessage();
      feedbackForm.reset();
      clearErrors();
    });
  }
}

const paymentOptions = $(".payment-options");
if (paymentOptions) {
  const paymentCards = Array.from(paymentOptions.querySelectorAll(".payment-card"));
  
  function clearSelection() {
    paymentCards.forEach(card => {
      card.classList.remove("active");
      card.style.borderColor = "var(--line)";
      card.style.background = "var(--panel)";
      const radio = card.querySelector("input[type='radio']");
      if (radio) radio.checked = false;
    });
  }
  
  paymentCards.forEach((card, index) => {
    const radio = card.querySelector("input[type='radio']");
    
    if (!radio) {
      const newRadio = document.createElement("input");
      newRadio.type = "radio";
      newRadio.name = "payment-method";
      newRadio.value = `payment-${index}`;
      card.appendChild(newRadio);
    }
    
    card.style.cursor = "pointer";
    
    card.addEventListener("click", (e) => {
      if (e.target !== radio && !(e.target instanceof HTMLInputElement)) {
        clearSelection();
        const cardRadio = card.querySelector("input[type='radio']");
        if (cardRadio) cardRadio.checked = true;
        card.classList.add("active");
        card.style.borderColor = "var(--accent)";
      }
    });
    
    const cardRadio = card.querySelector("input[type='radio']");
    if (cardRadio) {
      cardRadio.addEventListener("change", () => {
        clearSelection();
        cardRadio.checked = true;
        card.classList.add("active");
        card.style.borderColor = "var(--accent)";
      });
    }
  });
  
  const paymentSection = $("#payment");
  if (paymentSection) {
    const payBtn = paymentSection.querySelector("button.register-btn");
    if (payBtn) {
      payBtn.addEventListener("click", () => {
        const selectedRadio = paymentOptions.querySelector("input[type='radio']:checked");
        
        if (!selectedRadio) {
          alert("Выбери способ оплаты");
          return;
        }
        
        const messageDiv = document.createElement("div");
        messageDiv.className = "notice";
        messageDiv.style.marginTop = "16px";
        messageDiv.style.background = "color-mix(in oklab, var(--ok), transparent 85%)";
        messageDiv.style.borderColor = "color-mix(in oklab, var(--ok), var(--line) 60%)";
        messageDiv.style.color = "var(--ok)";
        messageDiv.textContent = "Оплата успешно выполнена)";
        paymentSection.appendChild(messageDiv);
        
        setTimeout(() => {
          messageDiv.remove();
        }, 4000);
      });
    }
  }
}

const modal = $("#donateModal");
if (donateBtn && modal) {
  const overlay = modal.querySelector(".modal__overlay");
  const closeBtn = modal.querySelector(".modal__close");
  const modalOptions = Array.from(modal.querySelectorAll(".payment-option"));
  let modalSelected = null;

  function openModal() {
    modal.setAttribute("aria-hidden", "false");
    modal.classList.add("open");
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    modalOptions.forEach(o => o.classList.remove("active"));
    modalSelected = null;
  }
  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
    modal.classList.remove("open");
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  donateBtn.addEventListener("click", openModal);
  if (overlay) overlay.addEventListener("click", closeModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });
  const supportBtn = $("#supportBtn");
  if (supportBtn) {
    supportBtn.addEventListener("click", () => {
      const supportSection = $("#support");
      if (supportSection) {
        supportSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }
  modalOptions.forEach(opt => {
    opt.addEventListener("click", () => {
      modalOptions.forEach(o => o.classList.remove("active"));
      opt.classList.add("active");
      modalSelected = opt.dataset.amount;
    });
  });

  const modalSend = $("#modalSendBtn");
  if (modalSend) {
    modalSend.addEventListener("click", () => {
      if (!modalSelected) {
        alert("Выбери сумму");
        return;
      }
      const msg = document.createElement("div");
      msg.className = "notice";
      msg.style.marginTop = "16px";
      msg.style.background = "color-mix(in oklab, var(--ok), transparent 85%)";
      msg.style.borderColor = "color-mix(in oklab, var(--ok), var(--line) 60%)";
      msg.style.color = "var(--ok)";
      msg.textContent = "Оплата успешно выполнена";
      modal.querySelector(".modal__content").appendChild(msg);
      setTimeout(() => {
        msg.remove();
        closeModal();
      }, 2000);
    });
  }
}