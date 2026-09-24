/* Titik masuk aplikasi */
(function (A) {
  A.acts.back = () => A.back();
  A.Store.load();
  A.Store.tick();
  A.render();
  setInterval(() => A.tickCountdowns(), 1000);
  setInterval(() => { if (A.Store.tick() && !A.$('#modal')) A.render(); }, 5000);
})(window.App);
