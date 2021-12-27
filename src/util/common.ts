export function epochSeconds() {
  return Math.floor(Date.now() / 1000);
}

export function debounce(func: () => void, timeout = 500) {
  var timer: NodeJS.Timeout;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func();
    }, timeout);
  };
}
