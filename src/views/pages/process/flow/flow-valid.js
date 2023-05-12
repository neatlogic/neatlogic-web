import utils from '@/resources/assets/js/util.js';
import {$t} from '@/resources/init.js';
let valid = {
  common(nodeConfig, d, that) { //公共校验方法  校验名称
    let validList = this.poliyUser(nodeConfig, d, that) || [];
    if (!nodeConfig.name) {
      validList.push({
        name: $t('form.validate.required', { target: $t('term.process.nodename') }),
        href: '#nodeName'
      });
    }
    if (!that.$utils.nameRegularValid(nodeConfig.name)) {
      validList.push({
        name: $t('term.process.noderultvalid'),
        href: '#nodeName'
      });
    }
    return validList; 
  },
  poliyUser(nodeConfig, d, that) { //分派处理人校验
    // 分派处理人校验
    let validList = [];
    let nodeData = nodeConfig.stepConfig || {};
    let parentNodes = d.getPrevNodes();
    let isStart = parentNodes.find(d => {
      return d.getConfig() && d.getConfig().handler === 'start'; 
    });
    if (isStart) { //如果是开始节点
      return validList;
    }
    let extendsHandlerList = ['condition', 'distributary', 'changehandle', 'timer'];
    if (!nodeData.workerPolicyConfig && extendsHandlerList.indexOf(nodeConfig.handler) < 0) { //分派处理人必填
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
      let isChecked = policyList && policyList.find(p => p.isChecked == 1) ? 1 : 0; //判断分配处理人是否有选中的项
      let errorText = $t('form.validate.required', { target: $t('term.process.poliyuser') });
      if (isChecked) {
        let keyConfig = {
          'prestepassign': { value: 'processStepUuidList', text: $t('term.process.prestepassignvalid')}, //由前置步骤处理人指定
          'copy': { value: 'processStepUuid', text: $t('term.process.copyworkerpolicyvalid') }, //复制前置步骤处理人
          'form': { value: 'attributeUuidList', text: $t('term.process.formworkerpolicyvalid') }, //表单值
          'assign': { value: 'workerList', text: $t('term.process.assignworkerpolicyvalid') }//自定义
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
              if (utils.isEmpty(policyList[i].config[value])) {
                isChecked = 0;
                errorText = keyConfig[type].text;
                break;
              } 
            } else if (policyList[i].type == 'automatic') { //分派器
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
                      if (that.$utils.isEmpty(val)) {
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
    return validList;
  },
  omnipotent(nodeConfig, d, that) { //通用节点
    let validList = [];
    return validList;
  },
  automatic(nodeConfig, d, that) { //auto 自动处理节点校验
    let validList = [];
    let nodeData = nodeConfig.stepConfig || {};
    if (nodeConfig.handler === 'automatic') {
      if (!nodeData.automaticConfig || !nodeData.automaticConfig.requestConfig.integrationUuid) {
        validList.push({
          name: $t('form.validate.required', { target: $t('term.process.externalcall')}),
          href: '#requestIntegration'
        });
      }
      if (!nodeData.automaticConfig || !nodeData.automaticConfig.requestConfig.failPolicy) {
        validList.push({
          name: $t('form.validate.required', { target: $t('page.failurestrategy')}),
          href: '#failPolicy'
        });
      }
      if (nodeData.automaticConfig && nodeData.automaticConfig.callbackConfig && nodeData.automaticConfig.callbackConfig.type == 'interval') {
        let callbackConfig = nodeData.automaticConfig.callbackConfig.config;
        if (callbackConfig) {
          if (!callbackConfig.integrationUuid) {
            validList.push({
              name: $t('form.validate.required', { target: $t('term.process.externalcall') }),
              href: '#callbackintegration'
            });
          }
          if (!callbackConfig.interval) {
            validList.push({
              name: $t('form.validate.required', { target: $t('page.timeinterval') }),
              href: '#callbackInterval'
            });
          }
        }
      }
    }
    return validList; 
  },
  changecreate(nodeConfig, d, that) { //变更创建的校验
    let validList = [];
    let nodeData = nodeConfig.stepConfig || {};
    if (nodeConfig.handler === 'changecreate') {
      let allNextNodes = d.getAllNextNodes();
      let haveChangehandle = allNextNodes.filter(p => p.getConfig() && p.getConfig().handler === 'changehandle');
      if (haveChangehandle.length == 0) {
        validList.push({
          name: $t('term.process.changeexistinpairsvalid') 
        });
      } else {
        let selectChangeList = haveChangehandle.filter(c => {
          let config = that.stepList.find(item => item.uuid == c.getUuid());
          return config.stepConfig.linkedChange && config.stepConfig.linkedChange == nodeConfig.uuid; 
        });
        if (selectChangeList.length == 0) {
          validList.push({
            name: $t('term.process.notselectchangelistvalid') 
          });
        } else if (selectChangeList.length > 1) {
          validList.push({
            name: $t('term.process.changeonlyonerelvalid')
          });
        }
      }
    }
    return validList; 
  },
  changehandle(nodeConfig, d, that) { //变更处理的校验
    let validList = [];
    let nodeData = nodeConfig.stepConfig || {};
    let allPrevNodes = d.getAllPrevNodes();
    if (nodeConfig.handler === 'changehandle') {
      let haveChangecreate = allPrevNodes.filter(p => p.getConfig() && p.getConfig().handler === 'changecreate');
      if (haveChangecreate.length == 0) {
        validList.push({
          name: $t('term.process.changeexistinpairsvalid') 
        });
      } else if (haveChangecreate.length > 0 && !nodeData.linkedChange) {
        validList.push({
          name: $t('term.process.selectchangevalid'),
          href: '#changeStep'
        });
      }
    }
    return validList; 
  },
  cientitysync(nodeConfig, d, that) { //配置项同步
    let validList = [];
    //20210518_这里的数据结构：原来nodeConfig.config的数据都变成nodeConfig.stepConfig里的数据
    let nodeData = nodeConfig.stepConfig || {};
    if (nodeConfig.handler === 'cientitysync') {
      //校验配置项同步的关联表单组件
      if (!nodeData || !nodeData.handlerList || nodeData.handlerList.length == 0) {
        validList.push({
          name: $t('term.process.selectformitemvalid'),
          href: '#handlerList'
        });
      } else if (nodeData && nodeData.handlerList && nodeData.handlerList.length > 0) {
        for (let i = 0; i < nodeData.handlerList.length; i++) {
          let findFormitem = that.allFormitemList.find(f => f.uuid == nodeData.handlerList[i]);
          if (!findFormitem) {
            nodeData.handlerList = [];
            validList.push({
              name: $t('term.process.selectformitemvalid'),
              href: '#handlerList'
            });
            break;
          }
        }
      }
    }
    return validList; 
  },
  autoexec(nodeConfig, d, that) { //自动化节点
    let validList = [];
    let nodeData = nodeConfig.stepConfig || {};
    let autoexecConfig = nodeData.autoexecConfig || {};
    if (nodeConfig.handler === 'autoexec') {
      if (!autoexecConfig.failPolicy) {
        validList.push({
          name: $t('form.validate.required', { target: $t('page.failurestrategy') }),
          href: '#failPolicy'
        });
      }
      if (!autoexecConfig.autoexecCombopId) {
        validList.push({
          name: $t('form.validate.required', { target: $t('term.autoexec.combinationtool') }),
          href: '#autoexecCombop'
        });
      }
      if (autoexecConfig.autoexecCombopId && (autoexecConfig.runtimeParamList || autoexecConfig.executeParamList)) {
        let runtimeParamList = autoexecConfig.runtimeParamList || [];
        let executeParamList = autoexecConfig.executeParamList || [];
        let paramsList = runtimeParamList.concat(executeParamList);
        if (paramsList.length > 0) {
          for (let i = 0; i < paramsList.length; i++) {
            if (paramsList[i].isRequired) {
              if (that.$utils.isEmpty(paramsList[i].value)) {
                validList.push({
                  name: $t('message.completerequired', { target: $t('term.process.paramsMapping') }),
                  href: '#autoexecCombop'
                });
                break;
              } else {
                if (paramsList[i].mappingMode == 'form') { //值类型是form的校验
                  let findForm = that.allFormitemList.find(f => f.uuid == paramsList[i].value);
                  if (!findForm) {
                    validList.push({
                      name: $t('message.completerequired', { target: $t('term.process.paramsMapping') }),
                      href: '#autoexecCombop'
                    });
                    break;
                  }
                } else if (paramsList[i].mappingMode == 'prestepexportparam') {
                  let nodeExportParamList = [];
                  that.nodeExportParamConfig && Object.keys(that.nodeExportParamConfig).forEach(key => {
                    if (that.nodeExportParamConfig[key] && that.nodeExportParamConfig[key].length) {
                      nodeExportParamList.push(...that.nodeExportParamConfig[key]);
                    }
                  });
                  let findExport = nodeExportParamList.find(e => e.value == paramsList[i].value);
                  if (!findExport) {
                    validList.push({
                      name: $t('message.completerequired', { target: $t('term.process.paramsMapping') }),
                      href: '#autoexecCombop'
                    });
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }
    return validList;
  },
  timer(nodeConfig, d, that) { //定时节点
    let validList = [];
    let validObj = {
      name: $t('form.validate.required', { target: $t('term.process.circulationtime') }),
      href: '#timerAttributeUuid'
    };
    let nodeData = nodeConfig.stepConfig || {};
    if (nodeConfig.handler === 'timer') {
      if (!nodeData.attributeUuid) {
        validObj.name = $t('form.validate.required', { target: $t('term.process.circulationtime') });
        validList.push(validObj);
      } else if (nodeData.attributeUuid) {
        validObj.name = $t('term.process.formupdateselecttimevalid');
        if (that.allFormitemList && that.allFormitemList.length > 0) {
          let attributeUuid = that.allFormitemList.find(f => f.uuid == nodeData.attributeUuid);
          !attributeUuid && (nodeData.attributeUuid = '') && validList.push(validObj);
        } else {
          nodeData.attributeUuid = '';
          validList.push(validObj);
        }
      }
    }
    return validList;
  }
};

let setInitData = {
  changehandle(nodeConfig, d, that) { //变更处理的校验
    // 变更处理，关联变更自动填充变更创建//特殊处理变更创建和处理(第一次保存不点击节点)--------------------------
    if (!nodeConfig.stepConfig.linkedChange) {
      let allNode = d.getAllPrevNodes();
      allNode.find(item => {
        let config = item.getConfig();
        if (config && config.handler == 'changecreate') {
          nodeConfig.stepConfig.linkedChange = config.uuid;
          nodeConfig.stepConfig.whenChangeStepUserVisible = 'changeStepActive';
        }
        return config && config.handler == 'changecreate';
      });
    }
  }
};
export {valid, setInitData};

