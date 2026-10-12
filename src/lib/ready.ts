// Le site est « prêt » quand l'écran d'ouverture se retire.
// On pose alors data-ready sur <html> : les animations d'entrée du hero (CSS) démarrent.

const listeners = new Set<() => void>();

export function isReady() {
  return typeof document !== "undefined" && document.documentElement.hasAttribute("data-ready");
}

export function markReady() {
  if (isReady()) return;
  document.documentElement.setAttribute("data-ready", "");
  listeners.forEach((cb) => cb());
  listeners.clear();
}

export function onReady(cb: () => void) {
  if (isReady()) {
    cb();
    return () => {};
  }
  listeners.add(cb);
  return () => listeners.delete(cb);
}
