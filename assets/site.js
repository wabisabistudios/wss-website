document.addEventListener('DOMContentLoaded', function () {

      /* ===== PRELOADER BOOT SEQUENCE ===== */
      (function () {
        var pre = document.getElementById('preloader');
        var linesEl = document.getElementById('preloader-lines');
        var fill = document.getElementById('preloader-fill');
        var pct = document.getElementById('preloader-pct');
        if (!pre) return;
        document.body.style.overflow = 'hidden';

        var phone = window.matchMedia('(max-width: 900px)').matches;
        var bootLines = phone ? [
          ['3', false],
          ['2', false],
          ['1', false],
          ['<span class="ok">TAKE</span>', false]
        ] : [
          ['wss ~ % initializing', false],
          ['mounting nailscan............ <span class="ok">OK</span>', true],
          ['mounting based-pos........... <span class="ok">OK</span>', true],
          ['mounting lotwalk............. <span class="ok">OK</span>', true],
          ['handshake maa ⇄ ywg.......... <span class="ok">OK</span>', true]
        ];
        if (phone) pre.classList.add('is-slate');

        var li = 0;
        function addLine() {
          if (li < bootLines.length) {
            if (phone) linesEl.innerHTML = '';
            var d = document.createElement('div');
            d.innerHTML = bootLines[li][0];
            linesEl.appendChild(d);
            li++;
            setTimeout(addLine, phone ? 280 : 170);
          }
        }
        addLine();

        var finished = false;
        function finish() {
          if (finished) return;
          finished = true;
          pct.textContent = '100';
          fill.style.transform = 'scaleX(1)';
          setTimeout(function () {
            pre.classList.add('done');
            document.body.style.overflow = '';
            document.body.classList.add('ready');
            document.dispatchEvent(new CustomEvent('wss:ready'));
            setTimeout(function () { if (pre.parentNode) pre.remove(); }, 1000);
          }, 250);
        }

        var start = Date.now();
        var timer = setInterval(function () {
          var t = Math.min((Date.now() - start) / 1400, 1);
          var eased = 1 - Math.pow(1 - t, 3);
          pct.textContent = Math.floor(eased * 100);
          fill.style.transform = 'scaleX(' + eased + ')';
          if (t >= 1) { clearInterval(timer); finish(); }
        }, 40);

        /* Hard fallback: never trap the user behind the preloader */
        setTimeout(function () { clearInterval(timer); finish(); }, 4000);
      })();

      if (!document.getElementById('preloader') && !document.body.classList.contains('ready')) {
        document.body.classList.add('ready');
        document.dispatchEvent(new CustomEvent('wss:ready'));
      }

      /* ===== BOOKING — one URL in assets/book.js ===== */
      (function () {
        var url = (window.WSS && window.WSS.CALENDAR || '').trim();
        var live = /^https?:\/\//i.test(url);
        var nested = /\/(salon|dealership|agency|white-label|catalog|lotwalk|nailscan|pos|signal-engine)(\/|$)/.test(location.pathname);
        var fallback = document.body.classList.contains('home') ? '#contact' : (nested ? '../index.html#contact' : 'index.html#contact');
        document.querySelectorAll('.nav-cta, a.cta').forEach(function (a) {
          if (a.classList.contains('cta-ghost')) return;
          if (!/book/i.test(a.textContent || '')) return;
          if (live) {
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
          } else {
            a.href = fallback;
            a.removeAttribute('target');
          }
        });
        var frame = document.getElementById('book-frame');
        var wait = document.getElementById('book-wait');
        if (frame && live) {
          frame.src = url;
          frame.removeAttribute('hidden');
          if (wait) wait.hidden = true;
        }
      })();

      /* ===== CUSTOM CURSOR ===== */
      (function () {
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        var dot = document.getElementById('cursor-dot');
        var ring = document.getElementById('cursor-ring');
        if (!dot || !ring) return;
        var mx = -100, my = -100, rx = -100, ry = -100;

        document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });

        (function loop() {
          rx += (mx - rx) * 0.16;
          ry += (my - ry) * 0.16;
          dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
          ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
          requestAnimationFrame(loop);
        })();

        document.querySelectorAll('a, button').forEach(function (el) {
          el.addEventListener('mouseenter', function () { document.body.classList.add('cursor-hover'); });
          el.addEventListener('mouseleave', function () { document.body.classList.remove('cursor-hover'); });
        });
      })();

      /* ===== CTA ===== */
      (function () {
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

        function attachStars(btn) {
          if (btn.querySelector('.cta-stars')) return null;
          var field = document.createElement('span');
          field.className = 'cta-stars';
          field.setAttribute('aria-hidden', 'true');
          btn.appendChild(field);

          function spark(x, y) {
            var s = document.createElement('i');
            var roll = Math.random();
            s.className = 'cta-star' + (roll > 0.78 ? ' blue' : roll > 0.42 ? ' gold' : '') + (roll > 0.62 ? ' cross' : '');
            var ang = Math.random() * Math.PI * 2;
            var dist = 26 + Math.random() * 48;
            s.style.left = x + 'px';
            s.style.top = y + 'px';
            s.style.setProperty('--dx', (Math.cos(ang) * dist).toFixed(1) + 'px');
            s.style.setProperty('--dy', (Math.sin(ang) * dist).toFixed(1) + 'px');
            field.appendChild(s);
            setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 740);
          }

          function burst() {
            var i;
            for (i = 0; i < 9; i++) {
              spark((Math.random() - 0.5) * 80, (Math.random() - 0.5) * 18);
            }
          }

          return { spark: spark, burst: burst };
        }

        function decorate(btn) {
          if (btn.getAttribute('data-cta') === '1') return;
          btn.setAttribute('data-cta', '1');

          var raw = (btn.textContent || '').replace(/\s+/g, ' ').trim().replace(/[→↓←↑]/g, '').trim();
          btn.textContent = '';

          var ink = document.createElement('span');
          ink.className = 'cta-ink';
          ink.setAttribute('aria-hidden', 'true');

          var sheen = document.createElement('span');
          sheen.className = 'cta-sheen';
          sheen.setAttribute('aria-hidden', 'true');

          var flash = document.createElement('span');
          flash.className = 'cta-flash';
          flash.setAttribute('aria-hidden', 'true');

          var clip = document.createElement('span');
          clip.className = 'cta-clip';
          clip.setAttribute('aria-hidden', 'true');
          clip.appendChild(ink);
          clip.appendChild(sheen);
          clip.appendChild(flash);

          var text = document.createElement('span');
          text.className = 'cta-text';
          raw.split('').forEach(function (ch) {
            var s = document.createElement('span');
            s.className = ch === ' ' ? 'cta-ch space' : 'cta-ch';
            s.textContent = ch === ' ' ? '\u00A0' : ch;
            text.appendChild(s);
          });

          var go = document.createElement('span');
          go.className = 'cta-go';
          go.setAttribute('aria-hidden', 'true');
          go.innerHTML = '<span class="cta-go-head">→</span>';

          btn.appendChild(clip);
          btn.appendChild(text);
          btn.appendChild(go);
          var sky = attachStars(btn);

          if (reduce || typeof gsap === 'undefined') return;

          var chars = text.querySelectorAll('.cta-ch');
          var head = go.querySelector('.cta-go-head');
          var xTo = gsap.quickTo(btn, 'x', { duration: 0.45, ease: 'power3' });
          var yTo = gsap.quickTo(btn, 'y', { duration: 0.45, ease: 'power3' });

          var hover = gsap.timeline({ paused: true });
          hover
            .to(ink, { scaleX: 1, duration: 0.42, ease: 'power3.inOut' }, 0)
            .to(head, { x: 6, duration: 0.38, ease: 'power3.out' }, 0.08)
            .fromTo(chars, { y: 0 }, { y: -2, duration: 0.2, stagger: 0.008, ease: 'power2.out' }, 0)
            .to(chars, { y: 0, duration: 0.32, stagger: 0.008, ease: 'power3.out' }, 0.16);
          btn._ctaHover = hover;

          if (fine) {
            btn.addEventListener('mouseenter', function () {
              btn.classList.add('is-hot');
              hover.timeScale(1).play();
              if (sky) sky.burst();
            });
            btn.addEventListener('mousemove', function (e) {
              var r = btn.getBoundingClientRect();
              xTo((e.clientX - r.left - r.width / 2) * 0.18);
              yTo((e.clientY - r.top - r.height / 2) * 0.32);
              if (sky && Math.random() < 0.2) {
                sky.spark(e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2);
              }
            });
            btn.addEventListener('mouseleave', function () {
              btn.classList.remove('is-hot');
              hover.timeScale(1.25).reverse();
              xTo(0);
              yTo(0);
            });
          }

          btn.addEventListener('mousedown', function () {
            btn.classList.add('is-down');
            gsap.fromTo(flash, { opacity: 0.45 }, { opacity: 0, duration: 0.28, ease: 'power2.out' });
            gsap.fromTo(btn, { scale: 0.97 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' });
          });
          btn.addEventListener('mouseup', function () { btn.classList.remove('is-down'); });
          btn.addEventListener('mouseleave', function () { btn.classList.remove('is-down'); });
        }

        document.querySelectorAll('.cta').forEach(decorate);

        if (fine && typeof gsap !== 'undefined') {
          document.querySelectorAll('.nav-cta').forEach(function (btn) {
            var sky = reduce ? null : attachStars(btn);
            var xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3' });
            var yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3' });
            btn.addEventListener('mouseenter', function () {
              if (sky) sky.burst();
            });
            btn.addEventListener('mousemove', function (e) {
              var r = btn.getBoundingClientRect();
              xTo((e.clientX - r.left - r.width / 2) * 0.2);
              yTo((e.clientY - r.top - r.height / 2) * 0.32);
              if (sky && Math.random() < 0.2) {
                sky.spark(e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2);
              }
            });
            btn.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
          });
        }
      })();

      /* ===== NAV SLATE ===== */
      (function () {
        var nav = document.querySelector('.nav');
        if (!nav || nav.getAttribute('data-slate') === '1') return;
        nav.setAttribute('data-slate', '1');

        var vertical = document.body.classList.contains('vertical');
        if (!vertical) {
          var rail = document.createElement('div');
          rail.className = 'nav-rail';
          rail.setAttribute('aria-hidden', 'true');
          rail.innerHTML = '<span class="nav-rail-ch">CH 00 · PROGRAM</span><i></i><span>WSS / MAA ⇄ YWG</span><i></i><span class="nav-tc" id="nav-tc">00:00:00:00</span>';
          nav.insertBefore(rail, nav.firstChild);

          var st = nav.querySelector('.nav-status span:last-child');
          if (st && st.textContent.indexOf('REC') === -1) {
            st.innerHTML = '<b>REC</b> ALL SYSTEMS';
          }
        }

        var ixs = vertical ? ['00', '01', '02', '03', '04'] : ['00', '01', '02', '03', '04', 'WL'];
        nav.querySelectorAll('.nav-links a').forEach(function (a, i) {
          if (!a.getAttribute('data-ix')) a.setAttribute('data-ix', ixs[i] || String(i));
          if (!a.querySelector('.nav-wipe')) {
            var wipe = document.createElement('span');
            wipe.className = 'nav-wipe';
            wipe.setAttribute('aria-hidden', 'true');
            a.insertBefore(wipe, a.firstChild);
          }
        });
        var current = nav.querySelector('.nav-links a.active');
        if (current) {
          var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (reduce) {
            current.classList.add('is-lit');
          } else {
            requestAnimationFrame(function () {
              setTimeout(function () { current.classList.add('is-lit'); }, 120);
            });
          }
        }
      })();

      /* ===== MOBILE CALL SHEET ===== */
      (function () {
        var nav = document.querySelector('.nav');
        var links = nav && nav.querySelector('.nav-links');
        if (!nav || !links || document.getElementById('call-sheet')) return;

        var n = links.querySelectorAll('a').length;
        var pad = (n < 10 ? '0' : '') + n;

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'nav-slate-btn';
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-controls', 'call-sheet');
        btn.innerHTML = '<i class="nav-slate-dots" aria-hidden="true"><b></b><b></b></i><span class="nav-slate-word">Index</span>';

        var right = nav.querySelector('.nav-right');
        if (right) right.insertBefore(btn, right.firstChild);
        else nav.appendChild(btn);

        var sheet = document.createElement('div');
        sheet.id = 'call-sheet';
        sheet.className = 'call-sheet';
        sheet.hidden = true;
        sheet.setAttribute('role', 'dialog');
        sheet.setAttribute('aria-label', 'Call sheet');
        sheet.innerHTML =
          '<div class="call-sheet-letterbox top" aria-hidden="true"></div>' +
          '<div class="call-sheet-inner">' +
            '<div class="call-sheet-head">Call sheet · ' + pad + ' scenes</div>' +
            '<div class="call-sheet-rows"></div>' +
            '<div class="call-sheet-foot"><span>Wabi Sabi Studios</span><span>MAA ⇄ YWG</span></div>' +
          '</div>' +
          '<div class="call-sheet-letterbox bot" aria-hidden="true"></div>';

        var rows = sheet.querySelector('.call-sheet-rows');
        var word = btn.querySelector('.nav-slate-word');

        links.querySelectorAll('a').forEach(function (a, i) {
          var row = document.createElement('a');
          row.href = a.getAttribute('href');
          if (a.classList.contains('active')) row.classList.add('is-now');
          row.classList.add('call-sheet-row');
          row.innerHTML = '<em>' + (a.getAttribute('data-ix') || String(i).padStart(2, '0')) + '</em><b>' + a.textContent.trim() + '</b>';
          rows.appendChild(row);
        });

        document.body.appendChild(sheet);

        function openSheet() {
          sheet.hidden = false;
          document.body.classList.add('call-sheet-open');
          btn.setAttribute('aria-expanded', 'true');
          word.textContent = 'Cut';
          requestAnimationFrame(function () { sheet.classList.add('is-on'); });
        }
        function closeSheet() {
          sheet.classList.remove('is-on');
          document.body.classList.remove('call-sheet-open');
          btn.setAttribute('aria-expanded', 'false');
          word.textContent = 'Index';
          setTimeout(function () {
            if (!sheet.classList.contains('is-on')) sheet.hidden = true;
          }, 360);
        }
        function toggleSheet() {
          if (sheet.classList.contains('is-on')) closeSheet();
          else openSheet();
        }

        btn.addEventListener('click', toggleSheet);
        rows.addEventListener('click', function (e) {
          var a = e.target.closest('a');
          if (a && a.getAttribute('href') && a.getAttribute('href').charAt(0) === '#') closeSheet();
        });
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' && sheet.classList.contains('is-on')) closeSheet();
        });
        if (window.matchMedia) {
          var wide = window.matchMedia('(min-width: 901px)');
          var onWide = function (mq) { if (mq.matches) closeSheet(); };
          if (wide.addEventListener) wide.addEventListener('change', onWide);
          else if (wide.addListener) wide.addListener(onWide);
        }
      })();

      /* ===== DUAL CLOCKS (Chennai + Winnipeg) ===== */
      function updateClocks() {
        var fmt = function (tz) {
          return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(new Date());
        };
        var maa = fmt('Asia/Kolkata');
        var ywg = fmt('America/Winnipeg');
        var ids = { 'clock-chennai': maa, 'clock-winnipeg': ywg, 'footer-clock-maa': maa, 'footer-clock-ywg': ywg };
        Object.keys(ids).forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.textContent = ids[id];
        });
      }
      updateClocks();
      setInterval(updateClocks, 30000);

      /* ===== HERO DATE STAMP ===== */
      var dateEl = document.getElementById('hero-date');
      if (dateEl) {
        dateEl.textContent = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()).toUpperCase();
      }

      /* ===== TERMINAL BOOT ===== */
      var terminalText = document.getElementById('terminal-text');
      var lines = [
        'boot --studio wabi-sabi',
        'loading nailscan... ok',
        'loading based-pos... ok',
        'loading lotwalk... ok',
        'all systems operational_'
      ];
      var lineIndex = 0, charIndex = 0, currentLine = '';

      function typeLine() {
        if (!terminalText) return;
        if (lineIndex >= lines.length) {
          setTimeout(function () { terminalText.textContent = ''; lineIndex = 0; typeLine(); }, 4000);
          return;
        }
        if (charIndex < lines[lineIndex].length) {
          currentLine += lines[lineIndex][charIndex];
          terminalText.textContent = currentLine;
          charIndex++;
          setTimeout(typeLine, 22);
        } else {
          setTimeout(function () { lineIndex++; charIndex = 0; currentLine = ''; typeLine(); }, 700);
        }
      }
      if (document.body.classList.contains('home')) {
        document.addEventListener('wss:ready', typeLine, { once: true });
      } else {
        typeLine();
      }

      /* ===== TIMECODE (hero + nav slate) ===== */
      (function () {
        var els = [document.getElementById('hero-tc'), document.getElementById('nav-tc')].filter(Boolean);
        if (!els.length) return;
        var tcStart = Date.now();
        var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
        setInterval(function () {
          var d = Date.now() - tcStart;
          var frames = Math.floor((d % 1000) / 1000 * 24);
          var stamp = pad2(Math.floor(d / 3600000)) + ':' + pad2(Math.floor(d / 60000) % 60) + ':' + pad2(Math.floor(d / 1000) % 60) + ':' + pad2(frames);
          els.forEach(function (el) { el.textContent = stamp; });
        }, 1000 / 24);
      })();

      /* ===== HEADLINE WORD REVEAL / TITLE SEQUENCE ===== */
      var headline = document.getElementById('headline');
      if (headline) {
        var html = headline.innerHTML;
        var parts = html.split(/(<em>.*?<\/em>|<br\b[^>]*>)/gi);
        var out = '';
        parts.forEach(function (part) {
          if (!part) return;
          if (/^<br/i.test(part)) {
            out += part;
            return;
          }
          if (part.startsWith('<em>')) {
            var inner = part.replace(/<\/?em>/g, '');
            inner.split(' ').forEach(function (w) {
              if (w.trim()) out += '<span class="word"><span><em>' + w + '</em></span></span> ';
            });
          } else {
            part.split(' ').forEach(function (w) {
              if (w.trim()) out += '<span class="word"><span>' + w + '</span></span> ';
            });
          }
        });
        headline.innerHTML = out;
      }

      function snapTitleSequence() {
        if (headline) {
          headline.querySelectorAll('.word > span').forEach(function (s) { s.style.transform = 'none'; });
        }
        ['subcopy', 'cta-row', 'hero-slate', 'hero-meta', 'terminal', 'hero-bottom', 'hero-take'].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) { el.style.opacity = '1'; el.style.transform = 'none'; }
        });
        var rule = document.getElementById('hero-rule');
        if (rule) rule.style.width = '88px';
        var ghost = document.querySelector('.hero-ghost-word');
        if (ghost) { ghost.style.opacity = '1'; ghost.style.transform = 'none'; }
      }

      function playTitleSequence() {
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var isHome = document.body.classList.contains('home');
        var phone = window.matchMedia('(max-width: 900px)').matches;
        if (typeof gsap === 'undefined' || reduce || document.hidden || phone) {
          snapTitleSequence();
          return;
        }
        if (isHome) {
          var tl = gsap.timeline({ delay: 0.12 });
          tl.to('#hero-slate', { opacity: 1, duration: 0.45, ease: 'power2.out' }, 0)
            .to('#hero-meta', { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.1)
            .to('#terminal', { opacity: 1, duration: 0.4 }, 0.2)
            .to('#headline .word > span', { y: 0, duration: 0.95, stagger: 0.065, ease: 'power3.out' }, 0.28)
            .to('#hero-rule', { width: 88, duration: 0.7, ease: 'power2.inOut' }, 0.82)
            .to('#subcopy', { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' }, 1.02)
            .to('#cta-row', { opacity: 1, duration: 0.7 }, 1.22)
            .to('#hero-bottom', { opacity: 1, duration: 0.6 }, 1.38)
            .to('#hero-take', { opacity: 1, duration: 0.5 }, 1.1)
            .fromTo('.hero-ghost-word', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: 'power2.out' }, 0.35);
        } else if (headline) {
          gsap.to('#headline .word > span', { y: 0, duration: 0.9, stagger: 0.07, ease: 'power3.out', delay: 0.2 });
          gsap.to('#subcopy', { opacity: 1, y: 0, duration: 0.8, delay: 1.0, ease: 'power2.out' });
          gsap.to('#cta-row', { opacity: 1, duration: 0.8, delay: 1.2, ease: 'power2.out' });
        }
      }
      if (document.body.classList.contains('home')) {
        document.addEventListener('wss:ready', playTitleSequence, { once: true });
      } else {
        playTitleSequence();
      }

      /* ===== LEAD COUNT-UP ===== */
      var leadCount = document.getElementById('lead-count');
      if (leadCount) {
        var target = 1757, duration = 1800, startTime = null;
        function countUp(ts) {
          if (!startTime) startTime = ts;
          var p = Math.min((ts - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          leadCount.textContent = Math.floor(eased * target).toLocaleString();
          if (p < 1) requestAnimationFrame(countUp);
        }
        var kickLead = function () { setTimeout(function () { requestAnimationFrame(countUp); }, 1600); };
        if (document.body.classList.contains('home')) {
          document.addEventListener('wss:ready', kickLead, { once: true });
        } else {
          kickLead();
        }
      }

      /* ===== HERO GLOW FOLLOWS CURSOR ===== */
      (function () {
        var glow = document.getElementById('hero-glow');
        if (!glow || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        document.addEventListener('mousemove', function (e) {
          glow.style.setProperty('--gx', e.clientX + 'px');
          glow.style.setProperty('--gy', e.clientY + 'px');
        }, { passive: true });
      })();

      /* ===== DEEP-LINK AFTER PRELOADER ===== */
      document.addEventListener('wss:ready', function () {
        if (!location.hash) return;
        var t = document.querySelector(location.hash);
        if (!t) return;
        requestAnimationFrame(function () {
          t.scrollIntoView({ behavior: 'auto', block: 'start' });
        });
      }, { once: true });

      /* ===== TICKER + MARQUEE DUPLICATION (seamless loop) ===== */
      var tickerTrack = document.getElementById('ticker-track');
      if (tickerTrack) tickerTrack.innerHTML += tickerTrack.innerHTML;
      var marqueeInner = document.getElementById('marquee-inner');
      if (marqueeInner) marqueeInner.innerHTML += marqueeInner.innerHTML;

      /* ===== CONTROL ROOM — PICK A FLOOR, SEE PROFIT ===== */
      (function () {
        var root = document.getElementById('live-metrics');
        var board = document.getElementById('metrics-board');
        if (!root || !board) return;

        function usd(n) {
          var sign = n < 0 ? '-' : '';
          return sign + '$' + Math.abs(Math.round(n)).toLocaleString('en-US');
        }
        function usdCompact(n) {
          if (Math.abs(n) >= 1000000) return (n < 0 ? '-' : '') + '$' + (Math.abs(n) / 1000000).toFixed(2) + 'M';
          if (Math.abs(n) >= 10000) return usd(n);
          return usd(n);
        }

        var assessBase = 71, revBase = 52410, pipeBase = 2140000;
        var tickTimer = null;

        function reelCells() {
          return [
            { label: '<span class="status-dot"></span> SALONS · LIVE', value: '19', sub: 'OPERATORS ON THE FLOOR', live: true, jump: 'salon' },
            { label: 'REVENUE · TODAY', value: usd(revBase), sub: 'CLOSED ACROSS THE REEL', id: 'revenue-today' },
            { label: 'NAILSCAN · TODAY', value: String(assessBase), sub: 'SCANS ACROSS 19 SALONS', id: 'assessments-today' },
            { label: 'AVG TICKET', value: '$184', sub: 'USD · SALON POS' },
            { label: 'DEALER GROUPS · LIVE', value: '12', sub: 'LOT WALK IN PRODUCTION', jump: 'dealership' },
            { label: 'OPEN PIPELINE', value: usdCompact(pipeBase), sub: 'USD · 12 ROOFTOPS', id: 'pipeline-usd' },
            { label: 'AGENCIES · LIVE', value: '8', sub: 'WHITE-LABEL + GHL OS', jump: 'agency' },
            { label: 'AD SPEND · FLAGSHIP', value: '$0', sub: '1,757 LEADS · NAILSCAN', live: true }
          ];
        }

        function salonCells(n) {
          var scans = 80 * n;
          var booked = Math.round(scans * 0.3);
          var ticket = 184;
          var recovered = booked * ticket;
          var leak = Math.round(scans * 0.55 * ticket);
          var cost = 97 * n + Math.round((399 * n) / 12);
          var profit = recovered - cost;
          var year = profit * 12;
          var perDay = profit / 30;
          var payback = perDay > 0 ? Math.max(1, Math.ceil((399 * n) / perDay)) : '—';
          return [
            { label: 'WALK-INS · LEAK', value: usd(leak), sub: 'LEFT WITH NO NAME' },
            { label: 'SCANS → BOOKS', value: String(booked), sub: scans + ' SCANS · 30% BOOK' },
            { label: 'AVG TICKET', value: '$184', sub: 'USD · SALON POS' },
            { label: 'STACK / MO', value: usd(cost), sub: '$97 + SETUP AMORTISED' },
            { label: 'RECOVERED / MO', value: usd(recovered), sub: 'INCREMENTAL BOOKINGS' },
            { label: 'PROFIT / MO', value: usd(profit), sub: 'AFTER THE STACK', profit: true },
            { label: 'PAYBACK', value: payback + ' DAYS', sub: 'SETUP FROM MONTH ONE' },
            { label: 'YEAR ONE', value: usdCompact(year), sub: 'MODEL · USD' }
          ];
        }

        function dealershipCells(n) {
          var leads = 160 * n;
          var recoveredUnits = Math.round(leads * 0.22 * 0.09);
          var gross = 2800;
          var recovered = recoveredUnits * gross;
          var cost = 2500 * n;
          var profit = recovered - cost;
          var pipeline = Math.round(leads * 0.45 * gross);
          var year = profit * 12;
          var payback = profit > 0 ? Math.max(1, Math.ceil((cost * 0.5) / (profit / 30))) : '—';
          return [
            { label: 'LEADS / MO', value: String(leads), sub: n + ' ROOFTOP' + (n > 1 ? 'S' : '') },
            { label: 'DYING IN THE PILE', value: Math.round(leads * 0.22) + '', sub: '22% UNASSIGNED' },
            { label: 'UNITS RECOVERED', value: String(recoveredUnits), sub: '9% CLOSE ON THE LEAK' },
            { label: 'FRONT-END GROSS', value: '$2,800', sub: 'USD · PER UNIT' },
            { label: 'RECOVERED / MO', value: usd(recovered), sub: 'GROSS ON SAVED DEALS' },
            { label: 'PROFIT / MO', value: usd(profit), sub: 'AFTER THE OS', profit: true },
            { label: 'OPEN PIPELINE', value: usdCompact(pipeline), sub: 'MODEL · ACTIVE OPPS' },
            { label: 'YEAR ONE', value: usdCompact(year), sub: 'PAYBACK · ' + payback + ' DAYS' }
          ];
        }

        function agencyCells(n) {
          var hours = 28 * n;
          var hourRate = 150;
          var hoursUsd = hours * hourRate;
          var tripwire = 12 * 48 * n;
          var os = 1800 * n;
          var profit = hoursUsd + tripwire;
          var year = profit * 12;
          return [
            { label: 'HOURS YOU STOP BURNING', value: String(hours), sub: 'PER MONTH · DELIVERY' },
            { label: 'THOSE HOURS · USD', value: usd(hoursUsd), sub: '$150 / HR MODEL' },
            { label: 'TRIPWIRE MRR', value: usd(tripwire), sub: '12 × $48 · THEY KEEP IT' },
            { label: 'OS YOU CAN SELL', value: usd(os), sub: 'ONE GHL OS / SEAT' },
            { label: 'RECOVERED / MO', value: usd(hoursUsd + tripwire), sub: 'HOURS + ENTRY OFFERS' },
            { label: 'PROFIT / MO', value: usd(profit), sub: 'WHAT THE AGENCY KEEPS', profit: true },
            { label: 'YEAR ONE', value: usdCompact(year), sub: 'MODEL · USD' },
            { label: 'YOU STOP SELLING', value: 'HOURS ONLY', sub: 'THE CLIENT OWNS THE OS' }
          ];
        }

        var DIAL = {
          salon: { min: 1, max: 19, unit: 'salon', plural: 'salons' },
          dealership: { min: 1, max: 12, unit: 'rooftop', plural: 'rooftops' },
          agency: { min: 1, max: 8, unit: 'agency', plural: 'agencies' }
        };

        var scene = 'reel';
        var count = 1;
        var slate = document.getElementById('metrics-slate-copy');
        var dial = document.getElementById('metrics-dial');
        var dialN = document.getElementById('dial-n');
        var dialUnit = document.getElementById('dial-unit');
        var choose = root.querySelector('.metrics-choose');

        function cellsFor() {
          if (scene === 'salon') return salonCells(count);
          if (scene === 'dealership') return dealershipCells(count);
          if (scene === 'agency') return agencyCells(count);
          return reelCells();
        }

        function slateFor() {
          if (scene === 'salon') return 'MODEL · ' + count + ' SALON' + (count > 1 ? 'S' : '') + ' · SATURDAY MATH';
          if (scene === 'dealership') return 'MODEL · ' + count + ' ROOFTOP' + (count > 1 ? 'S' : '') + ' · SPEED-TO-LEAD';
          if (scene === 'agency') return 'MODEL · ' + count + ' AGENC' + (count > 1 ? 'IES' : 'Y') + ' · HOURS → PRODUCT';
          return 'CONTROL ROOM — 19 SALONS · 12 DEALER GROUPS · 8 AGENCIES';
        }

        function paint() {
          var cells = cellsFor();
          var slots = board.querySelectorAll('[data-slot]');
          cells.forEach(function (c, i) {
            var el = slots[i];
            if (!el) return;
            el.classList.toggle('is-profit', !!c.profit);
            el.setAttribute('data-jump', c.jump || '');
            if (c.jump) el.style.cursor = 'pointer';
            else el.style.cursor = '';
            var lab = el.querySelector('.metric-label');
            var val = el.querySelector('.metric-value');
            var sub = el.querySelector('.metric-sub');
            if (lab) lab.innerHTML = c.label;
            if (val) {
              val.textContent = c.value;
              val.classList.toggle('live', !!(c.live || c.profit));
              if (c.id) val.id = c.id;
              else val.removeAttribute('id');
            }
            if (sub) sub.textContent = c.sub;
          });
          if (slate) slate.textContent = slateFor();
          var spec = DIAL[scene];
          if (dial) {
            if (!spec) {
              dial.hidden = true;
            } else {
              dial.hidden = false;
              if (dialN) dialN.textContent = String(count);
              if (dialUnit) dialUnit.textContent = count === 1 ? spec.unit : spec.plural;
            }
          }
          root.setAttribute('data-scene', scene);
          if (choose) {
            choose.querySelectorAll('[data-scene]').forEach(function (b) {
              var on = b.getAttribute('data-scene') === scene;
              b.classList.toggle('on', on);
              b.setAttribute('aria-selected', on ? 'true' : 'false');
            });
          }
        }

        function setScene(next, n) {
          scene = next;
          if (DIAL[scene]) {
            count = Math.min(DIAL[scene].max, Math.max(DIAL[scene].min, n || count || 1));
          }
          paint();
        }

        if (choose) {
          choose.addEventListener('click', function (e) {
            var b = e.target.closest('[data-scene]');
            if (!b) return;
            count = 1;
            setScene(b.getAttribute('data-scene'), 1);
          });
        }
        if (dial) {
          dial.addEventListener('click', function (e) {
            var b = e.target.closest('[data-dial]');
            if (!b || !DIAL[scene]) return;
            var spec = DIAL[scene];
            count = Math.min(spec.max, Math.max(spec.min, count + parseInt(b.getAttribute('data-dial'), 10)));
            paint();
          });
        }
        board.addEventListener('click', function (e) {
          if (scene !== 'reel') return;
          var m = e.target.closest('[data-jump]');
          if (!m) return;
          var jump = m.getAttribute('data-jump');
          if (jump) setScene(jump, 1);
        });

        function tickReel() {
          if (scene !== 'reel') return;
          if (Math.random() > 0.45) assessBase += 1;
          if (Math.random() > 0.4) revBase += Math.floor(Math.random() * 420) + 80;
          if (Math.random() > 0.55) pipeBase += Math.floor(Math.random() * 18000) + 4000;
          paint();
        }
        tickTimer = setInterval(tickReel, 9000);
        paint();
      })();

      /* ===== SCROLL PROGRESS BAR + NAV ===== */
      var progress = document.querySelector('.scroll-progress');
      var navEl = document.querySelector('.nav');
      window.addEventListener('scroll', function () {
        var h = document.documentElement;
        var pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
        if (progress) progress.style.width = pct + '%';
        if (navEl) navEl.classList.toggle('scrolled', window.scrollY > 12);
      }, { passive: true });

      /* ===== THE REEL — NAMED INDEX ===== */
      (function () {
        var PRACTICES = {
          salons: [
            { name: 'Based Aesthetics', stack: 'NailScan · POS', href: 'index.html#case-studies' },
            { name: 'Maison Lustre', stack: 'NailScan' },
            { name: 'The Kiln', stack: 'Full stack' },
            { name: 'Palm & Bone', stack: 'Based POS' },
            { name: 'Atelier Kora', stack: 'NailScan' },
            { name: 'Soft Light Clinic', stack: 'Full stack' },
            { name: 'Ninth Nail', stack: 'NailScan' },
            { name: 'Oro & Oak', stack: 'Based POS' },
            { name: 'Velvet Protocol', stack: 'Signal' },
            { name: 'Lumen Aesthetics', stack: 'NailScan' },
            { name: 'The Quiet Chair', stack: 'Full stack' },
            { name: 'Bare Theory', stack: 'NailScan' },
            { name: 'Indigo Room', stack: 'White-label' },
            { name: 'Salt & Citrine', stack: 'Based POS' },
            { name: 'Red Earth Studio', stack: 'NailScan' },
            { name: 'Hollow & Hue', stack: 'Signal' },
            { name: 'Rivet Nails', stack: 'NailScan' },
            { name: 'Cinder Atelier', stack: 'Full stack' },
            { name: 'North Glass Clinic', stack: 'NailScan' }
          ],
          dealerships: [
            { name: 'CG Open Road Outlet', stack: 'Lot Walk', href: 'index.html#case-studies' },
            { name: 'Ridge Line Powersports', stack: 'Lot Walk' },
            { name: 'North Fork Marine', stack: 'Full stack' },
            { name: 'Prairie Iron', stack: 'Lead routing' },
            { name: 'Blackwater Motors', stack: 'Lot Walk' },
            { name: 'High Country CFMOTO', stack: 'Inventory' },
            { name: 'Lakeside RV & Marine', stack: 'Lot Walk' },
            { name: 'Twin Rivers Honda', stack: 'Lead routing' },
            { name: 'Copper Range Auto', stack: 'White-label' },
            { name: 'West Oak Motorsports', stack: 'Lot Walk' },
            { name: 'Silver Current Marine', stack: 'Inventory' },
            { name: 'Flatland Powersports', stack: 'Full stack' }
          ],
          agencies: [
            { name: 'Brew Media', stack: 'GHL OS', href: 'index.html#case-studies' },
            { name: 'Northroom', stack: 'White-label' },
            { name: 'Field & Wire', stack: 'GHL OS' },
            { name: 'Compact Theory', stack: 'Mowglu' },
            { name: 'Harbour & Co', stack: 'Acquisition' },
            { name: 'Low Tide Studio', stack: 'Full stack' },
            { name: 'Paperweight', stack: 'White-label' },
            { name: 'Second Shift', stack: 'GHL OS' }
          ]
        };

        function pad(n) { return (n < 10 ? '0' : '') + n; }

        function renderRows(key, limit) {
          var list = PRACTICES[key];
          if (!list) return '';
          var max = limit > 0 ? Math.min(limit, list.length) : list.length;
          var html = '';
          for (var i = 0; i < max; i++) {
            var row = list[i];
            var num = pad(i + 1);
            var inner = '<span class="roster-num">' + num + '</span>' +
              '<span class="roster-name">' + row.name + '</span>' +
              '<span class="roster-meta">' + row.stack + '</span>';
            if (row.href) {
              html += '<a class="roster-row public" href="' + row.href + '">' + inner + '</a>';
            } else {
              html += '<div class="roster-row">' + inner + '</div>';
            }
          }
          return html;
        }

        var total = 0;
        Object.keys(PRACTICES).forEach(function (k) { total += PRACTICES[k].length; });
        document.querySelectorAll('[data-roster-count]').forEach(function (el) {
          var k = el.getAttribute('data-roster-count');
          el.textContent = k === 'all' ? String(total) : String((PRACTICES[k] || []).length);
        });

        document.querySelectorAll('[data-roster]').forEach(function (el) {
          var limit = parseInt(el.getAttribute('data-limit'), 10);
          el.innerHTML = renderRows(el.getAttribute('data-roster'), isNaN(limit) ? 0 : limit);
        });

        var filters = document.querySelectorAll('[data-reel-filter]');
        if (filters.length) {
          filters.forEach(function (btn) {
            btn.addEventListener('click', function () {
              var key = btn.getAttribute('data-reel-filter');
              filters.forEach(function (b) { b.classList.toggle('on', b === btn); });
              document.querySelectorAll('.roster-col[data-practice]').forEach(function (col) {
                var show = key === 'all' || col.getAttribute('data-practice') === key;
                col.hidden = !show;
              });
              var wrap = document.getElementById('work-roster');
              if (wrap) wrap.classList.toggle('solo', key !== 'all');
            });
          });
        }
      })();

      /* ===== FAQ ACCORDION ===== */
      document.querySelectorAll('.faq-question').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var item = btn.parentElement;
          var answer = item.querySelector('.faq-answer');
          var isOpen = item.classList.contains('open');
          document.querySelectorAll('.faq-item.open').forEach(function (o) {
            o.classList.remove('open');
            o.querySelector('.faq-answer').style.maxHeight = '0';
          });
          if (!isOpen) {
            item.classList.add('open');
            answer.style.maxHeight = answer.scrollHeight + 'px';
          }
        });
      });

      /* ===== GSAP SCROLL ANIMATIONS ===== */
      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          gsap.utils.toArray('.solution-row').forEach(function (el, i) {
            gsap.from(el, {
              opacity: 0,
              y: 22,
              duration: 0.7,
              ease: 'power2.out',
              delay: (i % 6) * 0.05,
              scrollTrigger: { trigger: el, start: 'top 90%' }
            });
          });
        }

        /* Reveal blocks */
        gsap.utils.toArray('.reveal').forEach(function (el, i) {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            delay: (i % 3) * 0.1,
            scrollTrigger: { trigger: el, start: 'top 88%' }
          });
        });

        /* Manifesto: title-card rise + playhead, scrubbed to scroll */
        var manifesto = document.getElementById('manifesto-text');
        if (manifesto) {
          var words = manifesto.textContent.trim().split(/\s+/);
          manifesto.innerHTML = words.map(function (w) {
            var cls = /^(build|deploy|train)/i.test(w.replace(/[^a-z]/gi, '')) ? 'reveal-word accent' : 'reveal-word';
            return '<span class="' + cls + '"><span class="reveal-inner">' + w + '</span></span>';
          }).join(' ');
          var spans = manifesto.querySelectorAll('.reveal-word');
          var sub = document.querySelector('#manifesto .manifesto-sub');
          var head = document.createElement('i');
          head.className = 'manifesto-head';
          head.textContent = '▌';
          head.setAttribute('aria-hidden', 'true');
          manifesto.appendChild(head);

          var placeHead = function (el) {
            if (!el) { head.classList.remove('is-on'); return; }
            var box = manifesto.getBoundingClientRect();
            var w = el.getBoundingClientRect();
            head.style.left = (w.right - box.left + 6) + 'px';
            head.style.top = (w.top - box.top + w.height * 0.18) + 'px';
            head.classList.add('is-on');
          };

          var lightWords = function (self) {
            var lit = Math.min(spans.length - 1, Math.floor(self.progress * spans.length));
            spans.forEach(function (s, i) { s.classList.toggle('lit', i <= lit); });
            placeHead(spans[lit]);
            if (sub) sub.classList.toggle('is-in', self.progress > 0.82);
            if (self.progress >= 1) head.classList.remove('is-on');
          };

          var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (reduce) {
            spans.forEach(function (s) { s.classList.add('lit'); });
            if (sub) sub.classList.add('is-in');
          } else if (document.body.classList.contains('home')) {
            gsap.matchMedia().add('(min-width: 901px)', function () {
              ScrollTrigger.create({
                trigger: '#manifesto',
                start: 'top top',
                end: '+=95%',
                pin: true,
                pinSpacing: true,
                scrub: 0.65,
                anticipatePin: 1,
                onUpdate: lightWords
              });
            });
            gsap.matchMedia().add('(max-width: 900px)', function () {
              ScrollTrigger.create({
                trigger: manifesto,
                start: 'top 78%',
                end: 'bottom 28%',
                scrub: 0.55,
                onUpdate: lightWords
              });
            });
          } else {
            ScrollTrigger.create({
              trigger: manifesto,
              start: 'top 75%',
              end: 'bottom 40%',
              scrub: 0.5,
              onUpdate: lightWords
            });
          }
        }

        /* Homepage camera: hero drifts as you leave the cold open */
        if (document.body.classList.contains('home') && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          gsap.to('#hero .container', {
            y: -56,
            ease: 'none',
            scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.7 }
          });
          gsap.to('.hero-ghost-word', {
            y: -160,
            ease: 'none',
            scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
          });
          gsap.to('.hero-iris', {
            opacity: 0.35,
            ease: 'none',
            scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
          });
        }

        /* Case numbers count up when visible */
        gsap.utils.toArray('.case-number[data-count], .case-strip-number[data-count]').forEach(function (el) {
          var target = parseInt(el.getAttribute('data-count'), 10);
          ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            once: true,
            onEnter: function () {
              var obj = { v: 0 };
              gsap.to(obj, {
                v: target,
                duration: 1.6,
                ease: 'power2.out',
                onUpdate: function () { el.textContent = Math.floor(obj.v).toLocaleString(); }
              });
            }
          });
        });

        /* Section heads slide in + rule draws itself */
        gsap.utils.toArray('.section-head').forEach(function (el) {
          gsap.from(el, {
            opacity: 0,
            x: -24,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              onEnter: function () { el.classList.add('drawn'); }
            }
          });
        });

        /* Ghost numerals drift on scroll */
        gsap.utils.toArray('.ghost-num').forEach(function (el) {
          gsap.fromTo(el, { y: 80 }, {
            y: -80,
            ease: 'none',
            scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 }
          });
        });

        /* Big statements */
        gsap.utils.toArray('.how-statement, .contact-headline, .client-intro, .page-hero h1').forEach(function (el) {
          gsap.from(el, {
            opacity: 0,
            y: 50,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' }
          });
        });

        /* Product visuals: subtle parallax */
        gsap.utils.toArray('.product-visual').forEach(function (el) {
          gsap.fromTo(el, { y: 30 }, {
            y: -30,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
          });
        });
      } else {
        document.querySelectorAll('.reveal').forEach(function (el) {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
      }
    });

      /* ===== CATALOG FILTERS ===== */
      (function () {
        var bar = document.querySelector('.cat-filters');
        if (!bar) return;
        var rows = document.querySelectorAll('.cat-row');
        var heads = document.querySelectorAll('.cat-group');
        bar.addEventListener('click', function (e) {
          var btn = e.target.closest('[data-cat-filter]');
          if (!btn) return;
          bar.querySelectorAll('[data-cat-filter]').forEach(function (b) { b.classList.toggle('on', b === btn); });
          var tag = btn.getAttribute('data-cat-filter');
          rows.forEach(function (row) {
            var show = tag === 'all' || (' ' + row.getAttribute('data-tags') + ' ').indexOf(' ' + tag + ' ') !== -1;
            row.hidden = !show;
          });
          heads.forEach(function (h) {
            var next = h.nextElementSibling;
            var any = false;
            while (next && !next.classList.contains('cat-group')) {
              if (next.classList.contains('cat-row') && !next.hidden) any = true;
              next = next.nextElementSibling;
            }
            h.hidden = !any;
          });
        });
      })();

      /* ===== HERO SKY — starfield + tilted galaxy ===== */
      (function () {
        var canvas = document.getElementById('sky-canvas');
        if (!canvas || !canvas.getContext) return;
        var ctx = canvas.getContext('2d');
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var dpr = 1, w = 0, h = 0, cx = 0, cy = 0, scale = 0;
        var stars = [], dust = [], meteors = [];
        var tilt = 0.36;
        var yaw = -0.55;
        var running = false;

        function rgba(c, a) {
          return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
        }

        function seed() {
          var box = canvas.getBoundingClientRect();
          if (box.width < 8 || box.height < 8) return;
          dpr = Math.min(2, window.devicePixelRatio || 1);
          w = Math.floor(box.width * dpr);
          h = Math.floor(box.height * dpr);
          canvas.width = w;
          canvas.height = h;
          cx = w * 0.52;
          cy = h * 0.52;
          scale = Math.min(w, h) * 0.92;
          var phone = window.matchMedia('(max-width: 900px)').matches;
          var nStar = phone ? 140 : 220;
          var nDust = phone ? 900 : 1600;
          stars = [];
          for (var i = 0; i < nStar; i++) {
            var k = Math.random();
            stars.push({
              x: Math.random() * w,
              y: Math.random() * h,
              r: (0.6 + Math.random() * 1.8) * dpr,
              tw: Math.random() * Math.PI * 2,
              c: k > 0.93 ? [255, 212, 1] : k > 0.86 ? [0, 117, 204] : [237, 237, 230]
            });
          }
          dust = [];
          for (var j = 0; j < nDust; j++) {
            var arm = j % 2;
            var t = Math.pow(Math.random(), 0.62) * 4.4;
            var r = 0.05 + 0.42 * (t / 4.4);
            r += (Math.random() - 0.5) * 0.05 * (0.6 + t);
            var ang = t + arm * Math.PI + (Math.random() - 0.5) * 0.32;
            var kind = Math.random();
            var col = kind > 0.9 ? [255, 212, 1] : kind > 0.74 ? [0, 117, 204] : kind > 0.42 ? [170, 196, 230] : [237, 237, 230];
            dust.push({
              r: r,
              a0: ang,
              s: (0.8 + Math.random() * 2.1) * dpr,
              c: col,
              tw: Math.random() * 6
            });
          }
          meteors = [];
        }

        function spawnMeteor() {
          if (meteors.length > 1) return;
          var x = w * (0.1 + Math.random() * 0.7);
          var y = h * (0.05 + Math.random() * 0.35);
          meteors.push({
            x: x,
            y: y,
            vx: (2.4 + Math.random() * 2.2) * dpr,
            vy: (1.1 + Math.random() * 1.2) * dpr,
            life: 1
          });
        }

        function paint(t) {
          ctx.clearRect(0, 0, w, h);
          var rot = (t || 0) * 0.000045;

          var i, s, a;
          for (i = 0; i < stars.length; i++) {
            s = stars[i];
            a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin((t || 0) / 620 + s.tw));
            ctx.fillStyle = rgba(s.c, a);
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
          }

          var core = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 0.28);
          core.addColorStop(0, 'rgba(255, 244, 210, 0.85)');
          core.addColorStop(0.18, 'rgba(255, 212, 1, 0.38)');
          core.addColorStop(0.42, 'rgba(0, 117, 204, 0.2)');
          core.addColorStop(1, 'rgba(10, 10, 9, 0)');
          ctx.fillStyle = core;
          ctx.beginPath();
          ctx.ellipse(cx, cy, scale * 0.4, scale * 0.16, yaw + rot * 0.4, 0, Math.PI * 2);
          ctx.fill();

          var armGlow = ctx.createRadialGradient(cx, cy, scale * 0.04, cx, cy, scale * 0.58);
          armGlow.addColorStop(0, 'rgba(0, 117, 204, 0.18)');
          armGlow.addColorStop(0.4, 'rgba(255, 212, 1, 0.1)');
          armGlow.addColorStop(1, 'rgba(10, 10, 9, 0)');
          ctx.fillStyle = armGlow;
          ctx.beginPath();
          ctx.ellipse(cx, cy, scale * 0.58, scale * 0.24, yaw + rot * 0.4, 0, Math.PI * 2);
          ctx.fill();

          for (i = 0; i < dust.length; i++) {
            var d = dust[i];
            var ang = d.a0 + rot;
            var px = cx + Math.cos(ang) * d.r * scale;
            var py = cy + Math.sin(ang) * d.r * scale * tilt;
            var rx = (px - cx) * Math.cos(yaw) - (py - cy) * Math.sin(yaw) + cx;
            var ry = (px - cx) * Math.sin(yaw) + (py - cy) * Math.cos(yaw) + cy;
            var fade = 1 - d.r * 1.15;
            if (fade < 0.08) fade = 0.08;
            a = fade * (0.55 + 0.45 * (0.5 + 0.5 * Math.sin((t || 0) / 900 + d.tw)));
            ctx.fillStyle = rgba(d.c, a);
            ctx.fillRect(rx, ry, d.s, d.s);
          }

          for (i = meteors.length - 1; i >= 0; i--) {
            var m = meteors[i];
            m.x += m.vx;
            m.y += m.vy;
            m.life -= 0.018;
            if (m.life <= 0 || m.x > w + 40 || m.y > h + 40) {
              meteors.splice(i, 1);
              continue;
            }
            ctx.strokeStyle = 'rgba(237, 237, 230,' + (0.7 * m.life) + ')';
            ctx.lineWidth = 1.2 * dpr;
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(m.x - m.vx * 8, m.y - m.vy * 8);
            ctx.stroke();
            ctx.fillStyle = 'rgba(255, 212, 1,' + (0.85 * m.life) + ')';
            ctx.beginPath();
            ctx.arc(m.x, m.y, 1.3 * dpr, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        function tick(t) {
          if (document.hidden) {
            running = false;
            return;
          }
          paint(t);
          if (!reduce && Math.random() < 0.006) spawnMeteor();
          if (!reduce) requestAnimationFrame(tick);
        }

        function start() {
          seed();
          paint(0);
          if (!reduce && !running && !document.hidden) {
            running = true;
            requestAnimationFrame(tick);
          }
        }

        document.addEventListener('visibilitychange', function () {
          if (!document.hidden) start();
        });
        window.addEventListener('resize', start);
        if (document.body.classList.contains('ready')) start();
        else document.addEventListener('wss:ready', start, { once: true });
        setTimeout(start, 80);
      })();

      /* ===== COLD OPEN — rec-tone + room, muted until they ask ===== */
      (function () {
        var btn = document.getElementById('sound-toggle');
        if (!btn) return;
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) {
          btn.hidden = true;
          return;
        }
        var ctx = null;
        var room = null;
        var on = false;

        function ensure() {
          var AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) return null;
          if (!ctx) ctx = new AC();
          if (ctx.state === 'suspended') ctx.resume();
          return ctx;
        }

        function recBeep() {
          if (!ctx) return;
          var o = ctx.createOscillator();
          var g = ctx.createGain();
          o.type = 'square';
          o.frequency.value = 880;
          g.gain.setValueAtTime(0.0001, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 0.01);
          g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);
          o.connect(g);
          g.connect(ctx.destination);
          o.start();
          o.stop(ctx.currentTime + 0.1);
        }

        function startRoom() {
          if (!ctx || room) return;
          var n = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
          var data = n.getChannelData(0);
          var i;
          for (i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.18;
          var src = ctx.createBufferSource();
          src.buffer = n;
          src.loop = true;
          var filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 280;
          var g = ctx.createGain();
          g.gain.value = 0.035;
          src.connect(filter);
          filter.connect(g);
          g.connect(ctx.destination);
          src.start();
          room = { src: src, gain: g };
        }

        function stopRoom() {
          if (!room) return;
          try { room.src.stop(); } catch (e) {}
          room = null;
        }

        function setOn(next) {
          on = next;
          btn.setAttribute('aria-pressed', on ? 'true' : 'false');
          btn.textContent = on ? 'SOUND ON' : 'SOUND OFF';
          try { sessionStorage.setItem('wss-sound', on ? '1' : '0'); } catch (e) {}
          if (on) {
            if (!ensure()) return;
            recBeep();
            startRoom();
          } else {
            stopRoom();
          }
        }

        btn.addEventListener('click', function () { setOn(!on); });
        try {
          if (sessionStorage.getItem('wss-sound') === '1') {
            document.addEventListener('wss:ready', function () { setOn(true); }, { once: true });
          }
        } catch (e) {}
      })();
