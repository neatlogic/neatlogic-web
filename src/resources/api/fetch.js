const postStream = async(url, param = {}) => {
  const res = await fetch(BASEURLPREFIX + url, {
    method: 'POST',
    headers: {
      'source': 'pc',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(param)
  });
  return res; // 前端自己去读流 res.body.getReader()
};

export default postStream;
