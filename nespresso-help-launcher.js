(function () {
  if (window.__NESP_HELP_LOADED__) return;
  window.__NESP_HELP_LOADED__ = true;

  /* ----------------------------------
     CONFIG (edit as needed)
  ---------------------------------- */
  const CONFIG = {
    faqUrl: "https://www.nespresso.com/us/en/service-faq",
    machineUrl: "https://www.nespresso.com/us/en/machine-assistance", // adjust if you have a better URL
    trackUrl: "https://www.nespresso.com/us/en/order-tracking",       // adjust if you have a better URL
    chatOpenSelector: ".quiq-web-chat-open",
    phoneOriginal: "800-562-1465",
    phoneVertuo: "877-964-6299",
  };

  const $ = (sel, root = document) => root.querySelector(sel);

  function safeOpen(url) {
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (_) {
      window.location.href = url;
    }
  }

  function telize(number) {
    // keep digits + leading +
    const cleaned = String(number).replace(/[^\d+]/g, "");
    return cleaned.startsWith("+") ? cleaned : "+1" + cleaned.replace(/^1/, "");
  }

  /* ----------------------------------
     Styles to match Nespresso look
  ---------------------------------- */
  const style = document.createElement("style");
  style.innerHTML = `
    :root{
      --nesp-z: 2147483000;

      --font: NespressoLucas,'Trebuchet MS',Helvetica,Arial,sans-serif;

      --bg: #faf9f8;
      --panel: #ffffff;

      --text: #1a1a1a;
      --sub: #7b7b7b;
      --label: #8b8b8b;

      --border: rgba(0,0,0,.10);
      --divider: rgba(0,0,0,.10);
      --hover: #f3f2f1;

      --radius-card: 16px;
      --radius-panel: 14px;

      --shadow-card: 0 18px 55px rgba(0,0,0,.20);
      --shadow-pill: 0 10px 26px rgba(0,0,0,.18);

      --right: 22px;
      --bottom: 22px;

      --pill-h: 44px;
      --pill-w: 44px;
      --pill-open: 148px; /* narrower than before */
    }

    /* Ensure our widget font wins */
    .nesp-help-launcher,
    .nesp-help-launcher *,
    .nesp-help-popup,
    .nesp-help-popup *{
      font-family: var(--font) !important;
      box-sizing: border-box;
    }

    /* Launcher */
    .nesp-help-launcher{
      position: fixed;
      right: var(--right);
      bottom: var(--bottom);
      z-index: var(--nesp-z);
    }

    .nesp-help-pill{
      height: var(--pill-h);
      width: var(--pill-w);
      border-radius: 999px;
      background: #111;
      color: #fff;
      border: 1px solid rgba(255,255,255,.10);
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

    .nesp-pill-icon{
      width: 20px;
      height: 20px;
      display:block;
      flex: 0 0 auto;
      line-height: 0;
    }

    .nesp-pill-text{
      font-size: 13px;
      font-weight: 600;
      letter-spacing: .1px;
      white-space:nowrap;
      opacity: 0;
      transform: translateX(-6px);
      transition: opacity 150ms ease, transform 180ms ease;
    }

    @media (hover:hover) and (pointer:fine){
      .nesp-help-launcher:hover .nesp-help-pill{ width: var(--pill-open); }
      .nesp-help-launcher:hover .nesp-pill-text{ opacity: 1; transform: translateX(0); }
    }
    .nesp-help-pill.is-open{ width: var(--pill-open); }
    .nesp-help-pill.is-open .nesp-pill-text{ opacity: 1; transform: translateX(0); }

    /* Popup card */
    .nesp-help-popup{
      position: fixed;
      right: var(--right);
      bottom: calc(var(--bottom) + 68px);
      width: min(392px, 92vw);

      background: var(--bg);
      border-radius: var(--radius-card);
      box-shadow: var(--shadow-card);
      border: 1px solid rgba(0,0,0,.08);

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

    .nesp-help-inner{
      padding: 16px;
      color: var(--text);
    }

    .nesp-help-header{
      display:flex;
      align-items:flex-start;
      justify-content:space-between;
      gap: 12px;
      margin-bottom: 8px;
    }

    .nesp-help-title{
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: .1px;
      line-height: 1.15;
    }

    .nesp-help-close{
      width: 32px;
      height: 32px;
      border-radius: 999px;
      border: 1px solid rgba(0,0,0,.10);
      background: #fff;
      color: #1a1a1a;

      display:grid;
      place-items:center;

      cursor:pointer;
      user-select:none;
      padding: 0;
      line-height: 1;
      font-size: 16px;
      flex: 0 0 auto;
    }
    .nesp-help-close:hover{ background: var(--hover); }

    .nesp-help-section{
      margin: 14px 2px 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--label);
    }

    .nesp-help-panel{
      background: var(--panel);
      border-radius: var(--radius-panel);
      overflow: hidden;
      border: 0;
    }

    .nesp-help-item{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap: 12px;
      padding: 12px 14px;
      background: #fff;
      cursor:pointer;
      user-select:none;
    }
    .nesp-help-item + .nesp-help-item{
      border-top: 1px solid var(--divider);
    }
    .nesp-help-item:hover{ background: var(--hover); }

    .nesp-help-left{
      display:flex;
      align-items:flex-start;
      gap: 12px;
      min-width: 0;
    }

    .nesp-help-icon{
      width: 22px;
      height: 22px;
      flex: 0 0 22px;
      display:block;
      color: #2b2b2b;
      margin-top: 1px;
    }

    .nesp-help-text{
      min-width:0;
    }

    .nesp-help-item-title{
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.25;
      color: var(--text);
    }

    .nesp-help-item-sub{
      margin: 4px 0 0;
      font-size: 13px;
      line-height: 1.25;
      color: var(--sub);
    }

    .nesp-help-right{
      flex: 0 0 auto;
      display:flex;
      align-items:center;
      gap: 8px;
      color: #6f6f6f;
    }

    .nesp-help-chev{
      font-size: 22px;
      line-height: 1;
      transform: translateY(-1px);
    }

    /* Mobile behavior: <= 767px bottom-attached full width, height unchanged */
    @media (max-width: 767px){
      .nesp-help-popup{
        left: 0;
        right: 0;
        width: 100vw;
        bottom: 0;
        border-radius: 16px 16px 0 0;
        transform-origin: bottom center;
      }
      .nesp-help-launcher{
        right: 16px;
        bottom: 16px;
      }
    }

    /* If Quiq chat opens, close our menu so it doesn't compete */
    ${CONFIG.chatOpenSelector} .nesp-help-popup{
      opacity:0 !important;
      pointer-events:none !important;
      transform: translateY(10px) scale(.99) !important;
    }
  `;
  document.head.appendChild(style);

  /* ----------------------------------
     Icons (outline style, left aligned)
  ---------------------------------- */
  const ICON_CHAT_PILL = `
    <svg class="nesp-pill-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M7.6 18.2 4.6 19.7l1.1-2.6A7.3 7.3 0 0 1 4 12.6C4 8.4 7.7 6 12.8 6c5.1 0 8.7 2.4 8.7 6.6s-3.6 6.6-8.7 6.6c-1.1 0-2.1-.1-3.1-.3l-2.3 1.1Z"
            stroke="white" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M9.4 12.6h.01M12.8 12.6h.01M16.2 12.6h.01"
            stroke="white" stroke-width="2.2" stroke-linecap="round"/>
    </svg>
  `;

  const ICON_INFO = `
    <svg class="nesp-help-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/>
      <path d="M12 10.6v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="12" cy="7.7" r="1.1" fill="currentColor"/>
    </svg>
  `;

  const ICON_BOOK = `
    <svg class="nesp-help-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M6 5.8h9.8c1.2 0 2.2 1 2.2 2.2V18.5c0 .9-.7 1.6-1.6 1.6H7.6c-.9 0-1.6-.7-1.6-1.6V5.8Z"
            stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M6.2 16.8h10.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M9.2 5.8v11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".6"/>
    </svg>
  `;

  const ICON_BOX = `
    <svg class="nesp-help-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M4.8 8.6 12 4.8l7.2 3.8-7.2 3.8-7.2-3.8Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M4.8 8.6V16L12 20l7.2-4V8.6" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M12 12.4V20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>
  `;

  const ICON_BUBBLE = `
    <svg class="nesp-help-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M6.4 16.8 4.6 18l.7-1.8A7 7 0 0 1 4 12.7C4 9 7.1 6.8 11.2 6.8c4.1 0 7.2 2.2 7.2 5.9s-3.1 5.9-7.2 5.9c-.8 0-1.7-.1-2.4-.2l-2.4 1.2Z"
            stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M8.6 12.6h.01M11.2 12.6h.01M13.8 12.6h.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
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
        <h3 class="nesp-help-title">How can we help you?</h3>
        <button class="nesp-help-close" type="button" aria-label="Close">×</button>
      </div>

      <div class="nesp-help-section">Useful links:</div>
      <div class="nesp-help-panel">
        <div class="nesp-help-item" data-action="faq" role="button" tabindex="0">
          <div class="nesp-help-left">
            ${ICON_INFO}
            <div class="nesp-help-text">
              <p class="nesp-help-item-title">Visit our FAQs</p>
            </div>
          </div>
          <div class="nesp-help-right"><span class="nesp-help-chev">›</span></div>
        </div>

        <div class="nesp-help-item" data-action="machine" role="button" tabindex="0">
          <div class="nesp-help-left">
            ${ICON_BOOK}
            <div class="nesp-help-text">
              <p class="nesp-help-item-title">Machine assistance</p>
            </div>
          </div>
          <div class="nesp-help-right"><span class="nesp-help-chev">›</span></div>
        </div>

        <div class="nesp-help-item" data-action="track" role="button" tabindex="0">
          <div class="nesp-help-left">
            ${ICON_BOX}
            <div class="nesp-help-text">
              <p class="nesp-help-item-title">Track your order</p>
            </div>
          </div>
          <div class="nesp-help-right"><span class="nesp-help-chev">›</span></div>
        </div>
      </div>

      <div class="nesp-help-section">Contact options:</div>
      <div class="nesp-help-panel">
        <div class="nesp-help-item" data-action="chat" role="button" tabindex="0">
          <div class="nesp-help-left">
            ${ICON_BUBBLE}
            <div class="nesp-help-text">
              <p class="nesp-help-item-title">Chat with us</p>
              <p class="nesp-help-item-sub">Our agents are available everyday from 8 AM to 10 PM ET.</p>
            </div>
          </div>
          <div class="nesp-help-right"><span class="nesp-help-chev">›</span></div>
        </div>

        <div class="nesp-help-item" data-action="phoneOriginal" role="button" tabindex="0">
          <div class="nesp-help-left">
            ${ICON_PHONE}
            <div class="nesp-help-text">
              <p class="nesp-help-item-title">Technical support for Original</p>
              <p class="nesp-help-item-sub">${CONFIG.phoneOriginal} Available 24/7</p>
            </div>
          </div>
          <div class="nesp-help-right"><span class="nesp-help-chev">›</span></div>
        </div>

        <div class="nesp-help-item" data-action="phoneVertuo" role="button" tabindex="0">
          <div class="nesp-help-left">
            ${ICON_PHONE}
            <div class="nesp-help-text">
              <p class="nesp-help-item-title">Technical support for Vertuo</p>
              <p class="nesp-help-item-sub">${CONFIG.phoneVertuo} Available 24/7</p>
            </div>
          </div>
          <div class="nesp-help-right"><span class="nesp-help-chev">›</span></div>
        </div>
      </div>
    </div>
  `;

  const launcher = document.createElement("div");
  launcher.className = "nesp-help-launcher";
  launcher.innerHTML = `
    <div class="nesp-help-pill" role="button" tabindex="0" aria-label="Open help menu">
      ${ICON_CHAT_PILL}
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
    popup.classList.contains("is-open") ? closePopup() : openPopup();
  }

  /* ----------------------------------
     Events
  ---------------------------------- */
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
    else if (action === "machine") safeOpen(CONFIG.machineUrl);
    else if (action === "track") safeOpen(CONFIG.trackUrl);
    else if (action === "phoneOriginal") window.location.href = "tel:" + telize(CONFIG.phoneOriginal);
    else if (action === "phoneVertuo") window.location.href = "tel:" + telize(CONFIG.phoneVertuo);
    else if (action === "chat") {
      try {
        if (window.chat && typeof window.chat.show === "function") window.chat.show();
        else if (window.Quiq && typeof window.Quiq.open === "function") window.Quiq.open();
      } catch (_) {}
    }

    closePopup();
  });

  // Close on outside click (no backdrop, like nespresso.com)
  document.addEventListener("click", () => closePopup());
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePopup(); });

  // Auto-close if Quiq chat opens
  const mo = new MutationObserver(() => {
    if (document.querySelector(CONFIG.chatOpenSelector)) closePopup();
  });
  mo.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ["class"] });
})();
