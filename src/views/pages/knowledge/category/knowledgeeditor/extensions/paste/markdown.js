import { Extension } from '@tiptap/core';
import { DOMParser as ProseMirrorDOMParser } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import { marked } from 'marked';

export const PasteMarkdown = Extension.create({
  name: 'pasteMarkdown',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste(view, event) {
            const clipboard = event.clipboardData;
            if (!clipboard) {
              return false;
            }

            const text = clipboard.getData('text/plain') || '';
            const html = clipboard.getData('text/html') || '';
            if (!text.trim() || htmlHasRichContent(html) || !looksLikeMarkdown(text)) {
              return false;
            }

            const markdown = normalizeVideoSyntax(normalizeTaskList(text));
            const container = markdownToDOM(markdown);
            const slice = ProseMirrorDOMParser.fromSchema(view.state.schema).parseSlice(container);

            if (!slice || slice.content.size === 0) {
              return false;
            }

            event.preventDefault();
            view.dispatch(view.state.tr.replaceSelection(slice).scrollIntoView());
            return true;
          }
        }
      })
    ];
  }
});

function htmlHasRichContent(html) {
  if (!html) {
    return false;
  }
  const container = document.createElement('div');
  container.innerHTML = html;
  return !!container.querySelector('h1,h2,h3,h4,h5,h6,ul,ol,blockquote,pre,table,img,a,hr');
}

function looksLikeMarkdown(text) {
  const trimmed = text.trim();
  return [
    /^#{1,6}\s+\S/m,
    /^ {0,3}(?:[-*+]|\d+\.)\s+\S/m,
    /^ {0,3}(?:[-*+]\s*)?\[(?: |x|X)?\]\s+\S/m,
    /^ {0,3}>[ \t]?\S/m,
    /^ {0,3}(?:`{3,}|~{3,})/m,
    /^ {0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/m,
    /!\[[^\]]*]\([^)]+\)/,
    /\[[^\]]+]\([^)]+\)/,
    /^ {0,3}<video\b/i
  ].some(pattern => pattern.test(trimmed));
}

function normalizeTaskList(text) {
  return text.replace(/^(\s*)(?:[-*+]\s*)?\[(x|X| )?]\s+(.+)$/gm, (match, indent, checked, content) => {
    return `${indent}- [${checked && checked.trim() ? 'x' : ' '}] ${content}`;
  });
}

function normalizeVideoSyntax(text) {
  return text.replace(/(^|\n)([ \t]*)@\[(video|\u89c6\u9891)]\(([^)]+)\)/gi, '$1$2[$3]($4)');
}

function markdownToDOM(markdown) {
  const renderer = new marked.Renderer();
  renderer.checkbox = () => '';
  renderer.list = (body, ordered, start) => renderList(body, ordered, start);
  renderer.listitem = (text, task, checked) => {
    if (task) {
      return `<li data-type="taskItem" data-checked="${checked ? 'true' : 'false'}">${normalizeTaskItemContent(text)}</li>`;
    }
    return `<li>${text}</li>`;
  };
  renderer.paragraph = text => {
    if (/^<div\b[^>]*data-block-type="(?:image|video)"[^>]*><\/div>$/.test(text.trim())) {
      return text;
    }
    return `<p>${text}</p>`;
  };
  renderer.html = html => {
    const video = videoHtmlToDOM(html);
    return video ? video.outerHTML : html;
  };
  renderer.link = (href, title, text) => {
    const src = sanitizeUrl(href);
    if (isVideoUrl(src) || isVideoText(text)) {
      return renderVideoBlock({
        src,
        title,
        alt: text
      });
    }
    return renderLink(href, title, text);
  };
  renderer.image = (href, title, text) => {
    if (isLocalImageUrl(href)) {
      return renderMarkdownImageText(href, title, text);
    }
    const src = sanitizeUrl(href);
    if (!src) {
      return escapeHTML(text || '');
    }
    if (isVideoUrl(src) || isVideoText(text)) {
      return renderVideoBlock({
        src,
        title,
        alt: text
      });
    }
    const attrs = {
      'data-block-type': 'image',
      src,
      title,
      alt: text
    };
    const attrText = Object.keys(attrs)
      .filter(key => attrs[key])
      .map(key => `${key}="${escapeAttribute(attrs[key])}"`)
      .join(' ');
    return `<div ${attrText}></div>`;
  };

  const container = document.createElement('div');
  container.innerHTML = marked.parse(markdown, {
    gfm: true,
    breaks: false,
    renderer
  });
  sanitizeDOM(container);
  return container;
}

function renderLink(href, title, text) {
  const src = sanitizeUrl(href);
  if (!src) {
    return escapeHTML(text || '');
  }
  const attrs = {
    href: src,
    title
  };
  const attrText = Object.keys(attrs)
    .filter(key => attrs[key])
    .map(key => `${key}="${escapeAttribute(attrs[key])}"`)
    .join(' ');
  return `<a ${attrText}>${text}</a>`;
}

function renderVideoBlock(attrs = {}) {
  const src = sanitizeUrl(attrs.src);
  if (!src) {
    return escapeHTML(attrs.alt || '');
  }
  const videoAttrs = {
    'data-block-type': 'video',
    src,
    title: attrs.title || attrs.alt,
    width: normalizeSize(attrs.width),
    height: normalizeSize(attrs.height)
  };
  const attrText = Object.keys(videoAttrs)
    .filter(key => videoAttrs[key] !== null && videoAttrs[key] !== undefined && videoAttrs[key] !== '')
    .map(key => `${key}="${escapeAttribute(videoAttrs[key])}"`)
    .join(' ');
  return `<div ${attrText}></div>`;
}

function videoHtmlToDOM(html) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  const video = wrapper.querySelector('video');
  if (!video) {
    return null;
  }
  const source = video.getAttribute('src') || video.querySelector('source')?.getAttribute('src') || '';
  const src = sanitizeUrl(source);
  if (!src) {
    return null;
  }
  const node = document.createElement('div');
  node.setAttribute('data-block-type', 'video');
  node.setAttribute('src', src);
  const width = normalizeSize(video.getAttribute('width') || video.style.width);
  const height = normalizeSize(video.getAttribute('height') || video.style.height);
  if (width) {
    node.setAttribute('width', width);
  }
  if (height) {
    node.setAttribute('height', height);
  }
  return node;
}

function normalizeSize(value) {
  const size = parseInt(value, 10);
  return Number.isFinite(size) && size > 0 ? size : null;
}

function renderList(body, ordered, start) {
  if (ordered) {
    const startAttr = start !== 1 ? ` start="${start}"` : '';
    return `<ol${startAttr}>${body}</ol>`;
  }

  const wrapper = document.createElement('div');
  wrapper.innerHTML = body;
  const items = Array.from(wrapper.children).filter(node => node.tagName === 'LI');
  if (!items.length) {
    return `<ul>${body}</ul>`;
  }

  const groups = [];
  items.forEach(item => {
    const isTask = item.getAttribute('data-type') === 'taskItem';
    const lastGroup = groups[groups.length - 1];
    if (!lastGroup || lastGroup.isTask !== isTask) {
      groups.push({
        isTask,
        body: ''
      });
    }
    groups[groups.length - 1].body += item.outerHTML;
  });

  return groups
    .map(group => group.isTask ? `<ul data-type="taskList">${group.body}</ul>` : `<ul>${group.body}</ul>`)
    .join('');
}

function normalizeTaskItemContent(text) {
  const content = text.trim();
  if (/^<(p|blockquote|pre|ul|ol|div|table)\b/i.test(content)) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = content;
    wrapper.querySelectorAll('p').forEach(paragraph => {
      paragraph.innerHTML = paragraph.innerHTML.trim();
    });
    return wrapper.innerHTML;
  }
  return `<p>${content}</p>`;
}

function sanitizeDOM(root) {
  root.querySelectorAll('script, style, iframe, object, embed, link, meta').forEach(node => node.remove());
  root.querySelectorAll('*').forEach(node => {
    Array.from(node.attributes).forEach(attr => {
      if (/^on/i.test(attr.name)) {
        node.removeAttribute(attr.name);
      } else if (['href', 'src'].includes(attr.name.toLowerCase()) && !sanitizeUrl(attr.value)) {
        node.removeAttribute(attr.name);
      }
    });
  });
}

function sanitizeUrl(value) {
  const url = String(value || '').trim();
  const normalized = url.replace(/[\u0000-\u001F\u007F\s]+/g, '').toLowerCase();
  if (/^(javascript|vbscript):/.test(normalized)) {
    return '';
  }
  if (/^data:/i.test(normalized) && !/^data:image\//i.test(normalized)) {
    return '';
  }
  return url;
}

function isLocalImageUrl(value) {
  const url = String(value || '').trim();
  if (!url) {
    return false;
  }
  if (/^[a-z]:[\\/]/i.test(url) || /^file:/i.test(url)) {
    return true;
  }
  if (/^(data:image\/|blob:|https?:|\/\/)/i.test(url) || /^\/?api\//i.test(url)) {
    return false;
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) {
    return false;
  }
  return true;
}

function renderMarkdownImageText(href, title, text) {
  const titleText = title ? ` "${String(title).replace(/"/g, '\\"')}"` : '';
  return escapeHTML(`![${text || ''}](${href || ''}${titleText})`);
}

function isVideoUrl(value) {
  const url = String(value || '').trim();
  if (!url) {
    return false;
  }
  return /\.(mp4|m4v|webm|ogg|ogv|mov|avi|mkv|flv|f4v|mpg|mpeg|ts|m2ts|mts|wmv|rm|rmvb|3gp|3g2)(?:[?#].*)?$/i.test(url);
}

function isVideoText(value) {
  return /^(video|\u89c6\u9891)$/i.test(String(value || '').trim());
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
