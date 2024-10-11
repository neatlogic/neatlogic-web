import utils from '@/resources/assets/js/util.js';
import { $t } from '@/resources/init.js';
const nameValid = {
  //校验节点名称
  valid: ({ node, graph }) => {
    const validList = [];
    const nodeConfig = node.getData();
    if (!nodeConfig.name) {
      validList.push({
        msg: $t('form.validate.required', { target: $t('term.process.nodename') }),
        href: '#nodeName'
      });
    }
    if (!utils.nameRegularValid(nodeConfig.name)) {
      validList.push({
        msg: $t('节点名称仅支持汉字、字母、数字和特殊字符(._-)'),
        href: '#nodeName'
      });
    }
    return validList;
  }
};
export { nameValid };
