(function () {
  'use strict';

  var CONFIG = {
    quiqScriptSrc: 'https://dixie.quiq-api.com/app/chat-ui/index.js',
    pageConfigurationId: 'nespresso',

    labels: {
      launcher: 'Need help?',
      heading: 'Can we help?',
      usefulLinks: 'Useful links:',
      contactOptions: 'Contact options:',
      faq: 'Visit our FAQs',
      promo: 'Claim your machine promotion',
      chat: 'Chat with Us',
      chatMeta: 'Our agents are available from Monday to Friday: 8am to 10pm ET Saturday & Sunday: 8am to 8pm ET',
      phone: 'Technical support',
      phoneMeta: 'Call 1-855-325-5781 Monday to Friday: 8am to 10pm ET Saturday & Sunday: 8am to 8pm'
    },

    links: {
      faq: 'https://www.nespresso.com/ca/en/service-faq',
      promo: 'https://www.nespresso.com/ca/en/promo',
      phone: '18553255781'
    },

    ids: {
      root: 'nesp-help-root',
      launcher: 'nesp-help-launcher',
      pill: 'nesp-help-pill',
      panel: 'nesp-help-panel',
      backdrop: 'nesp-help-backdrop',
      close: 'nesp-help-close',
      chatButton: 'nesp-open-chat'
    }
  };

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(value) {
    return String(value).replace(/"/g, '&quot;');
  }

  function loadQuiq(src, callback) {
    if (typeof window.Quiq === 'function') {
      callback();
      return;
    }

    var existing = document.querySelector('script[data-nesp-quiq-loader="true"]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.src = src;
    script.charset = 'UTF-8';
    script.async = true;
    script.setAttribute('data-nesp-quiq-loader', 'true');
    script.onload = callback;
    script.onerror = function () {
      console.error('[Nespresso Launcher] Failed to load Quiq script:', src);
    };
    document.head.appendChild(script);
  }

  function injectStyles() {
    if (document.getElementById('nesp-help-styles')) return;

    var style = document.createElement('style');
    style.id = 'nesp-help-styles';
    style.textContent = [
      ':root{',
      '--nesp-z:9999;',
      '--nesp-right:22px;',
      '--nesp-bottom:22px;',
      '--nesp-offset:92px;',
      '--nesp-ease:cubic-bezier(.2,.8,.2,1);',
      '--nesp-pill-open-width:190px;',
      '--nesp-pill-gap:14px;',
      '--nesp-pill-pad-left:6px;',
      '--nesp-pill-pad-right:18px;',
      '--nesp-launcher-bg:#151515;',
      '--nesp-launcher-border:#dadada;',
      '--nesp-launcher-text:#efefef;',
      '--nesp-card-bg:#ebe9e7;',
      '--nesp-group-bg:#f3f1ef;',
      '--nesp-text:#262626;',
      '--nesp-muted:#737373;',
      '--nesp-border:#dfdcd8;',
      '--nesp-hover:#efedeb;',
      '--nesp-shadow:0 14px 38px rgba(0,0,0,.22);',
      '--nesp-shadow-btn:0 7px 18px rgba(0,0,0,.16);',
      '--nesp-radius-card:18px;',
      '--nesp-radius-group:18px;',
      '--nesp-radius-row:14px;',
      '}',

      '#' + CONFIG.ids.root + '{',
      'font-family:"NespressoLucas",system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;',
      'color:var(--nesp-text);',
      '-webkit-font-smoothing:antialiased;',
      '-moz-osx-font-smoothing:grayscale;',
      '}',

      '.nesp-help-sr-only{',
      'position:absolute !important;',
      'width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;',
      'clip:rect(0,0,0,0);white-space:nowrap;border:0;',
      '}',

      '#' + CONFIG.ids.backdrop + '{',
      'position:fixed;inset:0;',
      'background:rgba(0,0,0,.28);',
      'opacity:0;pointer-events:none;',
      'transition:opacity 220ms var(--nesp-ease);',
      'z-index:calc(var(--nesp-z) - 1);',
      '}',
      '#' + CONFIG.ids.backdrop + '.is-open{opacity:1;pointer-events:auto;}',

      '#' + CONFIG.ids.panel + '{',
      'position:fixed;',
      'right:var(--nesp-right);',
      'bottom:calc(var(--nesp-bottom) + var(--nesp-offset));',
      'width:min(388px,calc(100vw - 28px));',
      'background:var(--nesp-card-bg);',
      'border-radius:var(--nesp-radius-card);',
      'box-shadow:var(--nesp-shadow);',
      'padding:20px 16px 16px;',
      'box-sizing:border-box;',
      'transform-origin:bottom right;',
      'transform:translateY(12px) scale(.98);',
      'opacity:0;',
      'pointer-events:none;',
      'transition:transform 230ms var(--nesp-ease), opacity 230ms var(--nesp-ease);',
      'z-index:calc(var(--nesp-z) - 1);',
      '}',
      '#' + CONFIG.ids.panel + '.is-open{',
      'opacity:1;',
      'pointer-events:auto;',
      'transform:translateY(0) scale(1);',
      '}',

      '.nesp-help-header{',
      'display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px;',
      '}',
      '.nesp-help-title{',
      'margin:0;',
      'font-size:17px;',
      'line-height:1.2;',
      'font-weight:650;',
      'letter-spacing:-0.2px;',
      'color:var(--nesp-text);',
      '}',

      '#' + CONFIG.ids.close + '{',
      'width:32px;height:32px;min-width:32px;',
      'border:0;border-radius:999px;',
      'background:#f0efed;',
      'color:#3a3a3a;',
      'display:grid;place-items:center;',
      'cursor:pointer;',
      'font-size:20px;line-height:1;padding:0;',
      'transition:background 140ms ease, transform 120ms ease;',
      '}',
      '#' + CONFIG.ids.close + ':hover{background:#ebe8e5;transform:scale(1.03);}',

      '.nesp-help-section{margin-top:8px;}',
      '.nesp-help-section-label{',
      'margin:0 0 10px 2px;',
      'font-size:12px;',
      'line-height:1.3;',
      'font-weight:500;',
      'color:#757575;',
      '}',

      '.nesp-help-group{',
      'background:var(--nesp-group-bg);',
      'border-radius:var(--nesp-radius-group);',
      'padding:12px 10px;',
      '}',

      '.nesp-help-list{display:grid;gap:6px;}',
      '.nesp-help-section:last-of-type .nesp-help-list{gap:8px;}',

      '.nesp-help-row{',
      'display:flex;align-items:flex-start;gap:12px;',
      'width:100%;min-height:56px;',
      'padding:14px 12px;',
      'border:0;background:transparent;',
      'border-radius:var(--nesp-radius-row);',
      'text-decoration:none;color:var(--nesp-text);',
      'box-sizing:border-box;',
      'transition:background 140ms ease, transform 120ms ease;',
      '}',
      '.nesp-help-row:hover{background:var(--nesp-hover);transform:translateY(-1px);}',
      '.nesp-help-row:active{transform:translateY(0);}',

      '.nesp-help-icon-wrap{',
      'width:24px;min-width:24px;height:24px;',
      'display:grid;place-items:center;',
      'color:#1f1f1f;margin-top:2px;',
      '}',
      '.nesp-help-icon-wrap svg{width:20px;height:20px;display:block;}',

      '.nesp-help-copy{min-width:0;flex:1 1 auto;text-align:left;}',
      '.nesp-help-row-title{',
      'display:block;',
      'font-size:14px;',
      'line-height:1.3;',
      'font-weight:500;',
      'color:var(--nesp-text);',
      'text-align:left;',
      '}',
      '.nesp-help-row-meta{',
      'display:block;',
      'margin-top:5px;',
      'font-size:11px;',
      'line-height:1.5;',
      'letter-spacing:0.1px;',
      'color:var(--nesp-muted);',
      'text-align:left;',
      '}',

      '.nesp-help-chevron{',
      'width:18px;min-width:18px;',
      'display:grid;place-items:center;',
      'color:#777;',
      'font-size:24px;line-height:1;',
      'margin-top:2px;',
      'align-self:flex-start;',
      '}',

      '.nesp-help-chat-row{cursor:pointer;}',
      '.nesp-help-chat-row .nesp-help-copy, .nesp-help-phone-row .nesp-help-copy{text-align:left;}',
      '.nesp-help-chat-row .nesp-help-row-title, .nesp-help-phone-row .nesp-help-row-title{text-align:left;}',
      '.nesp-help-chat-row .nesp-help-row-meta, .nesp-help-phone-row .nesp-help-row-meta{max-width:245px;}',

      '#' + CONFIG.ids.launcher + '{',
      'position:fixed;right:var(--nesp-right);bottom:var(--nesp-bottom);',
      'z-index:var(--nesp-z);background:transparent;border:0;padding:0;margin:0;cursor:pointer;',
      '}',

      '#' + CONFIG.ids.pill + '{',
      'height:52px;width:52px;border-radius:999px;',
      'background:var(--nesp-launcher-bg);',
      'border:1.5px solid var(--nesp-launcher-border);',
      'box-shadow:var(--nesp-shadow-btn);',
      'display:flex;align-items:center;justify-content:flex-start;',
      'padding:0;gap:0;overflow:hidden;user-select:none;',
      'transition:width 240ms var(--nesp-ease), padding 240ms var(--nesp-ease), gap 240ms var(--nesp-ease), box-shadow 180ms ease;',
      '}',

      '.nesp-help-launcher-icon{',
      'width:52px;height:52px;min-width:52px;',
      'display:grid;place-items:center;color:var(--nesp-launcher-text);line-height:0;',
      '}',
      '.nesp-help-launcher-icon svg{width:24px;height:24px;display:block;}',
      '.nesp-help-launcher-label{',
      'font-size:14px;font-weight:600;color:var(--nesp-launcher-text);',
      'white-space:nowrap;opacity:0;transition:opacity 200ms ease;',
      '}',

      '@media (hover:hover) and (pointer:fine){',
      '#' + CONFIG.ids.launcher + ':hover #' + CONFIG.ids.pill + '{',
      'width:var(--nesp-pill-open-width);',
      'padding:0 var(--nesp-pill-pad-right) 0 var(--nesp-pill-pad-left);',
      'gap:var(--nesp-pill-gap);',
      '}',
      '#' + CONFIG.ids.launcher + ':hover .nesp-help-launcher-label{opacity:1;}',
      '}',

      '#' + CONFIG.ids.launcher + '.is-open #' + CONFIG.ids.pill + '{',
      'width:var(--nesp-pill-open-width);',
      'padding:0 var(--nesp-pill-pad-right) 0 var(--nesp-pill-pad-left);',
      'gap:var(--nesp-pill-gap);',
      '}',
      '#' + CONFIG.ids.launcher + '.is-open .nesp-help-launcher-label{opacity:1;}',

      '#' + CONFIG.ids.launcher + ':focus-visible,',
      '#' + CONFIG.ids.close + ':focus-visible,',
      '.nesp-help-row:focus-visible{',
      'outline:2px solid #4d90fe;outline-offset:2px;',
      '}',

      '@media (max-width:640px){',
      '#' + CONFIG.ids.panel + '{right:12px;bottom:86px;width:calc(100vw - 24px);padding:18px 14px 14px;}',
      '#' + CONFIG.ids.launcher + '{right:12px;bottom:12px;}',
      '.nesp-help-chat-row .nesp-help-row-meta,.nesp-help-phone-row .nesp-help-row-meta{max-width:none;}',
      '}',

      'id="nesp-polish-pass"',
      '/* === POLISH PASS (Premium + Interaction) === */',
      
      '#' + CONFIG.ids.panel + '{',
      'background:#ece9e6;',
      'box-shadow:0 18px 40px rgba(0,0,0,.18),0 1px 0 rgba(255,255,255,.35) inset;',
      '}',
      
      '.nesp-help-group{',
      'background:#f5f3f1;',
      'box-shadow:0 1px 0 rgba(255,255,255,.55) inset;',
      '}',
      
      '.nesp-help-icon-wrap{',
      'width:28px;',
      'min-width:28px;',
      'height:28px;',
      'border-radius:999px;',
      'background:rgba(255,255,255,.6);',
      'margin-top:0;',
      '}',
      
      '.nesp-help-row{',
      'transition:background 160ms ease,transform 160ms ease,box-shadow 160ms ease;',
      '}',
      
      '.nesp-help-row:hover{',
      'background:#f0ece8;',
      'transform:translateY(-1px);',
      'box-shadow:0 1px 0 rgba(255,255,255,.55) inset;',
      '}',
      
      '.nesp-help-row:hover .nesp-help-chevron{',
      'color:#555;',
      '}',
      
      '#' + CONFIG.ids.pill + '{',
      'border:1px solid rgba(255,255,255,.22);',
      'box-shadow:0 10px 24px rgba(0,0,0,.18),0 1px 0 rgba(255,255,255,.14) inset;',
      'transition:width 280ms cubic-bezier(.2,.8,.2,1),padding 280ms cubic-bezier(.2,.8,.2,1),gap 280ms cubic-bezier(.2,.8,.2,1),box-shadow 180ms ease;',
      '}',
      
      '.nesp-help-launcher-icon{',
      'margin-left:1px;',
      '}',
      
      '.nesp-help-section:last-of-type .nesp-help-group{',
      'padding:14px 10px;',
      '}',
      
      '.nesp-help-chat-row{',
      'background:rgba(255,255,255,.25);',
      '}',
      
      '.nesp-help-section{',
      'opacity:.96;',
      'transform:translateY(4px);',
      'transition:opacity 220ms ease,transform 220ms ease;',
      '}',
      
      '#' + CONFIG.ids.panel + '.is-open .nesp-help-section{',
      'opacity:1;',
      'transform:translateY(0);',
      '}',
      
      '#' + CONFIG.ids.panel + ' .nesp-help-section:nth-of-type(2){',
      'transition-delay:30ms;',
      '}',

      '/* === CONTACT TYPOGRAPHY ALIGNMENT === */',
      
      '.nesp-help-chat-row .nesp-help-row-title,',
      '.nesp-help-phone-row .nesp-help-row-title{',
      'font-size:14px;',
      'line-height:1.3;',
      'font-weight:550;',
      'letter-spacing:0;',
      'color:#222;',
      '}',
      
      '.nesp-help-chat-row .nesp-help-row-meta,',
      '.nesp-help-phone-row .nesp-help-row-meta{',
      'font-size:11px;',
      'line-height:1.5;',
      'letter-spacing:0.1px;',
      'color:#727272;',
      'max-width:245px;',
      '}',
      
      '.nesp-help-chat-row .nesp-help-copy,',
      '.nesp-help-phone-row .nesp-help-copy{',
      'text-align:left;',
      '}',
    ].join('');

    document.head.appendChild(style);
  }

  function iconSvg(type) {
    var icons = {
      launcher: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m5.55 11.6-2.4 1.55.94-2.05-.37-.23C2.56 10.13 2 9 2 7.44 2 4.5 4.1 3 8.25 3c3.95 0 6.02 1.37 6.21 4.04A18 18 0 0 1 15.5 7c-.15-2.38-1.6-5-7.24-5C2.25 2 1 4.96 1 7.44c0 1.75.61 3.1 1.83 4.02l-1.08 2.38 1.08.72 2.92-1.9c.4.08.83.14 1.28.17.02-.32.07-.65.15-1-.5-.03-.99-.09-1.43-.18l-.2-.04Z"></path><path d="M23 13.44C23 10.96 21.7 8 15.5 8S8 10.96 8 13.44c0 2 .82 3.47 2.44 4.39 1.24.7 2.94 1.05 5.06 1.05.94 0 1.81-.07 2.6-.21l3.14 2.09.83-.83-.98-2.45A4.71 4.71 0 0 0 23 13.44Zm-2.3 5.76-2.4-1.6-.2.05c-.77.15-1.64.23-2.6.23-1.95 0-3.48-.3-4.57-.92C9.63 16.22 9 15.07 9 13.44 9 10.5 11.19 9 15.5 9c4.31 0 6.5 1.5 6.5 4.44 0 1.56-.59 2.69-1.79 3.42l-.36.23.85 2.1Z"></path><path d="M12.5 14.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15.5 14.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM18.5 14.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"></path></svg>',
      faq: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M9.8 9.4a2.45 2.45 0 1 1 4.03 1.85c-.86.73-1.83 1.22-1.83 2.52"></path><circle cx="12" cy="17" r=".8" fill="currentColor" stroke="none"></circle></svg>',
      promo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12.2V7a2 2 0 0 0-2-2h-5.4L4 13.6 10.4 20 19 11.4V10"></path><circle cx="16.2" cy="7.8" r="1.25"></circle><path d="m7.8 10.7 5.5 5.5"></path></svg>',
      phone: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v2a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 3.18 2 2 0 0 1 4.11 1h2a2 2 0 0 1 2 1.72c.12.9.33 1.78.63 2.62a2 2 0 0 1-.45 2.11L7.1 8.6a16 16 0 0 0 8.3 8.3l1.15-1.2a2 2 0 0 1 2.11-.45c.84.3 1.72.51 2.62.63A2 2 0 0 1 22 16.92z"></path></svg>',
      chat: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 16.3c-3 0-5-1.9-5-4.7S4.1 7 8.2 7s6.2 1.5 6.2 4.6c0 3.1-2.6 4.7-6 4.7H7l-3.4 2 .9-2.4"></path><path d="M14.5 10.2c.3-2.5 2.4-4.2 5.6-4.2 3.4 0 5.9 1.6 5.9 4.8 0 2.7-1.9 4.5-4.9 4.7l.7 1.9-2.7-1.5"></path></svg>'
    };
    return icons[type] || icons.launcher;
  }

  function buildRow(opts) {
    return [
      '<a class="nesp-help-row ' + escapeHtml(opts.className || '') + '" href="' + escapeAttr(opts.href) + '"' + (opts.targetBlank ? ' target="_blank" rel="noopener noreferrer"' : '') + '>',
        '<span class="nesp-help-icon-wrap">' + iconSvg(opts.icon) + '</span>',
        '<span class="nesp-help-copy">',
          '<span class="nesp-help-row-title">' + escapeHtml(opts.title) + '</span>',
          (opts.meta ? '<span class="nesp-help-row-meta">' + escapeHtml(opts.meta) + '</span>' : ''),
        '</span>',
        '<span class="nesp-help-chevron" aria-hidden="true">›</span>',
      '</a>'
    ].join('');
  }

  function buildChatButton() {
    return [
      '<button id="' + CONFIG.ids.chatButton + '" class="nesp-help-row nesp-help-chat-row" type="button">',
        '<span class="nesp-help-icon-wrap">' + iconSvg('chat') + '</span>',
        '<span class="nesp-help-copy">',
          '<span class="nesp-help-row-title">' + escapeHtml(CONFIG.labels.chat) + '</span>',
          '<span class="nesp-help-row-meta">' + escapeHtml(CONFIG.labels.chatMeta) + '</span>',
        '</span>',
        '<span class="nesp-help-chevron" aria-hidden="true">›</span>',
      '</button>'
    ].join('');
  }

  function buildMarkup() {
    if (document.getElementById(CONFIG.ids.root)) {
      return document.getElementById(CONFIG.ids.root);
    }

    var root = document.createElement('div');
    root.id = CONFIG.ids.root;

    root.innerHTML = [
      '<div id="' + CONFIG.ids.backdrop + '" aria-hidden="true"></div>',

      '<div id="' + CONFIG.ids.panel + '" role="dialog" aria-modal="false" aria-hidden="true" aria-labelledby="nesp-help-title">',
        '<div class="nesp-help-header">',
          '<h2 id="nesp-help-title" class="nesp-help-title">' + escapeHtml(CONFIG.labels.heading) + '</h2>',
          '<button id="' + CONFIG.ids.close + '" type="button" aria-label="Close panel">×</button>',
        '</div>',

        '<div class="nesp-help-section">',
          '<div class="nesp-help-section-label">' + escapeHtml(CONFIG.labels.usefulLinks) + '</div>',
          '<div class="nesp-help-group">',
            '<div class="nesp-help-list">',
              buildRow({
                className: 'nesp-help-faq-row',
                href: CONFIG.links.faq,
                targetBlank: true,
                icon: 'faq',
                title: CONFIG.labels.faq
              }),
              buildRow({
                className: 'nesp-help-promo-row',
                href: CONFIG.links.promo,
                targetBlank: true,
                icon: 'promo',
                title: CONFIG.labels.promo
              }),
            '</div>',
          '</div>',
        '</div>',

        '<div class="nesp-help-section">',
          '<div class="nesp-help-section-label">' + escapeHtml(CONFIG.labels.contactOptions) + '</div>',
          '<div class="nesp-help-group">',
            '<div class="nesp-help-list">',
              buildChatButton(),
              buildRow({
                className: 'nesp-help-phone-row',
                href: 'tel:' + CONFIG.links.phone,
                targetBlank: false,
                icon: 'phone',
                title: CONFIG.labels.phone,
                meta: CONFIG.labels.phoneMeta
              }),
            '</div>',
          '</div>',
        '</div>',
      '</div>',

      '<button id="' + CONFIG.ids.launcher + '" type="button" aria-expanded="false" aria-controls="' + CONFIG.ids.panel + '">',
        '<span id="' + CONFIG.ids.pill + '">',
          '<span class="nesp-help-launcher-icon">' + iconSvg('launcher') + '</span>',
          '<span class="nesp-help-launcher-label">' + escapeHtml(CONFIG.labels.launcher) + '</span>',
        '</span>',
        '<span class="nesp-help-sr-only">' + escapeHtml(CONFIG.labels.launcher) + '</span>',
      '</button>'
    ].join('');

    document.body.appendChild(root);
    return root;
  }

  function initQuiq() {
    if (typeof window.Quiq !== 'function') {
      console.error('[Nespresso Launcher] Quiq is not available on window.');
      return null;
    }

    try {
      window.chat = window.Quiq({
        pageConfigurationId: CONFIG.pageConfigurationId,
        elementId: CONFIG.ids.chatButton
      });
      return window.chat;
    } catch (err) {
      console.error('[Nespresso Launcher] Failed to initialize Quiq:', err);
      return null;
    }
  }

  function bindUI(root) {
    var launcher = root.querySelector('#' + CONFIG.ids.launcher);
    var panel = root.querySelector('#' + CONFIG.ids.panel);
    var backdrop = root.querySelector('#' + CONFIG.ids.backdrop);
    var closeBtn = root.querySelector('#' + CONFIG.ids.close);
    var chatBtn = root.querySelector('#' + CONFIG.ids.chatButton);
    var focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    if (!launcher || !panel || !backdrop || !closeBtn || !chatBtn) {
      console.error('[Nespresso Launcher] Missing required UI elements.');
      return;
    }

    function openPanel() {
      launcher.classList.add('is-open');
      panel.classList.add('is-open');
      backdrop.classList.add('is-open');
      launcher.setAttribute('aria-expanded', 'true');
      panel.setAttribute('aria-hidden', 'false');

      var firstFocusable = panel.querySelector(focusableSelector);
      if (firstFocusable) {
        window.setTimeout(function () {
          firstFocusable.focus();
        }, 30);
      }
    }

    function closePanel(returnFocus) {
      launcher.classList.remove('is-open');
      panel.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      launcher.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');

      if (returnFocus) {
        launcher.focus();
      }
    }

    function togglePanel() {
      if (panel.classList.contains('is-open')) {
        closePanel(true);
      } else {
        openPanel();
      }
    }

    launcher.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      togglePanel();
    });

    closeBtn.addEventListener('click', function (event) {
      event.preventDefault();
      closePanel(true);
    });

    backdrop.addEventListener('click', function () {
      closePanel(true);
    });

    chatBtn.addEventListener('click', function () {
      closePanel(false);
    });

    document.addEventListener('click', function (event) {
      if (!root.contains(event.target) && panel.classList.contains('is-open')) {
        closePanel(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && panel.classList.contains('is-open')) {
        closePanel(true);
      }
    });
  }

  ready(function () {
    injectStyles();
    var root = buildMarkup();

    loadQuiq(CONFIG.quiqScriptSrc, function () {
      initQuiq();
      bindUI(root);
    });
  });
})();
