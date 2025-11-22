const normalizeUrl = (url) => {
  if (!url) return '';
  return url.endsWith('/') ? url : url + '/';
};

export const FRONT_END_HOST = import.meta.env.VITE_FRONT_END_HOST;
export const FRONT_END_DOMAIN = import.meta.env.VITE_FRONT_END_HOST.split(":")[0];
export const PROTOCOL = import.meta.env.VITE_PROTOCOL;

export const BACKEND_BASE_URL = normalizeUrl(import.meta.env.VITE_BE_URL);
