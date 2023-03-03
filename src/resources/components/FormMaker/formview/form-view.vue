<template>
  <div class="input-border">
    <table v-if="tableList && tableList.length > 0" style="table-layout: fixed;" class="sheet-table">
      <colgroup>
        <col v-for="(w, i) in tableList[0]" :key="i" :width="setColWith(w, i)" />
      </colgroup>
      <tbody>
        <tr v-for="(tr, tindex) in tableList" :key="tindex" :style="setTrshow(tindex + 1)">
          <td
            v-for="(td, dindex) in showTd(tr)"
            :key="dindex"
            :colspan="getMergeCell(td, 'colspan')"
            :rowspan="getMergeCell(td, 'rowspan')"
            :style="setTdstyle(td)"
            :type="td.component ? td.component.handler : ''"
            :class="[td.className , !td.component ? 'text-right text-grey' : '']"
          >
            <div v-if="td.component && !(hideTrlist.length > 0 && hideTrlist.indexOf(tindex + 1) > -1) && !(stephidetrList.length > 0 && stephidetrList.indexOf(tindex + 1) > -1)">
              <div v-for="(pitem, pindex) in getComponent(td.component)" :key="pindex">
                <!--  :isReadonly="isReadonly || !isEdit || pitem.isReadonly || (stepreadtrList.length > 0 && stepreadtrList.indexOf(tindex + 1+'') > -1) || (readComponentlist.length > 0 && readComponentlist.indexOf(pitem.uuid) > -1) || (readTrlist.length > 0 && readTrlist.indexOf(tindex + 1+'') > -1) || false" -->
                <CellCompoment
                  v-if="!hideComponentlist || !hideComponentlist.length || hideComponentlist.indexOf(pitem.uuid) == -1"
                  :ref="pitem.uuid"
                  :setting="pitem"
                  :isReadonly="isReadonly || !isEdit || pitem.isReadonly || (readComponentlist.length > 0 && readComponentlist.indexOf(pitem.uuid) > -1) || (readTrlist.length > 0 && readTrlist.indexOf(tindex + 1 + '') > -1) || false"
                  :isHide="getformAttributeHide(pitem.uuid)"
                  :componentList="componentList"
                  :knowledgeView="knowledgeView"
                  @update="
                    val => {
                      comUpdataCell(val, pitem);
                    }
                  "
                ></CellCompoment>
              </div>
            </div>
            <div v-else-if="td.content && !(hideTrlist.length > 0 && hideTrlist.indexOf(tindex + 1) > -1) && !(stephidetrList.length > 0 && stephidetrList.indexOf(tindex + 1) > -1)" class="item-content" v-html="td.content"></div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import CellCompoment from '../formedit/view/sheet-components.vue';
import formViewRuleMixins from './form-view-rule-mixins.js';
export default {
  name: '',
  components: {
    CellCompoment
  },
  mixins: [formViewRuleMixins],
  props: {
    content: Object,
    isReadonly: {
      //标志组件是否是只读
      type: Boolean,
      default: false
    },
    isEdit: {
      //标志是否是编辑页面
      type: Boolean,
      default: true
    },
    stephidetrList: {
      //流程步骤的表单授权设置了隐藏行的，优先级高于其他
      type: [Boolean, Array],
      default: false
    },
    stepreadtrList: {
      //流程步骤的表单授权设置了只读行的
      type: [Boolean, Array],
      default: false
    },
    formAttributeHideList: {
      //表单组件的权限（隐藏列表）
      type: Array,
      default: () => []
    },
    knowledgeView: { //区分知识与表单的样式不一致，默认false：样式与表单一致；true:需要调整样式
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      type: 'overview',
      tableList: [], //表格的布局数据（不含合并单元格）
      mergeList: [], //表格的合并单元格数据
      deleteList: [], //表格需移除的单元格数据（合并用，自定义用来兼容插件数据）
      headerList: [], //表格的每个设置了宽度的col
      lefterList: [], //表格的每个设置了高度的row
      componentList: [], //组件的数据
      //isLoaded: true, //是否加载完成接口数据的获取
      ruleList: null, //配置的规则列表
      ruleTargets: null, //配置的条件列表（单独提取组件的条件，减少watch的交互监听频率）
      hideTrlist: [], //需要隐藏的tr列表
      hideComponentlist: [], //需要隐藏的组件列表
      emptyRow: [], //预览时需要过滤的下方空白行
      readComponentlist: [], //通过联动带过来的需要只读的组件列表
      readTrlist: [], //通过联动带过来的需要只读的行
      globalSetting: {}, //全局的设置，包括label设置、表单联动、自定义脚本等
      scriptArray: {}
    };
  },
  created() {},
  mounted() {
    this.initForm(this.content);
  },
  methods: {
    initForm(content) {
      //获取从编辑布局那里来的数据
      let emptyRow = [];
      this.emptyRow = [];
      let demodata = content;
      this.componentList = demodata.controllerList || [];
      this.globalSetting = demodata.globalSetting || { ruleList: [], defaultHiderow: [], scriptsConfig: '' };
      //先获取自定义脚本的数据
      try {
        this.scriptArray = new Function('return ' + this.globalSetting.scriptsConfig)();
      } catch (error) {
        this.scriptArray = new Function('return ')();
        console.error(error);
      }
      let maxRow = 0;
      let tablelists = [];
      demodata.sheetsConfig.tableList.forEach((tr, i) => {
        let trlist = [];
        let isEmpty = true;
        tr.forEach((td, j) => {
          if (td) {
            if (td.component || td.content != null) {
              trlist.push(td);
            } else {
              trlist.push({
                row: i,
                col: j,
                content: td
              });
            }
            isEmpty = false;
          } else {
            trlist.push({
              row: i,
              col: j,
              content: ''
            });
          }
        });
        if (isEmpty) {
          emptyRow.push(i);
        } else {
          maxRow = i;
        }
        tablelists.push(trlist);
      });
      this.emptyRow = emptyRow.filter(e => {
        return e > maxRow;
      });
      this.tableList = tablelists;

      this.lefterList = demodata.sheetsConfig.lefterList || [];
      this.headerList = demodata.sheetsConfig.headerList || [];
      this.perWidthList = demodata.sheetsConfig.perWidthList || [];
      this.mergeList = demodata.sheetsConfig.mergeList || [];
      this.customBorders = demodata.sheetsConfig.customBorders || [];
      this.deleteList = [];
      //需要过滤掉编辑布局里最下面几行空白数据，避免实际页面底下空白过多
      if (demodata.sheetsConfig.mergeList && demodata.sheetsConfig.mergeList.length > 0) {
        const mergeG = demodata.sheetsConfig.mergeList;
        for (var i = 0; i < mergeG.length; i++) {
          var mergeg = mergeG[i];
          for (var c = 0; c < mergeg.colspan; c++) {
            for (var r = 0; r < mergeg.rowspan; r++) {
              if (c != 0 || r != 0) {
                this.deleteList.push({
                  col: mergeg.col + c,
                  row: mergeg.row + r
                });
                if (this.emptyRow.indexOf(mergeg.row + r) >= 0) {
                  this.emptyRow.splice(this.emptyRow.indexOf(mergeg.row + r), 1);
                }
              }
            }
          }
        }
      }
      //把原来挨个组件的联动提取到全局表单设置
      //let oldRulelist = [];
      // if (this.componentList && this.componentList.length > 0) {
      //   this.componentList.forEach(con => {
      //     if (con.config && con.config.ruleList && con.config.ruleList.length > 0) {
      //       con.config.ruleList.forEach(r => {
      //         let item = {
      //           conditionList: [
      //             {
      //               rel: 'and',
      //               list: [
      //                 {
      //                   component: con.uuid,
      //                   expression: r.conditionConfig.expression,
      //                   rel: 'and',
      //                   value: r.conditionConfig.value
      //                 }
      //               ]
      //             }
      //           ],
      //           actionList: []
      //         };
      //         if (r.actionList && r.actionList.length > 0) {
      //           let newAction = r.actionList.map(a => {
      //             return {
      //               component: a.unit == 'component' ? a.value : a.type == 'setvalue' ? a.unit : '',
      //               action: a.type,
      //               type: a.unit,
      //               value: a.unit == 'row' || a.type == 'setvalue' ? a.value : ''
      //             };
      //           });
      //           Object.assign(item, {
      //             actionList: newAction
      //           });
      //         }
      //         oldRulelist.push(item);
      //       });
      //     }
      //   });
      //   if (oldRulelist.length > 0) {
      //     Object.assign(this.globalSetting, {
      //       ruleList: oldRulelist
      //     });
      //     this.$nextTick(() => {
      //       this.componentList.forEach(con => {
      //         con.config.ruleList = [];
      //       });
      //     });
      //   }
      // }
      if (this.scriptArray && this.scriptArray.loadFn) {
        this.scriptArray.loadFn(this.componentList, this.$https, this);
      }
      this.globalSetting.ruleList && this.getFormRuleresult(this.globalSetting);

      //this.getRuleconfig(this.componentList);
    },
    checkIsinit(val) {
      //校验值变化是属于默认无数据赋值还是操作导致的空值
      let isInit = true;
      if (val || val != null || val != undefined) {
        isInit = false;
      }
      return isInit;
    },
    getMergeCell(td, action) {
      //获取哪些单元格是需要合并的
      let mergecell = this.mergeList.find(d => d.row === td.row && d.col === td.col);
      return mergecell && mergecell[action];
    },
    getComponentconfig(uuid, type) {
      let configkey = type || 'value';
      let _this = this;
      switch (configkey) {
        case 'type':
          _this.getUuidtype(uuid);
          break;

        default:
          _this.getUuidvalue(uuid);
      }
    },
    getUuidvalue(uuid) {
      //获取uuid对应的组件的值
      let uuidvalue = null;
      if (this.$refs[uuid] && this.$refs[uuid][0] && this.$refs[uuid][0].getValue) {
        uuidvalue = this.$refs[uuid][0].getValue();
      } else {
        this.componentList.forEach(co => {
          if (co.uuid == uuid) {
            uuidvalue = this.$utils.checkType(co.config.value, ['null', 'undefined']) ? co.config.valueQuote : co.config.value;
          }
        });
      }
      return uuidvalue;
    },
    getUuidtype(uuid) {
      //获取uuid对应的组件的类型
      let type = null;
      if (this.componentList.length > 0) {
        this.componentList.forEach(co => {
          if (co.uuid == uuid) {
            type = co.handler;
          }
        });
      }
      return type;
    },
    updateContent(uuid, val) {
      //更新组件的值（根据组件uuid）
      let _this = this;
      if (this.componentList && this.componentList.length > 0) {
        this.componentList.find(com => {
          if (com.uuid == uuid) {
            _this.$set(com.config, 'value', val);
            return true;
          }
          return false;
        });
      }
      this.$forceUpdate();
    },
    updateComponentconfig(uuid, type, val) {
      let _this = this;
      let configkey = type || 'value';
      switch (configkey) {
        default:
          _this.updateContent(uuid, val);
      }
    },
    updateComponentfilter(uuid, valuelist, ruleUuid, isFirst) {
      //更新矩阵数据源的过滤参数（根据组件uuid）      
      let _this = this;
      let valueLi = typeof valuelist.valueList == 'string' ? [valuelist.valueList] : valuelist.valueList;
      let valueList = [];
      let defaultValue = [];
      if (valueLi && valueLi.length > 0) {
        valueLi.forEach(v => {
          valueList.push(this.setVal(v));
          defaultValue.push(v);
        });
      }

      if (this.componentList && this.componentList.length > 0) {
        this.componentList.forEach(com => {
          if (com.uuid == uuid) {
            let filters = com.config.filterList || [];
            if (filters.length > 0) {
              let isExsit = false;
              filters.forEach(f => {
                if (f.uuid == valuelist.uuid) {
                  isExsit = true;
                  Object.assign(f, {
                    valueList: valueList,
                    defaultValue: defaultValue,
                    ruleUuid: ruleUuid
                  });
                }
              });
              if (!isExsit) {
                let newLi = [
                  {
                    uuid: valuelist.uuid,
                    valueList: valueList,
                    ruleUuid: ruleUuid,
                    defaultValue: defaultValue
                  }
                ];
                filters = this.$utils.concatArr(filters, newLi);
              }
            } else {
              filters.push({
                uuid: valuelist.uuid,
                valueList: valueList,
                ruleUuid: ruleUuid,
                defaultValue: defaultValue
              });
            }
          
            this.$set(com.config, 'filterList', filters);
            //当规则的uuid 和 动作的uuid不相同时清空值，不然导致值赋值不上去
            !isFirst && ruleUuid !== uuid && this.$set(com.config, 'value', com.config.isMultiple ? [] : '');
            if (this.$utils.isEmpty(com.config.value)) {
              this.clearFilters(com);
            }
            com.config.fn && this[com.config.fn](com, isFirst);
          }
        });
      }
      this.$forceUpdate();
    },
    async getFormval(validConifg) {
      //获取表单的数据（期间执行了校验，不通过则不返回对应组件和他的值）
      let _this = this;
      let isSubmit = true;
      if (this.$children && this.$children.length > 0) {
        for (var s = 0; s < this.$children.length; s++) {
          if (this.$children[s] && this.$children[s].setting.config) {
            let isValid = await this.$children[s].validateValue(validConifg);
            if (!isValid) {
              isSubmit = false;
            }
          }
        }
        if (isSubmit) {
          this.getFormvalNovalid();
        } else {
          let errortips = document.querySelectorAll('.form-error-tip') || null;
          let errtop = 0;
          //错误提示的有延迟100ms
          setTimeout(() => {
            if (errortips && errortips.length > 0) {
              try {
                errortips.forEach(err => {
                  if (err.getBoundingClientRect().height > 0) {
                    errtop = err.getBoundingClientRect().top;
                    throw Error('请完善填写信息');
                  }
                });
              } catch (err) {
                console.error(err);
              }
              //定位到错误元素
              _this.$el.offsetParent && _this.$el.offsetParent.scrollTo({
                top: errtop - _this.$el.offsetParent.getBoundingClientRect().top + _this.$el.offsetParent.scrollTop - 40
              });
            }
          }, 100);
        }
      }
      return isSubmit;
    },
    getFormvalNovalid() {
      //获取表单数据（不校验规则）
      let formdata = [];
      if (this.componentList && this.componentList.length > 0) {
        for (var i = 0; i < this.componentList.length; i++) {
          var pluginli = this.componentList[i];
          let newData = {};
          newData.attributeUuid = pluginli.uuid;
          newData.handler = pluginli.handler;
          if (this.$refs[pluginli.uuid] && this.$refs[pluginli.uuid][0]) {
            newData.dataList = this.getUuidvalue(pluginli.uuid);
          } else {
            newData.dataList = this.componentList[i].config.value;
          }
          formdata.push(newData);
        }
      }
      return formdata;
    },
    getHidecomponent() {
      //获取隐藏组件
      let hidecomponentList = [...this.formAttributeHideList];
      let _this = this;
      if (this.componentList && this.componentList.length > 0) {
        this.componentList.forEach(co => {
          if (this.$refs[co.uuid] && this.$refs[co.uuid][0] && !co.isHide) {
            //如果组件存在，就不需要添加
          } else {
            hidecomponentList.push(co.uuid);
          }
        });
      }
      return hidecomponentList;
    },
    getReadcomponent() {
      //获取只读组件
      let readComponentList = [];
      if (this.componentList && this.componentList.length > 0) {
        this.componentList.forEach(c => {
          if (c.isReadonly) {
            readComponentList.push(c.uuid);
          }
        });
      }
      return readComponentList;
    },
    updateFormval(datalist) {
      //根据返回的uuid：值的数据重新赋值组件
      let _this = this;
      if (datalist) {
        for (var i in datalist) {
          if (this.componentList && this.componentList.length > 0) {
            this.componentList.find(com => {
              if (com.uuid == i) {
                //配置的参数改变
                this.$set(com.config, 'value', datalist[i]);

                //如果有组件，组件的值也跟着更新
                // if (_this.$refs[i] && _this.$refs[i][0] && _this.$refs[i][0].updateVal) {
                //   _this.$refs[i][0].updateVal(datalist[i]);
                // }
                return true;
              }
              return false;
            });
          }
        }
        if (this.scriptArray && this.scriptArray.loadFn) {
          this.scriptArray.loadFn(this.componentList, this.$https, this);
        }
        //表单的值整体更新之后需要执行联动规则
        this.globalSetting.ruleList && this.getFormRuleresult(this.globalSetting);
      }
    },
    setVal(val) {
      //需要处理通过&=&拼接的值（这种一般是外部数据源，后台做了value跟text的拼接）
      let value = val;
      if (val && val.indexOf('&=&') > -1) {
        value = val.split('&=&')[0] || null;
      }
      return value;
    },
    getComponentdefaultstatus(uuid, type) {
      //获取组件配置的默认状态（默认是否隐藏、是否需要隐藏清空值）
      let status = false;
      if (type == 'hide') {
        if (this.componentList && this.componentList.length > 0) {
          this.componentList.forEach(co => {
            if (co.uuid == uuid && co.config && co.config.isHide) {
              status = true;
            }
          });
        }
      } else if (type == 'empty') {
        if (this.componentList && this.componentList.length > 0) {
          this.componentList.forEach(co => {
            if (co.uuid == uuid && co.config && co.config.isEmpty) {
              status = true;
            }
          });
        }
      }
      return status;
    },
    comUpdataCell(val, pitem) {
      this.executionList = []; //滞空执行链数组
      this.updatecell(val, pitem);
    },
    updatecell(val, pitem) {
      if (pitem.config.value === null || pitem.config.value === undefined) {
        //当值不存在，默认值存在时，需要把默认值复制给value，当组件没有渲染时不能通过组件来getValue拿值而是通过config.value拿值
        if (pitem.config.valueQuote === val) {
          //如果显示的是默认值，则会执行规则，这个时候如果存显示隐藏行等操作导致组件重新渲染则会出现死循环，这个时候需要进行断掉循环
          return;
        } else {
          pitem.config.valueQuote = val;
        }
      }
      if (this.ruleTargets && this.ruleTargets.length > 0 && this.ruleTargets.indexOf(pitem.uuid) > -1) {
        this.getComponentRuleresult(pitem.uuid, val);
      }
      if (this.scriptArray && this.scriptArray.changeFn) {
        this.scriptArray.changeFn(pitem.uuid, val, this.componentList, this.$https, this);
      }
      //pitem.handler == 'formcascadelist' ? this.changecasval(val, pitem) : this.changeval(val, pitem);
    },
    getComponentRuleresult(uuid, val) {
      let _this = this;
      let rulelist = _this.globalSetting.ruleList;
      if (rulelist && rulelist.length > 0) {
        let newList = [];
        rulelist.forEach(rule => {
          //过滤掉没有配置执行动作和动作执行条件的联动规则，减少执行调用次数.这里提取出需要执行联动的规则
          let required = false;
          if (rule.actionList && rule.actionList.length > 0 && rule.conditionList && rule.conditionList.length > 0) {
            rule.conditionList.forEach((condition, cindex) => {
              if (condition.list && condition.list.length > 0) {
                //先判断改变值的组件是否需要执行联动
                condition.list.forEach((li, lindex) => {
                  if (li.component && li.expression && li.component == uuid) {
                    required = true;
                  }
                });
              }
            });
          }
          if (required) {
            newList.push(rule);
          }
        });
        if (newList && newList.length > 0) {
          newList.forEach(rule => {
            //过滤掉没有配置执行动作和动作执行条件的联动规则，减少执行调用次数
            if (rule.actionList && rule.actionList.length > 0 && rule.conditionList && rule.conditionList.length > 0) {
              let isPerform = false;
              //配置的条件执行结果
              let lists = ''; //拼接结果
              let conditionVal = null;
              rule.conditionList.forEach((condition, cindex) => {
                if (condition.list && condition.list.length > 0) {
                  let list = '';
                  condition.list.forEach((li, lindex) => {
                    if (li.component && li.expression) {
                      _this.ruleTargets.push(li.component);
                      //对比当前组件值是否满足条件结果
                      let currentVal = _this.getUuidvalue(li.component);
                      let type = _this.getUuidtype(li.component);
                      //改变值的时候需要保存值是多少
                      if (li.expression == 'change') {
                        conditionVal = typeof currentVal == 'string' ? [currentVal] : currentVal;
                      }
                      list += _this.getConditionResult(li, currentVal, type);
                      list += lindex < condition.list.length - 1 ? (li.rel == 'and' ? ' && ' : ' || ') : '';
                    }
                  });
                  lists += '(' + list + ')' + (cindex < rule.conditionList.length - 1 ? (condition.rel == 'and' ? ' && ' : ' || ') : '');
                }
              });
              isPerform = new Function('return ' + lists)();
              //先判断是否满足条件，再挨个执行动作

              if (isPerform) {
                if (this.executionList.filter(item => item == uuid).length > 2) {
                  //如果相同的组件在同一条执行链中执行次数大于2则终止执行链
                  throw new Error(`表单规则${uuid}执行链存在死循环，终止表单规则`);
                }
                this.executionList.push(uuid);
                rule.actionList.forEach(action => {
                  this.updaterComponent(action, conditionVal || null, true, uuid);
                });
              } else {
                rule.actionList.forEach(action => {
                  this.updaterComponent(action, conditionVal || null, false, uuid);
                });
              }
            }
          });
        }
      }
    },
    getFormRuleresult(config) {
      //初始化组件所有数据时触发
      let _this = this;
      let rulelist = config.ruleList;
      let component = this.componentList;

      _this.ruleTargets = [];
      _this.hideComponentlist = [];
      _this.hideTrlist = [];
      _this.readComponentlist = [];
      _this.readTrlist = [];
      if (config.defaultHiderow && config.defaultHiderow.length > 0) {
        _this.hideTrlist = config.defaultHiderow;
      }
      if (component && component.length > 0) {
        component.forEach(co => {
          if (co.isHide || co.config.isHide) {
            //原先使用co.config.isHide  之后有问题，可以使用co.isHide || co.config.isHide
            _this.hideComponentlist.push(co.uuid);
          }
          //存储表单里面的过滤条件，每次初始化数据时过滤条件需要清空还原为默认值
          !co.config.defaultFilterList && (co.config.defaultFilterList = this.$utils.deepClone(co.config.filterList || []));
          co.config.filterList = this.$utils.deepClone(co.config.defaultFilterList);
          co.config.valueQuote = null;
        });
      }
      if (rulelist && rulelist.length > 0) {
        rulelist.forEach(rule => {
          //过滤掉没有配置执行动作和动作执行条件的联动规则，减少执行调用次数
          let conditionVal = null;
          if (rule.actionList && rule.actionList.length > 0 && rule.conditionList && rule.conditionList.length > 0) {
            rule.conditionList.forEach((condition, cindex) => {
              if (condition.list && condition.list.length > 0) {
                let list = '';
                condition.list.forEach((li, lindex) => {
                  if (li.component && li.expression) {
                    _this.ruleTargets.push(li.component);
                  }
                });
              }
            });

            let isPerform = false;
            //配置的条件执行结果
            let lists = ''; //拼接结果
            _this.executionList = []; //滞空执行链的数组
            rule.conditionList.forEach((condition, cindex) => {
              if (condition.list && condition.list.length > 0) {
                let list = '';
                condition.list.forEach((li, lindex) => {
                  if (li.component && li.expression) {
                    _this.ruleTargets.push(li.component);
                    //对比当前组件值是否满足条件结果
                    let currentVal = _this.getUuidvalue(li.component);
                    let type = _this.getUuidtype(li.component);
                    //改变值的时候需要保存值是多少
                    if (li.expression == 'change') {
                      conditionVal = typeof currentVal == 'string' ? [currentVal] : currentVal;
                    }
                    //初始化时不执行改变值的运算
                    // list += li.expression !== 'change' ? _this.getConditionResult(li, currentVal, type) : false;
                    if (li.expression !== 'change') {
                      list += _this.getConditionResult(li, currentVal, type);
                    } else {
                      list += !this.$utils.isEmpty(currentVal);
                    }
                   
                    list += lindex < condition.list.length - 1 ? (li.rel == 'and' ? ' && ' : ' || ') : '';
                  }
                });
                lists += '(' + list + ')' + (cindex < rule.conditionList.length - 1 ? (condition.rel == 'and' ? ' && ' : ' || ') : '');
              }
            });
            isPerform = new Function('return ' + lists)();
            // 先判断是否满足条件，再挨个执行动作
            if (isPerform) {
              rule.actionList.forEach(action => {
                this.updaterComponent(action, conditionVal || null, true, '', true);
              });
            }
          }
        });
      }
    },
    getConditionResult(li, currentVal, type) {
      let list = '';
      switch (li.expression) {
        case 'empty':
          if (typeof currentVal == 'object' && currentVal) {
            currentVal.length == 0 ? (list = true) : (list = false);
          } else {
            !currentVal ? (list = true) : (list = false);
          }
          break;
        case 'non-empty':
          if (typeof currentVal == 'object' && currentVal) {
            currentVal.length > 0 ? (list = true) : (list = false);
          } else {
            currentVal ? (list = true) : (list = false);
          }
          break;
        case 'equal':
          currentVal && currentVal.toString() == li.value.toString() ? (list = true) : (list = false);
          break;
        case 'unequal':
          !currentVal || currentVal.toString() != li.value.toString() ? (list = true) : (list = false);
          break;
        case 'include':
          //数组情况下，调用全局合并数组如果得到的数组跟原数组一样长度则原数组里包含对比的数组，字符串情况下，判断indexOf
          currentVal && (typeof currentVal == 'object' ? this.$utils.intersectionArr(currentVal, li.value).length > 0 : currentVal.indexOf(li.value) > -1) ? (list = true) : (list = false);
          break;
        case 'exclude':
          //没有值+数组情况下，调用全局合并数组如果得到的数组跟原数组+对比数组的长度则原数组里不包含对比的数组，字符串情况下，判断indexOf
          currentVal ? ((currentVal && typeof currentVal == 'object' ? this.$utils.concatArr(currentVal, li.value).length == currentVal.length + li.value.length : currentVal.indexOf(li.value) == -1) ? (list = true) : (list = false)) : (list = true);
          break;
        case 'less-than':
          currentVal && this.matching(type, currentVal, li.value) == 'less-than' ? (list = true) : (list = false);
          break;
        case 'greater-than':
          currentVal && this.matching(type, currentVal, li.value) == 'greater-than' ? (list = true) : (list = false);
          break;
        case 'change':
          list = true;
          break;
        default:
        //console.log('没有匹配规则');
      }
      return list;
    },
    updaterComponent(config, valueList, init, ruleUuid, isFirst) {
      let _this = this;
      let uuid = config.component; //选择了哪些组件
      let action = config.action; //执行什么操作
      let value = config.value; //如果组件有赋值操作||选择了哪些行
      let type = config.type; //操作的是组件还是行
      //init 是否需要执行，如果是初始化的为true,如果是之后组件联动的根据规则联动结果判断是否需要执行
      if (type == 'component') {
        this.componentList.forEach(c => {
          if ((typeof uuid == 'string' && c.uuid == uuid) || (uuid && typeof uuid == 'object' && uuid.indexOf(c.uuid) > -1)) {
            switch (action) {
              case 'hide':
                //设置隐藏的时候，如果默认是显示则隐藏
                if (c.config && !c.config.isHide) {
                  let isExsit = false;
                  if (_this.hideComponentlist.length > 0 && _this.hideComponentlist.indexOf(c.uuid) > -1) {
                    isExsit = true;
                  }
                  if (init) {
                    !isExsit ? _this.hideComponentlist.push(c.uuid) : '';
                  } else {
                    isExsit ? _this.hideComponentlist.splice(_this.hideComponentlist.indexOf(c.uuid), 1) : '';
                  }
                }
                break;
              case 'read':
                //只读
                if (c.uuid) {
                  let isExsit = false;
                  if (_this.readComponentlist.length > 0 && _this.readComponentlist.indexOf(c.uuid) > -1) {
                    isExsit = true;
                  }
                  if (init) {
                    !isExsit ? _this.readComponentlist.push(c.uuid) : '';
                  } else {
                    isExsit ? _this.readComponentlist.splice(_this.readComponentlist.indexOf(c.uuid), 1) : '';
                  }
                }
                break;
              case 'show':
                //设置显示的时候，如果默认是隐藏则显示
                if (c.config && c.config.isHide) {
                  let isExsit = false;
                  if (_this.hideComponentlist.length > 0 && _this.hideComponentlist.indexOf(c.uuid) > -1) {
                    isExsit = true;
                  }
                  if (init) {
                    isExsit ? _this.hideComponentlist.splice(_this.hideComponentlist.indexOf(c.uuid), 1) : '';
                  } else {
                    //fasle
                    !isExsit ? _this.hideComponentlist.push(c.uuid) : '';
                  }
                }
                break;
              case 'empty':
                //清空值，执行恢复默认值操作,设置为null则执行组件无数据的逻辑，空会有多选、时间格式错误的问题
                if (init) {
                  this.$set(c.config, 'value', null);
                  //改变值触发规则
                  let _this = this;
                  this['setTimeout' + c.uuid] && clearTimeout(this['setTimeout' + c.uuid]);
                  this['setTimeout' + c.uuid] = setTimeout(function() {
                    _this.updatecell(value, c);
                    _this['setTimeout' + c.uuid] = null;
                  }, 1);
                }
                break;
              case 'setvalue':
                //赋值
                if (init) {
                  this.$set(c.config, 'value', value);
                  //改变值触发规则
                  this['setTimeout' + c.uuid] && clearTimeout(this['setTimeout' + c.uuid]);
                  this['setTimeout' + c.uuid] = setTimeout(function() {
                    _this.updatecell(value, c);
                    _this['setTimeout' + c.uuid] = null;
                  }, 1);
                }
                break;
              case 'setfilter':
                //过滤
                if (init) {
                  this.updateComponentfilter(uuid, { uuid: value.uuid, valueList: this.getUuidvalue(value.valueCom) || null }, ruleUuid || value.valueCom, isFirst);
                }
                break;
              default:
              //console.log('没有匹配的规则');
            }
          }
        });
      } else if (type == 'row') {
        if (value && value.length > 0) {
          switch (action) {
            case 'hide':
              //设置隐藏的时候，默认显示则隐藏
              if (init) {
                _this.$set(_this, 'hideTrlist', _this.$utils.concatArr(value, _this.hideTrlist));
              } else {
                let defaulthidelist = _this.globalSetting.defaultHiderow;
                if (_this.hideTrlist && _this.hideTrlist.length > 0) {
                  _this.hideTrlist = _this.hideTrlist.filter(h => {
                    if (value.indexOf(h) > -1 && (!defaulthidelist || defaulthidelist.indexOf(h) == -1)) {
                      h = null;
                    }
                    return h;
                  });
                }
              }
              break;
            case 'show':
              //设置显示的时候，默认隐藏则显示
              if (init) {
                if (_this.hideTrlist && _this.hideTrlist.length > 0) {
                  _this.hideTrlist = _this.hideTrlist.filter(h => {
                    if (value.indexOf(h) > -1) {
                      h = null;
                    }
                    return h;
                  });
                }
              } else {
                let defaulthidelist = _this.globalSetting.defaultHiderow;
                if (defaulthidelist && defaulthidelist.length > 0) {
                  value.forEach(v => {
                    _this.$nextTick(() => {
                      if (defaulthidelist.indexOf(v) > -1) {
                        _this.$set(_this, 'hideTrlist', _this.$utils.concatArr([v], _this.hideTrlist));
                      }
                    });
                  });
                }
              }

              break;
            case 'read':
              if (value) {
                let isExsit = false;
                if (_this.readTrlist.length > 0) {
                  let newTr = _this.$utils.concatArr(_this.readTrlist, value);
                  if (newTr.length <= _this.readTrlist.length + value.length) {
                    isExsit = true;
                  }
                }
                if (init) {
                  !isExsit ? _this.$set(_this, 'readTrlist', _this.$utils.concatArr(_this.readTrlist, value)) : '';
                } else {
                  if (isExsit) {
                    _this.readTrlist = _this.readTrlist.filter(re => {
                      if (value.indexOf(re) > -1) {
                        re = null;
                      }
                      return re;
                    });
                  }
                }
              }
              break;
            default:
            //console.log('没有匹配的规则');
          }
        }
      }
    },
    compareDate(val, matchval) {
      //比较日期组件：规则的值跟组件实际值的对比结果
      if (!val) {
        return false;
      }
      let totalval = val.replace(/-/g, '/');
      let totalmatchval = matchval.replace(/-/g, '/');
      let tval = new Date(totalval).getTime();
      let mval = new Date(totalmatchval).getTime();
      if (tval > mval) {
        return 'greater-than';
      } else if (tval < mval) {
        return 'less-than';
      } else {
        return 'equal';
      }
    },
    compareTime(val, matchval) {
      //比较时间组件：规则的值跟组件实际值的对比结果，只能根据时：分：秒每个位置挨个对比
      if (!val) {
        return false;
      }
      let result = 'equal';
      let compareList = [];
      let vallist = val.split(':');
      let matchvallist = matchval.split(':');
      if (vallist[0] && matchvallist[0]) {
        compareList.push(this.compareParttime(vallist[0], matchvallist[0]));
      }
      if (vallist[1] && matchvallist[1]) {
        compareList.push(this.compareParttime(vallist[1], matchvallist[1]));
      }
      if (vallist[2] && matchvallist[2]) {
        compareList.push(this.compareParttime(vallist[2], matchvallist[2]));
      }
      if (compareList[0] == 'greater-than') {
        result = 'greater-than';
        return result;
      } else if (compareList[0] == 'less-than') {
        result = 'less-than';
        return result;
      }
      if (compareList[1] == 'greater-than') {
        result = 'greater-than';
        return result;
      } else if (compareList[1] == 'less-than') {
        result = 'less-than';
        return result;
      }
      if (compareList[2] == 'greater-than') {
        result = 'greater-than';
      } else if (compareList[2] == 'less-than') {
        result = 'less-than';
      }
      return result;
    },
    compareParttime(val, matchval) {
      //时间组件每个单位的对比
      let str = 'equal';
      if (val > matchval) {
        str = 'greater-than';
      } else if (val == matchval) {
        str = 'equal';
      } else {
        str = 'less-than';
      }
      return str;
    },
    matching(type, value, matchvalue) {
      let result = '';
      switch (type) {
        case 'date':
          result = this.compareDate(value, matchvalue);
          break;
        case 'time':
          result = this.compareTime(value, matchvalue);
          break;
        default:
          if (parseFloat(value) == parseFloat(matchvalue)) {
            result = 'equal';
          } else {
            result = parseFloat(value) > parseFloat(matchvalue) ? 'greater-than' : 'less-than';
          }
      }
      return result;
    },
    getDate(unit = null, value = 0, styleType = '-', timstamp = null) {
      //根据单位跟数量计算需要的时间差（ms）
      let y;
      let m;
      let d;
      let returndate;
      let time = timstamp ? new Date(timstamp) : new Date();
      let timer = time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds();
      switch (unit) {
        case 'day':
          time.setTime(time.getTime() + 24 * 3600 * 1000 * value);
          y = time.getFullYear();
          m = time.getMonth() + 1;
          d = time.getDate();
          returndate = y + styleType + m + styleType + d;
          break;
        case 'month':
          time.setMonth(time.getMonth() + value);
          y = time.getFullYear();
          m = time.getMonth() + 1;
          d = time.getDate();
          returndate = y + styleType + m + styleType + d;
          break;
        case 'year':
          time.setFullYear(time.getFullYear() + value);
          y = time.getFullYear();
          m = time.getMonth() + 1;
          d = time.getDate();
          returndate = y + styleType + m + styleType + d;
          break;
        default:
          y = time.getFullYear();
          m = time.getMonth() + 1;
          d = time.getDate();
          returndate = y + styleType + m + styleType + d;
      }
      return returndate + ' ' + timer;
    },
    clearFilters(com) { //清空多级联动数据
      if (this.componentList && this.componentList.length > 0) {
        this.componentList.forEach(item => {
          if (item.config && item.config.filterList && item.config.filterList.length > 0) {
            item.config.filterList.forEach(f => {
              if (f.ruleUuid == com.uuid) {
                this.$set(f, 'valueList', null);
                this.$set(f, 'defaultValue', null);
              }
            }); 
          }
        });
      }
    }
  },
  computed: {
    setColWith() {
      let _this = this;
      return function(w, index) {
        let width = '';
        if (_this.perWidthList) {
          width = _this.perWidthList[index];
        } else {
          _this.headerList[index] != 170 ? _this.headerList[index] : '';
        }
        // let sum = 0;
        // headerList &&
        //   headerList.forEach(item => {
        //     sum = sum + Math.floor(item);
        //   });
        //return (index == 0 && w == 170) ? 120 : (w != 170 ? w : '');
        //return index == 0 ? 120 : headerList[index] != 170 ? headerList[index] : '';
        return width;
      };
    },
    setTdWidth() {
      return function(td) {
        let styleitem = {};
        if (this.headerList && this.headerList.length > 0) {
          if (this.headerList[td.col]) {
            styleitem.width = this.headerList[td.col] + 'px';
          } else {
            styleitem.width = 170 + 'px';
          }
        }
        return styleitem;
      };
    },
    setTdstyle() {
      return function(td) {
        let styleitem = {};
        if (this.isEdit) {
          //只读模式下去掉设置的高度
          if (this.lefterList && this.lefterList.length > 0) {
            if (this.lefterList[td.row]) {
              // styleitem.height = this.lefterList[td.row] + 'px';
              styleitem.height = '32px';
            } else {
              styleitem.height = 32 + 'px';
            }
          }
        }

        if (td.style) {
          let tdstyle = td.style || {};
          let o = {};
          if (tdstyle.border === 'all') {
            o.border = '1px solid #333';
          }
          Object.assign(styleitem, tdstyle, o);
        }
        if (td.component && td.component.handler == 'formdynamiclist') {
          // 表格选择组件,直接展示，解决高度过高的问题
          styleitem['border-spacing'] = '0 !important';
        }
        // let styleHeights = '';
        // if(this.content.sheets.rowHeight){
        // for(var j=0;j<this.content.sheets.rowHeight.length;j++){
        // if(this.content.sheets.rowHeight[j].index == s){
        // styleHeights='height:'+this.content.sheets.rowHeight[j].height+'px';
        // }
        // }
        // }
        // styleitem = styleitem+styleHeights;
        return styleitem;
      };
    },
    setTdcolspan() {
      return function(col, row) {
        const mergecell = this.mergeList;
        let ismerge = false;
        if (mergecell && mergecell.length > 0) {
          for (var i = 0; i < mergecell.length; i++) {
            if (mergecell[i].col == col && mergecell[i].row == row) {
              ismerge = true;
              return mergecell[i].colspan;
            }
          }
        }
        if (!ismerge) {
          return '';
        }
      };
    },
    setTdrowspan() {
      return function(col, row) {
        const mergecell = this.mergeList;
        let ismerge = false;
        if (mergecell && mergecell.length > 0) {
          for (var i = 0; i < mergecell.length; i++) {
            if (mergecell[i].col == col && mergecell[i].row == row) {
              ismerge = true;
              return mergecell[i].rowspan;
            }
          }
        }
        if (!ismerge) {
          return '';
        }
      };
    },
    showTd() {
      return function(tr) {
        const deleteList = this.deleteList;
        let isShow = true;
        let trlist = [];
        if (tr && tr.length > 0) {
          trlist = tr.filter(td => {
            let isShow = deleteList.filter(de => {
              return de.col == td.col && de.row == td.row;
            });
            return isShow.length < 1;
          });
        }
        return trlist;
      };
    },
    setTrshow() {
      return function(index) {
        let showStyle = {};
        if ((this.hideTrlist && this.hideTrlist.length > 0 && this.hideTrlist.indexOf(index) > -1) || (this.emptyRow.length > 0 && this.emptyRow.indexOf(index - 1) > -1) || (this.stephidetrList && this.stephidetrList.length > 0 && this.stephidetrList.indexOf(index) > -1)) {
          showStyle = { display: 'none' };
        }
        return showStyle;
      };
    },
    getComponent() {
      return function(pitem) {
        let com = this.componentList.filter(c => {
          return pitem.uuid == c.uuid;
        });
        return com || [];
      };
    },
    getformAttributeHide() {
      // 扩展组件和设置隐藏属性组件，组件隐藏
      return uuid => {
        if (this.formAttributeHideList.includes(uuid)) {
          return true;
        } else {
          return false;
        }
      };
    }
  },
  watch: {
    hideComponentlist: {
      handler: function(val) {
        let _this = this;
        if (val && val.length > 0) {
          val.forEach(v => {
            if (_this.getComponentdefaultstatus(v, 'empty')) {
              _this.updateContent(v, null);
            }
          });
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.sheet-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 10px 10px;
  table-layout: fixed;
  thead {
    height: 0;
  }

  tbody {
    tr {
      td {
        /*min-width: 170px;*/
        // background: #fff;
        vertical-align: middle;
        // padding: 3px 0;
        height: 47px;
        position: relative;
        word-break: break-all;
        border-radius: 6px;
        /*overflow: hidden;*/
        &.text-right {
          padding-right: 12px;
        }
      }
    }
  }
  // 解决sheet-table 添加间距，导致单选和复选框勾选样式不对的问题
  td[type='formradio'] {
    /deep/ .ivu-radio-inner:after {
      top: 50%! important;
      left: 50% !important;
      transform: translate(-50%, -50%) scale(.38);
    }
  }
  td[type='formcheckbox'] {
    /deep/ .ivu-checkbox-inner:after {
      top: -9px !important;
      left: -9px !important;
    }
  }
  // 解决复选框和文字对不齐问题
 /deep/ .overflow-ellipsis .ivu-checkbox-group > label > span.ivu-checkbox {
    top: 0;
  }
}
</style>
