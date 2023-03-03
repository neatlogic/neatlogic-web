import utils from '@/resources/assets/js/util.js';
let valid = {
  common(nodeConfig, d, that) { //公共校验方法  校验名称
    let validList = this.poliyUser(nodeConfig, d, that) || [];
    if (!nodeConfig.name) {
      validList.push({
        name: '节点名称必填',
        href: '#nodeName'
      });
    }
    if (!that.$utils.nameRegularValid(nodeConfig.name)) {
      validList.push({
        name: '节点不符合规则',
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
        name: '分配处理人必选',
        href: '#assignData'
      });
      validList.push({
        name: '异常处理人必选',
        href: '#assignData'
      });
    }
    if (nodeData && nodeData.workerPolicyConfig && nodeData.workerPolicyConfig.policyList) {
      let policyList = nodeData.workerPolicyConfig.policyList;
      let isChecked = policyList && policyList.find(p => p.isChecked == 1) ? 1 : 0; //判断分配处理人是否有选中的项
      let errorText = '分配处理人必选';
      if (isChecked) {
        let keyConfig = {
          'prestepassign': {value: 'processStepUuidList', text: '分配处理人：由前置步骤处理人指定必填'}, //由前置步骤处理人指定
          'copy': {value: 'processStepUuid', text: '分配处理人：复制前置步骤处理人必填'}, //复制前置步骤处理人
          'form': { value: 'attributeUuidList', text: '分配处理人：表单值必填'}, //表单值
          'assign': {value: 'workerList', text: '分配处理人：自定义必填'}//自定义
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
                        errorText = '分配处理人：分派器必填';
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
          name: '异常处理人必选',
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
          name: '外部调用必选',
          href: '#requestIntegration'
        });
      }
      if (!nodeData.automaticConfig || !nodeData.automaticConfig.requestConfig.failPolicy) {
        validList.push({
          name: '失败策略必选',
          href: '#failPolicy'
        });
      }
      if (nodeData.automaticConfig && nodeData.automaticConfig.callbackConfig && nodeData.automaticConfig.callbackConfig.type == 'interval') {
        let callbackConfig = nodeData.automaticConfig.callbackConfig.config;
        if (callbackConfig) {
          if (!callbackConfig.integrationUuid) {
            validList.push({
              name: '外部调用必选',
              href: '#callbackintegration'
            });
          }
          if (!callbackConfig.interval) {
            validList.push({
              name: '时间间隔必填',
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
          name: '变更创建与变更处理节点必须成对存在'
        });
      } else {
        let selectChangeList = haveChangehandle.filter(c => {
          let config = that.stepList.find(item => item.uuid == c.getUuid());
          return config.stepConfig.linkedChange && config.stepConfig.linkedChange == nodeConfig.uuid; 
        });
        if (selectChangeList.length == 0) {
          validList.push({
            name: '不允许存在未关联的变更创建'
          });
        } else if (selectChangeList.length > 1) {
          validList.push({
            name: '变更创建节点只允许被一个变更处理节点关联'
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
          name: '变更创建与变更处理节点必须成对存在'
        });
      } else if (haveChangecreate.length > 0 && !nodeData.linkedChange) {
        validList.push({
          name: '必须选择关联的变更创建',
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
          name: '至少选择一个关联表单组件',
          href: '#handlerList'
        });
      } else if (nodeData && nodeData.handlerList && nodeData.handlerList.length > 0) {
        for (let i = 0; i < nodeData.handlerList.length; i++) {
          let findFormitem = that.allFormitemList.find(f => f.uuid == nodeData.handlerList[i]);
          if (!findFormitem) {
            nodeData.handlerList = [];
            validList.push({
              name: '至少选择一个关联表单组件',
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
          name: '失败策略必选',
          href: '#failPolicy'
        });
      }
      if (!autoexecConfig.autoexecCombopId) {
        validList.push({
          name: '组合工具必选',
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
                  name: '参数映射填写完整',
                  href: '#autoexecCombop'
                });
                break;
              } else {
                if (paramsList[i].mappingMode == 'form') { //值类型是form的校验
                  let findForm = that.allFormitemList.find(f => f.uuid == paramsList[i].value);
                  if (!findForm) {
                    validList.push({
                      name: '参数映射填写完整',
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
                      name: '参数映射填写完整',
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
      name: '必须选择流转时间',
      href: '#timerAttributeUuid'
    };
    let nodeData = nodeConfig.stepConfig || {};
    if (nodeConfig.handler === 'timer') {
      if (!nodeData.attributeUuid) {
        validObj.name = '必须选择流转时间';
        validList.push(validObj);
      } else if (nodeData.attributeUuid) {
        validObj.name = '表单组件已被修改，请重新选择流转时间';
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

