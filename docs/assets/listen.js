/*
 * 朗读：用浏览器自带的语音合成把页面读出来。不上传内容，也不加载音频文件。
 * 声音来自读者设备上的中文语音，不同设备听起来不一样；没有中文语音的浏览器读不出来。
 * 「朗读」按钮由 hooks/guide.py 输出，默认隐藏，浏览器支持语音合成时才显示。
 * 朗读时跳过页眉标签、代码块和文末的链接列表；点目录里的标题可以跳到那一节。
 */
(function () {
  var synth = window.speechSynthesis;
  if (!synth || typeof window.SpeechSynthesisUtterance !== "function") return;

  var RATES = [0.8, 1, 1.25, 1.5, 2];
  /* 一句太长时，部分浏览器的在线语音会在十几秒处中断，所以按句切开，长句再按逗号切 */
  var MAX_CHARS = 50;
  var SKIP = ".lt-kicker, .lt-meta, .lt-related, .lt-verified, .lt-progress, pre, .highlight, script, style";
  var SKIP_SECTIONS = ["官方入口", "相关章节"];
  /* macOS 和 iOS 自带的几个音效式语音，听长文不合适 */
  var NOVELTY = /^(Eddy|Flo|Grandma|Grandpa|Reed|Rocko|Sandy|Shelley)\b/;

  var ICONS = {
    play: "M8 5v14l11-7z",
    pause: "M6 19h4V5H6v14zm8-14v14h4V5h-4z",
    prev: "M6 6h2v12H6zm3.5 6l8.5 6V6z",
    next: "M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z",
    close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
  };

  var items = [];
  var pos = 0;
  var sub = 0;
  var playing = false;
  var token = 0;
  var timer = null;
  var hintTimer = null;
  var utterance = null; /* 留着引用，否则有的浏览器会提前回收，收不到结束事件 */
  var voices = [];
  var voice = null;
  var rate = Number(read("lt-listen:rate")) || 1;
  var player = null;
  var ui = {};
  var marked = null;

  function read(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      /* 存不了就算了 */
    }
  }

  function icon(name) {
    return '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="' + ICONS[name] + '"></path></svg>';
  }

  /* ---------- 取出要读的内容 ---------- */

  function textOf(el) {
    var copy = el.cloneNode(true);
    Array.prototype.forEach.call(copy.querySelectorAll(".headerlink, ul, ol, pre, script, style"), function (node) {
      node.parentNode.removeChild(node);
    });
    /* 链接文字是网址的，只读名字，不读后缀和路径：dpsdr.vlk.lt/x 读成 dpsdr vlk */
    Array.prototype.forEach.call(copy.querySelectorAll("a"), function (link) {
      var host = /^(?:www\.)?([\w-]+(?:\.[\w-]+)*)\.[a-z]{2,}(?:\/\S*)?$/i.exec(link.textContent.trim());
      if (host) link.textContent = host[1].replace(/\./g, " ");
    });
    return copy.textContent;
  }

  function normalize(text) {
    return text
      .replace(/\s+/g, " ")
      .replace(/(\d),(?=\d{3}(?!\d))/g, "$1")
      .replace(/([\d%])\s*[–~～]\s*(?=\d)/g, "$1到")
      .replace(/\s*→\s*/g, "，再到")
      .replace(/ \/ /g, "、")
      .replace(/\s*×\s*/g, "乘以")
      .replace(/\s*km²/g, "平方公里")
      .replace(/\s*m²/g, "平方米")
      .replace(/ − /g, "减")
      .trim();
  }

  function split(text) {
    var out = [];
    (text.match(/[^。！？；!?;]+[。！？；!?;]*/g) || []).forEach(function (sentence) {
      sentence = sentence.trim();
      if (!sentence) return;
      if (sentence.length <= MAX_CHARS) {
        out.push(sentence);
        return;
      }
      var buffer = "";
      (sentence.match(/[^，、：]+[，、：]*/g) || [sentence]).forEach(function (piece) {
        if (buffer && (buffer + piece).length > MAX_CHARS) {
          out.push(buffer);
          buffer = "";
        }
        buffer += piece;
      });
      if (buffer.trim()) out.push(buffer);
    });
    return out;
  }

  function collect(article) {
    var found = [];
    var skipping = false;
    var section = "";

    function add(el, text) {
      text = normalize(text);
      if (!/[一-鿿A-Za-z0-9]/.test(text)) return;
      var parts = split(text);
      if (parts.length) found.push({ el: el, parts: parts, section: section });
    }

    function each(list, fn) {
      Array.prototype.forEach.call(list, fn);
    }

    function visit(el) {
      var tag = el.tagName;
      if (el.matches(SKIP)) return;
      if (el.parentNode === article && (tag === "H1" || tag === "H2")) {
        section = normalize(textOf(el));
        skipping = SKIP_SECTIONS.indexOf(section) !== -1;
      }
      if (skipping) return;

      if (/^H[1-6]$/.test(tag) || tag === "P" || tag === "DT" || tag === "DD" || tag === "SUMMARY") {
        add(el, textOf(el));
      } else if (tag === "UL" || tag === "OL") {
        each(el.children, function (li) {
          if (li.tagName !== "LI") return;
          /* 列表项里分了段的，按段读；否则读这一项自己的文字，再读嵌套的列表 */
          if (li.querySelector(":scope > p")) {
            each(li.children, visit);
            return;
          }
          add(li, textOf(li));
          each(li.querySelectorAll(":scope > ul, :scope > ol"), visit);
        });
      } else if (tag === "TABLE") {
        each(el.querySelectorAll("tr"), function (row) {
          var cells = Array.prototype.map.call(row.children, function (cell) {
            return textOf(cell).trim();
          });
          add(row, cells.filter(Boolean).join("，"));
        });
      } else if (tag === "DIV" || tag === "SECTION" || tag === "BLOCKQUOTE" || tag === "DETAILS" || tag === "DL") {
        each(el.children, visit);
      }
    }

    each(article.children, visit);
    return found;
  }

  /* ---------- 选声音 ---------- */

  function score(candidate) {
    var lang = candidate.lang.replace("_", "-").toLowerCase();
    if (!/^(zh|cmn)/.test(lang) || /hk|yue/.test(lang)) return -1;
    var points = /^(zh-cn|cmn-hans-cn|zh-hans)/.test(lang) ? 100 : /tw|hant/.test(lang) ? 40 : 60;
    if (lang.split("-").length > 2 && !/hans|hant/.test(lang)) points -= 50; /* 方言口音 */
    if (/natural|neural/i.test(candidate.name)) points += 30;
    if (/premium|enhanced|优化|高音质/i.test(candidate.name)) points += 20;
    if (/tingting|婷婷/i.test(candidate.name)) points += 10;
    if (NOVELTY.test(candidate.name)) points -= 30;
    if (candidate.localService) points += 5;
    return points;
  }

  function label(candidate) {
    return candidate.name.replace(/^Microsoft\s+/, "").replace(/\s+Online \(Natural\)/, "").replace(/\s+-\s+Chinese.*$/, "");
  }

  function loadVoices() {
    voices = synth.getVoices().filter(function (candidate) {
      return score(candidate) >= 0;
    });
    voices.sort(function (a, b) {
      return score(b) - score(a);
    });
    var plain = voices.filter(function (candidate) {
      return !NOVELTY.test(candidate.name);
    });
    if (plain.length) voices = plain;

    var saved = read("lt-listen:voice");
    voice = null;
    voices.forEach(function (candidate) {
      if (candidate.name === saved) voice = candidate;
    });
    if (!voice) voice = voices[0] || null;

    if (!player) return;
    ui.voice.innerHTML = "";
    voices.forEach(function (candidate) {
      var option = document.createElement("option");
      option.value = candidate.name;
      option.textContent = label(candidate);
      option.selected = candidate === voice;
      ui.voice.appendChild(option);
    });
    ui.voice.hidden = voices.length < 2;
  }

  /* ---------- 播放 ---------- */

  function isHeading(item) {
    return /^H[1-3]$/.test(item.el.tagName);
  }

  function hint(text) {
    ui.hint.textContent = text || "";
    ui.hint.hidden = !text;
  }

  /* 读出声了，收起「没有声音」的提示。设备上确实没有中文语音时，提示留着 */
  function heard() {
    window.clearTimeout(hintTimer);
    if (voices.length || !synth.getVoices().length) hint("");
  }

  function render() {
    var item = items[pos];
    ui.toggle.innerHTML = icon(playing ? "pause" : "play");
    ui.toggle.setAttribute("aria-label", playing ? "暂停" : "播放");
    ui.rate.textContent = rate + "×";
    ui.count.textContent = Math.min(pos + 1, items.length) + " / " + items.length;
    ui.section.textContent = item ? item.section : "读完了";
    ui.fill.style.width = (items.length ? Math.round((pos / items.length) * 100) : 0) + "%";
  }

  function mark(el) {
    if (marked) marked.classList.remove("lt-speaking");
    marked = el;
    if (!el) return;
    el.classList.add("lt-speaking");

    /* 当前这一段不在可见范围里才滚动 */
    var rect = el.getBoundingClientRect();
    var header = document.querySelector(".md-header");
    var top = (header ? header.getBoundingClientRect().bottom : 0) + 16;
    var bottom = window.innerHeight - player.offsetHeight - 32;
    if (rect.top >= top && rect.bottom <= bottom) return;
    var offset = rect.height > (bottom - top) * 0.8 ? rect.top - top : rect.top + rect.height / 2 - (top + bottom) / 2;
    /* 页面在后台时平滑滚动不会推进，直接跳过去，回来时位置才是对的 */
    var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollBy({ top: offset, behavior: calm || document.hidden ? "auto" : "smooth" });
  }

  function speak() {
    if (!playing) return;
    if (pos >= items.length) {
      playing = false;
      mark(null);
      render();
      return;
    }

    var item = items[pos];
    var mine = (token += 1);
    if (sub === 0 || marked !== item.el) mark(item.el);
    render();

    utterance = new window.SpeechSynthesisUtterance(item.parts[sub]);
    utterance.lang = voice ? voice.lang : "zh-CN";
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.onstart = function () {
      if (mine === token) heard();
    };
    utterance.onend = function () {
      if (mine !== token) return;
      heard();
      sub += 1;
      if (sub >= item.parts.length) {
        pos += 1;
        sub = 0;
      }
      speak();
    };
    utterance.onerror = function (event) {
      if (mine !== token) return;
      /* 自己喊停之前会先换 token，走到这里的都是被系统打断或者出错，停在这一句等读者再点播放 */
      stop();
      render();
      if (event.error !== "interrupted" && event.error !== "canceled") {
        hint("这个浏览器读不出来。换用 Safari、Chrome 或 Edge 打开试试。");
      }
    };
    synth.speak(utterance);
  }

  /* 从当前位置重新开始读。正在出声时要先停掉，停和读之间隔一下，否则有的浏览器会丢掉新的一句 */
  function restart() {
    token += 1;
    window.clearTimeout(timer);
    if (synth.speaking || synth.pending) {
      synth.cancel();
      timer = window.setTimeout(speak, 80);
    } else {
      speak();
    }
  }

  function stop() {
    token += 1;
    window.clearTimeout(timer);
    window.clearTimeout(hintTimer);
    playing = false;
    synth.cancel();
  }

  function goTo(index) {
    pos = Math.max(0, Math.min(index, items.length - 1));
    sub = 0;
    if (playing) {
      restart();
    } else {
      mark(items[pos].el);
      render();
    }
  }

  function jump(direction) {
    var index = Math.min(pos, items.length - 1);
    if (direction > 0) {
      for (index = pos + 1; index < items.length && !isHeading(items[index]); index += 1);
      if (index >= items.length) return;
    } else {
      while (index > 0 && !isHeading(items[index])) index -= 1;
      /* 已经在这一节开头，就退到上一节 */
      if (pos - index <= 1 && pos < items.length && index > 0) {
        index -= 1;
        while (index > 0 && !isHeading(items[index])) index -= 1;
      }
    }
    goTo(index);
  }

  function toggle() {
    if (playing) {
      stop();
      render();
    } else {
      if (pos >= items.length) {
        pos = 0;
        sub = 0;
      }
      playing = true;
      restart();
    }
  }

  function close() {
    stop();
    mark(null);
    player.hidden = true;
    document.body.classList.remove("lt-listening");
  }

  function build() {
    player = document.createElement("div");
    player.className = "lt-player";
    player.setAttribute("role", "region");
    player.setAttribute("aria-label", "朗读");
    player.hidden = true;
    player.innerHTML =
      '<div class="lt-player__bar"><span></span></div>' +
      '<div class="lt-player__row">' +
      '<button type="button" data-act="prev" aria-label="上一节">' + icon("prev") + "</button>" +
      '<button type="button" data-act="toggle" class="lt-player__main"></button>' +
      '<button type="button" data-act="next" aria-label="下一节">' + icon("next") + "</button>" +
      '<div class="lt-player__text"><strong></strong><span></span></div>' +
      '<select aria-label="声音" hidden></select>' +
      '<button type="button" data-act="rate" class="lt-player__rate" aria-label="语速"></button>' +
      '<button type="button" data-act="close" aria-label="关闭朗读">' + icon("close") + "</button>" +
      "</div>" +
      '<p class="lt-player__hint" hidden></p>';
    document.body.appendChild(player);

    ui.fill = player.querySelector(".lt-player__bar span");
    ui.toggle = player.querySelector("[data-act=toggle]");
    ui.rate = player.querySelector("[data-act=rate]");
    ui.section = player.querySelector(".lt-player__text strong");
    ui.count = player.querySelector(".lt-player__text span");
    ui.voice = player.querySelector("select");
    ui.hint = player.querySelector(".lt-player__hint");

    player.addEventListener("click", function (event) {
      var button = event.target.closest("button[data-act]");
      if (!button) return;
      var act = button.getAttribute("data-act");
      if (act === "toggle") toggle();
      if (act === "prev") jump(-1);
      if (act === "next") jump(1);
      if (act === "close") close();
      if (act === "rate") {
        rate = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
        write("lt-listen:rate", String(rate));
        render();
        if (playing) restart();
      }
    });

    ui.voice.addEventListener("change", function () {
      write("lt-listen:voice", ui.voice.value);
      loadVoices();
      if (playing) restart();
    });

    /* 点目录或正文里的锚点链接时，跟着跳到那一节 */
    window.addEventListener("hashchange", function () {
      if (player.hidden) return;
      var id = decodeURIComponent(window.location.hash.slice(1));
      for (var index = 0; index < items.length; index += 1) {
        if (items[index].el.id === id) {
          goTo(index);
          break;
        }
      }
    });
  }

  function start(article) {
    items = collect(article);
    if (!items.length) return;
    if (!player) build();
    loadVoices();

    /* 从屏幕上能看到的第一段读起 */
    var header = document.querySelector(".md-header");
    var top = header ? header.getBoundingClientRect().bottom : 0;
    pos = 0;
    for (var index = 0; index < items.length; index += 1) {
      if (items[index].el.getBoundingClientRect().bottom > top) {
        pos = index;
        break;
      }
    }
    sub = 0;

    player.hidden = false;
    document.body.classList.add("lt-listening");
    var missing = synth.getVoices().length > 0 && !voices.length;
    hint(missing ? "这台设备上没有找到中文语音，可能读不出来。换用 Safari、Chrome 或 Edge 打开试试。" : "");
    playing = true;
    restart();

    window.clearTimeout(hintTimer);
    hintTimer = window.setTimeout(function () {
      hint("没有声音？这个浏览器可能没有中文语音，换用 Safari、Chrome 或 Edge 打开试试。");
    }, 4000);
  }

  function init() {
    var article = document.querySelector("article.md-typeset");
    var button = article && article.querySelector(".lt-listen");
    if (!button || button.getAttribute("data-ready")) return;
    button.setAttribute("data-ready", "1");
    button.hidden = false;
    button.addEventListener("click", function () {
      start(article);
    });
  }

  /* 上一页没读完的内容不要带到这一页；离开页面时停下 */
  synth.cancel();
  window.addEventListener("pagehide", function () {
    synth.cancel();
  });
  /* 手机锁屏或切到后台时系统会把朗读停掉，回来后把按钮改回「播放」 */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden || !playing) return;
    window.setTimeout(function () {
      if (playing && !synth.speaking && !synth.pending) {
        stop();
        render();
      }
    }, 300);
  });
  if ("onvoiceschanged" in synth) synth.onvoiceschanged = loadVoices;

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(init);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
