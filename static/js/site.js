/* Site-wide behaviour: mobile navigation, landing-page motion and the
   publications list. Plain JavaScript, no dependencies. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function copyText(text, done) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done);
      return;
    }
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
    document.body.removeChild(area);
  }

  /* Mobile navigation */
  function initNav() {
    var burger = document.querySelector('.site-nav-burger');
    var nav = document.querySelector('.site-nav');
    if (!burger || !nav) return;
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('.site-nav-menu a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Fade sections in as they scroll into view */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    document.documentElement.classList.add('has-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* Count the headline figures up from zero once */
  function initCounters() {
    var nums = document.querySelectorAll('.figure-num[data-count]');
    if (!nums.length || reduceMotion || !('IntersectionObserver' in window)) return;

    function run(el) {
      var target = parseInt(el.dataset.count, 10);
      var suffix = el.dataset.suffix || '';
      var start = null;
      var duration = 1600;
      function step(ts) {
        if (start === null) start = ts;
        var t = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased).toLocaleString('en-US') + suffix;
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          run(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { io.observe(el); });
  }

  /* Cycle the teaser phrase through several languages */
  function initRotator() {
    var word = document.querySelector('.teaser-word[data-words]');
    if (!word || reduceMotion) return;
    var words;
    try { words = JSON.parse(word.dataset.words); } catch (e) { return; }
    if (!words.length) return;
    var i = 0;
    setInterval(function () {
      word.classList.add('is-leaving');
      setTimeout(function () {
        i = (i + 1) % words.length;
        word.textContent = words[i];
        word.classList.remove('is-leaving');
      }, 420);
    }, 2600);
  }

  /* Publications: search, year filter, BibTeX toggle and copy */
  function initPublications() {
    var list = document.getElementById('publications-list');
    if (!list) return;

    var search = document.getElementById('pub-search');
    var pills = document.querySelectorAll('.filter-pill');
    var empty = document.getElementById('pubs-empty');
    var items = list.querySelectorAll('.pub-item');

    function apply() {
      var q = (search ? search.value : '').toLowerCase().trim();
      var active = document.querySelector('.filter-pill.active');
      var year = active ? active.dataset.filter : 'all';
      var shown = 0;

      items.forEach(function (item) {
        var text = item.querySelector('.pub-content').textContent.toLowerCase();
        var ok = (year === 'all' || item.dataset.year === year) && (!q || text.indexOf(q) !== -1);
        item.hidden = !ok;
        if (ok) shown++;
      });

      list.querySelectorAll('.year-group').forEach(function (group) {
        group.hidden = !group.querySelector('.pub-item:not([hidden])');
      });

      if (empty) empty.hidden = shown !== 0;
    }

    if (search) search.addEventListener('input', apply);
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        pills.forEach(function (p) { p.classList.remove('active'); });
        pill.classList.add('active');
        apply();
      });
    });

    list.querySelectorAll('.pub-item').forEach(function (item) {
      var toggle = item.querySelector('.bibtex-toggle-btn');
      var box = item.querySelector('.bibtex-box');
      var copy = item.querySelector('.bibtex-box .copy-button');
      var pre = item.querySelector('.bibtex-pre');
      if (toggle && box) {
        toggle.addEventListener('click', function () {
          var open = box.hidden;
          box.hidden = !open;
          toggle.classList.toggle('active', open);
          toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
      }
      if (copy && pre) {
        copy.addEventListener('click', function () {
          copyText(pre.textContent, function () {
            copy.textContent = 'Copied';
            copy.classList.add('copied');
            setTimeout(function () {
              copy.textContent = 'Copy';
              copy.classList.remove('copied');
            }, 2000);
          });
        });
      }
    });
  }

  function init() {
    initNav();
    initReveal();
    initCounters();
    initRotator();
    initPublications();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
