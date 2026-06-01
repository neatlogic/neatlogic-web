import utils from '@/resources/assets/js/util.js';

function normalizeDownloadUrl(url) {
  const value = String(url || '');
  if (/^(https?:)?\/\//.test(value) || /^(blob|data):/.test(value) || value.startsWith('/')) {
    return value;
  }
  if (value) {
    return `/${value.replace(/^\/+/, '')}`;
  }
  return '';
}

export default function file({ editor, position, options, https }) {
  const { file } = options || {};
  const { insertPosition } = position || {};
  if (!file || insertPosition == null) {
    return;
  }
  const uploadUrl = '/api/binary/file/upload';
  const uuid = utils.setUuid();
  const formData = new FormData();
  formData.append('type', 'knowledge');
  formData.append('responseType', 'blob');
  formData.append('param', 'file');
  formData.append('file', file);
  editor.chain().focus().file({
    recordUuid: uuid,
    position: insertPosition,
    name: file.name,
    size: file.size,
    loading: true
  }).run();
  https
    .post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      contentType: 'multipart/form-data'
    }).then((res) => {
      const { Status = 'OK', Return: fileInfo = {} } = res || {};
      const { id = null, name = file.name, size = file.size, ext = '', sizeText = '' } = fileInfo || {};
      const url = normalizeDownloadUrl(fileInfo?.url);
      if (Status === 'OK' && url) {
        editor.chain().focus().updateFile({
          recordUuid: uuid,
          url,
          id,
          name,
          size,
          ext,
          sizeText,
          loading: false,
          error: false
        }).run();
      } else {
        editor.chain().focus().updateFile({ recordUuid: uuid, loading: false, error: true }).run();
      }
    }).catch(() => {
      editor.chain().focus().updateFile({ recordUuid: uuid, loading: false, error: true }).run();
    });
}
