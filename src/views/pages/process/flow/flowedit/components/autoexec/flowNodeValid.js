import { $t } from '@/resources/init.js';
const nodeConfigValid = {
  autoexec(nodeConfig, d, that) {
    //自动化节点
    let validList = [];
    let nodeData = nodeConfig.stepConfig || {};
    let autoexecConfig = nodeData.autoexecConfig || {};
    if (nodeConfig.handler === 'autoexec') {
      if (!autoexecConfig.failPolicy) {
        validList.push({
          name: $t('form.validate.required', { target: $t('page.failurestrategy') }),
          href: '#autoexecCombop'
        });
      }
      if (that.$utils.isEmpty(autoexecConfig.configList)) {
        validList.push({
          name: $t('form.validate.leastonetarget', { target: $t('term.autoexec.job') }),
          href: '#autoexecCombop'
        });
      }
    }
    return validList;
  }
};
export { nodeConfigValid };
