const App = (() => {
  let curTab = 'chat';
  let root = null;
  let cfg = {};
  let chatView = 'list';
  let meView = 'main';
  let discoverView = 'list';
  let plusOpen = false;
  let dotsOpen = false;

  function init(el, conf) {
    root = el;
    cfg = conf || {};
    curTab = cfg.defaultTab || 'chat';
    chatView = 'list';
    meView = 'main';
    discoverView = 'list';
    render();
  }

  function render() {
    root.innerHTML =
      '<div class="app-frame">' +
        '<div class="app-body" id="appBody"></div>' +
        '<div class="app-tabbar">' +
          tabBtn('chat', '聊天', '💬') +
          tabBtn('contacts', '通讯录', '👥') +
          tabBtn('discover', '发现', '🌐') +
          tabBtn('me', '我', '👤') +
        '</div>' +
      '</div>';
    document.querySelectorAll('.app-tab').forEach(b => {
      b.onclick = () => {
        curTab = b.dataset.tab;
        chatView = 'list'; meView = 'main'; discoverView = 'list';
        render();
      };
    });
    renderBody();
  }

  function tabBtn(id, name, icon) {
    return '<div class="app-tab' + (id === curTab ? ' on' : '') + '" data-tab="' + id + '">' +
      '<div class="ic">' + icon + '</div><div class="nm">' + name + '</div></div>';
  }

  function renderBody() {
    const body = document.getElementById('appBody');
    if (!body) return;
    const map = { chat: renderChatTab, contacts: renderContactsTab, discover: renderDiscoverTab, me: renderMeTab };
    map[curTab](body);
  }

  // ===== 顶部栏 =====
  function topBar(title, opts) {
    opts = opts || {};
    let right = '<div style="width:24px"></div>';
    if (opts.search || opts.plus) {
      let r = '';
      if (opts.search) r += '<div class="top-ic" id="topSearch">🔍</div>';
      if (opts.plus) r += '<div class="top-ic" id="topPlus">+</div>';
      right = '<div class="top-ics">' + r + '</div>';
    }
    if (opts.dots) right = '<div class="top-ic" id="topDots">···</div>';
    const left = opts.back
      ? '<div class="bk" id="topBk">‹</div>'
      : '<div class="bk" style="visibility:hidden">‹</div>';
    return '<div class="app-top">' + left + '<div class="tt">' + title + '</div>' + right + '</div>';
  }

  function bindTop(opts) {
    opts = opts || {};
    if (opts.onBack) {
      const b = document.getElementById('topBk');
      if (b) b.onclick = opts.onBack;
    }
    if (opts.onSearch) {
      const s = document.getElementById('topSearch');
      if (s) s.onclick = opts.onSearch;
    }
    if (opts.onPlus) {
      const p = document.getElementById('topPlus');
      if (p) p.onclick = opts.onPlus;
    }
    if (opts.onDots) {
      const d = document.getElementById('topDots');
      if (d) d.onclick = opts.onDots;
    }
  }

  // ===== + 菜单 =====
  function showPlus() {
    if (plusOpen) return;
    plusOpen = true;
    const mask = ui.el('div', 'plus-menu-mask');
    mask.innerHTML = '<div class="plus-menu">' +
      '<div class="pi" data-p="group">发起群聊</div>' +
      '<div class="pi" data-p="add">添加朋友</div>' +
      '<div class="pi" data-p="scan">扫一扫</div>' +
      '<div class="pi" data-p="pay">收付款</div>' +
      '<div class="pi" data-p="mini">小程序</div>' +
      '</div>';
    document.body.appendChild(mask);
    mask.onclick = (e) => {
      if (e.target === mask) { mask.remove(); plusOpen = false; }
    };
    mask.querySelectorAll('.pi').forEach(p => {
      p.onclick = () => {
        mask.remove(); plusOpen = false;
        if (p.dataset.p === 'scan' && cfg.onScan) cfg.onScan();
        else ui.toast('还想' + p.textContent + '？做梦！', 'error');
      };
    });
  }

  // ===== ··· 菜单 =====
  function showDots() {
    if (dotsOpen) return;
    dotsOpen = true;
    const mask = ui.el('div', 'dots-mask');
    mask.innerHTML =
      '<div class="dots-panel">' +
        '<div class="dots-head"><div class="dh-av">Ω</div><div class="dh-n">Ω</div></div>' +
        '<div class="dots-list">' +
          '<div class="di" data-d="search">查找聊天记录</div>' +
          '<div class="di" data-d="mute">消息免打扰</div>' +
          '<div class="di" data-d="top">置顶聊天</div>' +
          '<div class="di" data-d="remind">提醒</div>' +
          '<div class="di" data-d="clear">清空聊天记录</div>' +
          '<div class="di" data-d="complain">投诉</div>' +
          '<div class="di" data-d="delete">删除</div>' +
        '</div>' +
        '<div class="dots-cancel" id="dotsCancel">取消</div>' +
      '</div>';
    document.body.appendChild(mask);
    const close = () => { mask.remove(); dotsOpen = false; };
    mask.onclick = (e) => { if (e.target === mask) close(); };
    document.getElementById('dotsCancel').onclick = close;
    mask.querySelectorAll('.di').forEach(d => {
      d.onclick = () => {
        close();
        const map = {
          search: '查找聊天记录', mute: '消息免打扰', top: '置顶聊天',
          remind: '提醒', clear: '清空聊天记录', complain: '投诉', delete: '删除'
        };
        ui.toast('还想' + map[d.dataset.d] + '？做梦！', 'error');
      };
    });
  }

  // ===== 聊天 Tab =====
  function renderChatTab(body) {
    if (chatView === 'omega') return renderOmega(body);
    if (chatView === 'group') return renderGroup(body);
    if (chatView === 'file') return renderFile(body);
    body.innerHTML =
      topBar('信连', { search: true, plus: true }) +
      '<div style="flex:1;overflow-y:auto;background:#fff">' +
        '<div class="app-row" data-cv="omega"><div class="av">Ω</div><div class="bd"><div class="n">Ω</div><div class="s">%&amp;*#@ 加密通讯</div></div><div class="arrow">›</div></div>' +
        '<div class="app-row" data-cv="group"><div class="av" style="background:#4a90d9">群</div><div class="bd"><div class="n">修复者联盟</div><div class="s">' + (S.get('groupDone') ? '[已解禁]' : '[禁言] 请输入暗号解锁') + '</div></div><div class="arrow">›</div></div>' +
        '<div class="app-row" data-cv="file"><div class="av" style="background:#888">文</div><div class="bd"><div class="n">文件驿站</div><div class="s">传输文件</div></div><div class="arrow">›</div></div>' +
      '</div>';
    body.querySelectorAll('.app-row[data-cv]').forEach(r => {
      r.onclick = () => { chatView = r.dataset.cv; renderBody(); };
    });
    bindTop({
      onSearch: () => ui.toast('搜索模块待修复', 'error'),
      onPlus: showPlus
    });
  }

  function renderOmega(body) {
    if (cfg.renderOmega) return cfg.renderOmega(body);
    body.innerHTML = topBar('Ω', { back: true, dots: true }) + '<div class="app-empty">加密通讯</div>';
    bindTop({ onBack: () => { chatView = 'list'; renderBody(); }, onDots: showDots });
  }
  function renderGroup(body) {
    if (cfg.renderGroup) return cfg.renderGroup(body);
    body.innerHTML = topBar('修复者联盟', { back: true, dots: true }) + '<div class="app-empty">群聊</div>';
    bindTop({ onBack: () => { chatView = 'list'; renderBody(); }, onDots: showDots });
  }
  function renderFile(body) {
    if (cfg.renderFile) return cfg.renderFile(body);
    body.innerHTML = topBar('文件驿站', { back: true, dots: true }) + '<div class="app-empty">文件驿站</div>';
    bindTop({ onBack: () => { chatView = 'list'; renderBody(); }, onDots: showDots });
  }

  // ===== 通讯录 Tab =====
  function renderContactsTab(body) {
    if (cfg.renderContacts) return cfg.renderContacts(body);
    body.innerHTML = topBar('通讯录', { search: true, plus: true }) + '<div class="app-empty">通讯录</div>';
    bindTop({
      onSearch: () => ui.toast('搜索模块待修复', 'error'),
      onPlus: showPlus
    });
  }

  // ===== 发现 Tab =====
  const discoverItems = [
    { k: 'moments', n: '朋友圈', icon: '🌄' },
    { k: 'channels', n: '视频号', icon: '📺' },
    { k: 'live', n: '直播', icon: '📡' },
    { k: 'scan', n: '扫一扫', icon: '📷' },
    { k: 'listen', n: '听一听', icon: '🎵' },
    { k: 'watch', n: '看一看', icon: '👀' },
    { k: 'search', n: '搜一搜', icon: '🔍' },
    { k: 'nearby', n: '附近的人', icon: '📍' },
    { k: 'games', n: '游戏', icon: '🎮' },
    { k: 'mini', n: '小程序', icon: '📦' }
  ];
  function renderDiscoverTab(body) {
    if (discoverView === 'moments') return renderMomentsPage(body);
    let html = topBar('发现') + '<div style="flex:1;overflow-y:auto;background:#fff">';
    discoverItems.forEach(d => {
      html += '<div class="app-row" data-dk="' + d.k + '"><div class="av" style="background:#fff;color:#333;font-size:20px">' + d.icon + '</div><div class="bd"><div class="n">' + d.n + '</div></div><div class="arrow">›</div></div>';
    });
    html += '</div>';
    body.innerHTML = html;
    body.querySelectorAll('.app-row[data-dk]').forEach(r => {
      r.onclick = () => {
        const k = r.dataset.dk;
        if (k === 'moments') { discoverView = 'moments'; renderBody(); }
        else if (k === 'scan' && cfg.onScan) cfg.onScan();
        else ui.toast('还想' + discoverItems.find(x => x.k === k).n + '？做梦！', 'error');
      };
    });
  }

  function renderMomentsPage(body) {
    if (cfg.renderMomentsPage) return cfg.renderMomentsPage(body);
    body.innerHTML = topBar('朋友圈', { back: true }) + '<div class="app-empty">朋友圈</div>';
    bindTop({ onBack: () => { discoverView = 'list'; renderBody(); } });
  }

  // ===== 我 Tab =====
  function renderMeTab(body) {
    if (meView === 'wallet' && cfg.renderWallet) return cfg.renderWallet(body);
    if (meView === 'fav' && cfg.renderFav) return cfg.renderFav(body);
    if (meView === 'settings' && cfg.renderSettings) return cfg.renderSettings(body);
    if (cfg.renderMe) return cfg.renderMe(body);
    body.innerHTML = topBar('我') + '<div class="app-empty">我</div>';
  }

  function switchChatView(v) { chatView = v; renderBody(); }
  function switchMeView(v) { meView = v; renderBody(); }
  function switchDiscoverView(v) { discoverView = v; renderBody(); }
  function switchTab(t) { curTab = t; chatView = 'list'; meView = 'main'; discoverView = 'list'; render(); }
  function rerender() { renderBody(); }

  return {
    init, switchChatView, switchMeView, switchDiscoverView, switchTab, rerender,
    topBar, bindTop, showDots, showPlus,
    cur: () => curTab
  };
})();