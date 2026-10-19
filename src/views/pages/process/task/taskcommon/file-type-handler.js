/** 节点附件只读取步骤平级字段，空值沿用原类型，不回退到旧 config；自定义名称保留大小写。 */
export function getFileTypeHandler(step, handler) {
  const value = step && step.fileTypeHandler;
  const fileTypeHandler = typeof value === 'string' ? value.trim() : '';
  return fileTypeHandler || (handler === 'changecreate' || handler === 'changehandle' ? 'change' : 'itsm');
}
