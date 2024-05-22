<template>
  <div>
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">
        组件联动
        <span class="text-href tsfont-plus" style="margin-left:16px;" @click="addRule()">联动</span>
      </label>
      <div v-if="ruleList && ruleList.length > 0" class="formsetting-text">
        <div class="rule-container">
          <div v-for="(rule, rindex) in ruleList" :key="rindex" class="tsForm-border-bottom tsForm-item">
            <div class="div-rule bg-block">
              <span class="tsfont-close btn-removerule" @click="removeRule(rindex, ruleList)"></span>
              <div>
                <div class="text-grey title">条件(当前组件)</div>
                <RuleCondition
                  :uuid="uuid"
                  :handler="handler"
                  :setting="setting"
                  :rule="rule"
                ></RuleCondition>
              </div>
              <div>
                <div class="text-grey title">动作</div>
                <div v-if="rule.actionList && rule.actionList.length > 0">
                  <div v-for="(action, aindex) in rule.actionList" :key="aindex" class="rule-top tsForm-border-bottom action-list">
                    <RuleAction
                      :uuid="uuid"
                      :handler="handler"
                      :relationList="relationList"
                      :sheetsConfig="sheetsConfig"
                      :rowLength="rowLength"
                      :action="action"
                      :rule="rule"
                      :aindex="aindex"
                      @removeAction="removeAction(aindex,rule.actionList)"
                    ></RuleAction>
                  </div>
                </div>
                <div>
                  <span class="text-action tsfont-plus span-addrule" @click="addAction(rule.actionList)">动作</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- end_拓展的通用设置，授权跟规则 -->
  </div>
</template>
<script>
export default {
  name: 'Rule',
  components: {
    RuleCondition: () => import('./rule/condition.vue'),
    RuleAction: () => import('./rule/action.vue')
  },
  props: {
    uuid: {
      type: String
    },
    handler: {
      type: String,
      default: 'formselect'
    },
    setting: Object,
    relationList: Array,
    isValid: {
      type: Boolean,
      default: true
    },
    sheetsConfig: Object,
    rowLength: Number

  },
  data() {
    let _this = this;
    return {
      componentOpt: [], //除了自己的组件
      ruleList: _this.setting.ruleList || [],

      actionList: [
        { text: '隐藏', value: 'hide' },
        { text: '显示', value: 'show' },
        { text: '只读', value: 'read' },
        { text: '赋值', value: 'setvalue'}
      ],
      actionUnit: [
        { text: '行', value: 'row' },
        { text: '组件', value: 'component' }
      ],
      defaultruleUnit: {
        conditionConfig: {
          type: 'value',
          expression: 'equal',
          value: ''
        },
        actionList: [
          {
            type: 'hide',
            unit: 'component',
            value: ''
          }
        ]
      },
      defaultmetrixruleUnit: {
        conditionConfig: {
          type: '',
          expression: 'equal',
          value: ''
        },
        actionList: [
          {
            type: 'hide',
            unit: 'component',
            value: ''
          }
        ],
        matrixList: []
      },
      defaultactionUnit: {
        type: 'hide',
        unit: 'component',
        value: ''
      },
      showSelectrow: false, //是否显示选择行的弹窗
      rowVal: [], //选中列
      defaultUint: {
        'hide': 'component',
        'show': 'component',
        'read': '',
        'setval': ''

      }
    };
  },
  created() {},
  mounted() {},
  destroyed() {},
  methods: {
    getRulelist() {
      let _this = this;
      if (!_this.setting.ruleList) {
        _this.setting.ruleList = [];
      }
      _this.ruleList = _this.setting.ruleList;
    },
    getRuletype(handler) {
      let isShow = false;
      let selectList = ['formradio', 'formcheckbox', 'formselect'];
      isShow = selectList.indexOf(handler) > -1;
      return isShow;
    },
    addRule() {
      let _this = this;
      let newrule = _this.setting.dataSource == 'matrix' ? _this.$utils.deepClone(_this.defaultmetrixruleUnit) : _this.$utils.deepClone(_this.defaultruleUnit);
      if (this.handler == 'formcascadelist') {
        newrule.conditionConfig.levelIndex = 1;
      }
      _this.ruleList.push(newrule);
    },
    addAction(list) {
      let _this = this;
      let newaction = _this.$utils.deepClone(_this.defaultactionUnit);
      list.push(newaction);
    },
    removeAction(ind, list) {
      list.splice(ind, 1);
    },
    removeRule(ind, list) {
      list.splice(ind, 1);
    },
    selectRow(val) {
      this.rowVal = this.$utils.deepClone(val) || [];
      this.showSelectrow = true;
    },
    toggleselectRow(li, action) {
      let val = action.value;
      if (val && val.length > 0) {
        if (val.indexOf(li) > -1) {
          let turn = val.indexOf(li);
          val.splice(turn, 1);
        } else {
          val.push(li);
        }
      } else {
        val = [];
        val.push(li);
      }
      val.sort(this.$utils.sortNumber());
      this.$set(action, 'value', val);
    },
    updateSelectrow(vals) {
      this.$set(vals, 'value', this.rowVal);
      this.showSelectrow = false;
    },
    clearSelectrow() {
      this.rowVal = [];
    },
    setRow(val) {
      this.rowVal = val || [];
    },
    clearAction(action) {
      this.$set(action, 'unit', this.defaultUint[action.type]);
      this.$set(action, 'value', '');
    },
    clearActionval(action) {
      this.$set(action, 'value', '');
    },

    getMatrixvalue(item, rule) {
      let _this = this;
      let param = {
        matrixUuid: _this.setting.matrixUuid,
        keywordColumn: item.type,
        valueField: item.type,
        textField: _this.setting.mapping.value
      };
      //this.$set(item, "value", "");
      this.$api.framework.matrix.getMatrixDataForSelect(param).then(res => {
        if (res.Status == 'OK' && !res.Return.isRepeat) {
          let columlist = res.Return.dataList || [];
          rule.matrixList = columlist;
        } else if (res.Return.isRepeat) {
          _this.$Notice.error({
            title: '错误信息',
            desc: '属性列存在相同数据，请重新选择'
          });
          _this.$set(rule, 'matrixList', []);
        }
      });
    },
    getRowgroup(list) {
      let result = [];
      let i = 0;
      result[i] = [list[0]];
      list.reduce(function(prev, cur) {
        cur - prev === 1 ? result[i].push(cur) : (result[++i] = [cur]);
        return cur;
      });
      return result;
    },
    updateVal(val, action) {
      this.$set(action, 'value', val);
    }
  },
  computed: {
    actionValue() {
      return function(exclude) { //新增过滤类型
        let list = [];
        let uuid = this.uuid;
        let relalist = this.relationList;
        if (relalist && relalist.length > 0) {
          list = relalist.filter(v => {
            return exclude ? v.uuid != this.uuid && v.handler != exclude : v.uuid != this.uuid;
          });
        }
        // relalist.forEach(re => {
        //   if (re.uuid != uuid) {
        //     list.push(re);
        //   }
        // });
        return list;
      };
    },
    getMatrix() {
      return function() {
        return [];
      };
    },
    setRowtxt() {
      return function(list) {
        let txt = '';
        if (list && list.length > 0) {
          list.forEach(li => {
            if (li > this.rowLength) {
              list.splice(list.indexOf(li), 1);
            }
          });
        }

        if (list && list.length > 0) {
          let listtxt = this.getRowgroup(list);
          listtxt.forEach((li, lindex) => {
            if (li.length > 1) {
              txt += li[0] + '-' + li[li.length - 1];
            } else {
              txt += li[0];
            }

            if (lindex < listtxt.length - 1) {
              txt += ',';
            }
          });
        }
        return txt;
      };
    },
    setRowli() {
      return function(li, val) {
        let classTxt = 'ivu-select-item';
        if (val && val.length > 0) {
          if (val.indexOf(li) > -1) {
            classTxt += ' ivu-dropdown-item-selected';
          }
        }
        return classTxt;
      };
    },
    getConfig() {
      return function(uuid) {
        let compomentConfig = null;
        if (this.componentOpt && this.componentOpt.length > 0) {
          this.componentOpt.forEach(com => {
            if (com.uuid == uuid) {
              compomentConfig = com;
            }
          });
        }
        return compomentConfig;
      };
    }
  },
  watch: {
    relationList: {
      handler: function(val) {
        if (val && val.length > 0) {
          this.componentOpt = val.filter(v => {
            return v.uuid != this.uuid;
          });
        } else {
          this.componentOpt = [];
        }
      },
      immediate: true,
      deep: true
    },
    ruleList: {
      handler: function(val) {
        this.$parent.updatesetting('ruleList', val);
      },
      deep: true
    },
    setting: {
      handler: function(val, oldval) {
        let _this = this;
        if (val.ruleList) {
          this.ruleList = val.ruleList;
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.rule-container {
  .expression-container {
    // &:hover {
    //   background: #e8f8fb;
    // }
    &:not(:last-of-type) {
      padding-bottom: 10px;
    }
  }
  .span-addrule {
    display: block;
    text-align: center;
    cursor: pointer;
    margin-top: 8px;
  }
  .div-rule {
    padding: 8px;
    position: relative;
    margin-bottom: 10px;
    .title {
      margin-top: 10px;
    }
    .btn-removerule {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 14px;
      height: 14px;
      line-height: 14px;
      text-align: center;
      cursor: pointer;
      display: none;
      opacity: 0.6;
    }
    &:hover {
      .btn-removerule {
        display: block;
        &:hover {
          opacity: 1;
        }
      }
    }
    .btn-action {
      line-height: 30px;
      text-align: center;
      display: block;
      height: 30px;
      opacity: 0.4;
      font-size: 10px;
      width: 30px;
    }
    .action-list {
      &:hover {
        .btn-action {
          opacity: 1;
        }
      }
    }
    /deep/ .row-select {
      position: relative;
      display: block;
      line-height: 31px;
      border-bottom: 1px solid;
      cursor: pointer;
      padding-right: 20px;
      min-height: 32px;
    }
    /deep/ .icon-select {
      position: absolute;
      top: 50%;
      right: 8px;
      line-height: 1;
      transform: translateY(-50%);
      transition: all 0.2s ease-in-out;
      cursor: pointer;
    }
  }
  .action-type {
    line-height: 32px;
    height: 32px;
    text-align: center;
    font-size: 10px;
  }
}
</style>
