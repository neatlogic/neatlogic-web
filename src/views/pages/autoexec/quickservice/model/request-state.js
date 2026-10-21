// 每个通道只允许最后一次请求提交；失效后连旧 finally 也不能改变加载状态。
export function createRequestState() {
  let alive = true;
  const versions = {};
  return {
    begin(channel) {
      const version = versions[channel] = (versions[channel] || 0) + 1;
      return () => alive && versions[channel] === version;
    },
    invalidate() {
      alive = false;
    }
  };
}
