/** 节点附件上传读取独立配置，空值沿用所属节点原有类型；自定义处理器保留大小写。 */
export function getFileTypeHandler(config, handler) {
  const value = config && config.fileTypeHandler;
  const fileTypeHandler = typeof value === 'string' ? value.trim() : '';
  return fileTypeHandler || (handler === 'changecreate' || handler === 'changehandle' ? 'change' : 'itsm');
}
