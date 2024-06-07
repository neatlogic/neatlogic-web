
<template>
  <div v-if="list && list.length" class="input-border">
    <div v-for="(l, lindex) in list" :key="lindex" class="item-box">
      <div>
        <Row v-if="canEdit" :gutter="8" class="edit-param-list">
          <Col span="6">
            <div class="param-title overflow" :class="l.config && l.config.isRequired?'require-label':''">
              <span>
                <Tooltip
                  placement="top"
                  theme="light"
                  transfer
                  :content="l.typeText"
                >
                  <i :class="typeIcon[l.type]? typeIcon[l.type] :'tsfont-forminput'" class="text-tip fz10"></i>
                </Tooltip>
              </span>
              <span :title="l.name" class="overflow">{{ l.name }}</span>
              <template v-if="l.description">
                <span>
                  <Tooltip
                    placement="top"
                    theme="light"
                    transfer
                    max-width="500"
                    :content="l.description"
                  >
                    <i class="tsfont-info-o text-tip fz10"></i>
                  </Tooltip>
                </span>
              </template>
            </div>
          </Col>
          <Col v-if="configParamList[lindex].isRequired" span="6">
            <TsFormSelect
              v-model="configParamList[lindex].mappingMode"
              :dataList="getList(inputTypeList, isFirst, true, profileParamVoList, l)"
              v-bind="styleConfig"
              :validateList="validateList"
              :disabled="!canEdit"
              @change="changeMappingMode(configParamList[lindex],l)"
            ></TsFormSelect>
          </Col>
          <Col v-if="!configParamList[lindex].isRequired" :span="configParamList[lindex].mappingMode == 'isempty' ? 18 : 6">
            <TsFormSelect
              v-model="configParamList[lindex].mappingMode"
              :dataList="getList(inputTypeList, isFirst, false, profileParamVoList, l)"
              v-bind="styleConfig"
              :validateList="validateList"
              :disabled="!canEdit"
              @change="changeMappingMode(configParamList[lindex],l)"
            ></TsFormSelect>
          </Col>
          <Col v-if="configParamList[lindex].mappingMode == 'constant'" span="12">
            <div
              :is="configParamList[lindex].component + 'Handler'"
              v-model="configParamList[lindex].value"
              :disabled="!canEdit"
              isRequired
              :config="getConfig(configParamList[lindex],paramsTypeList)"
              :phaseList="phaseList"
              class="param-value"
            ></div>
          </Col>
          <Col v-else-if="configParamList[lindex].mappingMode == 'runtimeparam'" span="12">
            <TsFormSelect
              v-model="configParamList[lindex].value"
              :dataList="getParamList(paramList, configParamList[lindex].component)"
              transfer
              textName="name"
              valueName="key"
              :validateList="validateList"
              :disabled="!canEdit"
              :firstText="$t('term.autoexec.jobparam')"
              :firstSelect="false"
              :firstLi="isEditRuntimeParam"
              @first="gotoAddParameter"
            ></TsFormSelect>
          </Col>
          <Col v-else-if="configParamList[lindex].mappingMode.indexOf('prenode')==0" span="12">
            <PrenodeSelect
              :value="configParamList[lindex].value"
              :dataList="getPrevList(prevList, configParamList[lindex].component,configParamList[lindex].mappingMode)"
              :disabled="!canEdit"
              @updateVal="(val)=>{changePrenode(val,lindex)}"
            ></PrenodeSelect>
          </Col>
          <!-- 预置参数集 -->
          <Col v-else-if="configParamList[lindex].mappingMode == 'profile'" span="12">
            <div
              :is="configParamList[lindex].component + 'Handler'"
              v-if="getProfileParamConfig(profileParamVoList,l).mappingMode == 'constant'"
              :value="getProfileParamConfig(profileParamVoList,l).defaultValue"
              :disabled="true"
              :config="getConfig(configParamList[lindex],paramsTypeList)"
              :phaseList="phaseList"
              class="param-value"
            ></div>
            <div v-else-if="getProfileParamConfig(profileParamVoList,l).mappingMode == 'globalparam'">
              <Globalparam v-model="getProfileParamConfig(profileParamVoList,l).defaultValue" :params="getGlobalparamType(l.type)" :disabled="true"></Globalparam>
            </div>
          </Col>
          <!-- 全局参数 -->
          <Col v-else-if="configParamList[lindex].mappingMode == 'globalparam'" span="12">
            <Globalparam v-model="configParamList[lindex].value" :params="getGlobalparamType(l.type)"></Globalparam>
          </Col>
        </Row>
        <template v-else>
          <Readonly
            :config="l"
            :value="configParamList[lindex]"
            :paramList="paramList"
            :inputTypeList="inputTypeList"
            :paramsTypeList="paramsTypeList"
            :prevList="prevList"
            :phaseList="phaseList"
            :profileParamVoList="profileParamVoList"
            :prenodeDataList="getPrevList(prevList, configParamList[lindex].component,configParamList[lindex].mappingMode)"
          ></Readonly>
        </template>
        <!-- <Row :gutter="16">
          <Col span="24">
            <div class="line-2 item-read">
              <span class="tsfont-formstaticlist item-key">{{ l.name }}</span>
              <span class="text-tip">({{ getTypeName(configParamList[lindex].mappingMode) }}):</span>
              <span class="item-value">{{ configParamList[lindex].value }}</span>
            </div>
          </Col>
        </Row> -->
      </div>
    </div>
  </div>
  <div v-else>
    {{ $t('page.notarget', {target: $t('page.inputparam')}) }}
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect.vue';
import items from '@/views/pages/autoexec/components/param/view/index.js';
export default {
  name: 'InputParam',
  inject: {
    openParamsSetting: {
      default: () => {}
    },
    getCombopConfig: { //组合工具详情
      default: () => {}
    }
  },
  components: {
    TsFormSelect,
    ...items,
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput.vue'),
    Readonly: () => import('./readonly.vue'),
    Globalparam: () => import('./globalparam.vue'),
    PrenodeSelect: () => import('./prenode-select.vue')
  },
  filters: {},
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    list: Array,
    value: {
      type: Array,
      default() {
        return [];
      }
    },
    prevList: Array,
    canEdit: [Boolean, Number],
    isFirst: [Boolean, Number],
    paramList: {
      type: Array,
      default() {
        return [];
      }
    },
    paramsTypeList: {
      type: Array,
      default() {
        return [];
      }
    },
    inputTypeList: {
      type: Array,
      default() {
        return [];
      }
    },
    stepConfig: Object, //当前阶段的所有数据
    profileId: {
      type: Number,
      default: null
    } //预置参数集
  },
  data() {
    return {
      configParamList: [],
      styleConfig: {
        border: 'border',
        transfer: true,
        clearable: false
      },
      validateList: ['required'],
      phaseList: [],
      profileParamVoList: [], //预置参数集：参数列表
      typeIcon: {
        text: 'tsfont-forminput', //文本输入
        password: 'tsfont-lock', //密码
        file: 'tsfont-wenjian', //文件
        filepath: 'tsfont-wenjian', //文件路径
        date: 'tsfont-calendar', //日期
        datetime: 'tsfont-riqishijian', //日期时间
        json: 'tsfont-json', //json
        select: 'tsfont-formselect', //下拉单选
        multiselect: 'tsfont-formselectcascader', //下拉多选
        time: 'tsfont-formtime', //时间
        radio: 'tsfont-circle-o', //单选
        checkbox: 'tsfont-check-square', //复选
        node: 'tsfont-blocks', //节点
        account: 'tsfont-userinfo', //账号
        textarea: 'tsfont-formtextarea', //文本域
        phase: 'tsfont-stage', //阶段
        switch: 'tsfont-canvas' //开关
      },
      isEditRuntimeParam: true,
      paramTypeConfig: { //参数类型引用规则
        text: ['text', 'date', 'time', 'datetime', 'select', 'radio', 'textarea', 'phase', 'password'], //如果自定义工具或工具库的参数类型是是【文本】类型，以下控件类型的作业参数、全局参数均可被引用：文本、日期、时间、时间日期、单选下拉、单选、文本域、阶段、密码
        textarea: ['text', 'textarea'],
        json: ['json', 'node']
      }
    };
  },
  beforeCreate() {},
  created() {
    if (this.stepConfig && this.stepConfig.config && this.stepConfig.config.profileId) {
      this.getProfileParamsList(this.stepConfig.config.profileId, true);
    } else {
      this.profileParamVoList = [];
    }
  },
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    clearValue(item) {
      this.$set(item, 'value', '');
    },
    valid() {
      //校验输入参数是否通过
      if (this.$el.querySelectorAll('.form-li').length) {
        let isVaild = true;
        let childrendom = this.$el.querySelectorAll('.form-li');
        if (childrendom && childrendom.length > 0) {
          childrendom.forEach(children => {
            if (children.__vue__ && children.__vue__.valid) {
              if (!children.__vue__.valid()) {
                isVaild = false;
              }
            }
          });
        }
        this.$forceUpdate();
        return isVaild;
      } else {
        return true;
      }
    },
    changeMappingMode(item, l) {
      if (item.mappingMode == 'constant' && l.defaultValue) { //选择常量时把默认值替换
        this.$set(item, 'value', l.defaultValue);
      } else if (item.mappingMode == 'profile') { ////选择参数集时把默认值替换
        let findItem = this.profileParamVoList.find(p => {
          return p.key == item.key && p.type == item.component && !this.$utils.isEmpty(p.defaultValue);
        });
        this.getProfileValue(findItem, item);
      } else {
        this.clearValue(item);
      }
    },
    gotoAddParameter() { //添加作业参数
      this.openParamsSetting();
    },
    getPhaseList(list) {
      if (list && list.length > 0) {
        this.phaseList = list.map(item => {
          return {
            text: item.name,
            value: item.name
          };
        });
      }
    },
    getProfileParamsList(id, isFirst) { //预置参数集：参数列表
      this.$api.autoexec.profile.getProfileDetailById(id).then((res) => {
        if (res.Status == 'OK') {
          this.profileParamVoList = res.Return.profileParamVoList || [];
          !isFirst && this.updateParamMappingList(this.profileParamVoList);
          this.$forceUpdate();
        }
      });
    },
    //判断是否需要把预置参数集的选项过滤
    filterProfile(list, profileParamVoList, item) {
      let dataList = list || [];
      let isFilterProfile = true;
      if (profileParamVoList && profileParamVoList.length > 0) {
        profileParamVoList.forEach(p => {
          if (p.key == item.key && p.type == item.type && !this.$utils.isEmpty(p.defaultValue)) {
            isFilterProfile = false;
          }
        });
      }
      if (isFilterProfile) {
        dataList = dataList.filter(d => {
          return d.value != 'profile';
        });
      }
      return dataList;
    },
    updateParamMappingList(val) { //改变参数集时更新输入参数
      let profileParamVoList = val;
      if (this.configParamList && this.configParamList.length > 0) {
        if (profileParamVoList && profileParamVoList.length > 0) {
          this.configParamList.forEach(item => {
            let findItem = profileParamVoList.find(p => {
              return p.key == item.key && p.type == item.component && !this.$utils.isEmpty(p.defaultValue);
            });
            if (findItem) {
              this.$set(item, 'mappingMode', 'profile');
              this.getProfileValue(findItem, item);
            } else if (item.mappingMode == 'profile') {
              this.$set(item, 'mappingMode', 'constant');
              this.$set(item, 'value', this.getComponentValue(item));
            }
          });
        } else {
          this.configParamList.forEach(item => {
            if (item.mappingMode == 'profile') {
              this.$set(item, 'mappingMode', 'constant');
              this.$set(item, 'value', this.getComponentValue(item));
            }
          });
        }
      }
    },
    getProfileValue(profileConfig, item) { //替换参数集的值
      this.$set(item, 'value', profileConfig.key);
    },
    getComponentValue(item) { //不同组件类型的默认值
      let value = null;
      if (item.component == 'switch') { //开关类型的参数值：true/false
        value = false;
      }
      return value;
    },
    prevListConversion(arr) {
      let level1 = 'combopUuid';//获取一级属性名称: 阶段
      let level2 = 'operationUuid';//获取二级属性名称：工具
      let level3 = 'key';//获取三级属性名称：参数
      let list = Array.from(new Set(
        arr.map(item => {
          return {
            value: item['combopUuid'],
            label: item['combopName']
          };
        })));
      let subList = [];
      list.forEach(res => {
        arr.forEach(ele => {
          if (ele[level1] === res.value) {
            let nameArr = subList.map(item => item.value);
            if (nameArr.indexOf(res.value) !== -1) {
              let nameArr2 = subList[nameArr.indexOf(res.value)].children.map(item => item.value);
              if (nameArr2.indexOf(ele[level2]) !== -1) {
                if (!subList[nameArr.indexOf(res.value)].children[nameArr2.indexOf(ele[level2])].children.find(c => c.label == ele['name'])) {
                  subList[nameArr.indexOf(res.value)].children[nameArr2.indexOf(ele[level2])].children.push({
                    value: ele[level3],
                    label: ele['name']
                  });
                }
              } else {
                subList[nameArr.indexOf(res.value)].children.push({
                  value: ele[level2],
                  label: ele['operationName'] + (ele.operationLetter ? ('_' + ele.operationLetter) : '') + (ele.operationDes ? '[' + ele.operationDes + ']' : ''),
                  operationDes: ele.operationDes,
                  children: [{
                    value: ele[level3],
                    label: ele['name']
                  }]
                });
              }
            } else {
              subList.push({
                value: res.value,
                label: res.label,
                children: [{
                  value: ele[level2],
                  label: ele['operationName'] + (ele.operationLetter ? ('_' + ele.operationLetter) : '') + (ele.operationDes ? '[' + ele.operationDes + ']' : ''),
                  operationDes: ele.operationDes,
                  children: [{
                    value: ele[level3],
                    label: ele['name']
                  }]
                }]
              });
            }
          }
        });
      });
      return subList;
    },
    changePrenode(val, lindex) {
      this.configParamList[lindex].value = val;
    }
  },
  computed: {
    getTypeName() {
      return function(type) {
        let currentItem = this.inputTypeList.find(t => {
          return t.value == type;
        });
        return currentItem ? currentItem.text : '';
      };
    },
    getPrevList() {
      return function(list, type, mappingMode) {
        if (list && list.length) {
          let li = [];
          if (mappingMode == 'prenodeoutputparamkey') { //引用上游参数名-选项不受限制
            li = list;
          } else {
            li = list.filter(l => {
              if (this.paramTypeConfig.hasOwnProperty(type)) {
                let typelist = this.paramTypeConfig[type];
                return typelist.includes(l.type);
              } else {
                return l.type == type;
              }
            });
          }
          if (li && li.length) {
            return this.prevListConversion(li);
          } else {
            return [];
          }
        } else {
          return [];
        }
      };
    },
    getList() {
      return function(list, isFirst, exclueEmpty, profileParamVoList, item) {
        let dataList = list.filter(l => {
          return isFirst ? (exclueEmpty ? (l.value != 'isempty' && l.value.indexOf('prenode') == -1) : l.value.indexOf('prenode') == -1) : (exclueEmpty ? l.value != 'isempty' : l);
        });
        dataList = this.filterProfile(dataList, profileParamVoList, item);
        return dataList;
      };
    },
    getParamList() {
      return function(list, type) {
        //需要过滤掉类型不同类的
        if (list && list.length) {
          if (this.paramTypeConfig.hasOwnProperty(type)) {
            let typelist = this.paramTypeConfig[type];
            return list.filter(l => {
              return typelist.includes(l.type);
            });
          } else {
            return list.filter(l => {
              return l.type == type;
            });
          }
        } else {
          return [];
        }
      };
    },
    getConfig() {
      return function(com, paramsTypeList) { //直接使用带过来的数据，因为带过来的数据含有矩阵相关的配置
        let item = com.config;
        item = item || paramsTypeList.find(p => {
          return p.value == com.component;
        });
        return item || {};
      };
    },
    getProfileParamConfig() {
      return (profileParamVoList, item) => {
        let config = '';
        profileParamVoList.forEach(p => {
          if (p.key == item.key && p.type == item.type) {
            config = p;
          }
        });
        return config;
      };
    },
    getGlobalparamType() {
      return (type) => {
        let params = {
          typeList: [type]
        };
        if (this.paramTypeConfig.hasOwnProperty(type)) {
          this.$set(params, 'typeList', this.paramTypeConfig[type]);
        }
        return params;
      };
    },
    prenodeValue() {
      return (val) => {
        let defaultValue = [];
        if (val && typeof val == 'string') {
          defaultValue = val.split('&&');
        } else if (typeof val == 'array') {
          defaultValue = val;
        }
        return defaultValue;
      };
    }
  },
  watch: {
    list: {
      handler(val) {
        if (val) {
          let _this = this;
          if (val.length) {
            this.configParamList = val.map(l => {
              let currentItem =
                _this.value &&
                _this.value.find(v => {
                  return v.key == l.key;
                });
              return {
                mappingMode: currentItem ? currentItem.mappingMode : (l.isRequired ? 'constant' : 'isempty'),
                key: l.key,
                value: _this.$utils.deepClone(currentItem && currentItem.hasOwnProperty('value') ? currentItem.value : (l.isRequired && !this.$utils.isEmpty(l.defaultValue) ? l.defaultValue : '')),
                isRequired: !!l.isRequired,
                component: l.type,
                config: l.config || null
              };
            });
          } else {
            this.configParamList = [];
          }
        }
      },
      deep: true,
      immediate: true
    },
    configParamList: {
      handler(val) {
        let currentConfig = val.length
          ? val.map(v => {
            return {
              mappingMode: v.mappingMode,
              key: v.key,
              value: this.$utils.deepClone(v.value),
              type: v.component
            };
          })
          : [];
        let isSame = this.$utils.isSame(currentConfig, this.value);
        if (!isSame) {
          this.$emit('change', currentConfig);
        }
      },
      deep: true,
      immediate: true
    },
    getCombopConfig: {
      handler(val) {
        if (val) {
          let list = val.phaseList || [];
          this.getPhaseList(list);
          if (val.hasOwnProperty('isEditRuntimeParam')) {
            this.isEditRuntimeParam = val.isEditRuntimeParam;
          }
        }
      },
      deep: true,
      immediate: true
    },
    profileId(val) {
      if (val) {
        this.getProfileParamsList(val);
      } else {
        this.profileParamVoList = [];
        this.updateParamMappingList(this.profileParamVoList);
      }
    }
  }
};
</script>
<style lang="less" scoped>
.item-read {
  .item-key {
    &:before {
      opacity: 0.8;
      margin-right: 4px;
    }
  }
  .item-value {
    margin-left: 8px;
  }
}
.item-box{
  .edit-param-list {
    line-height: 32px;
    .param-title{
      display: flex;
      align-items: flex-end;
      height: 32px;
      padding-top: 1px;
    }
  }
  &:not(:last-child){
    padding-bottom: 10px;
  }
  .param-value {
    white-space: break-spaces;
  }
}
</style>
