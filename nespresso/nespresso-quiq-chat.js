/*!
 * Nespresso custom Quiq chat shim.
 *
 * Loads the Quiq Conversation Starter tag AND renders a custom
 * button -> popup -> chat flow on top of it, since Quiq doesn't natively
 * support that pattern. Drop this in place of the standard Quiq tag:
 *
 *   Before (standard Quiq embed):
 *     <script src="https://<tenant>.quiq-api.com/app/chat-ui/index.js" charset="UTF-8"></script>
 *     <script>var chat = Quiq({ pageConfigurationId: '<page id>' });</script>
 *
 *   After (this file replaces both of the above):
 *     <script src="/path/to/nespresso-quiq-chat.js"></script>
 *
 * Everything below — the Quiq tag itself, the page-configuration call, and
 * the custom UI — is self-contained in this one file so a site only needs
 * to swap a single <script src> to go from the standard embed to this one.
 */
(function () {
  'use strict';

  // ── Config — update these two values for a different tenant/page ──────────
  var QUIQ_TAG_SRC = 'https://nespresso-ai-studio-playground.quiq-api.com/app/chat-ui/index.js';
  var PAGE_CONFIGURATION_ID = 'shelf-agent-test';

  // ── Styles ──────────────────────────────────────────────────────────────
  var CSS = ''
    + '/* Design tokens pulled from the live Genesys widget on nespresso.com/us/en */'
    + ':root {'
    + '  --qs-primary: #161D26;'
    + '  --qs-on-primary: #ffffff;'
    + '  --qs-radius: 4px;'
    + '  --qs-font: -apple-system, "system-ui", "Segoe UI", Roboto, Oxygen-Sans, Ubuntu,'
    + '             Cantarell, "Open Sans", "Helvetica Neue", sans-serif;'
    + '}'
    + '#qs-root, #qs-root * { box-sizing: border-box; font-family: var(--qs-font); }'

    /* Fake launcher — the real widget is layout:"custom" so it renders nothing
       on its own; this button is what the user actually sees. Default state is
       a plain circle; on hover it slides out into a pill with the icon on the
       left and a "Need help?" label. */
    + '#qs-launcher {'
    + '  position: fixed; right: 24px; bottom: 24px; height: 56px; width: 56px;'
    + '  border-radius: 28px; background: var(--qs-primary); color: var(--qs-on-primary);'
    + '  border: 1.5px solid rgba(255,255,255,.85); cursor: pointer; display: flex; align-items: center; padding: 0 15px;'
    + '  overflow: hidden; white-space: nowrap;'
    + '  box-shadow: rgba(0,0,0,.12) 0 4px 16px, rgba(0,0,0,.08) 0 1px 4px;'
    + '  z-index: 999999; transition: width .32s cubic-bezier(.4,0,.2,1), box-shadow .2s ease;'
    + '}'
    + '#qs-launcher:hover, #qs-launcher:focus-visible {'
    + '  width: 168px; box-shadow: rgba(0,0,0,.18) 0 8px 24px, rgba(0,0,0,.1) 0 2px 6px;'
    + '}'
    + '#qs-launcher-icon { flex-shrink: 0; display: flex; }'
    + '#qs-launcher-icon svg { width: 24px; height: 24px; fill: currentColor; }'
    + '#qs-launcher-text {'
    + '  display: inline-block; max-width: 0; opacity: 0; margin-left: 0;'
    + '  font-size: 15px; font-weight: 500;'
    + '  transition: max-width .32s cubic-bezier(.4,0,.2,1), opacity .2s ease .05s, margin-left .32s cubic-bezier(.4,0,.2,1);'
    + '}'
    + '#qs-launcher:hover #qs-launcher-text, #qs-launcher:focus-visible #qs-launcher-text {'
    + '  max-width: 120px; opacity: 1; margin-left: 12px;'
    + '}'

    /* Fake popup menu */
    + '#qs-menu {'
    + '  position: fixed; right: 24px; bottom: 92px; width: 380px; max-width: calc(100vw - 48px);'
    + '  background: #fff; border-radius: 20px;'
    + '  box-shadow: rgba(0,0,0,.16) 0 16px 48px, rgba(0,0,0,.08) 0 4px 12px;'
    + '  overflow: hidden; z-index: 999997; opacity: 0; transform: translateY(12px) scale(.98);'
    + '  pointer-events: none; transition: opacity .18s ease, transform .18s ease;'
    + '}'
    + '#qs-menu.qs-open { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }'
    /* box-shadow (not border) extends the header's own color 1px past its
       layout edge without taking up space — masks a hairline seam that
       otherwise shows the white body peeking through. Caused by the header's
       height coming out to a fractional pixel value (padding + the title's
       font-metric-driven line height rarely sum to a whole number), which
       Chrome can round differently between layout and paint, worse still
       during the popup's open/close scale transition. */
    + '#qs-menu-header {'
    + '  background: var(--qs-primary); color: var(--qs-on-primary); padding: 28px 60px 24px 28px;'
    + '  position: relative; box-shadow: 0 1px 0 0 var(--qs-primary);'
    + '}'
    + '#qs-menu-header h1 { margin: 0; font-size: 21px; font-weight: 600; letter-spacing: -.01em; line-height: 1.3; }'
    + '#qs-menu-close {'
    + '  position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; display: flex;'
    + '  align-items: center; justify-content: center; background: rgba(255,255,255,.08); border: none;'
    + '  border-radius: 50%; color: var(--qs-on-primary); font-size: 18px; cursor: pointer; line-height: 1;'
    + '  transition: background .15s ease;'
    + '}'
    + '#qs-menu-close:hover { background: rgba(255,255,255,.18); }'
    + '#qs-menu-body { padding: 4px 10px 10px; max-height: 60vh; overflow-y: auto; }'
    + '.qs-section { padding: 6px 0; }'
    + '.qs-section + .qs-section { border-top: 1px solid #eee; }'
    + '.qs-section-title {'
    + '  margin: 0; padding: 12px 12px 6px; font-size: 11.5px; font-weight: 700;'
    + '  text-transform: uppercase; letter-spacing: .04em; color: #8a8a8a;'
    + '}'
    + '.qs-section:first-child .qs-section-title { padding-top: 4px; }'
    + '.qs-option {'
    + '  display: flex; align-items: center; gap: 14px; width: 100%; padding: 12px; margin: 2px 0;'
    + '  background: none; border: none; border-radius: 14px; text-align: left; color: #161D26;'
    + '  cursor: pointer; text-decoration: none; transition: background .15s ease;'
    + '}'
    + '.qs-option:hover { background: #f4f4f5; }'
    + '.qs-option-icon {'
    + '  width: 42px; height: 42px; flex-shrink: 0; display: flex; align-items: center;'
    + '  justify-content: center; border-radius: 50%; background: #f4f4f5; color: var(--qs-primary);'
    + '}'
    + '.qs-option-icon svg { width: 20px; height: 20px; fill: currentColor; }'
    + '.qs-option-text { flex: 1 1 auto; min-width: 0; }'
    + '.qs-option-text .qs-label { display: block; font-size: 15px; font-weight: 500; line-height: 1.35; }'
    + '.qs-option-text .qs-sub { display: block; font-size: 13px; color: #78787d; margin-top: 3px; line-height: 1.4; }'
    + '.qs-chevron { flex-shrink: 0; width: 18px; height: 18px; color: #b4b4b8; }'
    + '.qs-chevron svg { width: 100%; height: 100%; fill: currentColor; }'

    /* Hide the real chat window until the SDK reports it's actually initialized
       (see waitForChatReady) — otherwise there's a visible moment where the
       iframe is up but blank/unstyled while its own app boots. Once revealed
       (qs-ready), it stays revealed; we don't want it to flash hidden again on
       every subsequent open, only the very first time it loads. */
    + '.quiq-webchat-sdk:not(.qs-ready) { opacity: 0 !important; pointer-events: none !important; }'

    /* Quiq's SDK also auto-renders its own default floating launcher for this widget
       (a `.quiq-togglechatbutton-button` inside `.quiq-floating-element`) even though
       it's configured as a custom entry point — left uncorrected this shows as a second
       circle behind our own launcher. Two things to know if this ever needs revisiting:
       1. Hiding the outer `.quiq-floating-element` (display:none) also breaks the real
          docked chat window — its position/size is computed relative to that element's
          geometry, so collapsing it to 0x0 collapses the real window too. Leave the
          outer element alone.
       2. The inner button/wrapper carry their own explicit `visibility: visible` (not
          just inherited), so hiding the outer container via visibility does nothing —
          Quiq's own rule wins. Targeting the inner button and wrapper directly with
          !important is what actually works. */
    + '.quiq-togglechatbutton-wrapper, .quiq-togglechatbutton-button {'
    + '  visibility: hidden !important; pointer-events: none !important;'
    + '}'

    /* The chat window's own corner radius isn't one of the theme's style-override keys
       (no override reaches the outer docked panel) — but the iframe and its wrapper are
       ordinary elements in this document, so we style their box directly to match the
       popup's 20px radius, including the bottom corners since it floats as a card here
       rather than sitting flush against a screen edge. */
    + '.quiq-chat-iframe, .quiq-webchat-sdk { border-radius: 20px !important; }';

  // ── Markup ──────────────────────────────────────────────────────────────
  var HTML = ''
    + '<div id="qs-root">'
    + '  <button id="qs-launcher" aria-label="Open chat menu">'
    + '    <span id="qs-launcher-icon">'
    + '      <svg viewBox="0 -960 960 960"><path d="M240-400h480v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Z"/></svg>'
    + '    </span>'
    + '    <span id="qs-launcher-text">Need help?</span>'
    + '  </button>'
    + '  <div id="qs-menu" role="dialog" aria-labelledby="qs-menu-title" aria-modal="true">'
    + '    <div id="qs-menu-header">'
    + '      <h1 id="qs-menu-title">How can we help you?</h1>'
    + '      <button id="qs-menu-close" aria-label="Close">&times;</button>'
    + '    </div>'
    + '    <div id="qs-menu-body">'
    + '      <section class="qs-section" aria-labelledby="qs-section-links">'
    + '        <h3 class="qs-section-title" id="qs-section-links">Useful links</h3>'
    // TODO: point at the real FAQ page for this tenant/domain
    + '        <a class="qs-option" href="/us/en/service-faq">'
    + '          <span class="qs-option-icon"><svg viewBox="0 -960 960 960"><path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/></svg></span>'
    + '          <span class="qs-option-text"><span class="qs-label">Visit our FAQs</span></span>'
    + '          <span class="qs-chevron"><svg viewBox="0 -960 960 960"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg></span>'
    + '        </a>'
    // TODO: point at the real machine-assistance page for this tenant/domain
    + '        <a class="qs-option" href="/us/en/machine-assistance">'
    + '          <span class="qs-option-icon"><svg viewBox="0 -960 960 960"><path d="M160-120v-80h80v-280q0-83 50-147.5T420-706v-14q0-25 17.5-42.5T480-780q25 0 42.5 17.5T540-720v14q80 20 130 84.5T720-480v280h80v80H160Z"/></svg></span>'
    + '          <span class="qs-option-text"><span class="qs-label">Machine assistance</span></span>'
    + '          <span class="qs-chevron"><svg viewBox="0 -960 960 960"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg></span>'
    + '        </a>'
    // TODO: wire to real order-tracking flow
    + '        <a class="qs-option" href="#" data-qs-todo="order-tracking">'
    + '          <span class="qs-option-icon"><svg viewBox="0 -960 960 960"><path d="M280-80q-33 0-56.5-23.5T200-160q0-33 23.5-56.5T280-240q33 0 56.5 23.5T360-160q0 33-23.5 56.5T280-80Zm400 0q-33 0-56.5-23.5T600-160q0-33 23.5-56.5T680-240q33 0 56.5 23.5T760-160q0 33-23.5 56.5T680-80ZM80-880v-80h133l45 200h522l-90 400H320l-30-120h-40v-80h100l100-400H80Z"/></svg></span>'
    + '          <span class="qs-option-text"><span class="qs-label">Track your order</span></span>'
    + '          <span class="qs-chevron"><svg viewBox="0 -960 960 960"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg></span>'
    + '        </a>'
    + '      </section>'
    + '      <section class="qs-section" aria-labelledby="qs-section-contact">'
    + '        <h3 class="qs-section-title" id="qs-section-contact">Contact options</h3>'
    + '        <button id="qs-chat-option" class="qs-option">'
    + '          <span class="qs-option-icon"><svg viewBox="0 -960 960 960"><path d="M240-400h480v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Z"/></svg></span>'
    + '          <span class="qs-option-text">'
    + '            <span class="qs-label">Chat with us</span>'
    + '            <span class="qs-sub">Our agents are available everyday from 8 AM to 10 PM ET.</span>'
    + '          </span>'
    + '          <span class="qs-chevron"><svg viewBox="0 -960 960 960"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg></span>'
    + '        </button>'
    // TODO: confirm these numbers/hours for the real tenant
    + '        <a class="qs-option" href="tel:800-562-1465">'
    + '          <span class="qs-option-icon"><svg viewBox="0 -960 960 960"><path d="M798-120q-125 0-247-54.5T329-329Q229-429 174.5-551T120-798q0-18 12-30t30-12h162q14 0 25 9.5t13 22.5l26 140q2 16-1 27t-11 19l-97 98q20 37 47.5 71.5T387-386q31 31 65 57.5t72 48.5l94-94q9-9 23.5-13.5T669-390l138 28q14 4 22.5 14.5T838-322v162q0 18-12 30t-30 12Z"/></svg></span>'
    + '          <span class="qs-option-text">'
    + '            <span class="qs-label">Technical support for Original</span>'
    + '            <span class="qs-sub">800-562-1465 &middot; Available 24/7</span>'
    + '          </span>'
    + '          <span class="qs-chevron"><svg viewBox="0 -960 960 960"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg></span>'
    + '        </a>'
    + '        <a class="qs-option" href="tel:877-964-6299">'
    + '          <span class="qs-option-icon"><svg viewBox="0 -960 960 960"><path d="M798-120q-125 0-247-54.5T329-329Q229-429 174.5-551T120-798q0-18 12-30t30-12h162q14 0 25 9.5t13 22.5l26 140q2 16-1 27t-11 19l-97 98q20 37 47.5 71.5T387-386q31 31 65 57.5t72 48.5l94-94q9-9 23.5-13.5T669-390l138 28q14 4 22.5 14.5T838-322v162q0 18-12 30t-30 12Z"/></svg></span>'
    + '          <span class="qs-option-text">'
    + '            <span class="qs-label">Technical support for Vertuo</span>'
    + '            <span class="qs-sub">877-964-6299 &middot; Available 24/7</span>'
    + '          </span>'
    + '          <span class="qs-chevron"><svg viewBox="0 -960 960 960"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg></span>'
    + '        </a>'
    + '      </section>'
    + '    </div>'
    + '  </div>'
    + '</div>';

  // ── Setup ───────────────────────────────────────────────────────────────
  function injectStyles() {
    var style = document.createElement('style');
    style.setAttribute('data-qs', 'nespresso-quiq-chat');
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function injectMarkup() {
    var holder = document.createElement('div');
    holder.innerHTML = HTML;
    document.body.appendChild(holder.firstElementChild);
  }

  // Polls the SDK's own state (rather than the iframe's `load` event, which
  // fires before the app inside has actually finished booting/theming) until
  // the widget reports itself initialized, then reveals it. Cheap and safe to
  // call on every open — resolves near-instantly once already initialized.
  var chatRevealed = false;
  function revealChatWhenReady() {
    if (chatRevealed) return;
    var attempts = 0;
    var interval = setInterval(function () {
      attempts++;
      var wrapper = document.querySelector('.quiq-webchat-sdk');
      window.chat.getState().then(function (state) {
        var webchat = state.webchats && state.webchats[PAGE_CONFIGURATION_ID];
        var ready = webchat && webchat.status === 'webchatStatusAppInitialized';
        if (ready && wrapper) {
          chatRevealed = true;
          wrapper.classList.add('qs-ready');
          clearInterval(interval);
        } else if (attempts > 100) {
          // ~10s safety valve - reveal anyway rather than hide it forever
          // if something about the ready-state check doesn't pan out.
          chatRevealed = true;
          if (wrapper) wrapper.classList.add('qs-ready');
          clearInterval(interval);
        }
      });
    }, 100);
  }

  function wireEvents() {
    var qsMenu = document.getElementById('qs-menu');

    // Tracks whether WE last opened the real Quiq window, so only one of
    // {popup, chat window} is ever showing at a time. If the end user closes
    // the chat window some other way (its own X button), this flag goes
    // stale, but that's harmless here: hide() on an already-closed window is
    // a no-op, so the launcher still does the right thing (opens the popup).
    var isChatOpen = false;

    function closeMenu() {
      qsMenu.classList.remove('qs-open');
    }

    document.getElementById('qs-launcher').addEventListener('click', function () {
      if (qsMenu.classList.contains('qs-open')) {
        // Popup is showing -> this closes everything.
        closeMenu();
        return;
      }
      if (isChatOpen) {
        // Chat window is showing -> swap it for the popup.
        window.chat.hide();
        isChatOpen = false;
      }
      qsMenu.classList.add('qs-open');
    });

    document.getElementById('qs-menu-close').addEventListener('click', closeMenu);

    // Real trigger: close our fake menu and open the actual Quiq widget via the
    // SDK. `window.chat` is assigned once the Quiq tag has loaded and initialized
    // below; a user can't reach this click before that's done since it's nested
    // behind opening the menu first.
    document.getElementById('qs-chat-option').addEventListener('click', function () {
      closeMenu();
      window.chat.show();
      isChatOpen = true;
      revealChatWhenReady();
    });

    // Placeholder links not yet wired to a real destination for this tenant.
    var todoEls = document.querySelectorAll('[data-qs-todo]');
    for (var i = 0; i < todoEls.length; i++) {
      todoEls[i].addEventListener('click', function (e) {
        e.preventDefault();
        // eslint-disable-next-line no-console
        console.warn('[nespresso-quiq-chat] "' + e.currentTarget.getAttribute('data-qs-todo') + '" has no destination wired up yet.');
      });
    }
  }

  function loadQuiqTag(onLoaded) {
    var script = document.createElement('script');
    script.src = QUIQ_TAG_SRC;
    script.charset = 'UTF-8';
    script.onload = onLoaded;
    document.head.appendChild(script);
  }

  function init() {
    injectStyles();
    injectMarkup();
    wireEvents();
    loadQuiqTag(function () {
      window.chat = window.Quiq({ pageConfigurationId: PAGE_CONFIGURATION_ID });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
