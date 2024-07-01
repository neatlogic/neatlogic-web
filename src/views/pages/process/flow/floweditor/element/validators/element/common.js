import utils from '@/resources/assets/js/util.js';
import { $t } from '@/resources/init.js';
import { ElementFactory } from '@/views/pages/process/flow/floweditor/element/core/ElementFactory.js';
const validAssign = {
  valid: ({ nodeConfig, graph }) => {
    const validList = [];
    const nodeData = nodeConfig.stepConfig || {};
    if (nodeConfig.handler === 'start') {
      //如果是开始节点
      return validList;
    }
    const element = graph.getCellById(nodeConfig.uuid);
    if (element && element.getProp('setting') && element.getProp('setting').assignable) {
      //需要分配处理人的节点才需要校验
      if (!nodeData || !nodeData.workerPolicyConfig) {
        validList.push({
          name: $t('form.validate.required', { target: $t('term.process.poliyuser') }),
          href: '#assignData'
        });
        validList.push({
          name: $t('form.validate.required', { target: $t('term.process.erroruser') }),
          href: '#assignData'
        });
      }

      if (nodeData && nodeData.workerPolicyConfig && nodeData.workerPolicyConfig.policyList) {
        let policyList = nodeData.workerPolicyConfig.policyList;
        let isChecked = policyList && policyList.find(p => p.isChecked === 1) ? 1 : 0; //判断分配处理人是否有选中的项
        let errorText = $t('form.validate.required', { target: $t('term.process.poliyuser') });
        if (isChecked) {
          let keyConfig = {
            prestepassign: { value: 'processStepList', text: $t('term.process.prestepassignvalid') }, //由前置步骤处理人指定
            copy: { value: 'processStepUuid', text: $t('term.process.copyworkerpolicyvalid') }, //复制前置步骤处理人
            form: { value: 'attributeUuidList', text: $t('term.process.formworkerpolicyvalid') }, //表单值
            assign: { value: 'workerList', text: $t('term.process.assignworkerpolicyvalid') } //自定义
          };
          for (let i = 0; i < policyList.length; i++) {
            if (policyList[i].isChecked == 1) {
              let type = policyList[i].type;
              if (keyConfig[type]) {
                let value = keyConfig[type].value;
                if (type == 'form' && policyList[i].config.attributeUuidList) {
                  if (that.allFormitemList && that.allFormitemList.length > 0) {
                    if (Array.isArray(policyList[i].config.attributeUuidList) && policyList[i].config.attributeUuidList.length > 0) {
                      let newPolicyListAttributeUuid = [];
                      policyList[i].config.attributeUuidList.forEach(item => {
                        let formItem = that.allFormitemList.find(f => f.uuid == item);
                        formItem && newPolicyListAttributeUuid.push(item);
                      });
                      newPolicyListAttributeUuid.length == 0 && (policyList[i].config.attributeUuidList = []);
                    }
                  } else {
                    policyList[i].config.attributeUuidList = [];
                  }
                }
                if (type === 'prestepassign' && !utils.isEmpty(policyList[i].config[value])) {
                  for (let p = 0; p < policyList[i].config[value].length; p++) {
                    if (!policyList[i].config[value][p].uuid) {
                      isChecked = 0;
                      errorText = keyConfig[type].text;
                      break;
                    }
                  }
                } else if (utils.isEmpty(policyList[i].config[value])) {
                  isChecked = 0;
                  errorText = keyConfig[type].text;
                  break;
                }
              } else if (policyList[i].type === 'automatic') {
                //分派器
                if (policyList[i].config.handler && policyList[i].config.handler != '') {
                  if (policyList[i].config.handlerConfig != {}) {
                    let newObj = that.automaticList.find(d => d.handler === policyList[i].config.handler);
                    if (newObj && newObj.isHasForm && newObj.config) {
                      let automaticDeal = newObj.config;
                      automaticDeal.forEach(item => {
                        if (item.type == 'formselect' && policyList[i].config.handlerConfig[item.name]) {
                          let findFormitem = that.allFormitemList.find(f => f.uuid == policyList[i].config.handlerConfig[item.name]);
                          if (!findFormitem) {
                            policyList[i].config.handlerConfig[item.name] = null;
                          }
                        }
                      });
                    }
                    let row = policyList[i].config.handlerConfig;
                    for (let key in row) {
                      if (row.hasOwnProperty(key)) {
                        let val = row[key];
                        let handler = policyList[i].config.handler;
                        let dispatcherName = this.handleDispatcherName(handler) || '';
                        if (!that.$utils.isEmpty(dispatcherValid) && !that.$utils.isEmpty(dispatcherValid[dispatcherName]) && dispatcherValid[dispatcherName](that, handler, key, val)) {
                          isChecked = 0;
                          errorText = $t('term.process.assignconfigvalid');
                          break;
                        }
                      }
                    }
                  }
                } else {
                  isChecked = 0;
                  break;
                }
              }
            }
          }
        }

        if (isChecked == 0) {
          validList.push({
            name: errorText,
            href: '#assignData'
          });
        }
        if (!nodeData.workerPolicyConfig.defaultWorker || nodeData.workerPolicyConfig.defaultWorker == '') {
          validList.push({
            name: $t('form.validate.required', { target: $t('term.process.erroruser') }),
            href: '#assignData'
          });
        }
      }
    }

    return validList;
  }
};
export { validAssign };
