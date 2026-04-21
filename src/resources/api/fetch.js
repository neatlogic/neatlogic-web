const postStream = async(url, param = {}, options = {}) => {
  const res = await fetch(BASEURLPREFIX + url, {
    method: 'POST',
    headers: {
      'source': 'pc',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(param),
    signal: options.signal
  });
  return res; // 前端自己去读流 res.body.getReader()
};

export default postStream;
