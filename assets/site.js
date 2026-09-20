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

      /* ===== MAGNETIC CTA ===== */
      (function () {
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        document.querySelectorAll('.cta, .nav-cta').forEach(function (btn) {
          btn.addEventListener('mousemove', function (e) {
            var r = btn.getBoundingClientRect();
            var x = (e.clientX - r.left - r.width / 2) * 0.18;
            var y = (e.clientY - r.top - r.height / 2) * 0.3;
            btn.style.transform = 'translate(' + x + 'px,' + y + 'px)';
          });
          btn.addEventListener('mouseleave', function () {
            btn.style.transform = '';
            btn.style.transition = 'transform 350ms cubic-bezier(0.22, 1, 0.36, 1)';
            setTimeout(function () { btn.style.transition = ''; }, 350);
          });
        });
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
      typeLine();

      /* ===== HEADLINE WORD REVEAL ===== */
      var headline = document.getElementById('headline');
      if (headline && typeof gsap !== 'undefined') {
        var html = headline.innerHTML;
        var parts = html.split(/(<em>.*?<\/em>)/g);
        var out = '';
        parts.forEach(function (part) {
          if (part.startsWith('<em>')) {
            var inner = part.replace(/<\/?em>/g, '');
            inner.split(' ').forEach(function (w) {
              out += '<span class="word"><span><em>' + w + '</em></span></span> ';
            });
          } else {
            part.split(' ').forEach(function (w) {
              if (w.trim()) out += '<span class="word"><span>' + w + '</span></span> ';
            });
          }
        });
        headline.innerHTML = out;
        gsap.to('#headline .word > span', {
          y: 0,
          duration: 0.9,
          stagger: 0.07,
          ease: 'power3.out',
          delay: 0.3
        });
        gsap.to('#subcopy', { opacity: 1, y: 0, duration: 0.8, delay: 1.1, ease: 'power2.out' });
        gsap.to('#cta-row', { opacity: 1, duration: 0.8, delay: 1.35, ease: 'power2.out' });
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
        setTimeout(function () { requestAnimationFrame(countUp); }, 1400);
      }

      /* ===== TICKER + MARQUEE DUPLICATION (seamless loop) ===== */
      var tickerTrack = document.getElementById('ticker-track');
      if (tickerTrack) tickerTrack.innerHTML += tickerTrack.innerHTML;
      var marqueeInner = document.getElementById('marquee-inner');
      if (marqueeInner) marqueeInner.innerHTML += marqueeInner.innerHTML;

      /* ===== LIVE METRICS SIMULATION ===== */
      var clientsNow = document.getElementById('clients-now');
      var assessmentsToday = document.getElementById('assessments-today');
      var revenueToday = document.getElementById('revenue-today');
      var assessBase = 2, revBase = 18400;

      function updateMetrics() {
        if (clientsNow) clientsNow.textContent = 2 + Math.floor(Math.random() * 3);
        if (assessmentsToday) {
          if (Math.random() > 0.6) assessBase += 1;
          assessmentsToday.textContent = assessBase;
        }
        if (revenueToday) {
          if (Math.random() > 0.5) revBase += Math.floor(Math.random() * 900) + 300;
          revenueToday.textContent = '₹' + revBase.toLocaleString('en-IN');
        }
      }
      setInterval(updateMetrics, 9000);

      /* ===== SCROLL PROGRESS BAR ===== */
      var progress = document.querySelector('.scroll-progress');
      window.addEventListener('scroll', function () {
        var h = document.documentElement;
        var pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
        if (progress) progress.style.width = pct + '%';
      }, { passive: true });

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
          ScrollTrigger.create({
            trigger: manifesto,
            start: 'top 75%',
            end: 'bottom 40%',
            scrub: 0.5,
            onUpdate: function (self) {
              var lit = Math.floor(self.progress * spans.length);
              spans.forEach(function (s, i) { s.classList.toggle('lit', i <= lit); });
            }
          });
        }

        /* Case numbers count up when visible */
        gsap.utils.toArray('.case-number[data-count]').forEach(function (el) {
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
        gsap.utils.toArray('.how-statement, .contact-headline, .client-intro').forEach(function (el) {
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
      }
    });
