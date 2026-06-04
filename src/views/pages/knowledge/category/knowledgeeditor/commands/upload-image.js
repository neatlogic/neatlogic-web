function normalizeInternalResourceUrl(url = '') {
  const value = String(url || '');
  if (!value || /^(data:|blob:|mailto:|tel:|#)/i.test(value) || /^api\//i.test(value)) {
    return value;
  }

  if (value.indexOf('/api/') === 0) {
    return value.slice(1);
  }

  try {
    const parsedUrl = new URL(value, document.baseURI);
    if (parsedUrl.origin !== window.location.origin) {
      return value;
    }

    const apiIndex = parsedUrl.pathname.indexOf('/api/');
    if (apiIndex > -1) {
      return parsedUrl.pathname.slice(apiIndex + 1) + parsedUrl.search + parsedUrl.hash;
    }
  } catch (e) {
    return value;
  }

  return value;
}

export default function uploadImage({ editor, position, options, https }) {
  const { file } = options || {};
  const { insertPosition } = position || {};
  if (!file || insertPosition == null) {
    return;
  }
  const uploadUrl = '/api/binary/file/upload';
  const formData = new FormData();
  formData.append('type', 'knowledge');
  formData.append('responseType', 'blob');
  formData.append('param', 'file');
  formData.append('file', file);
  https
    .post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      contentType: 'multipart/form-data'
    }).then((res) => {
      const { Status = 'OK', Return: { url = '' } = {} } = res || {};
      if (Status === 'OK' && url) {
        editor
          .chain()
          .focus()
          .insertContentAt(insertPosition, { type: 'image', attrs: { src: normalizeInternalResourceUrl(url) } })
          .run();
      }
    }).catch(() => {});
}
