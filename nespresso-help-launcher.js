(function () {
  if (window.__NESP_HELP_LOADED__) return;
  window.__NESP_HELP_LOADED__ = true;

  /* ----------------------------------
     CONFIG (edit as needed)
  ---------------------------------- */
  const CONFIG = {
    faqUrl: "https://www.nespresso.com/us/en/service-faq",
    promoUrl: "https://www.nespresso.com/us/en/promo",
    phone: "+18553255781",
    // If the Quiq container gets this when chat is open, we'll auto-close our popup
    chatOpenSelector: ".quiq-web-chat-open",
  };

  /* ----------------------------------
     Helpers
  ---------------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);

  function safeOpen(url) {
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (_) {
      // fallback
      window.location.href = url;
    }
  }

  /* ----------------------------------
     Styles (Nespresso-ish)
  ---------------------------------- */
  const style = document.createElement("style");
  style.innerHTML = `
    :root{
      --nesp-z: 2147483000;

      --nesp-black: #111111;
      --nesp-white: #ffffff;

      --nesp-text: #1a1a1a;
      --nesp-sub: #6f6f6f;

      --nesp-border: rgba(0,0,0,.08);
      --nesp-surface: #ffffff;
      --nesp-chip: #f4f4f4;
      --nesp-chip-hover: #ededed;

      --nesp-shadow: 0 18px 50px rgba(0,0,0,.22);
      --nesp-shadow-pill: 0 10px 28px rgba(0,0,0,.22);

      --nesp-radius-card: 18px;
      --nesp-radius-chip: 12px;
      --nesp-radius-pill: 999px;

      --nesp-right: 22px;
      --nesp-bottom: 22px;
      --nesp-gap: 12px;

      --nesp-font: system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;
    }

    /* Backdrop */
    .nesp-help-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.26);
      opacity: 0;
      pointer-events: none;
      transition: opacity 180ms ease;
      z-index: calc(var(--nesp-z) - 2);
    }
    .nesp-help-backdrop.is-open {
      opacity: 1;
      pointer-events: auto;
    }

    /* Popup card */
    .nesp-help-popup {
      position: fixed;
      right: var(--nesp-right);
      bottom: calc(var(--nesp-bottom) + 74px);
      width: min(420px, 92vw);
      background: var(--nesp-surface);
      border: 1px solid var(--nesp-border);
      border-radius: var(--nesp-radius-card);
      box-shadow: var(--nesp-shadow);
      z-index: calc(var(--nesp-z) - 1);

      opacity: 0;
      pointer-events: none;
      transform: translateY(10px) scale(.985);
      transform-origin: bottom right;
      transition: opacity 180ms ease, transform 220ms cubic-bezier(.2,.8,.2,1);
    }
    .nesp-help-popup.is-open {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0) scale(1);
    }

    .nesp-help-popup * { box-sizing: border-box; }

    .nesp-help-popup-inner{
      padding: 14px;
      font-family: var(--nesp-font);
      color: var(--nesp-text);
    }

    .nesp-help-header{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap: 10px;
      padding: 2px 2px 10px 2px;
    }
    .nesp-help-title{
      font-size: 14px;
      font-weight: 700;
      letter-spacing: .1px;
      margin: 0;
      line-height: 1.2;
    }
    .nesp-help-close{
      width: 26px;
      height: 26px;
      border-radius: 999px;
      border: 1px solid var(--nesp-border);
      background: #fafafa;
      display:grid;
      place-items:center;
      cursor:pointer;
      user-select:none;
      color: #2b2b2b;
      line-height: 1;
      font-size: 14px;
      padding:0;
    }
    .nesp-help-close:hover { background: #f3f3f3; }

    .nesp-help-section{
      font-size: 12px;
      font-weight: 600;
      color: #7a7a7a;
      margin: 10px 2px 8px;
      letter-spacing: .1px;
    }

    .nesp-help-panel{
      background: transparent;
      padding: 0;
      margin: 0;
    }

    .nesp-help-row{
      width: 100%;
      display:flex;
      align-items:flex-start;
      justify-content:space-between;
      gap: 12px;

      padding: 12px 12px;
      border-radius: var(--nesp-radius-chip);
      background: var(--nesp-chip);
      border: 1px solid rgba(0,0,0,.04);

      text-align:left;
      cursor:pointer;
      user-select:none;

      transition: background 140ms ease, transform 120ms ease;
    }
    .nesp-help-row:hover{ background: var(--nesp-chip-hover); }
    .nesp-help-row:active{ transform: scale(.995); }

    .nesp-help-row + .nesp-help-row { margin-top: 8px; }

    .nesp-help-row-main{ min-width: 0; }
    .nesp-help-row-title{
      font-size: 13px;
      font-weight: 700;
      margin: 0;
      line-height: 1.25;
      color: var(--nesp-text);
    }
    .nesp-help-row-sub{
      font-size: 11.5px;
      margin: 5px 0 0;
      color: var(--nesp-sub);
      line-height: 1.25;
    }

    .nesp-help-row-right{
      flex: 0 0 auto;
      display:flex;
      align-items:center;
      gap: 10px;
      padding-top: 1px;
      color: #2b2b2b;
      opacity: .9;
    }

    .nesp-help-icon{
      width: 18px;
      height: 18px;
      display:block;
    }

    .nesp-help-chev{
      width: 18px;
      height: 18px;
      display:grid;
      place-items:center;
      font-size: 18px;
      line-height: 1;
      color: #2b2b2b;
      opacity: .85;
    }

    /* Launcher */
    .nesp-help-launcher{
      position: fixed;
      right: var(--nesp-right);
      bottom: var(--nesp-bottom);
      z-index: var(--nesp-z);
      font-family: var(--nesp-font);
    }

    .nesp-help-pill{
      height: 44px;
      width: 44px;
      border-radius: var(--nesp-radius-pill);
      background: var(--nesp-black);
      color: #fff;
      border: 1px solid rgba(255,255,255,.12);
      box-shadow: var(--nesp-shadow-pill);

      display:flex;
      align-items:center;
      justify-content:flex-start;
      gap: 10px;
      padding: 0 14px 0 12px;

      cursor:pointer;
      user-select:none;
      overflow:hidden;

      transition: width 220ms cubic-bezier(.2,.8,.2,1), padding 220ms cubic-bezier(.2,.8,.2,1);
    }

    .nesp-help-pill .nesp-pill-icon{
      width: 20px;
      height: 20px;
      display:block;
      flex: 0 0 auto;
    }

    .nesp-help-pill .nesp-pill-text{
      font-size: 12.5px;
      font-weight: 700;
      letter-spacing: .1px;
      white-space:nowrap;
      opacity: 0;
      transform: translateX(-6px);
      transition: opacity 150ms ease, transform 180ms ease;
    }

    @media (hover:hover) and (pointer:fine){
      .nesp-help-launcher:hover .nesp-help-pill{
        width: 168px;
      }
      .nesp-help-launcher:hover .nesp-pill-text{
        opacity: 1;
        transform: translateX(0);
      }
    }

    .nesp-help-pill.is-open{
      width: 168px;
    }
    .nesp-help-pill.is-open .nesp-pill-text{
      opacity: 1;
      transform: translateX(0);
    }

    /* Optional: when Quiq chat is open, ensure our overlay isn't blocking */
    ${CONFIG.chatOpenSelector} .nesp-help-backdrop,
    ${CONFIG.chatOpenSelector} .nesp-help-popup{
      opacity: 0 !important;
      pointer-events: none !important;
      transform: translateY(10px) scale(.985) !important;
    }
  `;
  document.head.appendChild(style);

  /* ----------------------------------
     SVG Icons (simple, clean)
  ---------------------------------- */
  const ICON_CHAT = `
    <svg class="nesp-pill-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M7.5 18.2 4.6 19.7l1.1-2.6A7.3 7.3 0 0 1 4 12.6C4 8.4 7.7 6 12.8 6c5.1 0 8.7 2.4 8.7 6.6s-3.6 6.6-8.7 6.6c-1.1 0-2.1-.1-3.1-.3l-2.2 1.1Z"
            stroke="white" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M9.4 12.6h.01M12.8 12.6h.01M16.2 12.6h.01"
            stroke="white" stroke-width="2.2" stroke-linecap="round"/>
    </svg>
  `;

  const ICON_LINK = `
    <svg class="nesp-help-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M9.5 14.5 14.5 9.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M10 9H8a5 5 0 0 0 0 10h2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M14 15h2a5 5 0 0 0 0-10h-2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>
  `;

  const ICON_PHONE = `
    <svg class="nesp-help-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M8.2 6.3c.4-.7 1.2-1.1 2-.9l1.9.5c.8.2 1.3.9 1.2 1.7l-.2 1.6c0 .4.1.8.4 1.1l1.8 1.8c.3.3.7.4 1.1.4l1.6-.2c.8-.1 1.5.4 1.7 1.2l.5 1.9c.2.8-.2 1.6-.9 2-1.2.7-2.8 1.2-4.6.7-2.1-.6-4.6-2.5-6.6-4.5-2-2-3.9-4.5-4.5-6.6-.5-1.8 0-3.4.7-4.6Z"
            stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    </svg>
  `;

  /* ----------------------------------
     Build DOM
  ---------------------------------- */

  const backdrop = document.createElement("div");
  backdrop.className = "nesp-help-backdrop";

  const popup = document.createElement("div");
  popup.className = "nesp-help-popup";
  popup.innerHTML = `
    <div class="nesp-help-popup-inner" role="dialog" aria-modal="true" aria-label="Help menu">
      <div class="nesp-help-header">
        <p class="nesp-help-title">Can we help?</p>
        <button class="nesp-help-close" type="button" aria-label="Close">×</button>
      </div>

      <div class="nesp-help-section">Useful links</div>
      <div class="nesp-help-panel">
        <div class="nesp-help-row" data-action="faq" role="button" tabindex="0">
          <div class="nesp-help-row-main">
            <p class="nesp-help-row-title">Visit our FAQs</p>
          </div>
          <div class="nesp-help-row-right">
            ${ICON_LINK}
            <div class="nesp-help-chev">›</div>
          </div>
        </div>

        <div class="nesp-help-row" data-action="promo" role="button" tabindex="0">
          <div class="nesp-help-row-main">
            <p class="nesp-help-row-title">Claim your machine promotion</p>
          </div>
          <div class="nesp-help-row-right">
            ${ICON_LINK}
            <div class="nesp-help-chev">›</div>
          </div>
        </div>
      </div>

      <div class="nesp-help-section">Contact options</div>
      <div class="nesp-help-panel">
        <div class="nesp-help-row" data-action="chat" role="button" tabindex="0">
          <div class="nesp-help-row-main">
            <p class="nesp-help-row-title">Chat with Us</p>
            <p class="nesp-help-row-sub">Agents available Mon–Fri 8am–10pm ET, Sat–Sun 8am–8pm ET</p>
          </div>
          <div class="nesp-help-row-right">
            <div class="nesp-help-chev">›</div>
          </div>
        </div>

        <div class="nesp-help-row" data-action="phone" role="button" tabindex="0">
          <div class="nesp-help-row-main">
            <p class="nesp-help-row-title">Technical support</p>
            <p class="nesp-help-row-sub">Call 1-855-325-5781</p>
          </div>
          <div class="nesp-help-row-right">
            ${ICON_PHONE}
            <div class="nesp-help-chev">›</div>
          </div>
        </div>
      </div>
    </div>
  `;

  const launcher = document.createElement("div");
  launcher.className = "nesp-help-launcher";
  launcher.innerHTML = `
    <div class="nesp-help-pill" role="button" tabindex="0" aria-label="Open help menu">
      ${ICON_CHAT}
      <div class="nesp-pill-text">Need help?</div>
    </div>
  `;

  document.body.appendChild(backdrop);
  document.body.appendChild(popup);
  document.body.appendChild(launcher);

  const pill = $(".nesp-help-pill", launcher);
  const closeBtn = $(".nesp-help-close", popup);

  /* ----------------------------------
     Open/Close
  ---------------------------------- */
  function openPopup() {
    backdrop.classList.add("is-open");
    popup.classList.add("is-open");
    pill.classList.add("is-open");
  }
  function closePopup() {
    backdrop.classList.remove("is-open");
    popup.classList.remove("is-open");
    pill.classList.remove("is-open");
  }
  function togglePopup() {
    if (popup.classList.contains("is-open")) closePopup();
    else openPopup();
  }

  /* ----------------------------------
     Events
  ---------------------------------- */
  // Keep Quiq from stealing these clicks (now we can because we're outside the injected root)
  launcher.addEventListener("click", function (e) {
    e.stopPropagation();
    togglePopup();
  });

  launcher.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      togglePopup();
    }
  });

  backdrop.addEventListener("click", function (e) {
    e.stopPropagation();
    closePopup();
  });

  closeBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    closePopup();
  });

  popup.addEventListener("click", function (e) {
    e.stopPropagation();
    const row = e.target.closest(".nesp-help-row");
    if (!row) return;

    const action = row.getAttribute("data-action");
    if (action === "faq") safeOpen(CONFIG.faqUrl);
    else if (action === "promo") safeOpen(CONFIG.promoUrl);
    else if (action === "phone") window.location.href = "tel:" + CONFIG.phone;
    else if (action === "chat") {
      // Try common patterns
      try {
        if (window.chat && typeof window.chat.show === "function") window.chat.show();
        else if (window.Quiq && typeof window.Quiq.open === "function") window.Quiq.open();
      } catch (_) {}
    }

    closePopup();
  });

  // Close on ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closePopup();
  });

  // Close if user clicks elsewhere
  document.addEventListener("click", function () {
    closePopup();
  });

  // Optional: if Quiq toggles "chat open" class, we auto-close our UI
  const mo = new MutationObserver(() => {
    const chatOpen = document.querySelector(CONFIG.chatOpenSelector);
    if (chatOpen) closePopup();
  });
  mo.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ["class"] });
})();
