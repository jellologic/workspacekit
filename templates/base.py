"""Shared HTML document shell."""

from .styles import COMMON_CSS

THEME_INIT_SCRIPT = """\
(function(){
  var t = localStorage.getItem('devpod-theme');
  if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', t);
})();"""

THEME_TOGGLE_HTML = """\
<button class="theme-toggle" onclick="toggleTheme()" title="Toggle light/dark mode">
  <svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
  <svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
</button>"""

THEME_TOGGLE_JS = """\
function toggleTheme(){
  var h=document.documentElement;
  var t=h.getAttribute('data-theme')==='dark'?'light':'dark';
  h.setAttribute('data-theme',t);
  localStorage.setItem('devpod-theme',t);
}"""


def wrap_page(title, body_html, page_css="", page_js="", head_extra=""):
    """Wrap body content in a full HTML document with shared styles."""
    return f"""<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<script>{THEME_INIT_SCRIPT}</script>
<style>
{COMMON_CSS}
{page_css}
</style>
{head_extra}
</head>
<body>
{THEME_TOGGLE_HTML}
{body_html}
<div class="toast" id="toast"></div>
<script>
{THEME_TOGGLE_JS}
{page_js}
</script>
</body>
</html>"""
