/*
 * 事项清单的勾选：状态存在读者自己的浏览器里（localStorage），不上传。
 * 页面上有任务列表时，在第一个二级标题前加一条进度。
 * 浏览器禁用了本地存储时仍然可以勾选，只是刷新后不保留。
 */
(function () {
  function load(key) {
    try {
      return JSON.parse(window.localStorage.getItem(key) || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  function save(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* 存不了就算了 */
    }
  }

  function init() {
    var article = document.querySelector("article.md-typeset");
    if (!article || article.querySelector(".lt-progress")) return;

    var boxes = article.querySelectorAll(".task-list-item input[type=checkbox]");
    if (!boxes.length) return;

    var key = "lt-checklist:" + window.location.pathname;
    var state = load(key);

    var progress = document.createElement("div");
    progress.className = "lt-progress";
    progress.innerHTML =
      '<div class="lt-progress__bar" role="progressbar" aria-label="清单完成进度" aria-valuemin="0"><span></span></div>' +
      '<div>已完成 <strong></strong> / <span class="lt-progress__total"></span></div>' +
      '<button type="button">清空勾选</button>';

    var bar = progress.querySelector(".lt-progress__bar");
    var fill = bar.querySelector("span");
    var count = progress.querySelector("strong");
    progress.querySelector(".lt-progress__total").textContent = boxes.length;
    bar.setAttribute("aria-valuemax", boxes.length);

    function render() {
      var done = 0;
      boxes.forEach(function (box) {
        if (box.checked) done += 1;
      });
      count.textContent = done;
      fill.style.width = Math.round((done / boxes.length) * 100) + "%";
      bar.setAttribute("aria-valuenow", done);
    }

    boxes.forEach(function (box, index) {
      box.disabled = false;
      box.checked = !!state[index];
      box.addEventListener("change", function () {
        state[index] = box.checked;
        save(key, state);
        render();
      });
    });

    progress.querySelector("button").addEventListener("click", function () {
      state = {};
      save(key, state);
      boxes.forEach(function (box) {
        box.checked = false;
      });
      render();
    });

    var anchor = article.querySelector("h2");
    if (anchor) {
      article.insertBefore(progress, anchor);
    } else {
      article.appendChild(progress);
    }
    render();
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(init);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
