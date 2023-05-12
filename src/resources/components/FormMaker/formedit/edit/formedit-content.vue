<template>
  <div class="formsetting-container bg-grey">
    <div class="formTop">编辑组件</div>
    <div class="btn-closeedit tsfont-close" @click="hideEdit"></div>
    <div v-if="uuid" class="formContain input-border">
      <!-- start_默认的通用设置，名称、描述、宽度 -->
      <div class="formsetting-block">
        <label class="formsetting-label text-grey require-label">组件名称</label>
        <div class="formsetting-text">
          <TsFormInput
            ref="label"
            v-model.trim="name"
            placeholder="请输入插件名称"
            maxlength="50"
            show-word-limit
            :errorMessage="errorMessage"
            :validateList="labelValidJson"
            @on-blur="onBlur"
          />
        </div>
      </div>
      <!-- 优先级不需要这些属性，后期整改时需调整 -->
      <template v-if="handler != 'formpriority'">
        <div class="formsetting-block">
          <label class="formsetting-label text-grey">描述</label>
          <div class="formsetting-text">
            <TsFormInput
              ref="desc"
              v-model="setting.desc"
              type="textarea"
              placeholder="请输入描述"
              show-word-limit
              maxlength="500"
              autosize
              :validateList="desclValidJson"
            />
          </div>
        </div>
        <div class="formsetting-block">
          <label class="formsetting-label text-grey">宽度</label>
          <div class="formsetting-text bg-block">
            <RadioGroup v-model="setting.width" class="col-3" @on-change="changeRadio">
              <Radio label="50%">50%</Radio>
              <Radio label="75%">75%</Radio>
              <Radio label="100%">100%</Radio>
            </RadioGroup>
          </div>
        </div>

        <!-- end_默认的通用设置，名称、描述、提示、宽度 -->
        <!-- start_新增默认隐藏、隐藏清空值 -->

        <div class="formsetting-block">
          <label class="formsetting-label text-grey label-switch">
            默认隐藏
            <i-switch v-model="setting.isHide" class="label-right" />
          </label>
        </div>
        <div class="formsetting-block">
          <label class="formsetting-label text-grey label-switch">
            隐藏时清空值
            <i-switch v-model="setting.isEmpty" class="label-right" />
          </label>
        </div>
      </template>
      <!-- start_新增默认隐藏、隐藏清空值 -->
      <!-- start_不同组件自定义设置 -->
      <EditComponents 
        :is="handler" 
        :ref="uuid" 
        :key="uuid" 
        :setting="setting" 
        :uuid="uuid" 
        :type="handler" 
        :isvalid="isValid"
        :controllerList="controllerList"
      >
      </EditComponents>

      <!-- end_不同组件自定义设置 -->

      <!-- start_拓展的通用设置，授权 -->
      <div v-if="handler != 'formpriority'" class="formsetting-block">
        <label class="formsetting-label text-grey">查看授权</label>
        <div class="formsetting-text">
          <div class="input-border">
            <UserSelect v-if="setting" v-model="setting.authorityConfig" width="100%"></UserSelect>
          </div>
        </div>
      </div>
      <!-- end_拓展的通用设置，授权 -->
    </div>
    <div v-else class="formContain">提示：暂无选中节点</div>
  </div>
</template>
<script>
import EditComponents from './components';
import UserSelect from '@/resources/components/UserSelect/UserSelect.vue';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
let _this; //全局设置的this变量
export default {
  name: 'FormeditContent',
  inject: {
    $labelName: {
      default: {}
    }
  },
  components: {
    UserSelect,
    TsFormInput,
    ...EditComponents
  },
  props: {
    uuid: {
      type: String
    },
    handler: {
      type: String,
      default: 'formselect'
    },
    type: {
      type: String,
      default: 'system'
    },
    label: {
      type: String,
      default: '插件名称'
    },
    config: {
      type: Object,
      default: function() {
        //return { "label": "", "desc": "", "size": "50%", "switchType": "formselect", "length": 50, "defaultValue": "50", "isRequire": 0, "isHidden": true, "rules": null }
        return null;
      }
    },
    controllerList: Array,
    isValid: {
      type: Boolean,
      default: true
    },
    rowLength: Number
  },
  data() {
    let _this = this;
    return {
      componentPlugin: {
        //兼容之前的组件名称和通用的组件名字
        forminput: 'formeditInput',
        formtextarea: 'formeditTextarea',
        formselect: 'formeditSelect',
        formdate: 'formeditDate',
        formtime: 'formeditTime',
        formradio: 'formeditRadio',
        formcheckbox: 'formeditCheckbox',
        formeditor: 'formeditEditor'
      },
      relationList: [], //表单里所有组件
      name: null, //组件名称，后期手机端展示和规则区别不同组件用
      setting: {}, //组件配置，对应config字段
      authorityLoading: true, //授权信息是否加载中
      dateRelation: [], //单独时间的关系组件
      isValidRepeatName: true,
      errorMessage: '',
      labelValidJson: [
        {name: 'custom', message: '组件名称已存在', trigger: 'change', validator: function(rule, value) {
          // 修复点击保存时，前端验证组件名称是否重复
          let isValid = true;
          if (!_this.$utils.isEmpty(_this.relationList)) {
            for (let i = 0; i < _this.relationList.length; i++) {
              if ((_this.relationList[i] && _this.relationList[i].label) == (_this.relationList[i + 1] && _this.relationList[i + 1].label)) {
                isValid = false;
                _this.isValidRepeatName = true;
                break;
              }
            }
          } else {
            _this.isValidRepeatName = false;
          }
          return isValid;
        }}, 'non-special'],
      desclValidJson: ['non-special'],
      sheetsConfig: null
    };
  },
  mounted() {
    _this = this;
    if (!this.config.width) {
      this.config.width = '75%';
    }
    if (!this.config.isRequired) {
      this.config.isRequired = false;
    }
    this.setting = this.config;
    this.getSetting();
    this.getSheetconfig();
    this.dateRelation = this.relationList.filter(re => {
      return re.uuid != this.uuid && re.handler == this.handler;
    });
  },
  destroyed() {
    if (!this.name) {
      //编辑区域消失，自动填充空的label名称
      this.updateOwnsetting('label', this.$labelName[this.handler]);
    }
  },
  methods: {
    hideEdit() {
      //手动关闭编辑滑窗
      this.validComponent();
      this.$parent.isEditcomponent = false;
    },
    getSetting() {
      //初始化设置参数
      this.getRulelist(); //初始化规则
      this.relationList = this.$parent.controllerList; //获取表单的所有组件（含自己）
    },
    updatesetting(key, value) {
      //更新本组件的setting设置,方便子组件调用外层更新
      let newval = {};
      newval[key] = value;
      this.$set(this.setting, key, value);
      this.$forceUpdate();
    },
    updateOwnsetting(key, value) {
      //统一调用父组件的数据更新
      if (key == 'handler') {
        //切换组件时如果没设置，默认查看权限为所有人
        if (!this.setting.authorityConfig || this.setting.authorityConfig.length == 0) {
          this.setting.authorityConfig = ['common#alluser'];
        }
      }
      this.$parent.updateComponent(this.uuid, key, value);
    },
    getRulelist() {
      if (!_this.setting.ruleList) {
        _this.setting.ruleList = [];
      }
    },

    updateVal() {
      //通用的更新当前组件数据
      this.$forceUpdate();
    },
    validComponent() {
      let _this = this;
      this.config.validList = [];
      let validList = [];
      let message = _this.isValidRepeatName ? '名称：组件名称已存在' : '名称：请输入正确的格式';
      let type = _this.isValidRepeatName ? 'nameRepeat' : 'formatError';
      let componet = [
        { ref: 'label', message: message},
        { ref: 'desc', message: '描述：请输入正确的格式' }
      ];
      componet.forEach(item => {
        if (_this.$refs[item.ref] && !_this.$refs[item.ref].valid()) {
          validList.push({
            uuid: _this.uuid,
            message: item.message,
            type: type
          });
        }
      });

      if (this.$refs[this.uuid] && this.$refs[this.uuid].validComponent) {
        validList.push.apply(validList, this.$refs[this.uuid].validComponent());
      }
      if (!this.name) {
        //编辑区域消失，自动填充空的label名称
        this.updateOwnsetting('label', this.$labelName[this.handler]);
      }
      this.config.validList = validList;
      return this.config.validList;
    },
    changeRadio(val) {
      this.$set(this.setting, 'width', val);
      this.$forceUpdate();
    },
    getSheetconfig() {
      let sheetdata = this.$parent.getSheetdata();
      this.sheetsConfig = sheetdata.sheetsConfig;
    },
    onBlur() {
      this.errorMessage = '';
      if (this.relationList && (this.relationList.filter((item) => item.label == this.name)).length >= 2) {
        this.errorMessage = '组件名称已存在';
      } else {
        this.errorMessage = '';
      }
      this.updateOwnsetting('label', this.name);
    }
  },
  computed: {
    isRule() {
      return function(handler) {
        let isshow = false;
        let itemlist = ['forminput', 'formtextarea', 'formradio', 'formcheckbox', 'formswitch', 'formselect', 'formdate', 'formtime', 'formnumber', 'formemail', 'formphone', 'formtext', 'formeditor', 'formcascadelist', 'formuserselect'];
        if (itemlist.indexOf(handler) > -1) {
          isshow = true;
        }
        return isshow;
      };
    }
  },
  watch: {
    label: {
      handler: function(val) {
        this.name = val;
      },
      immediate: true
    },
    config(val, oldval) {
      if (!val.width) {
        val.width = '75%';
      }
      this.setting = val;
    },
    setting(val, oldval) {
      this.updateOwnsetting('config', val);
    },
    uuid(val, oldval) {
      if (val != oldval) {
        this.getSetting(); //主要针对切换组件，需要再更新一次配置信息
      }
    },
    relationList(val) {
      this.dateRelation = this.relationList.filter(re => {
        return re.uuid != this.uuid && re.handler == this.handler;
      });
    }
  }
};
</script>
