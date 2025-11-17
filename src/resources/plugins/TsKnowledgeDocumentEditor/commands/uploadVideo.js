import utils from '@/resources/assets/js/util.js';
export default function heading({ editor, pos, options, https }) {
  const { file } = options || {};
  if (!file) {
    return;
  }
  const uuid = utils.setUuid();
  let editorFocus = editor.chain().focus();
  const uploadUrl = '/api/binary/file/upload';
  const formData = new FormData();
  formData.append('type', 'knowledge');
  formData.append('responseType', 'blob');
  formData.append('param', 'file');
  formData.append('file', file);
  editorFocus.insertVideo({loading: true, uuid: uuid}).run();
  https
    .post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      contentType: 'multipart/form-data'
    }).then((res) => {
      const { Status = 'OK', Return: { url = '' } = {} } = res || {};
      if (Status === 'OK' && url) {
        editorFocus.updateVideo(uuid, { src: url }).run();
      }
    });
}
