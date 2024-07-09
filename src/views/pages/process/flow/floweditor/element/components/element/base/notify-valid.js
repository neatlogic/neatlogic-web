import { $t } from '@/resources/init.js';
const notifyValid = {
  //校验节点名称
  valid: ({ node, graph }) => {
    const validList = [];
    const nodeConfig = node.getData();
    if (nodeConfig?.stepConfig?.notifyPolicyConfig?.isCustom && nodeConfig?.stepConfig?.notifyPolicyConfig?.policyId) {
      // 【通知策略】为自定义通知策略，必填
      validList.push({
        msg: $t('form.validate.required', { target: $t('page.notificationstrategy') }),
        href: '#NoticeSetting'
      });
    }
    return validList;
  }
};
export { notifyValid };
