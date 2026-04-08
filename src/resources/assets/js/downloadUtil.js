export function parseContentDispositionFileName(contentDisposition, defaultFileName = 'download') {
  if (!contentDisposition) {
    return defaultFileName;
  }

  const match = contentDisposition.match(/(?:filename|fileName)\s*=\s*([^;]+)/i);
  if (!match) {
    return defaultFileName;
  }

  let fileName = (match[1] || '').trim();
  if (
    (fileName.startsWith('"') && fileName.endsWith('"')) ||
    (fileName.startsWith('\'') && fileName.endsWith('\''))
  ) {
    fileName = fileName.slice(1, -1).trim();
  }

  if (!fileName) {
    return defaultFileName;
  }

  try {
    return decodeURIComponent(fileName);
  } catch (e) {
    try {
      return decodeURI(fileName);
    } catch (error) {
      return fileName;
    }
  }
}

export function downloadBlobFile(data, options = {}) {
  const { contentDisposition = '', defaultFileName = 'download', type = 'application/x-msdownload' } = options;
  const aLink = document.createElement('a');
  const blob = new Blob([data], { type });
  const objectUrl = URL.createObjectURL(blob);

  aLink.href = objectUrl;
  aLink.download = parseContentDispositionFileName(contentDisposition, defaultFileName);
  document.body.appendChild(aLink);
  aLink.click();
  aLink.remove();
  URL.revokeObjectURL(objectUrl);
}
