/* Titik masuk aplikasi */
(function (A) {
  A.acts.back = () => A.back();
  A.Store.load();
  if (A.Store.data && A.Store.data.session) {
    A.Store.syncProblemsFromBackend().catch(() => {});
  }
  A.Store.tick();
  A.render();
  setInterval(() => A.tickCountdowns(), 1000);
  setInterval(() => { if (A.Store.tick() && !A.$('#modal')) A.render(); }, 5000);
})(window.App);
