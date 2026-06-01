import utils from '@/resources/assets/js/util.js';
export default function video({ editor, position, options, https }) {
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
  editor.chain().focus().video({recordUuid: uuid, position: insertPosition}).run();
  https
    .post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      contentType: 'multipart/form-data'
    }).then((res) => {
      const { Status = 'OK', Return: { url = '' } = {} } = res || {};
      if (Status === 'OK' && url) {
        editor.chain().focus().updateVideo({ recordUuid: uuid, position: insertPosition, src: url, loading: false }).run();
      }
    }).catch(() => {});
}
