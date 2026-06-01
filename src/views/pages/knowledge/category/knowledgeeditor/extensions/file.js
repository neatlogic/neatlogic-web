import { Node, mergeAttributes } from '@tiptap/core';
import downloadMixin from '@/resources/mixins/download.js';

const COMPARE_CLASS_LIST = [
  'knowledge-compare-block',
  'knowledge-compare-insert',
  'knowledge-compare-delete',
  'knowledge-compare-update'
];
const LEGACY_FILE_BLOCK_TYPE = ['insert', 'file'].join('-');
const FILE_DOWNLOAD_URL = '/api/binary/file/download';

const FILE_ICON_CLASS_MAP = {
  bat: 'tsfont-mm-bat',
  bmp: 'tsfont-mm-bmp',
  cls: 'tsfont-mm-cls',
  cmd: 'tsfont-mm-cmd',
  cnf: 'tsfont-mm-cnf',
  css: 'tsfont-mm-css',
  dir: 'tsfont-mm-dir',
  doc: 'tsfont-mm-doc',
  docx: 'tsfont-mm-docx',
  exe: 'tsfont-mm-exe',
  gif: 'tsfont-mm-gif',
  gz: 'tsfont-mm-gzip',
  gzip: 'tsfont-mm-gzip',
  htm: 'tsfont-mm-html',
  html: 'tsfont-mm-html',
  java: 'tsfont-mm-java',
  jpeg: 'tsfont-mm-jpeg',
  jpg: 'tsfont-mm-jpg',
  js: 'tsfont-mm-js',
  misc: 'tsfont-mm-misc',
  mov: 'tsfont-mm-mov',
  mp4: 'tsfont-mm-mp4',
  png: 'tsfont-mm-png',
  ppt: 'tsfont-mm-ppt',
  pptx: 'tsfont-mm-ppt',
  py: 'tsfont-mm-py',
  rar: 'tsfont-mm-rar',
  rpm: 'tsfont-mm-rpm',
  rtf: 'tsfont-mm-rtf',
  sh: 'tsfont-mm-sh',
  sql: 'tsfont-mm-sql',
  svg: 'tsfont-mm-svg',
  tar: 'tsfont-mm-tar',
  txt: 'tsfont-mm-txt',
  vbs: 'tsfont-mm-vbs',
  xls: 'tsfont-mm-xls',
  xlsm: 'tsfont-mm-xlsm',
  xlsx: 'tsfont-mm-xlsx',
  xml: 'tsfont-mm-xml',
  zip: 'tsfont-mm-zip'
};

function getCompareChangeType(attrs = {}) {
  return ['insert', 'delete', 'update'].includes(attrs.compareChangeType) ? attrs.compareChangeType : null;
}

function syncCompareState(element, attrs = {}) {
  const changeType = getCompareChangeType(attrs);
  if (!element) {
    return;
  }
  element.classList.remove(...COMPARE_CLASS_LIST);
  if (changeType) {
    element.dataset.compareChangeType = changeType;
    element.classList.add('knowledge-compare-block', `knowledge-compare-${changeType}`);
  } else {
    delete element.dataset.compareChangeType;
  }
}

function formatFileSize(size) {
  const bytes = Number(size);
  if (!bytes) {
    return '';
  }
  if (bytes < 1024) {
    return `${bytes}B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)}KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)}M`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)}GB`;
}

function getFileExt(attrs = {}) {
  const ext = String(attrs.ext || '').replace(/^\./, '').toLowerCase();
  if (ext) {
    return ext;
  }
  const fileName = String(attrs.name || attrs.pathName || attrs.url || '');
  const match = fileName.match(/\.([^./?#]+)(?:[?#].*)?$/);
  return match ? match[1].toLowerCase() : '';
}

function getFileIconClass(attrs = {}) {
  return `${FILE_ICON_CLASS_MAP[getFileExt(attrs)] || 'tsfont-mm-unknown'} file-card-icon`;
}

function getDownloadFileId(url = '') {
  const value = String(url || '');
  if (!value) {
    return null;
  }
  const query = value.split('#')[0].split('?').slice(1).join('?');
  if (!query) {
    return null;
  }
  const idList = query.split('&').map(param => {
    const [key, ...rest] = param.split('=');
    return key === 'id' ? rest.join('=') : null;
  }).filter(Boolean);
  const id = idList.pop();
  if (!id) {
    return null;
  }
  try {
    return decodeURIComponent(id);
  } catch (error) {
    return id;
  }
}

function getFileId(attrs = {}) {
  return attrs.id || getDownloadFileId(attrs.url);
}

function getFileHref(attrs = {}) {
  const id = getFileId(attrs);
  if (id) {
    return `${FILE_DOWNLOAD_URL}?id=${encodeURIComponent(id)}`;
  }
  return attrs.url || '';
}

function downloadFile(attrs = {}, changeStatus) {
  const id = getFileId(attrs);
  if (!id) {
    return false;
  }
  downloadMixin.methods.download.call({
    downloadSuccess() {},
    downloadError() {}
  }, {
    url: FILE_DOWNLOAD_URL,
    params: { id },
    method: 'post',
    changeStatus
  });
  return true;
}

const File = Node.create({
  name: 'file',
  group: 'block',
  atom: true,
  selectable: false,
  addAttributes() {
    return {
      url: { default: null },
      id: { default: null },
      name: { default: '' },
      size: { default: null },
      sizeText: { default: '' },
      ext: { default: '' },
      contentType: { default: '' },
      actionType: { default: '' },
      path: { default: '' },
      pathName: { default: '' },
      policyLimit: { default: null },
      startPage: { default: null },
      type: { default: '' },
      typeText: { default: '' },
      uploadTime: { default: null },
      userUuid: { default: '' },
      loading: { default: false },
      error: { default: false },
      recordUuid: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-record-uuid'),
        renderHTML: (attributes) => ({ 'data-record-uuid': attributes['recordUuid'] })
      }
    };
  },
  parseHTML() {
    return [
      { tag: 'div[data-block-type="file"]' },
      { tag: `div[data-block-type="${LEGACY_FILE_BLOCK_TYPE}"]` }
    ];
  },
  renderHTML({ HTMLAttributes }) {
    const { url, name, size, sizeText, loading, error } = HTMLAttributes;
    const title = name || HTMLAttributes.pathName || url || '';
    const href = loading || error ? '' : getFileHref(HTMLAttributes);
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-block-type': 'file',
        'data-block-uuid': HTMLAttributes['data-block-uuid']
      }),
      [
        'a',
        {
          href,
          download: title,
          class: 'file-card-link'
        },
        ['span', { class: getFileIconClass(HTMLAttributes) }],
        ['span', { class: 'file-card-name' }, title],
        ['span', { class: 'file-card-size' }, sizeText || formatFileSize(size)]
      ]
    ];
  },
  addCommands() {
    return {
      file: (options) => ({ commands }) => {
        const { position, ...restAttrs } = options || {};
        return commands.insertContentAt(position, {
          type: this.name,
          attrs: {
            ...(restAttrs || {})
          }
        });
      },
      updateFile: (options) => ({ tr }) => {
        const { recordUuid, ...newAttrs } = options || {};
        tr.doc.descendants((node, pos) => {
          if (node.type.name === this.name && node.attrs['recordUuid'] === recordUuid) {
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...newAttrs });
          }
        });
        return true;
      }
    };
  },
  addNodeView() {
    return ({ node }) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'file-block';
      wrapper.contentEditable = 'false';
      wrapper.dataset.blockType = 'file';
      wrapper.dataset.recordUuid = node.attrs['recordUuid'];
      wrapper.dataset.blockUuid = node.attrs['blockUuid'];

      const link = document.createElement('a');
      link.className = 'file-card-link';

      const icon = document.createElement('span');
      icon.className = getFileIconClass(node.attrs);

      const content = document.createElement('span');
      content.className = 'file-card-content';

      const name = document.createElement('span');
      name.className = 'file-card-name';

      const meta = document.createElement('span');
      meta.className = 'file-card-meta';
      let currentAttrs = { ...node.attrs };
      let isDownloading = false;

      const handleDownload = event => {
        if (currentAttrs.loading || currentAttrs.error) {
          event.preventDefault();
          return;
        }
        if (!getFileId(currentAttrs)) {
          return;
        }
        event.preventDefault();
        if (isDownloading) {
          return;
        }
        downloadFile(currentAttrs, status => {
          if (status === 'start') {
            isDownloading = true;
            wrapper.classList.add('is-downloading');
          } else if (status === 'success' || status === 'error') {
            isDownloading = false;
            wrapper.classList.remove('is-downloading');
          }
        });
      };

      content.appendChild(name);
      content.appendChild(meta);
      link.appendChild(icon);
      link.appendChild(content);
      wrapper.appendChild(link);
      link.addEventListener('click', handleDownload);

      const syncFileState = (attrs = {}) => {
        currentAttrs = { ...attrs };
        syncCompareState(wrapper, attrs);
        const fileName = attrs.name || attrs.pathName || attrs.url || '';
        icon.className = getFileIconClass(attrs);
        name.textContent = fileName;
        name.title = fileName;
        if (attrs.loading) {
          meta.textContent = '上传中...';
          link.removeAttribute('href');
          link.removeAttribute('download');
          wrapper.classList.add('is-loading');
          wrapper.classList.remove('is-error');
        } else if (attrs.error) {
          meta.textContent = '上传失败';
          link.removeAttribute('href');
          link.removeAttribute('download');
          wrapper.classList.add('is-error');
          wrapper.classList.remove('is-loading');
        } else {
          meta.textContent = formatFileSize(attrs.size);
          meta.textContent = attrs.sizeText || meta.textContent;
          const href = getFileHref(attrs);
          if (href) {
            link.href = href;
            link.download = fileName;
          } else {
            link.removeAttribute('href');
            link.removeAttribute('download');
          }
          wrapper.classList.remove('is-loading', 'is-error');
        }
      };

      syncFileState(node.attrs);

      return {
        dom: wrapper,
        update(updatedNode) {
          if (updatedNode.type.name !== 'file') return false;
          node = updatedNode;
          syncFileState(node.attrs);
          return true;
        },
        destroy() {
          link.removeEventListener('click', handleDownload);
        }
      };
    };
  }
});

export default File;
