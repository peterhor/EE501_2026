/* EE501 — staged release gate.
 *
 * Controls when each lecture's and lab's material becomes visible on the
 * public site, and when the "Reveal answer" buttons inside that material
 * start working. Everything below is edited by hand; there is no build step.
 *
 * TO CHANGE WHEN SOMETHING OPENS
 *   Edit "opensAt" / "answersAt" in UNITS below, commit, push.
 *   GitHub Pages picks the change up in well under a minute.
 *
 *   "opensAt"   when the pages of that unit become reachable
 *   "answersAt" when the answers inside those pages become revealable
 *
 *   Both accept:
 *     "2026-09-07T10:15+02:00"  an exact moment (Europe/Oslo is +02:00 in Sep)
 *     "open"                    available right now
 *     "manual"                  stays shut until this line is changed
 *
 *   HOLD_ALL = true shuts everything for students at once, whatever the dates
 *   say. Useful if a lecture is postponed.
 *
 * TO SEE IT AS A STUDENT SEES IT
 *   Use the "Student view" button in the instructor badge, add ?view=student
 *   to any URL, or open the site in a private window. ?view=full returns.
 *
 * TO UNLOCK EVERYTHING FOR YOURSELF
 *   Open any page with ?key=<your passphrase> once, e.g.
 *     https://peterhor.github.io/EE501_2026/?key=your-passphrase
 *   The browser remembers it afterwards. ?key=off forgets it again.
 *   The passphrase itself is NOT in this file — only its SHA-256 hash. To set
 *   a new one:  python3 -c "import hashlib;print(hashlib.sha256(b'NEW').hexdigest())"
 *   and paste the result into KEY_HASH.
 *
 * WHAT THIS IS AND IS NOT
 *   It is a curtain, not a lock. It hides unreleased material from anyone
 *   following the site, its links and its QR codes. It does not hide the
 *   files from someone who browses the public GitHub repository, because the
 *   pages are served as static files from that repository.
 */
(function () {
  'use strict';
  if (window.EE501Release) return;

  /* ------------------------------------------------------------------ *
   * 1. Release schedule                                                 *
   * ------------------------------------------------------------------ */

  var HOLD_ALL = false;

  var UNITS = {
    'lecture-1': { name: 'Lecture 1 — Components of the Climate System',
                   opensAt: '2026-09-07T10:15+02:00', answersAt: '2026-09-07T16:00+02:00' },
    'lecture-2': { name: 'Lecture 2 — The Earth’s Energy Budget',
                   opensAt: '2026-09-07T12:15+02:00', answersAt: '2026-09-08T12:00+02:00' },
    'lecture-3': { name: 'Lecture 3 — Climate at a Local Scale',
                   opensAt: '2026-09-08T12:15+02:00', answersAt: '2026-09-08T16:00+02:00' },
    'lecture-4': { name: 'Lecture 4 — Global Cycles: Water and Carbon',
                   opensAt: '2026-09-09T08:15+02:00', answersAt: '2026-09-09T12:00+02:00' },
    'lecture-5': { name: 'Lecture 5 — Modelling the Climate System',
                   opensAt: '2026-09-10T08:15+02:00', answersAt: '2026-09-14T12:00+02:00' },
    'lecture-6': { name: 'Lecture 6 — Response of the Climate System to Perturbations',
                   opensAt: '2026-09-15T08:15+02:00', answersAt: '2026-09-15T12:00+02:00' },
    'lecture-7': { name: 'Lecture 7 — Climate Change: the Past and the Present',
                   opensAt: '2026-09-16T08:15+02:00', answersAt: '2026-09-16T12:00+02:00' },
    'lecture-8': { name: 'Lecture 8 — Climate Change: the Future',
                   opensAt: '2026-09-17T08:15+02:00', answersAt: '2026-09-17T12:00+02:00' },
    'lab-1':     { name: 'PC Lab 1 — Daisyworld',
                   opensAt: '2026-09-09T12:15+02:00', answersAt: '2026-09-09T12:15+02:00' },
    'lab-2':     { name: 'PC Lab 2 — Energy Balance Model',
                   opensAt: '2026-09-14T12:15+02:00', answersAt: '2026-09-14T12:15+02:00' },
    'lab-3':     { name: 'PC Lab 3 — Abrupt Vegetation Change',
                   opensAt: '2026-09-16T12:15+02:00', answersAt: '2026-09-16T12:15+02:00' }
  };

  /* Pages that belong to a different unit than their folder implies.
   * Key = path ending, value = unit id. Example:
   *   'lecture-7-climate-change-past-and-present/provenance.html': 'lecture-1'
   */
  var PAGE_UNITS = {};

  var KEY_HASH = 'eb88111ea670c84ee5dea6027dcad3375929eaf2fa8a376a3b6aafd1b34a2e40';

  /* ------------------------------------------------------------------ *
   * 2. Plumbing                                                         *
   * ------------------------------------------------------------------ */

  var LS_KEY = 'ee501-instructor';
  var LS_VIEW = 'ee501-view';
  var TZ = 'Europe/Oslo';

  var script = document.currentScript;
  var root = script && script.src ? script.src.replace(/assets\/release\.js(\?.*)?$/, '') : '/';
  var path = location.pathname;

  function ls(fn, fallback) {
    try { return fn(); } catch (e) { return fallback; }
  }

  function isInstructor() {
    return ls(function () { return localStorage.getItem(LS_KEY) === KEY_HASH; }, false);
  }
  function studentView() {
    return ls(function () { return localStorage.getItem(LS_VIEW) === 'student'; }, false);
  }
  /* Unlocked = holds the key AND is not deliberately previewing student view. */
  function unlocked() {
    return isInstructor() && !studentView();
  }

  function unitFor(p) {
    var k;
    for (k in PAGE_UNITS) {
      if (Object.prototype.hasOwnProperty.call(PAGE_UNITS, k) && p.indexOf(k) !== -1) return PAGE_UNITS[k];
    }
    var lec = p.match(/(?:^|\/)lecture-([1-8])-[^\/]*\//);
    if (lec) return 'lecture-' + lec[1];
    var lab = p.match(/(?:^|\/)pc-lab-([1-3])-[^\/]*\//);
    if (lab) return 'lab-' + lab[1];
    return null;
  }

  function due(value) {
    if (value === 'open') return true;
    if (!value || value === 'manual') return false;
    var t = Date.parse(value);
    return isNaN(t) ? false : Date.now() >= t;
  }

  function isOpen(unit) {
    if (!unit) return true;                 /* ungated page */
    if (unlocked()) return true;
    if (HOLD_ALL) return false;
    var u = UNITS[unit];
    return u ? due(u.opensAt) : true;
  }

  function answersOpen(unit) {
    if (!unit) return true;
    if (unlocked()) return true;
    if (HOLD_ALL) return false;
    var u = UNITS[unit];
    if (!u) return true;
    return due(u.opensAt) && due(u.answersAt);
  }

  var fmt = null;
  function when(value) {
    if (value === 'open') return 'now';
    if (!value || value === 'manual') return 'later in the course';
    var t = Date.parse(value);
    if (isNaN(t)) return 'later in the course';
    if (!fmt) {
      try {
        fmt = new Intl.DateTimeFormat('en-GB', {
          timeZone: TZ, weekday: 'short', day: 'numeric', month: 'numeric',
          year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false
        });
      } catch (e) {
        fmt = null;
      }
    }
    var d = new Date(t);
    if (!fmt) return d.toISOString().slice(0, 16).replace('T', ' ');
    var got = {};
    fmt.formatToParts(d).forEach(function (p) { got[p.type] = p.value; });
    /* month names spelled to match the schedule table on the landing page */
    var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return got.weekday + ' ' + parseInt(got.day, 10) + ' ' + MON[parseInt(got.month, 10) - 1] +
           ', ' + got.hour + ':' + got.minute;
  }

  function opensText(unit) {
    var u = UNITS[unit];
    return u ? when(u.opensAt) : 'later in the course';
  }
  function unitName(unit) {
    var u = UNITS[unit];
    return u ? u.name : 'This material';
  }

  /* ------------------------------------------------------------------ *
   * 3. Instructor key handling (?key=...)                               *
   * ------------------------------------------------------------------ */

  function cleanUrl() {
    var u = new URL(location.href);
    u.searchParams.delete('key');
    return u.pathname + (u.searchParams.toString() ? '?' + u.searchParams.toString() : '') + u.hash;
  }

  function sha256Hex(text) {
    if (!window.crypto || !window.crypto.subtle) return Promise.resolve(null);
    return window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return ('0' + b.toString(16)).slice(-2);
      }).join('');
    });
  }

  var params = new URLSearchParams(location.search);

  /* ?view=student previews the site exactly as a student sees it; ?view=full
   * goes back to full access. Same switch as the buttons in the badge. */
  if (params.has('view')) {
    var v = params.get('view');
    ls(function () {
      if (v === 'student') localStorage.setItem(LS_VIEW, 'student');
      else localStorage.removeItem(LS_VIEW);
    });
    var u = new URL(location.href);
    u.searchParams['delete']('view');
    location.replace(u.pathname + (u.searchParams.toString() ? '?' + u.searchParams.toString() : '') + u.hash);
    return;
  }

  if (params.has('key')) {
    var supplied = params.get('key');
    if (supplied === 'off') {
      ls(function () { localStorage.removeItem(LS_KEY); localStorage.removeItem(LS_VIEW); });
      location.replace(cleanUrl());
      return;
    }
    document.documentElement.style.visibility = 'hidden';
    sha256Hex(supplied).then(function (hex) {
      if (hex && hex === KEY_HASH) {
        ls(function () { localStorage.setItem(LS_KEY, KEY_HASH); localStorage.removeItem(LS_VIEW); });
      }
      var back = params.get('r');
      location.replace(back ? root + back : cleanUrl());
    })['catch'](function () { location.replace(cleanUrl()); });
    return;
  }

  /* ------------------------------------------------------------------ *
   * 4. Gate this page                                                   *
   * ------------------------------------------------------------------ */

  var unit = unitFor(path);
  var LOCK_PAGE = /\/locked\.html$/.test(path);

  if (unit && !LOCK_PAGE && !isOpen(unit)) {
    var rel = path.indexOf(new URL(root).pathname) === 0
      ? path.slice(new URL(root).pathname.length)
      : path.replace(/^\//, '');
    location.replace(root + 'locked.html?u=' + encodeURIComponent(unit) + '&r=' + encodeURIComponent(rel));
    return;
  }

  /* ------------------------------------------------------------------ *
   * 5. Styles for locked cards, answer stubs and the instructor badge   *
   * ------------------------------------------------------------------ */

  function injectStyle() {
    if (document.getElementById('ee501-release-style')) return;
    var s = document.createElement('style');
    s.id = 'ee501-release-style';
    s.textContent = [
      '.ee501-locked{opacity:.55}',
      '.ee501-locked h2,.ee501-locked .num{color:inherit}',
      '.ee501-lock-note{display:flex;align-items:center;gap:.4em;font-size:.85rem;font-weight:600;',
      'color:#8a8a8a;font-style:normal}',
      /* beat the landing page accent colouring of .card-links spans */
      '.card .card-links .ee501-lock-note,.grid .card .card-links .ee501-lock-note{color:#8a8a8a}',
      '.ee501-preview-tag{display:inline-block;margin-left:.5em;padding:.05em .5em;border:1px dashed #b45309;',
      'border-radius:99px;font-size:.7rem;font-weight:700;letter-spacing:.03em;text-transform:uppercase;color:#b45309}',
      '.ee501-answer-lock{display:block;margin:9px 0 0;padding:5px 12px;border:1px dashed currentColor;',
      'border-radius:8px;font-size:12.5px;font-weight:600;opacity:.6}',
      '#ee501-badge{position:fixed;left:12px;bottom:12px;z-index:2147483000;display:flex;align-items:center;',
      'gap:8px;padding:7px 10px;border-radius:10px;border:1px solid #b45309;background:#fff8ef;color:#7c3d06;',
      'font:600 12px/1.2 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;',
      'box-shadow:0 2px 10px rgba(0,0,0,.14)}',
      '#ee501-badge.student{border-color:#3f6212;background:#f3f8ea;color:#3f6212}',
      '#ee501-badge button{font:inherit;cursor:pointer;padding:4px 8px;border-radius:7px;',
      'border:1px solid currentColor;background:transparent;color:inherit}',
      '#ee501-badge button:hover{background:rgba(0,0,0,.06)}',
      '#ee501-badge .dot{width:8px;height:8px;border-radius:50%;background:currentColor}',
      '@media print{#ee501-badge{display:none}}'
    ].join('');
    (document.head || document.documentElement).appendChild(s);
  }

  /* ------------------------------------------------------------------ *
   * 6. Answer gate                                                      *
   * ------------------------------------------------------------------ */

  function lockStub(unit) {
    var el = document.createElement('div');
    el.className = 'ee501-answer-lock';
    var u = UNITS[unit];
    el.textContent = 'Answer opens ' + (u ? when(u.answersAt) : 'after the lecture');
    return el;
  }

  function lockAnswers(unit) {
    /* (a) reveal buttons produced by assets/reveal-answers.js, and pages that
     *     already ship .rev / .ans markup by hand */
    Array.prototype.forEach.call(document.querySelectorAll('button.rev'), function (btn) {
      var id = btn.getAttribute('aria-controls');
      var ans = (id && document.getElementById(id)) || btn.nextElementSibling;
      if (ans && ans.classList.contains('ans')) { ans.hidden = true; ans.remove(); }
      btn.replaceWith(lockStub(unit));
    });
    /* (b) any .ans left without a button */
    Array.prototype.forEach.call(document.querySelectorAll('.ans'), function (ans) { ans.remove(); });
    /* (c) <details><summary>Answer</summary> on pages without the upgrade script */
    Array.prototype.forEach.call(document.querySelectorAll('details'), function (d) {
      var sum = d.firstElementChild;
      if (!sum || sum.tagName !== 'SUMMARY') return;
      if (sum.textContent.trim().toLowerCase() !== 'answer') return;
      d.replaceWith(lockStub(unit));
    });
  }

  /* ------------------------------------------------------------------ *
   * 7. Landing-page decoration                                          *
   * ------------------------------------------------------------------ */

  function lockNote(unit) {
    var p = document.createElement('div');
    p.className = 'ee501-lock-note';
    p.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2.4" aria-hidden="true"><rect x="4" y="10.5" width="16" height="11" rx="2"></rect>' +
      '<path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"></path></svg><span></span>';
    p.querySelector('span').textContent = 'Opens ' + opensText(unit);
    return p;
  }

  function previewTag() {
    var t = document.createElement('span');
    t.className = 'ee501-preview-tag';
    t.textContent = 'preview';
    return t;
  }

  function decorateIndex() {
    var open = unlocked();

    Array.prototype.forEach.call(document.querySelectorAll('[data-unit],[data-unit-quiet]'), function (el) {
      var quiet = el.hasAttribute('data-unit-quiet');
      var u = quiet ? el.getAttribute('data-unit-quiet') : el.getAttribute('data-unit');
      var released = UNITS[u] ? due(UNITS[u].opensAt) && !HOLD_ALL : true;
      if (released) return;

      if (open) {
        if (quiet) return;                       /* one preview tag per lecture, on the heading */
        var h = el.querySelector('h2, .lec') || el;
        if (!el.querySelector('.ee501-preview-tag')) h.appendChild(previewTag());
        return;
      }

      el.classList.add('ee501-locked');
      var links = el.querySelector('.card-links');
      if (quiet) {
        /* the lecture heading already carries the date; keep the cards plain */
        if (links) {
          var q = document.createElement('span');
          q.className = 'ee501-lock-note';
          q.textContent = 'Not open yet';
          links.replaceChildren(q);
        }
      } else if (links) {
        links.replaceChildren(lockNote(u));
      } else if (el.tagName === 'H3') {
        var note = lockNote(u);
        note.style.fontSize = '.8rem';
        note.style.fontWeight = '600';
        el.appendChild(note);
      }
      /* kill any remaining anchors inside a locked card */
      Array.prototype.forEach.call(el.querySelectorAll('a[href]'), function (a) {
        var span = document.createElement('span');
        span.textContent = a.textContent;
        a.replaceWith(span);
      });
      el.classList.remove('is-clickable');
    });

    /* standalone links, e.g. the appendix paragraph */
    Array.prototype.forEach.call(document.querySelectorAll('a[data-ee501-link]'), function (a) {
      var u = a.getAttribute('data-ee501-link');
      var released = UNITS[u] ? due(UNITS[u].opensAt) && !HOLD_ALL : true;
      if (released) return;
      if (open) { a.appendChild(previewTag()); return; }
      var span = document.createElement('span');
      span.className = 'ee501-lock-note';
      span.style.display = 'inline-flex';
      span.textContent = a.textContent + ' — opens ' + opensText(u);
      a.replaceWith(span);
    });
  }

  /* ------------------------------------------------------------------ *
   * 8. Instructor badge                                                 *
   * ------------------------------------------------------------------ */

  function badge() {
    if (!isInstructor()) return;
    if (document.getElementById('ee501-badge')) return;
    var student = studentView();
    var box = document.createElement('div');
    box.id = 'ee501-badge';
    if (student) box.className = 'student';

    var dot = document.createElement('span');
    dot.className = 'dot';
    var label = document.createElement('span');
    label.textContent = student ? 'Student view' : 'Instructor preview';

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.textContent = student ? 'Back to full access' : 'See student view';
    toggle.addEventListener('click', function () {
      ls(function () {
        if (student) localStorage.removeItem(LS_VIEW);
        else localStorage.setItem(LS_VIEW, 'student');
      });
      location.reload();
    });

    var exit = document.createElement('button');
    exit.type = 'button';
    exit.textContent = 'Exit';
    exit.title = 'Forget the instructor key on this browser';
    exit.addEventListener('click', function () {
      ls(function () { localStorage.removeItem(LS_KEY); localStorage.removeItem(LS_VIEW); });
      location.reload();
    });

    box.append(dot, label, toggle, exit);
    document.body.appendChild(box);
  }

  /* ------------------------------------------------------------------ *
   * 9. Run                                                              *
   * ------------------------------------------------------------------ */

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  window.EE501Release = {
    units: UNITS, unit: unit, root: root,
    isOpen: isOpen, answersOpen: answersOpen, opensText: opensText,
    unitName: unitName, when: when, isInstructor: isInstructor,
    studentView: studentView, unlocked: unlocked
  };

  ready(function () {
    injectStyle();
    if (document.querySelector('[data-unit], a[data-ee501-link]')) decorateIndex();
    if (unit && !answersOpen(unit)) lockAnswers(unit);
    badge();
  });
})();
