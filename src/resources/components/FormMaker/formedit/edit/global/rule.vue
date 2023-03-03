<template>
  <div class="input-border">
    <div class="formsetting-block" @mouseleave="highlight()">
      <div>
        <label class="formsetting-label text-grey rule-amount">
          组件联动
          <Badge :text="relatvieAmount ? relatvieAmount.toString() + '/' + ruleList.length.toString() : ruleList.length.toString()"></Badge>
        </label>
        <span v-if="componentRuleuuid" class="text-primary formsetting-label float-right cursor-pointer" @click="clearRuleuuid">显示所有</span>
      </div>
      <div class="formsetting-text">
        <div class="rule-container">
          <div v-if="ruleList && ruleList.length > 0" class="">
            <div
              v-for="(rule, rindex) in ruleList"
              v-show="showrulelist(componentRuleuuid, rule)"
              :key="rindex"
              class="rule-li border-color"
              :class="'rule_' + rindex"
            >
              <span class="tsfont-close btn-removerule text-danger" @click="removeList(ruleList, rindex)"></span>
              <div v-if="rule.conditionList && rule.conditionList.length > 0">
                <div class="text-grey title bg-grey">
                  条件
                  <span class="text-href tsfont-plus" style="margin-left:16px;" @click="addCondition(rule.conditionList)">条件</span>
                </div>
                <div class="bg-grey">
                  <div class="rule-top action-list" :class="'rule_condition_' + rindex">
                    <RuleCondition
                      v-model="rule.conditionList"
                      :controllerList="controllerList"
                      :excludeController="excludeController"
                      @highlight="highlight"
                    ></RuleCondition>
                  </div>
                </div>
              </div>
              <div>
                <div class="text-grey title bg-grey">
                  动作
                  <span class="text-href tsfont-plus" style="margin-left:16px;" @click="addAction(rule.actionList)">动作</span>
                  <div style="float:right">
                    <Poptip :transfer="true" placement="bottom-end" trigger="hover">
                      <span class="text-action">帮助</span>
                      <div slot="title">帮助</div>
                      <div slot="content" class="help-contain">
                        <p><b>隐藏</b>：隐藏组件或行</p>
                        <p><b>显示</b>：显示组件或行</p>
                        <p><b>只读</b>：只读组件或行</p>
                        <p><b>赋值</b>：给组件自定义赋值</p>
                        <p><b>过滤</b>：将源表单值作为入参，匹配同一矩阵的过滤字段，过滤出目标表单的选项</p>
                        <p>
                          <span class="text-tip">过滤——配置举例</span><br>
                          a、目标组件：选择目标表单组件；<br>
                          b、动作：根据前面选择的目标组件过滤动作选项；<br>
                          c、过滤字段：目标组件绑定矩阵的过滤字段；<br>
                          d、来源组件：提供过滤字段入参的来源表单组件；<br>
                        </p>
                      </div>
                    </Poptip>
                  </div>
                </div>
                <RuleAction
                  v-model="rule.actionList"
                  :sheetsConfig="sheetsConfig"
                  :rowLength="rowLength"
                  :controllerList="controllerList"
                  :rindex="rindex"
                  :excludeController="excludeController"
                  @highlight="highlight"
                ></RuleAction>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Button long @click.native="addRule">
        <i class="tsfont-plus"></i>
        联动
      </Button>
    </div>
  </div>
</template>
<script>
import RuleCondition from '../rule/rule-condition.vue';
import RuleAction from '../rule/rule-action.vue';
export default {
  name: 'Rule',
  components: {
    RuleAction,
    RuleCondition
  },
  props: {
    globalSetting: { type: Object },
    controllerList: { type: Array },
    rowLength: Number,
    sheetsConfig: Object,
    componentRuleuuid: String
  },
  data() {
    let _this = this;
    return {
      //ruleList: [{conditionList:[],actionList:[]}],
      ruleList: [],
      rulecontrollerList: [], //可以配置条件的组件，排除布局组件和特殊组件
      defaultItem: {
        conditionList: [
          {
            list: [
              {
                component: '', //组件uuid
                expression: '', //匹配表达式
                value: '', //匹配值
                rel: 'and'
              }
            ],
            rel: 'and'
          }
        ],
        actionList: [
          {
            component: '', //组件uuid
            action: '', //执行动作
            value: '', //匹配值
            type: 'component' //类型，组件和行
          }
        ]
      },
      relatvieAmount: 0, //过滤当前组件的规则数量
      excludeController: ['formdivider', 'formstaticlist', 'formdynamiclist', 'formlink']//联动的主组件必须是可以配置联动条件的，布局组件和表格的需排除
    };
  },
  created() {},
  mounted() {
    let _this = this;
    if (this.globalSetting) {
      if (this.globalSetting.ruleList && this.globalSetting.ruleList.length > 0) {
        this.globalSetting.ruleList.forEach(rule => {
          if (rule.actionList && rule.actionList.length > 0) {
            rule.actionList.forEach(action => {
              if (!action.type) {
                _this.$set(action, 'type', 'component');
              }
            });
          }
        });
      }
      this.ruleList = this.globalSetting.ruleList || [];
    }
  },
  destroyed() {},
  methods: {
    addRule() {
      let ruleitem = this.$utils.deepClone(this.defaultItem);
      this.ruleList.push(ruleitem);
    },
    addCondition(list) {
      let li = {
        list: [
          {
            component: '', //组件uuid
            expression: '', //匹配表达式
            value: '', //匹配值
            rel: 'and'
          }
        ],
        rel: 'and'
      };
      list.push(li);
    },
    removeList(list, index) {
      this.$nextTick(() => {
        list.splice(index, 1);
      });
    },
    valid() {
      let rule = this.ruleList;
      let ruleList = [];
      let childrendom = this.$el.querySelectorAll('.form-li');
      let isVaild = true;
      if (childrendom && childrendom.length > 0) {
        childrendom.forEach(children => {
          if (children.__vue__ && children.__vue__.valid) {
            if (!children.__vue__.valid()) {
              isVaild = false;
            }
          }
        });
      }
      return isVaild;
    },
    highlight(item) {
      if (item && item.component) {
        this.$parent.hightlight(item.component);
      } else {
        this.$parent.hightlight(null);
      }
    },
    addAction(list) {
      let li = {
        component: '', //组件uuid
        action: '', //执行动作
        value: '', //匹配值
        type: 'component' //类型，组件和行
      };
      list.push(li);
    },
    clearRuleuuid() {
      this.relatvieAmount = 0;
      this.$emit('clearRuleuuid');
    }

  },
  computed: {
    showrulelist() {
      return function(uuid, ruleList) {
        let isshow = true;
        if (uuid) {
          isshow = false;
          if (ruleList.conditionList && ruleList.conditionList.length > 0) {
            ruleList.conditionList.forEach(co => {
              if (co.list && co.list.length > 0) {
                co.list.forEach(li => {
                  if (li.component && li.component == uuid) {
                    isshow = true;
                  }
                });
              }
            });
          }
          //
        }
        return isshow;
      };
    }
  },
  watch: {
    controllerList: {
      handler: function(val) {
        let _this = this;
        if (val) {
          this.rulecontrollerList = val.filter(con => {
            return con.handler && _this.excludeController.indexOf(con.handler) < 0;
          });
        }
      },
      immediate: true,
      deep: true
    },
    ruleList: {
      handler: function(val) {
        this.$emit('updateGlobal', 'ruleList', val);
      },
      deep: true
    },
    componentRuleuuid: {
      handler: function(val) {
        this.relatvieAmount = 0;
        if (val != null) {
          if (this.globalSetting && this.globalSetting.ruleList && this.globalSetting.ruleList.length > 0) {
            this.globalSetting.ruleList.forEach(ruleList => {
              let isIn = false;
              if (ruleList.conditionList && ruleList.conditionList.length > 0) {
                ruleList.conditionList.forEach(co => {
                  if (co.list && co.list.length > 0) {
                    co.list.forEach(li => {
                      if (li.component && li.component == val) {
                        isIn = true;
                      }
                    });
                  }
                });
              }
              if (isIn) {
                this.relatvieAmount++;
              }
            });
          }
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.rule-amount {
  /deep/ .ivu-badge .ivu-badge-count {
    padding: 0 6px;
  }
}
.rule-container {
  /deep/ .btn-actionbtn {
    line-height: 32px;
    height: 32px;
    width: 50%;
    font-size: 10px;
    opacity: 0.4;
    &:hover {
      opacity: 1;
    }
  }
  /deep/ .rule-item {
    padding: 4px 0;
  }
  .expression-container {
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
  .title {
    padding: 8px 0;
  }
  .rule-li {
    position: relative;
    padding: 4px 8px;
    margin-bottom: 10px;
    border: 1px solid;
    /deep/ .btn-removerule {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 14px;
      height: 14px;
      line-height: 14px;
      text-align: center;
      cursor: pointer;
      display: none;
      opacity: 0.6;
    }
    &:hover {
      /deep/ .btn-removerule {
        display: block;
        &:hover {
          opacity: 1;
        }
      }
    }
  }
  /deep/ .div-rule {
    padding: 8px;
    position: relative;

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
    /deep/.row-select {
      border: 1px solid;
      padding-left: 4px;
      
    }
    /deep/.icon-select {
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

  .select-li {
    position: relative;
    padding-left: 20px !important;
    .btn-actionbtn {
      position: absolute;
      left: 1px;
      width: 18px;
      cursor: pointer;
      top: 0;
    }
  }
}

</style>
<style lang="less">
.help-contain{
  p{
    margin-bottom: 15px;
  }
}
</style>
