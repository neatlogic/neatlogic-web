export default function uploadImage({ editor, position, options, https }) {
  const { file } = options || {};
  const { insertPosition } = position || {};
  if (!file) {
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
          .insertContentAt(insertPosition, { type: 'image', attrs: {src: url} })
          .run();
      }
    });
}
