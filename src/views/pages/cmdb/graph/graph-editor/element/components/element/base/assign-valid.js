import utils from '@/resources/assets/js/util.js';
import { $t } from '@/resources/init.js';
import ComponentManager from '@/resources/import/component-manager.js';
const dispatcherValid = ComponentManager.getDispatcherValidComponent();
const assignValid = {
  //校验节点分派策略
  valid: ({ node, graph, view }) => {
    const validList = [];
    const nodeData = node.getData()['stepConfig'] || {};
    if (node && node.getProp('setting') && node.getProp('setting').assignable) {
      //需要分配处理人的节点才需要校验
      if (!nodeData || !nodeData.workerPolicyConfig) {
        validList.push({
          type: 'error',
          msg: $t('form.validate.required', { target: $t('term.process.poliyuser') }),
          href: '#assignData'
        });
        validList.push({
          type: 'error',
          msg: $t('form.validate.required', { target: $t('term.process.erroruser') }),
          href: '#assignData'
        });
      }

      if (nodeData && nodeData.workerPolicyConfig && nodeData.workerPolicyConfig.policyList) {
        const allPreNodes = view.getAllPrevNodes(node);
        const preNodeUuidList = allPreNodes.map(i => i.id);
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
                  if (view.allFormitemList && view.allFormitemList.length > 0) {
                    if (Array.isArray(policyList[i].config.attributeUuidList) && policyList[i].config.attributeUuidList.length > 0) {
                      let newPolicyListAttributeUuid = [];
                      policyList[i].config.attributeUuidList.forEach(item => {
                        let formItem = view.allFormitemList.find(f => f.uuid == item);
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
                    let obj = policyList[i].config[value][p];
                    if (obj.uuid && !preNodeUuidList.includes(obj.uuid)) {
                      view.$set(obj, 'uuid', '');
                    }
                    if (!utils.isEmpty(obj.condition)) {
                      //前置步骤可选的路径节点
                      const currPreNode = graph.getCellById(obj.uuid);
                      const currPreNodeUuidList = view.getNextNodes(currPreNode).map(i => i.id);
                      const condition = utils.intersectionArr(currPreNodeUuidList, obj.condition);
                      view.$set(obj, 'condition', condition);
                    }
                    if (!obj.uuid) {
                      isChecked = 0;
                      errorText = keyConfig[type].text;
                    }
                  }
                } else if (type === 'copy' && policyList[i].config[value]) {
                  //复制前置步骤处理人，判断是否包含前置步骤
                  if (!preNodeUuidList.includes(policyList[i].config[value])) {
                    policyList[i].config[value] = '';
                    isChecked = 0;
                    errorText = keyConfig[type].text;
                    break;
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
                    let newObj = view.automaticList.find(d => d.handler === policyList[i].config.handler);
                    if (newObj && newObj.isHasForm && newObj.config) {
                      let automaticDeal = newObj.config;
                      automaticDeal.forEach(item => {
                        if (item.type == 'formselect' && policyList[i].config.handlerConfig[item.name]) {
                          let findFormitem = view.allFormitemList.find(f => f.uuid == policyList[i].config.handlerConfig[item.name]);
                          if (!findFormitem) {
                            policyList[i].config.handlerConfig[item.name] = null;
                          }
                        }
                      });
                    }
                    let row = policyList[i].config.handlerConfig;
                    for (let key in row) {
                      if (row.hasOwnProperty(key)) {
                        const val = row[key];
                        const handler = policyList[i].config.handler;
                        const arr = (handler && handler.split('.')) || [];
                        const dispatcherName = arr[arr.length - 1] || '';
                        if (!utils.isEmpty(dispatcherValid) && !utils.isEmpty(dispatcherValid[dispatcherName]) && dispatcherValid[dispatcherName](view, handler, key, val)) {
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
            type: 'error',
            msg: errorText,
            href: '#assignData'
          });
        }
        if (!nodeData.workerPolicyConfig.defaultWorker || nodeData.workerPolicyConfig.defaultWorker == '') {
          validList.push({
            type: 'error',
            msg: $t('form.validate.required', { target: $t('term.process.erroruser') }),
            href: '#assignData'
          });
        }
      }
    }

    return validList;
  }
};
export { assignValid };
