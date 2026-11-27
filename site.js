const field = document.querySelector('#docs-search');
const results = document.querySelector('#search-results');
const status = document.querySelector('#search-status');
const base = new URL('./', document.querySelector('link[rel="stylesheet"]').href);
let index;
field.addEventListener('input', async () => {
  const query = field.value.trim().toLowerCase();
  results.replaceChildren();
  results.hidden = !query;
  status.textContent = '';
  if (!query) return;
  try {
    index ??= fetch(new URL('search-index.json', base)).then((response) => {
      if (!response.ok) throw new Error('Search unavailable');
      return response.json();
    });
    const pages = await index;
    if (field.value.trim().toLowerCase() !== query) return;
    const terms = query.split(/\s+/);
    const matches = pages
      .filter((page) => terms.every((term) => (page.title + ' ' + page.text).toLowerCase().includes(term)))
      .slice(0, 8);
    status.textContent = matches.length ? matches.length + ' 条结果' : '没有找到结果，试试“联动”或“配置”。';
    for (const page of matches) {
      const anchor = document.createElement('a');
      anchor.href = page.href;
      anchor.textContent = page.title;
      results.append(anchor);
    }
  } catch {
    index = undefined;
    status.textContent = '搜索暂不可用，请使用下方目录。';
  }
});
field.closest('form').addEventListener('submit', (event) => event.preventDefault());
field.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    field.value = '';
    field.dispatchEvent(new Event('input'));
  }
});
document.querySelector('#copy-install').addEventListener('click', async () => {
  const message = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText('npm i forminojs');
    message.textContent = '已复制';
  } catch {
    message.textContent = '请手动复制上方命令';
  }
});
