(function () {
  if (window.__NESP_HELP_LOADED__) return;
  window.__NESP_HELP_LOADED__ = true;

  /* ----------------------------------
     CONFIG
  ---------------------------------- */

  const CONFIG = {
    faqUrl: "https://www.nespresso.com/ca/en/service-faq",
    promoUrl: "https://www.nespresso.com/ca/en/promo",
    phone: "+18553255781",
    chatOpenSelector: ".quiq-web-chat-open"
  };

  /* ----------------------------------
     CREATE STYLES
  ---------------------------------- */

  const style = document.createElement("style");
  style.innerHTML = `
    .nesp-help-launcher {
      position: fixed;
      right: 22px;
      bottom: 22px;
      z-index: 999999;
      font-family: system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;
    }

    .nesp-help-pill {
      height: 52px;
      width: 52px;
      border-radius: 999px;
      background: #141414;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: width .25s ease;
      overflow: hidden;
      padding: 0 18px 0 6px;
    }

    .nesp-help-pill span {
      margin-left: 8px;
      white-space: nowrap;
      opacity: 0;
      transition: opacity .2s ease;
    }

    .nesp-help-launcher:hover .nesp-help-pill {
      width: 180px;
    }

    .nesp-help-launcher:hover .nesp-help-pill span {
      opacity: 1;
    }

    .nesp-help-popup {
      position: fixed;
      right: 22px;
      bottom: 120px;
      width: 380px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 25px 60px rgba(0,0,0,.35);
      padding: 18px;
      display: none;
      z-index: 999998;
    }

    .nesp-help-popup.active {
      display: block;
    }

    .nesp-help-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.4);
      display: none;
      z-index: 999997;
    }

    .nesp-help-backdrop.active {
      display: block;
    }

    .nesp-help-row {
      display: flex;
      justify-content: space-between;
      padding: 12px;
      border-radius: 14px;
      background: #f3f3f3;
      margin-top: 10px;
      cursor: pointer;
    }

    .nesp-help-row:hover {
      background: #eaeaea;
    }

    .nesp-help-title {
      font-weight: 600;
      font-size: 15px;
    }

    .nesp-help-sub {
      font-size: 13px;
      color: #666;
      margin-top: 4px;
    }

    .nesp-help-close {
      cursor: pointer;
      font-size: 18px;
      float: right;
    }
  `;
  document.head.appendChild(style);

  /* ----------------------------------
     CREATE DOM
  ---------------------------------- */

  const backdrop = document.createElement("div");
  backdrop.className = "nesp-help-backdrop";

  const popup = document.createElement("div");
  popup.className = "nesp-help-popup";
  popup.innerHTML = `
    <div class="nesp-help-close">×</div>
    <h3>Can we help?</h3>

    <div class="nesp-help-row" data-action="faq">
      <div>
        <div class="nesp-help-title">Visit our FAQs</div>
      </div>
      <div>›</div>
    </div>

    <div class="nesp-help-row" data-action="promo">
      <div>
        <div class="nesp-help-title">Claim your machine promotion</div>
      </div>
      <div>›</div>
    </div>

    <div class="nesp-help-row" data-action="chat">
      <div>
        <div class="nesp-help-title">Chat with Us</div>
        <div class="nesp-help-sub">
          Our agents are available from Monday to Friday: 8am to 10pm ET
        </div>
      </div>
      <div>›</div>
    </div>

    <div class="nesp-help-row" data-action="phone">
      <div>
        <div class="nesp-help-title">Technical support</div>
        <div class="nesp-help-sub">
          Call 1-855-325-5781
        </div>
      </div>
      <div>›</div>
    </div>
  `;

  const launcher = document.createElement("div");
  launcher.className = "nesp-help-launcher";
  launcher.innerHTML = `
    <div class="nesp-help-pill">
      💬 <span>Need help?</span>
    </div>
  `;

  document.body.appendChild(backdrop);
  document.body.appendChild(popup);
  document.body.appendChild(launcher);

  /* ----------------------------------
     LOGIC
  ---------------------------------- */

  function openPopup() {
    backdrop.classList.add("active");
    popup.classList.add("active");
  }

  function closePopup() {
    backdrop.classList.remove("active");
    popup.classList.remove("active");
  }

  launcher.addEventListener("click", function (e) {
    e.stopPropagation();
    openPopup();
  });

  backdrop.addEventListener("click", closePopup);
  popup.querySelector(".nesp-help-close").addEventListener("click", closePopup);

  popup.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  popup.addEventListener("click", function (e) {
    const row = e.target.closest(".nesp-help-row");
    if (!row) return;

    const action = row.dataset.action;

    switch (action) {
      case "faq":
        window.open(CONFIG.faqUrl, "_blank");
        break;

      case "promo":
        window.open(CONFIG.promoUrl, "_blank");
        break;

      case "chat":
        if (window.chat && typeof window.chat.show === "function") {
          window.chat.show();
        }
        break;

      case "phone":
        window.location.href = "tel:" + CONFIG.phone;
        break;
    }

    closePopup();
  });

})();
