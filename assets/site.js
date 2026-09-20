document.addEventListener('DOMContentLoaded', function () {

      /* ===== PRELOADER BOOT SEQUENCE ===== */
      (function () {
        var pre = document.getElementById('preloader');
        var linesEl = document.getElementById('preloader-lines');
        var fill = document.getElementById('preloader-fill');
        var pct = document.getElementById('preloader-pct');
        if (!pre) return;
        document.body.style.overflow = 'hidden';

        var bootLines = [
          ['wss ~ % initializing', false],
          ['mounting nailscan............ <span class="ok">OK</span>', true],
          ['mounting based-pos........... <span class="ok">OK</span>', true],
          ['mounting lotwalk............. <span class="ok">OK</span>', true],
          ['handshake maa ⇄ ywg.......... <span class="ok">OK</span>', true]
        ];

        var li = 0;
        function addLine() {
          if (li < bootLines.length) {
            var d = document.createElement('div');
            d.innerHTML = bootLines[li][0];
            linesEl.appendChild(d);
            li++;
            setTimeout(addLine, 170);
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

          btn.appendChild(ink);
          btn.appendChild(sheen);
          btn.appendChild(flash);
          btn.appendChild(text);
          btn.appendChild(go);

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
            });
            btn.addEventListener('mousemove', function (e) {
              var r = btn.getBoundingClientRect();
              xTo((e.clientX - r.left - r.width / 2) * 0.18);
              yTo((e.clientY - r.top - r.height / 2) * 0.32);
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
            var xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3' });
            var yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3' });
            btn.addEventListener('mousemove', function (e) {
              var r = btn.getBoundingClientRect();
              xTo((e.clientX - r.left - r.width / 2) * 0.2);
              yTo((e.clientY - r.top - r.height / 2) * 0.32);
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
        var parts = html.split(/(<em>.*?<\/em>|<br\s*\/?>)/g);
        var out = '';
        parts.forEach(function (part) {
          if (!part) return;
          if (/^<br/i.test(part)) {
            out += '<br>';
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
        if (typeof gsap === 'undefined' || reduce || document.hidden) {
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

      /* ===== LIVE METRICS SIMULATION ===== */
      var assessmentsToday = document.getElementById('assessments-today');
      var revenueToday = document.getElementById('revenue-today');
      var pipelineUsd = document.getElementById('pipeline-usd');
      var assessBase = 71, revBase = 52410, pipeBase = 2140000;

      function usd(n) {
        return '$' + Math.floor(n).toLocaleString('en-US');
      }
      function usdCompact(n) {
        if (n >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
        return usd(n);
      }

      function updateMetrics() {
        if (assessmentsToday) {
          if (Math.random() > 0.45) assessBase += 1;
          assessmentsToday.textContent = assessBase;
        }
        if (revenueToday) {
          if (Math.random() > 0.4) revBase += Math.floor(Math.random() * 420) + 80;
          revenueToday.textContent = usd(revBase);
        }
        if (pipelineUsd) {
          if (Math.random() > 0.55) pipeBase += Math.floor(Math.random() * 18000) + 4000;
          pipelineUsd.textContent = usdCompact(pipeBase);
        }
      }
      setInterval(updateMetrics, 9000);

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

        /* Manifesto: word-by-word light-up on scroll */
        var manifesto = document.getElementById('manifesto-text');
        if (manifesto) {
          var words = manifesto.textContent.split(' ');
          manifesto.innerHTML = words.map(function (w) {
            var cls = /build|deploy|train/i.test(w) ? 'reveal-word accent' : 'reveal-word';
            return '<span class="' + cls + '">' + w + '</span>';
          }).join(' ');
          var spans = manifesto.querySelectorAll('.reveal-word');
          var lightWords = function (self) {
            var lit = Math.floor(self.progress * spans.length);
            spans.forEach(function (s, i) { s.classList.toggle('lit', i <= lit); });
          };
          if (document.body.classList.contains('home')) {
            gsap.matchMedia().add('(min-width: 901px)', function () {
              if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                ScrollTrigger.create({ trigger: manifesto, start: 'top 75%', end: 'bottom 40%', scrub: 0.5, onUpdate: lightWords });
                return;
              }
              ScrollTrigger.create({
                trigger: '#manifesto',
                start: 'top top',
                end: '+=70%',
                pin: true,
                pinSpacing: true,
                scrub: 0.55,
                anticipatePin: 1,
                onUpdate: lightWords
              });
            });
            gsap.matchMedia().add('(max-width: 900px)', function () {
              ScrollTrigger.create({ trigger: manifesto, start: 'top 75%', end: 'bottom 40%', scrub: 0.5, onUpdate: lightWords });
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
