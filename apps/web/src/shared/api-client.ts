const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'
).replace(/\/+$/, '');

const usesNgrokFreeTunnel = (() => {
  try {
    return new URL(apiBaseUrl, window.location.origin).hostname.endsWith('.ngrok-free.dev');
  } catch {
    return false;
  }
})();

export function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);

  // ngrok Free trả một trang cảnh báo HTML cho request từ trình duyệt nếu
  // không có header này. Chỉ gửi header khi API thật sự đi qua tunnel ngrok.
  if (usesNgrokFreeTunnel) {
    headers.set('ngrok-skip-browser-warning', '1');
  }

  return fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: init.credentials ?? 'include',
    headers,
  });
}
