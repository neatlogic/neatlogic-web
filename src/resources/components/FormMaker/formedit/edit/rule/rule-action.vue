<template>
  <div>
    <div v-if="actionList && actionList.length > 0" class="bg-block div-rule" :class="'rule_action_' + rindex">
      <div v-for="(action, aindex) in actionList" :key="aindex" class="rule-item">
        <Row :gutter="8" @mouseenter.native="highlight(action)">
          <!-- 动作类型 -->
          <Col :span="action.action ? 4 : 22">
            <TsFormSelect
              v-model="action.action"
              :dataList="actionDatalist"
              :validateList="requirevalid"
              :clearable="false"
              placeholder="动作类型"
              @on-change="clearAction(action)"
            ></TsFormSelect>
          </Col>

          <!-- 选择行 或者组件  当动作类型为隐藏  显示  只读-->
          <Col v-if="action.action && isrowList.indexOf(action.action) > -1" span="4">
            <TsFormSelect
              v-model="action.type"
              :dataList="typeList"
              :clearable="false"
              placeholder="请选择类型"
              :validateList="requirevalid"
              @on-change="
                val => {
                  toggleType(val, action);
                }
              "
            ></TsFormSelect>
          </Col>

          <!-- 选中组件 -->
          <!-- {{ newSetting }} --1111221-- -->
          <Col v-if="action.action && (!action.type || action.type == 'component')" :span="novalueList.indexOf(action.action) > -1 ? (isrowList.indexOf(action.action) > -1 ? 14 : 18) : 8">
            <!-- 隐藏  显示  只读  选择的组件  主要是多选 -->
            <TsFormSelect
              v-if="action.action !='setfilter'"
              :ref="'compnent_' + aindex"
              v-model="action.component"
              placeholder="组件"
              :dataList="getcontrollerList(action.action)"
              v-bind="componentConfig"
              :multiple="action.action && action.action.indexOf('set')<0"
              @on-change="clearVal(action)"
            ></TsFormSelect>
            <!-- 过滤 和 赋值 选择的组件 主要是单选-->
            <TsFormSelect
              v-else
              :ref="'compnent_' + aindex"
              v-model="action.component"
              placeholder="组件"
              :dataList="getcontrollerList(action.action)"
              v-bind="componentConfig"
              :multiple="false"
              @on-change="clearVal(action)"
            ></TsFormSelect>
          </Col>
          
          <!-- 选择行 -->
          <Col v-if="action.type == 'row'" span="14">
            <RowSelect
              v-model="action.value"
              :rowLength="rowLength"
              :sheetsConfig="sheetsConfig||{}"
              placeholder="行"
              :controllerList="controllerList||[]"
            ></RowSelect>
          </Col>

          <Col v-if="(!action.type || action.type == 'component') && action.action && novalueList.indexOf(action.action) < 0" :span="action.action == 'setfilter'?5:10">
            <!-- 进行赋值 选择对应组件的具体值 -->
            <Items
              :is="handlerType(action.component)"
              v-if="action.action == 'setvalue'"
              v-model="action.value"
              :config="getselectConfig(action.component)"
            ></Items>
          
            <!--进行过滤  选择过滤属性  -->
            <div v-else-if="action.action == 'setfilter'">
              <TsFormSelect
                v-model="action.value.uuid"
                v-bind="uuidConfig"
                placeholder="过滤属性"
                :dataList="getfilterList(matrixConfig,action.component)"
              ></TsFormSelect>
            </div>
            <div v-else>{{ action.action }}</div>
          </Col>

          <!-- 选择过滤属性的值 -->
          <Col v-if="(!action.type || action.type == 'component') && action.action=='setfilter'" span="5">
            <TsFormSelect
              v-model="action.value.valueCom"
              placeholder="值"
              :dataList="getcontrollerList('filtervalue')"
              v-bind="comConfig"
            ></TsFormSelect>
          </Col>

          <!-- 删除按钮 -->
          <Col span="2">
            <div
              class="tsfont-close-o text-action btn-actionbtn"
              title="删除动作"
              style="width:100%;"
              @click="removeList(actionList, aindex)"
            ></div>
          </Col>
        </Row>
      </div>
    </div>
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import RowSelect from './row-select.vue';
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
    ...Items,
    RowSelect
  },
  filters: {},
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: Array,
    excludeController: Array,
    controllerList: Array,
    rindex: Number,
    rowLength: Number,
    sheetsConfig: Object
  },
  data() {
    return {
      actionList: [],
      rulecontrollerList: [], //可以配置条件的组件，排除布局组件和特殊组件
      componentConfig: {
        clearable: false,
        valueName: 'uuid',
        textName: 'label',
        placeholder: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.component')}),
        validateList: ['required']
      },
      dialogConfig: {
        maskClose: false,
        hasHeader: false,
        showCloseIcon: false,
        type: 'modal',
        title: '请选择行'
      },
      requirevalid: ['required'],
      actionConfig: {
        system: [
          { text: '隐藏', value: 'hide' },
          { text: '显示', value: 'show' },
          { text: '只读', value: 'read' },
          { text: '赋值', value: 'setvalue' },
          { text: '过滤', value: 'setfilter' }
        // { text: '枚举', value: 'setdata', _disabled: true},
        // { text: '脚本', value: 'script'}
        ],
        custom: [{ text: '赋值', value: 'setvalue' }]
      },
      actionDatalist: [
        { text: '隐藏', value: 'hide' },
        { text: '显示', value: 'show' },
        { text: '只读', value: 'read' },
        { text: '赋值', value: 'setvalue' },
        { text: '过滤', value: 'setfilter' }
        // { text: '枚举', value: 'setdata', _disabled: true},
        // { text: '脚本', value: 'script'}
      ],
      novalueList: ['hide', 'show', 'read', 'empty'], //动作不需要设置值选项
      isrowList: ['hide', 'show', 'read'], //动作不需要设置值选项
      typeList: [
        { text: '行', value: 'row' },
        { text: '组件', value: 'component' }
      ],
      uuidConfig: {
        valueName: 'uuid',
        textName: 'name',
        transfer: true,
        clearable: false,
        validateList: ['required']
      },
      comConfig: {
        valueName: 'uuid',
        textName: 'label',
        transfer: true,
        clearable: false,
        validateList: ['required']
      },
      matrixConfig: {}//矩阵数据下拉的数据
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
    clearAction(action) {
      this.$set(action, 'type', 'component');
      this.$set(action, 'component', '');
      //20200915_zqp_需求更改，由原来改变值的组件值作为入参改为：触发条件后自行选择入参的值来自哪个组件
      if (action.action == 'setfilter') {
        Object.assign(action, {
          value: {
            uuid: '',
            valueCom: ''
          }
        });
      } else {
        Object.assign(action, {
          value: ''
        });
      }
    },
    toggleType(type, action) {
      this.$set(action, 'component', '');
      //20200915_zqp_需求更改，由原来改变值的组件值作为入参改为：触发条件后自行选择入参的值来自哪个组件
      if (action.action == 'setfilter') {
        Object.assign(action, {
          value: {
            uuid: '',
            valueCom: ''
          }
        });
      } else {
        Object.assign(action, {
          value: ''
        });
      }
    },
    removeList(list, index) {
      this.$nextTick(() => {
        list.splice(index, 1);
      });
    },
    clearVal(action) {
      //当为改变过滤时，还需要根据当前选中组件的矩阵数据源更新第三个过滤下拉的值
      if (action.action == 'setfilter') {
        Object.assign(action, {
          value: {
            uuid: '',
            valueCom: ''
          }
        });
        let type = '';
        let uuid = '';
        // this.controllerList  是类型所有的数据
        this.controllerList.forEach(v => {
          if (v.uuid == action.component) {
            type = v.config.dataSource;
            uuid = v.uuid;
          }
        });
        if (type == 'integration') {
          // 如果类型为集成 调用 这个接口
          this.getIntegrauuid(uuid);
        } else {
          this.getMatrixuuid(action.component);
        }
      } else {
        Object.assign(action, {
          value: ''
        });        
      }
    },
    async getMatrixuuid(component) {
      let uuid = null;
      if (this.controllerList && this.controllerList.length > 0) {
        this.controllerList.forEach(con => {
          if (con.uuid == component && con.config && con.config.matrixUuid) {
            uuid = con.config.matrixUuid;
          }
        });
      }
      if (uuid && !this.matrixConfig['matrix_' + uuid]) {
        this.$set(this.matrixConfig, 'matrix_' + uuid, []);
        await this.getmatrixList(uuid);
      }
    },
    async getIntegrauuid(component) {
      // 集成调用的方法
      let uuid = null;
      if (this.controllerList && this.controllerList.length > 0) {
        this.controllerList.forEach(con => {
          if (con.uuid == component && con.config && con.config.integrationUuid) {
            uuid = con.config.integrationUuid;
          }
        });
      }
      if (uuid && !this.matrixConfig['matrix_' + uuid]) {
        this.$set(this.matrixConfig, 'matrix_' + uuid, []);
        await this.getIntegraList(uuid);
      }
    },
    getIntegraList(uuid) {
      // 集成的接口
      let _this = this;
      return new Promise((resolve, reject) => {
        _this.$api.framework.integration
          .getIntegrationColumnList({ integrationUuid: uuid })
          .then(res => {
            if (res.Status == 'OK') {
              _this.$set(_this.matrixConfig, 'matrix_' + uuid, res.Return.tbodyList || []);
            }
            resolve(_this.matrixConfig['matrix_' + uuid]);
          })
          .catch(error => {
            _this.$Notice.error({ title: error.data.Message });
            _this.$set(_this.matrixConfig, 'matrix_' + uuid, []);
            resolve(_this.matrixConfig['matrix_' + uuid]);
          });
      });
    },
    getmatrixList(uuid) {
      let _this = this;
      return new Promise((resolve, reject) => {
        _this.$api.framework.matrix
          .getMatrixAttributeByUuid({ matrixUuid: uuid })
          .then(res => {
            if (res.Status == 'OK') {
              let tbodyList = res.Return.tbodyList || [];
              let type = res.Return.type;
              if (type == 'cmdbci') {
                tbodyList = this.getCmdbAttrList(tbodyList);
              }
              _this.$set(_this.matrixConfig, 'matrix_' + uuid, tbodyList);
            }
            resolve(_this.matrixConfig['matrix_' + uuid]);
          })
          .catch(error => {
            _this.$Notice.error({ title: error.data.Message });
            _this.$set(_this.matrixConfig, 'matrix_' + uuid, []);
            resolve(_this.matrixConfig['matrix_' + uuid]);
          });
      });
    },
    getCmdbAttrList(list) { //获取cmdbci的过滤属性
      let newList = [];
      if (list && list.length > 0) {
        list.forEach(item => {
          let config = this.getCmdbAttrConfig(item);
          if (!this.$utils.isEmpty(config)) {
            newList.push(item);
          }
        });
      }
      return newList;
    },
    getCmdbAttrConfig(item) {
      let obj = item.config || {};
      let config = {};
      if (obj && obj['attr']) { //属性
        config = obj['attr'];
      } else if (obj && obj['rel']) { //关系
        config = obj['rel'];
      }
      return config;
    }
  },
  computed: {
    handlerType() {
      return function(uuid) {
        let type = 'forminput';
        let selectedCom = this.rulecontrollerList && this.rulecontrollerList instanceof Array && this.rulecontrollerList.filter(rule => {
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
        let selectedCom = this.rulecontrollerList && this.rulecontrollerList instanceof Array && this.rulecontrollerList.filter(rule => {
          return rule.uuid == uuid;
        });
        if (selectedCom && selectedCom.length > 0) {
          config = selectedCom[0];
        }
        return config;
      };
    },
    getfilterList() {
      return function(matrixConfig, uuid) {
        let list = [];
        let type = '';
        if (this.controllerList && this.controllerList.length > 0) {
          this.controllerList.forEach(con => {
            let matrixUuid = con.config.matrixUuid;
            type = con.config.dataSource;
            if (!matrixUuid) {
              matrixUuid = con.config.integrationUuid;
            }
            if (con.uuid == uuid && con.config && matrixUuid) {
              if (matrixConfig['matrix_' + matrixUuid]) {
                list = matrixConfig['matrix_' + matrixUuid];
              } else {
                // 解决过滤属性列表回显不了的问题
                if (type == 'integration') {
                  // 如果类型为集成 调用 这个接口
                  this.getIntegrauuid(uuid);
                } else {
                  this.getMatrixuuid(uuid);
                }
                list = matrixConfig['matrix_' + matrixUuid];
              }
            }
          });
        }
        //需要过滤掉不能够搜索的矩阵属性
        return list && list instanceof Array && list.filter(item => item.isSearchable);
      };
    },
    getcontrollerList() {
      return function(action) {
        // 'formcheckbox',  'formdate','forminput', 'formradio', 'formselect', 'formtextarea',  'formtime',  'formeditor', 'formdivider',  'formstaticlist', 'formcascadelist', 'formdynamiclist', 'formuserselect', 'formlink', 'formpriority'
        let _this = this;
        let typeList = {
          'hide': _this.$actionAuthorityConfig.showList, //隐藏
          'show': _this.$actionAuthorityConfig.showList, //显示
          'read': _this.$actionAuthorityConfig.showList, //只读
          'setvalue': _this.$actionAuthorityConfig.isValueList, //赋值
          'filtervalue': _this.$actionAuthorityConfig.isValueList, //过滤
          'setfilter': _this.$actionAuthorityConfig.filterList//过滤 主要针对有矩阵数据源的数据
        };

        return this.controllerList && this.controllerList instanceof Array && this.controllerList.filter((con) => {
          if (action && typeList[action] && typeList[action].indexOf(con.handler) >= 0) {
            if (action == 'setfilter') { 
              //只要是矩阵都可以进行  只是说在选择属性的时候需要判断对应的 isSearchable是否可以搜索
              if (con.handler) { 
                return con.config && (con.config.matrixUuid || con.config.integrationUuid); 
              }
            } else {
              return true;
            }
          } 
          return false;
        });
      };
    } 
  
  },
  watch: {
    actionList: {
      handler: function(val) {
        this.$emit('change', val);
      },
      deep: true
    },
    value: {
      handler: function(val) {
        if (val && JSON.stringify(val) != JSON.stringify(this.actionList)) {
          this.actionList = val;
        }
      },
      deep: true,
      immediate: true    
    },
    controllerList: {
      handler: function(val) {
        let _this = this;
        if (val) {
          this.rulecontrollerList = val instanceof Array && val.filter(con => {
            //return con.handler && _this.excludeController.indexOf(con.handler) < 0;
            return true;
          });
        }
      },
      immediate: true,
      deep: true
    }
  }

};

</script>
<style lang='less'>

</style>
