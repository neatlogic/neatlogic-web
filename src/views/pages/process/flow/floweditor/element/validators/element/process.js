import utils from '@/resources/assets/js/util.js';
import { $t } from '@/resources/init.js';
export default {
  type: 'process',
  valid(nodeConfig, graph) {
    //公共校验方法  校验名称
    let validList = this.poliyUser(nodeConfig, d, that) || [];
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
    if (nodeConfig && nodeConfig.stepConfig && nodeConfig.stepConfig.notifyPolicyConfig && nodeConfig.stepConfig.notifyPolicyConfig.isCustom && that.$utils.isEmpty(nodeConfig.stepConfig.notifyPolicyConfig.policyId)) {
      // 【通知策略】为自定义通知策略，必填
      validList.push({
        name: $t('form.validate.required', { target: $t('page.notificationstrategy') }),
        href: '#NoticeSetting'
      });
    }
    return validList;
  }
};
