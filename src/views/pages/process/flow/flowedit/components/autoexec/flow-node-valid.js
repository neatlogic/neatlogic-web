import { $t } from '@/resources/init.js';
import ViewUI from 'neatlogic-ui/iview/index.js';
const nodeValidConfig = {
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
const lineValidConfig = {
  connectBackward: {
    eoa(handler, that) {
      let isValid = true;
      if (handler == 'eoa') {
        if ((that.getNextNodes('backward') && that.getNextNodes('backward').length > 0) || (that.getNextNodes('forward') && that.getNextNodes('forward').length > 1)) {
          ViewUI.Message.warning({ content: $t('message.process.eoalinkouttip'), duration: 3, closable: true });

          isValid = false;
        }
      }
      return isValid;
    }
  },
  connectForward: {
    eoa(handler, that) {
      let isValid = true;
      if (handler == 'eoa') {
        if ((that.getNextNodes('forward') && that.getNextNodes('backward').length > 0) || that.getNextNodes('forward').length > 1) {
          ViewUI.Message.warning({ content: $t('message.process.eoalinkouttip'), duration: 3, closable: true });
          isValid = false;
        }
      }
      return isValid;
    }
  }
};
export { nodeValidConfig, lineValidConfig };
