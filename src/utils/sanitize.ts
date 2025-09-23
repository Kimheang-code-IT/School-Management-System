import DOMPurify from 'dompurify';

export const sanitizeHtml = (value: string) => {
  return DOMPurify.sanitize(value, { USE_PROFILES: { html: true } });
};
