(function () {
  function centerActivePageTab() {
    const switcher = document.querySelector(".page-switcher");
    const activeTab = switcher?.querySelector(".module-button.is-active");

    if (!switcher || !activeTab) return;
    if (switcher.scrollWidth <= switcher.clientWidth) return;

    const targetLeft = activeTab.offsetLeft + activeTab.offsetWidth / 2 - switcher.clientWidth / 2;
    const maxLeft = switcher.scrollWidth - switcher.clientWidth;
    const nextLeft = Math.max(0, Math.min(targetLeft, maxLeft));

    switcher.scrollTo({ left: nextLeft, behavior: "auto" });
  }

  function scheduleActivePageTabCentering() {
    window.requestAnimationFrame(centerActivePageTab);
    window.setTimeout(centerActivePageTab, 120);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleActivePageTabCentering, { once: true });
  } else {
    scheduleActivePageTabCentering();
  }

  window.addEventListener("load", centerActivePageTab, { once: true });
})();
