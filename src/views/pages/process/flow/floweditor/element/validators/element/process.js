import utils from '@/resources/assets/js/util.js';
import { $t } from '@/resources/init.js';
import { validAssign } from './common.js';
export default {
  type: 'process',
  //nodeConfig:节点数据，page:页面，可以直接调用page中的methods
  valid({ nodeConfig, page, graph }) {
    const validList = [];
    if (!nodeConfig.name) {
      validList.push({
        name: $t('form.validate.required', { target: $t('term.process.nodename') }),
        href: '#nodeName'
      });
    }
    if (!utils.nameRegularValid(nodeConfig.name)) {
      validList.push({
        name: $t('term.process.noderultvalid'),
        href: '#nodeName'
      });
    }
    if (nodeConfig?.stepConfig?.notifyPolicyConfig?.isCustom && nodeConfig?.stepConfig?.notifyPolicyConfig?.policyId) {
      // 【通知策略】为自定义通知策略，必填
      validList.push({
        name: $t('form.validate.required', { target: $t('page.notificationstrategy') }),
        href: '#NoticeSetting'
      });
    }
    //校验分配设置
    validList.push(...validAssign.valid({ nodeConfig, graph }));
    return validList;
  }
};
