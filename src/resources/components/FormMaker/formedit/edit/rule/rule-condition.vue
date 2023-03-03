<template>
  <div>
    <div v-for="(cond, cindex) in conditionList" :key="cindex">
      <div v-if="cond.list && cond.list.length>0" class="rule-item div-rule bg-block">
        <div v-for="(con,coindex) in cond.list" :key="coindex">
          <div>
            <Row :gutter="8" @mouseenter.native="highlight(con)">
              <Col :span="con.component ? 8 : 21">
                <TsFormSelect
                  :ref="'compnent_' + cindex"
                  v-model="con.component"
                  :dataList="rulecontrollerList"
                  :clearable="false"
                  valueName="uuid"
                  textName="label"
                  placeholder="请选择组件"
                  :validateList="requirevalid"
                  @on-change="getConfig(con)"
                ></TsFormSelect>
              </Col>
              <Col v-if="con.component" :span="con.expression && excludevalList.indexOf(con.expression) < 0 ? 6 : 13">
                <TsFormSelect
                  v-model="con.expression"
                  :dataList="ruleOpt(con)"
                  :validateList="requirevalid"
                  :clearable="false"
                  @on-change="changeStatus"
                ></TsFormSelect>
              </Col>
              <Col v-if="con.expression && excludevalList.indexOf(con.expression) < 0" span="7">
                <Items :is="handlerType(con.component)" v-model="con.value" :config="getselectConfig(con.component)"></Items>
              </Col>
              <Col span="3" class="col-btn">
                <div class="text-href tsfont-plus-o text-action btn-actionbtn" title="新增条件" @click="addConditionlist(cond.list)"></div>
                <div
                  v-if="cond.list.length==1 && conditionList.length>1"
                  title="删除条件"
                  class="tsfont-close-o text-action btn-actionbtn"
                  @click="removeList(conditionList, cindex)"
                ></div>
                <div
                  v-else-if="cond.list.length>1"
                  title="删除条件"
                  class="tsfont-close-o text-action btn-actionbtn"
                  @click="removeList(cond.list, coindex)"
                ></div>
              </Col>
            </Row>
          </div>
          <div>
            <Row v-if="coindex < cond.list.length - 1">
              <Col span="1"></Col>
              <Col span="20">
                <div class="rel-container text-href">
                  <TsFormSelect
                    v-model="con.rel"
                    :dataList="relList"
                    :clearable="false"
                    :validateList="requirevalid"
                    border="none"
                  ></TsFormSelect></div>
              </Col>
            </Row>
          </div>
        </div>
      </div>
      <div style="padding:0 6px;">
        <Row v-show="cindex < conditionList.length - 1">
          <Col span="20">
            <div class="rel-container text-href"><TsFormSelect
              v-model="cond.rel"
              :dataList="relList"
              :clearable="false"
              :validateList="requirevalid"
              border="none"
            ></TsFormSelect></div>
          </Col>
        </Row>
      </div>
    </div>
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import Items from '../../items';
export default {
  name: '',
  inject: {
    $actionAuthorityConfig: {
      default: null
    }
  },
  components: {
    TsFormSelect,
    ...Items
  },
  filters: {},
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: Array,
    controllerList: Array
  },
  data() {
    return {
      conditionList: [],
      rulecontrollerList: [], //可以配置条件的组件，排除布局组件和特殊组件
      dateruleList: [
        //时间的规则匹配
        { text: '等于', value: 'equal' },
        { text: '不等于', value: 'unequal' },
        { text: '早于', value: 'less-than' },
        { text: '晚于', value: 'greater-than' },
        { text: '为空', value: 'empty' },
        { text: '不为空', value: 'non-empty' },
        { text: '值改变', value: 'change'}
      ],
      commonruleList: [
        { text: '等于', value: 'equal' },
        { text: '不等于', value: 'unequal' },
        { text: '包含', value: 'include' },
        { text: '不包含', value: 'exclude' },
        { text: '为空', value: 'empty' },
        { text: '不为空', value: 'non-empty' },
        { text: '值改变', value: 'change'}
      ],
      singleruleList: [
        { text: '等于', value: 'equal' },
        { text: '不等于', value: 'unequal' },
        { text: '为空', value: 'empty' },
        { text: '不为空', value: 'non-empty' },
        { text: '值改变', value: 'change'}
      ],
      numberruleList: [
        { text: '等于', value: 'equal' },
        { text: '不等于', value: 'unequal' },
        { text: '小于', value: 'less-than' },
        { text: '大于', value: 'greater-than' },
        { text: '为空', value: 'empty' },
        { text: '不为空', value: 'non-empty' },
        { text: '值改变', value: 'change'}
      ],
      relList: [
        {
          text: '并且',
          value: 'and'
        },
        {
          text: '或者',
          value: 'or'
        }
      ],
      excludevalList: ['empty', 'non-empty', 'change'], //不需要选择值的场景,选择为空、不为空,后期还有个改变值
      requirevalid: ['required']
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    highlight(item) {
      this.$emit('highlight', item);
    },
    getConfig(item) {
      this.$set(item, 'expression', '');
      this.$set(item, 'value', '');
      this.$set(item, 'rel', 'and');
    },
    changeStatus(val) {},
    addConditionlist(list) {
      let li = {
        component: '', //组件uuid
        expression: '', //匹配表达式
        value: '', //匹配值
        rel: 'and'
      };
      list.push(li);
    },
    removeList(list, index) {
      this.$nextTick(() => {
        list.splice(index, 1);
      });
    }
  },
  computed: {
    ruleOpt() {
      return function(config) {
        let list = [];
        let uuid = config.component;
        let selectedCom = this.rulecontrollerList.filter(rule => {
          return rule.uuid == uuid;
        });
        if (selectedCom && selectedCom.length > 0) {
          if (selectedCom[0].handler == 'formdate' || selectedCom[0].handler == 'formtime') {
            list = this.dateruleList;
          } else if ((selectedCom[0].handler == 'formselect' && selectedCom[0].config && selectedCom[0].config.isMultiple === false) || selectedCom[0].handler == 'formcascadelist' || selectedCom[0].handler == 'formradio') {
            list = this.singleruleList;
          } else if (selectedCom[0].handler == 'forminput' && selectedCom[0].config && selectedCom[0].config.textType && selectedCom[0].config.textType == 'float') {
            //20200825_zqp_补充数字的选项(比如体温等)
            list = this.numberruleList;
          } else {
            list = this.commonruleList;
          }
        }
        return list;
      };
    },
    handlerType() {
      return function(uuid) {
        let type = 'forminput';
        let selectedCom = this.rulecontrollerList.filter(rule => {
          return rule.uuid == uuid;
        });
        if (selectedCom && selectedCom.length > 0) {
          type = selectedCom[0].handler;
        }
        return type;
      };
    },
    getselectConfig() {
      return function(uuid) {
        let config = {};
        let selectedCom = this.rulecontrollerList.filter(rule => {
          return rule.uuid == uuid;
        });
        if (selectedCom && selectedCom.length > 0) {
          config = selectedCom[0];
        }
        return config;
      };
    }
  },
  watch: {
    controllerList: {
      handler: function(val) {
        let _this = this;
        if (val) {
          this.rulecontrollerList = val.filter(con => {
            let filterList = _this.$actionAuthorityConfig ? _this.$actionAuthorityConfig.conditionList || false : false;
            if (filterList) {
              return filterList.indexOf(con.handler) >= 0;
            } else {
              return true;
            }
          });
        }
      },
      immediate: true,
      deep: true
    },
    conditionList: {
      handler: function(val) {
        this.$emit('change', val);
      },
      deep: true
    },
    value: {
      handler: function(val) {
        if (val && JSON.stringify(val) != JSON.stringify(this.conditionList)) {
          this.conditionList = val;
        }
      },
      deep: true,
      immediate: true    
    }
  }

};

</script>
<style lang='less' scoped>
  .rel-container {
    width: 60px;
    position: relative;
    &:before,
    &:after {
      content: '';
      position: absolute;
      left: 17px;
      width: 0px;
      height: 6px;
      border-left: 1px solid;
      z-index: 9;
    }
    &:before {
      top: 0;
    }
    &:after {
      bottom: 0;
    }
    /deep/ .ivu-input {
      background: transparent;
    }
  }
  .col-btn{
    >div{
      display: inline-block;
    }
  }
</style>
