export default function heading({ editor, pos, options, https }) {
  const { file } = options || {};
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
          .setImage({ src: url })
          .run();
      }
    });
}
