(function () {
  if (window.__NESP_HELP_LOADED__) return;
  window.__NESP_HELP_LOADED__ = true;

  const CONFIG = {
    faqUrl: "https://www.nespresso.com/us/en/service-faq",
    promoUrl: "https://www.nespresso.com/us/en/promo",
    phone: "+18553255781",
    chatOpenSelector: ".quiq-web-chat-open",
  };

  const $ = (sel, root = document) => root.querySelector(sel);

  function safeOpen(url) {
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (_) {
      window.location.href = url;
    }
  }

  /* ----------------------------------
     Styling closer to nespresso.com
  ---------------------------------- */
  const style = document.createElement("style");
  style.innerHTML = `
    :root{
      --nesp-z: 2147483000;
      --nesp-font: system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;

      --c-black:#111;
      --c-white:#fff;
      --c-text:#1a1a1a;
      --c-sub:#6f6f6f;

      --c-border: rgba(0,0,0,.10);
      --c-divider: rgba(0,0,0,.08);
      --c-hover: #f6f6f6;

      /* Nespresso-ish: smaller radius, softer shadow */
      --radius-card: 12px;
      --radius-pill: 999px;

      --shadow-card: 0 16px 40px rgba(0,0,0,.16);
      --shadow-pill: 0 10px 26px rgba(0,0,0,.18);

      --right: 22px;
      --bottom: 22px;
    }

    /* Launcher */
    .nesp-help-launcher{
      position: fixed;
      right: var(--right);
      bottom: var(--bottom);
      z-index: var(--nesp-z);
      font-family: var(--nesp-font);
    }

    /* Start as a circle, expand on hover */
    .nesp-help-pill{
      height: 44px;
      width: 44px;
      border-radius: var(--radius-pill);
      background: var(--c-black);
      color: #fff;
      border: 0;
      box-shadow: var(--shadow-pill);

      display:flex;
      align-items:center;
      justify-content:flex-start;
      gap: 10px;

      padding: 0 14px 0 12px;
      cursor:pointer;
      user-select:none;
      overflow:hidden;

      transition: width 220ms cubic-bezier(.2,.8,.2,1);
    }

    .nesp-help-pill .nesp-pill-icon{
      width: 20px;
      height: 20px;
      display:block;
      flex:0 0 auto;
    }

    .nesp-help-pill .nesp-pill-text{
      font-size: 12.5px;
      font-weight: 600;
      letter-spacing: .1px;
      white-space:nowrap;
      opacity: 0;
      transform: translateX(-6px);
      transition: opacity 150ms ease, transform 180ms ease;
    }

    @media (hover:hover) and (pointer:fine){
      .nesp-help-launcher:hover .nesp-help-pill{ width: 162px; }
      .nesp-help-launcher:hover .nesp-pill-text{ opacity: 1; transform: translateX(0); }
    }

    .nesp-help-pill.is-open{ width: 162px; }
    .nesp-help-pill.is-open .nesp-pill-text{ opacity: 1; transform: translateX(0); }

    /* Popup card (no backdrop, like Nespresso) */
    .nesp-help-popup{
      position: fixed;
      right: var(--right);
      bottom: calc(var(--bottom) + 68px);
      width: min(360px, 92vw);

      background: var(--c-white);
      border: 1px solid var(--c-border);
      border-radius: var(--radius-card);
      box-shadow: var(--shadow-card);

      z-index: calc(var(--nesp-z) - 1);

      opacity: 0;
      pointer-events: none;
      transform: translateY(10px) scale(.99);
      transform-origin: bottom right;
      transition: opacity 160ms ease, transform 200ms cubic-bezier(.2,.8,.2,1);
    }

    .nesp-help-popup.is-open{
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0) scale(1);
    }

    .nesp-help-popup *{ box-sizing:border-box; font-family: var(--nesp-font); }

    .nesp-help-inner{ padding: 12px 12px 10px; color: var(--c-text); }

    .nesp-help-header{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap: 10px;
      padding: 2px 2px 8px;
    }

    .nesp-help-title{
      margin:0;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: .1px;
      line-height: 1.2;
    }

    .nesp-help-close{
      width: 26px;
      height: 26px;
      border-radius: 999px;
      border: 1px solid var(--c-border);
      background: #fff;
      color: #333;
      display:grid;
      place-items:center;
      cursor:pointer;
      user-select:none;
      padding:0;
      line-height:1;
      font-size: 14px;
    }
    .nesp-help-close:hover{ background: var(--c-hover); }

    .nesp-help-section{
      margin: 10px 2px 6px;
      font-size: 11.5px;
      font-weight: 700;
      color: #7a7a7a;
      letter-spacing: .12px;
      text-transform: none;
    }

    /* List style rows: white, separators, subtle hover */
    .nesp-help-list{
      border: 1px solid var(--c-divider);
      border-radius: 10px;
      overflow: hidden;
      background: #fff;
    }

    .nesp-help-item{
      display:flex;
      align-items:flex-start;
      justify-content:space-between;
      gap: 12px;

      padding: 10px 12px;
      background: #fff;
      cursor:pointer;
      user-select:none;
    }
    .nesp-help-item:hover{ background: var(--c-hover); }

    .nesp-help-item + .nesp-help-item{
      border-top: 1px solid var(--c-divider);
    }

    .nesp-help-item-main{ min-width:0; }
    .nesp-help-item-title{
      margin:0;
      font-size: 13px;
      font-weight: 600;
      line-height: 1.25;
      color: var(--c-text);
    }
    .nesp-help-item-sub{
      margin: 4px 0 0;
      font-size: 11.5px;
      line-height: 1.35;
      color: var(--c-sub);
    }

    .nesp-help-item-right{
      flex:0 0 auto;
      display:flex;
      align-items:center;
      gap: 8px;
      padding-top: 1px;
      color: #333;
      opacity: .9;
    }

    .nesp-help-icon{
      width: 16px;
      height: 16px;
      display:block;
    }
    .nesp-help-chev{
      font-size: 18px;
      line-height: 1;
    }

    /* If Quiq chat opens, close our menu so it doesn't compete */
    ${CONFIG.chatOpenSelector} .nesp-help-popup{
      opacity:0 !important;
      pointer-events:none !important;
      transform: translateY(10px) scale(.99) !important;
    }
  `;
  document.head.appendChild(style);

  const ICON_CHAT = `
    <svg class="nesp-pill-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M7.4 18.2 4.6 19.7l1.1-2.6A7.3 7.3 0 0 1 4 12.6C4 8.4 7.7 6 12.8 6c5.1 0 8.7 2.4 8.7 6.6s-3.6 6.6-8.7 6.6c-1.1 0-2.1-.1-3.1-.3l-2.3 1.1Z"
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
     DOM
  ---------------------------------- */
  const popup = document.createElement("div");
  popup.className = "nesp-help-popup";
  popup.innerHTML = `
    <div class="nesp-help-inner" role="dialog" aria-modal="true" aria-label="Help menu">
      <div class="nesp-help-header">
        <p class="nesp-help-title">How can we help you?</p>
        <button class="nesp-help-close" type="button" aria-label="Close">×</button>
      </div>

      <div class="nesp-help-section">Useful links</div>
      <div class="nesp-help-list">
        <div class="nesp-help-item" data-action="faq" role="button" tabindex="0">
          <div class="nesp-help-item-main">
            <p class="nesp-help-item-title">Visit our FAQs</p>
          </div>
          <div class="nesp-help-item-right">
            ${ICON_LINK}
            <span class="nesp-help-chev">›</span>
          </div>
        </div>

        <div class="nesp-help-item" data-action="promo" role="button" tabindex="0">
          <div class="nesp-help-item-main">
            <p class="nesp-help-item-title">Claim your machine promotion</p>
          </div>
          <div class="nesp-help-item-right">
            ${ICON_LINK}
            <span class="nesp-help-chev">›</span>
          </div>
        </div>
      </div>

      <div class="nesp-help-section">Contact options</div>
      <div class="nesp-help-list">
        <div class="nesp-help-item" data-action="chat" role="button" tabindex="0">
          <div class="nesp-help-item-main">
            <p class="nesp-help-item-title">Chat with Us</p>
            <p class="nesp-help-item-sub">Mon–Fri 8am–10pm ET, Sat–Sun 8am–8pm ET</p>
          </div>
          <div class="nesp-help-item-right">
            <span class="nesp-help-chev">›</span>
          </div>
        </div>

        <div class="nesp-help-item" data-action="phone" role="button" tabindex="0">
          <div class="nesp-help-item-main">
            <p class="nesp-help-item-title">Technical support</p>
            <p class="nesp-help-item-sub">Call 1-855-325-5781</p>
          </div>
          <div class="nesp-help-item-right">
            ${ICON_PHONE}
            <span class="nesp-help-chev">›</span>
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

  document.body.appendChild(popup);
  document.body.appendChild(launcher);

  const pill = $(".nesp-help-pill", launcher);
  const closeBtn = $(".nesp-help-close", popup);

  function openPopup() {
    popup.classList.add("is-open");
    pill.classList.add("is-open");
  }
  function closePopup() {
    popup.classList.remove("is-open");
    pill.classList.remove("is-open");
  }
  function togglePopup() {
    if (popup.classList.contains("is-open")) closePopup();
    else openPopup();
  }

  launcher.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePopup();
  });

  launcher.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      togglePopup();
    }
  });

  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closePopup();
  });

  popup.addEventListener("click", (e) => {
    e.stopPropagation();
    const item = e.target.closest(".nesp-help-item");
    if (!item) return;

    const action = item.getAttribute("data-action");

    if (action === "faq") safeOpen(CONFIG.faqUrl);
    else if (action === "promo") safeOpen(CONFIG.promoUrl);
    else if (action === "phone") window.location.href = "tel:" + CONFIG.phone;
    else if (action === "chat") {
      try {
        if (window.chat && typeof window.chat.show === "function") window.chat.show();
        else if (window.Quiq && typeof window.Quiq.open === "function") window.Quiq.open();
      } catch (_) {}
    }

    closePopup();
  });

  // close on outside click (no backdrop, like nespresso.com)
  document.addEventListener("click", () => closePopup());
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePopup(); });

  // auto-close if Quiq chat opens
  const mo = new MutationObserver(() => {
    if (document.querySelector(CONFIG.chatOpenSelector)) closePopup();
  });
  mo.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ["class"] });
})();
