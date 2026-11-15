const S = (() => {
  const K = 'xinlian_save';
  const def = {
    progress: 0, unlocked: [], notes: [], errors: 0,
    events: { win: 0, fail: 0 }, choice: '', startTime: Date.now(),
    stage: 'index'
  };
  let d = null;

  function init() {
    try { d = JSON.parse(localStorage.getItem(K)) || { ...def }; }
    catch (e) { d = { ...def }; }
    if (!d.startTime) d.startTime = Date.now();
    if (!d.events) d.events = { win: 0, fail: 0 };
    if (!Array.isArray(d.unlocked)) d.unlocked = [];
    if (!Array.isArray(d.notes)) d.notes = [];
    return d;
  }

  function flush() { try { localStorage.setItem(K, JSON.stringify(d)); } catch (e) {} }
  function get(k) { return d[k]; }
  function set(k, v) { d[k] = v; flush(); }
  function add(k, n) { d[k] = (d[k] || 0) + n; flush(); }
  function progress(v) { d.progress = Math.max(0, Math.min(100, v)); flush(); }
  function unlock(m) { if (!d.unlocked.includes(m)) { d.unlocked.push(m); flush(); } }
  function note(id) { if (!d.notes.includes(id)) { d.notes.push(id); flush(); return true; } return false; }
  function reset() { d = { ...def, startTime: Date.now() }; flush(); }

  function guard(need) {
    if (d.unlocked.includes(need)) return true;
    document.body.innerHTML =
      '<div style="padding:60px 20px;text-align:center;color:#888;font-family:sans-serif;font-size:14px;line-height:2">' +
      '未解锁该模块<br>正在返回启动画面…' +
      '</div>';
    setTimeout(() => { location.href = 'index.html'; }, 800);
    return false;
  }

  init();
  return { init, get, set, add, progress, unlock, note, reset, guard, flush };
})();