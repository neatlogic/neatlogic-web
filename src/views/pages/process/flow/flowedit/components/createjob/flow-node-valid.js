import { $t } from '@/resources/init.js';
import ViewUI from 'neatlogic-ui/iview/index.js';
const nodeValidConfig = {
  createjob(nodeConfig, d, that) {
    //节点
    let validList = [];
    let nodeData = nodeConfig.stepConfig || {};
    let createJobConfig = nodeData.createJobConfig || {};
    if (!createJobConfig.failPolicy) {
      validList.push({
        name: $t('form.validate.required', { target: $t('page.failurestrategy') }),
        href: '#createJobConfig'
      });
    }
    if (that.$utils.isEmpty(createJobConfig.configList)) {
      validList.push({
        name: $t('form.validate.leastonetarget', { target: $t('term.autoexec.job') }),
        href: '#createJobConfig'
      });
    }
    return validList;
  }
};
export { nodeValidConfig };
