const ui = (() => {
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function popup(title, body, btns = [{ t: '确定' }]) {
    const old = document.querySelector('.ui-mask');
    if (old) old.remove();
    const mask = el('div', 'ui-mask');
    const box = el('div', 'ui-popup');
    box.appendChild(el('div', 'ui-popup-title', title));
    const bd = el('div', 'ui-popup-body', body);
    box.appendChild(bd);
    const bar = el('div', 'ui-popup-btns');
    btns.forEach(b => {
      const btn = el('button', 'ui-btn' + (b.primary ? ' primary' : ''), b.t);
      btn.onclick = () => {
        if (btn.disabled) return;
        btn.disabled = true;
        mask.remove();
        b.fn && b.fn();
      };
      bar.appendChild(btn);
    });
    box.appendChild(bar);
    mask.appendChild(box);
    document.body.appendChild(mask);
    return { mask, box, body: bd };
  }

  let omegaTimer = null;
  function omega(text) {
    let o = document.querySelector('.ui-omega');
    if (!o) { o = el('div', 'ui-omega'); document.body.appendChild(o); }
    o.textContent = text;
    o.classList.add('show');
    clearTimeout(omegaTimer);
    omegaTimer = setTimeout(() => o.classList.remove('show'), 4000);
  }

  let toastTimer = null;
  function toast(text, type = '') {
    let t = document.querySelector('.ui-toast');
    if (!t) { t = el('div', 'ui-toast'); document.body.appendChild(t); }
    t.className = 'ui-toast show ' + type;
    t.textContent = text;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  function bar(container, val) {
    let b = container.querySelector('.ui-progress');
    if (!b) { b = el('div', 'ui-progress', '<i></i><span></span>'); container.appendChild(b); }
    b.querySelector('i').style.width = val + '%';
    b.querySelector('span').textContent = '修复进度 ' + val + '%';
  }

  let ac = null;
  function beep(freq = 440, dur = 0.08, type = 'square', vol = 0.06) {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.value = vol;
      o.connect(g); g.connect(ac.destination);
      o.start();
      o.frequency.exponentialRampToValueAtTime(freq * 0.5, ac.currentTime + dur);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
      o.stop(ac.currentTime + dur);
    } catch (e) {}
  }

  return { el, popup, omega, toast, bar, beep };
})();