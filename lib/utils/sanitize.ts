export function sanitizeHtml(input: string): string {
  if (!input) return ''
  let out = String(input)
  // Drop script/style/iframe/object tags and their content
  out = out.replace(/<\/(script|style|iframe|object)>/gi, '</removed>')
  out = out.replace(/<(script|style|iframe|object)[\s\S]*?>[\s\S]*?<\/removed>/gi, '')
  // Remove event handler attributes like onClick=, onload=, etc.
  out = out.replace(/ on[a-z]+\s*=\s*"[^"]*"/gi, '')
  out = out.replace(/ on[a-z]+\s*=\s*'[^']*'/gi, '')
  out = out.replace(/ on[a-z]+\s*=\s*[^\s>]+/gi, '')
  // Neutralize javascript: urls
  out = out.replace(/javascript:/gi, '')
  return out
}

