/*
 * app.js
 * SurveyCity
 * 2020-11-09
 */

(function () {
  function start() {
    [...document.querySelectorAll(".require-confirmation")].forEach(el => {
      el.addEventListener("click", e => {
        if (!confirm("Are you sure you want to do this?"))
          e.preventDefault();
      });
    });

    [...document.querySelectorAll("[data-copy]")].forEach(el => {
      el.addEventListener("click", async e => {
        e.preventDefault();

        if (typeof el.dataset.copy !== "string")
          return;

        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": new Blob([el.dataset.copy], { type: "text/plain" }),
          }),
        ]);

        const oldContent = el.innerHTML;
        el.innerHTML = "Copied.";
        setTimeout(() => el.innerHTML = oldContent, 1000);
      });
    });
  }

  window.addEventListener("DOMContentLoaded", start);
})();
