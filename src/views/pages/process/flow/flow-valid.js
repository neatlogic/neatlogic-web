import utils from '@/resources/assets/js/util.js';
import { $t } from '@/resources/init.js';
let validConfig = {};
try {
  // 导入组件校验方法
  const validPath = require.context('@', true, /flowNodeValid.js$/);
  validPath
    .keys()
    .forEach(path => {
      if (validPath(path).nodeConfigValid) {
        Object.assign(validConfig, validPath(path).nodeConfigValid);
      }
    });
} catch (error) {
  console.error('flowNodeValid.js异常', error);
}
let valid = {
  ...validConfig,
  common(nodeConfig, d, that) {
    //公共校验方法  校验名称
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
    if (nodeConfig && nodeConfig.stepConfig && nodeConfig.stepConfig.notifyPolicyConfig && nodeConfig.stepConfig.notifyPolicyConfig.isCustom && that.$utils.isEmpty(nodeConfig.stepConfig.notifyPolicyConfig.policyId)) {
      // 【通知策略】为自定义通知策略，必填
      validList.push({
        name: $t('form.validate.required', { target: $t('page.notificationstrategy') }),
        href: '#NoticeSetting'
      });
    }
    return validList;
  },
  poliyUser(nodeConfig, d, that) {
    //分派处理人校验
    // 分派处理人校验
    let validList = [];
    let nodeData = nodeConfig.stepConfig || {};
    let parentNodes = d.getPrevNodes();
    let isStart = parentNodes.find(d => {
      return d.getConfig() && d.getConfig().handler === 'start';
    });
    if (isStart) {
      //如果是开始节点
      return validList;
    }
    let extendsHandlerList = ['condition', 'distributary', 'changehandle', 'timer'];
    if (!nodeData.workerPolicyConfig && extendsHandlerList.indexOf(nodeConfig.handler) < 0) {
      //分派处理人必填
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
          prestepassign: { value: 'processStepUuidList', text: $t('term.process.prestepassignvalid') }, //由前置步骤处理人指定
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
              if (utils.isEmpty(policyList[i].config[value])) {
                isChecked = 0;
                errorText = keyConfig[type].text;
                break;
              }
            } else if (policyList[i].type == 'automatic') {
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
                      if ((handler.indexOf('CmdbDispatcher') > -1 && this.validCmdbDispatcher(that, handler, key, val)) || (handler.indexOf('RegionDispatcher') > -1 && this.validRegionDispatcher(that, handler, key, val))) {
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
  omnipotent(nodeConfig, d, that) {
    //通用节点
    let validList = [];
    return validList;
  },
  automatic(nodeConfig, d, that) {
    //auto 自动处理节点校验
    let validList = [];
    let nodeData = nodeConfig.stepConfig || {};
    if (nodeConfig.handler === 'automatic') {
      if (!nodeData.automaticConfig || !nodeData.automaticConfig.requestConfig.integrationUuid) {
        validList.push({
          name: $t('form.validate.required', { target: $t('term.process.externalcall') }),
          href: '#requestIntegration'
        });
      }
      if (!nodeData.automaticConfig || !nodeData.automaticConfig.requestConfig.failPolicy) {
        validList.push({
          name: $t('form.validate.required', { target: $t('page.failurestrategy') }),
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
  changecreate(nodeConfig, d, that) {
    //变更创建的校验
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
  changehandle(nodeConfig, d, that) {
    //变更处理的校验
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
  cientitysync(nodeConfig, d, that) {
    //配置项同步
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
  cmdbsync(nodeConfig, d, that) {
    //cmdb
    let validList = [];
    let nodeData = nodeConfig.stepConfig || {};
    let ciEntityConfig = nodeData.ciEntityConfig || {};
    if (nodeConfig.handler === 'cmdbsync') {
      if (!ciEntityConfig.failPolicy) {
        validList.push({
          name: $t('form.validate.required', { target: $t('page.failurestrategy') }),
          href: '#ciEntityConfig'
        });
      }
      if (that.$utils.isEmpty(ciEntityConfig.configList)) {
        validList.push({
          name: $t('form.validate.required', { target: $t('term.cmdb.modemapping') }),
          href: '#ciEntityConfig'
        });
      }
    }
    return validList;
  },
  timer(nodeConfig, d, that) {
    //定时节点
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
  },
  eoa(nodeConfig, d, that) {
    let validList = [];
    let nodeData = nodeConfig.stepConfig || {};
    let eoaConfig = nodeData.eoaConfig || {};
    let nodeChildren = d.getNextNodes().map(d => that.stepList.find(item => item.uuid == d.getUuid()));
    if (nodeConfig.handler === 'eoa') {
      if (that.$utils.isEmpty(eoaConfig.eoaTemplateList)) {
        validList.push({
          name: $t('form.validate.required', { target: $t('page.template') }),
          href: '#eoaSetting'
        });
      }
      if (that.$utils.isEmpty(eoaConfig.eoaSucceedToStepUuid) || (!that.$utils.isEmpty(eoaConfig.eoaSucceedToStepUuid) && that.$utils.isEmpty(nodeChildren) || (!that.$utils.isEmpty(nodeChildren) && !nodeChildren.find(item => item.uuid === eoaConfig.eoaSucceedToStepUuid)))) {
        that.$set(eoaConfig, 'eoaSucceedToStepUuid', '');
        validList.push({
          name: $t('form.validate.required', { target: $t('term.process.eoapassedforwardedtonode') }),
          href: '#eoaSetting'
        });
      }
      if (that.$utils.isEmpty(eoaConfig.eoaFailedToStepUuid) || (!that.$utils.isEmpty(eoaConfig.eoaFailedToStepUuid) && that.$utils.isEmpty(nodeChildren) || (!that.$utils.isEmpty(nodeChildren) && !nodeChildren.find(item => item.uuid === eoaConfig.eoaFailedToStepUuid)))) {
        that.$set(eoaConfig, 'eoaFailedToStepUuid', '');
        validList.push({
          name: $t('form.validate.required', { target: $t('term.process.eoanopassedforwardedtonode') }),
          href: '#eoaSetting'
        });
      }
    }
    return validList;
  },
  dataconversion(nodeConfig, d, that) {
    //dataconversion
    let validList = [];
    let nodeData = nodeConfig.stepConfig || {};
    let dataConversionConfig = nodeData.dataConversionConfig || {};
    if (nodeConfig.handler === 'dataconversion') {
      if (!dataConversionConfig.failPolicy) {
        validList.push({
          name: $t('form.validate.required', { target: $t('page.failurestrategy') }),
          href: '#dataConversionConfig'
        });
      }
      if (that.$utils.isEmpty(dataConversionConfig.configList)) {
        validList.push({
          name: $t('form.validate.required', { target: $t('term.cmdb.modemapping') }),
          href: '#dataConversionConfig'
        });
      }
    }
    return validList;
  },
  subprocess(nodeConfig, d, that) {
    let validList = [];
    let nodeData = nodeConfig.stepConfig || {};
    let subProcessConfig = nodeData.subProcessConfig || {};
    if (that.$utils.isEmpty(subProcessConfig.channelList)) {
      validList.push({
        name: $t('form.validate.required', { target: $t('term.process.catalogmanage') }),
        href: '#subprocessSetting'
      });
    }
    return validList;
  },
  diagram(nodeConfig, d, that) {
    let validList = [];
    let nodeData = nodeConfig.stepConfig || {};
    let diagramConfig = nodeData.diagramConfig || {};
    if (nodeConfig.handler === 'diagram') {
      if (that.$utils.isEmpty(diagramConfig.catalogId)) {
        validList.push({
          name: $t('form.validate.required', { target: '架构目录' }),
          href: '#diagramSetting'
        });
      }
      if (that.$utils.isEmpty(diagramConfig.ciEntityIdMappingFormAttributeUuid)) {
        validList.push({
          name: $t('form.validate.required', { target: '架构图关联节点' }),
          href: '#diagramSetting'
        });
      }
      if (that.$utils.isEmpty(diagramConfig.requestMappingFormAttributeUuid)) {
        validList.push({
          name: $t('form.validate.required', { target: '架构图关联需求节点' }),
          href: '#diagramSetting'
        });
      }
      if (that.$utils.isEmpty(diagramConfig.checkingStatusList)) {
        validList.push({
          name: $t('form.validate.required', { target: '架构图待审批状态' }),
          href: '#diagramSetting'
        });
      }
    }
    return validList;
  },
  collection(nodeConfig, d, that) {
    let validList = [];
    let nodeData = nodeConfig.stepConfig || {};
    let collectionConfig = nodeData.collectionConfig || {};
    if (nodeConfig.handler === 'collection') {
      if (that.$utils.isEmpty(collectionConfig.systemField)) {
        validList.push({
          name: '应用系统关联字段不能为空',
          href: '#collectionConfig'
        });
      }
      if (that.$utils.isEmpty(collectionConfig.requestField)) {
        validList.push({
          name: '需求编号关联字段不能为空',
          href: '#collectionConfig'
        });
      }
      if (that.$utils.isEmpty(collectionConfig.envField)) {
        validList.push({
          name: '环境关联字段不能为空',
          href: '#collectionConfig'
        });
      }
    }
    return validList;
  },
  handleDispatcherName(dispatcherName) {
    // 处理分派器名称 neatlogic.module.cmdb.workerdispatcher.handler.CmdbDispatcher 截取最后一个CmdbDispatcher
    const arr = (dispatcherName && dispatcherName.split('.')) || [];
    return arr[arr.length - 1];
  },
  validCmdbDispatcher(that, handler, key, filterList) {
    if (that.$utils.isEmpty(filterList)) {
      return true;
    }
    // 验证cmdb分派器，匹配映射，两个数组时，有一个为空时，数据校验不通过问题
    // [{"formAttributeUuid": "ca04365ff49c4c80b39cf802e857eeaa","key": 441733552807936},{key: '441733846409216', formAttributeUuid: ''}]
    if (key !== 'filterList' || this.handleDispatcherName(handler) !== 'CmdbDispatcher') {
      return false;
    }
    return filterList.some(item => !item.formAttributeUuid || !item.key);
  },
  validRegionDispatcher(that, handler, key, value) {
    if (key !== 'app' && !value) {
      return true;
    }
    if (key === 'regionAttrs') {
      if (that.$utils.isEmpty(value)) {
        return true;
      } else {
        return value.some(item => !item.value);
      }
    }
  }

};

let setInitData = {
  changehandle(nodeConfig, d, that) {
    //变更处理的校验
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
export { valid, setInitData };
