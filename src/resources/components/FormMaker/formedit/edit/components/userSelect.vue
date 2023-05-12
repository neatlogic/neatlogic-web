<template>
  <div class="selectContent">
    <!-- start_必填 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey label-switch">
        必填
        <i-switch v-model="setting.isRequired" class="label-right" />
      </label>
    </div>
    <!-- end_必填 -->

    <!-- start_多选 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey label-switch">
        多选
        <i-switch v-model="setting.isMultiple" class="label-right" />
      </label>
    </div>
    <!-- end_多选 -->
    <!-- start_分组类型 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey require-label">
        分组
      </label>
      <div class="formsetting-text ">
        <TsFormSelect
          v-model="setting.groupList"
          placeholder="请选择分组"
          multiple
          :dataList="groupList"
          :validateList="groupvalid"
          @on-change="changeGroup"
        ></TsFormSelect>
      </div>
    </div>
    <!-- end_分组类型-->
    <!-- start_默认值 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">默认值</label>
      <div class="formsetting-text bg-block">
        <RadioGroup v-model="setting.defaultValueType" class="col-2" @on-change="changeDefaultValueType">
          <Radio label="self">自定义</Radio>
          <Radio label="quote">引用</Radio>
        </RadioGroup>
        <!-- 自定义组件 -->
        <div style="padding-top:14px">
          <UserSelect
            v-if="setting.defaultValueType == 'self'"
            v-model="setting.defaultValueList"
            :multiple="setting.isMultiple"
            :groupList="getGroup(setting.groupList)"
            :excludeList="getexcludeList(setting.groupList)"
            :includeList="getincludeList(setting.groupList)"
          ></UserSelect>
          <!-- 引用 -->
          <TsFormSelect
            v-else-if="setting.defaultValueType == 'quote'"
            v-model="setting.quoteUuid"
            transfer
            :dataList="getComponentList"
            placeholder="请选择引用组件"
          ></TsFormSelect>
        </div>
      </div>
    </div>
    <!-- end_默认值 -->
    <!-- start_输入提示 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">输入提示</label>
      <div class="formsetting-text">
        <TsFormInput
          v-model="setting.placeholder"
          type="text"
          width="100%"
          maxlength="50"
        ></TsFormInput>
      </div>
    </div>
    <!-- end_输入提示 -->
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
import UserSelect from '@/resources/components/UserSelect/UserSelect.vue';
let _this;
export default {
  name: 'FormeditSelect',
  components: { TsFormSelect, UserSelect, TsFormInput},
  props: {
    uuid: String,
    setting: Object,
    controllerList: Array
  },

  data() {
    return {
      defaultValueDataList: [],
      groupList: [],
      groupvalid: ['required']
    };
  },
  mounted() {
    this.$nextTick(function() {
      this.getGrouplist();
    });
  },
  created() {},
  destroyed() {},
  methods: {
    changeDefaultValueType(val) {
      //改变默认值类型
      this.setting.defaultValueList = '';
      this.setting.quoteUuid = '';
      if (this.setting.isMultiple) {
        this.setting.defaultValueList = [];
      }
    },
    setDefaultJson(isInit) {},
    getGrouplist() {
      //
      let _this = this;
      this.$api.framework.form.getGrouplist().then(res => {
        if (res.Status == 'OK') {
          if (res.Return) {
            _this.$set(_this, 'groupList', res.Return);
          } else {
            _this.$set(_this, 'groupList', []);
          }
        }
      })
        .catch(e => {
          _this.set(_this, 'groupList', []);
          console.log(e);
        });
    },
    validComponent() {
      let _this = this;
      let validList = [];
      if (!_this.setting.groupList || _this.setting.groupList.length <= 0) {
        validList.push('分组类型：不可以为空');
      }
      return validList;
    },
    changeGroup(val) { //切换分组时清楚默认值
      if (val && this.setting.defaultValueType == 'self' && this.setting.defaultValueList) {
        if (Array.isArray(this.setting.defaultValueList)) {
          this.setting.defaultValueList = this.setting.defaultValueList.filter(element => {
            return val.indexOf(element.split('#')[0]) >= 0;
          });
        } else {
          let value = this.setting.defaultValueList;
          this.setting.defaultValueList = val.indexOf(value.split('#')[0]) >= 0 ? value : '';
        }
      } else if (val) {
        this.setting.defaultValueList = this.setting.isMultiple ? [] : '';
      }
    }
  },
  computed: {
    getComponentList() {
      return this.controllerList.filter(item => {
        return item.handler == 'formuserselect' && item.value != this.uuid;
      });
    },
    getGroup() {
      //20200908_zqp_新增需求用户选择器选择用户需支持当前登录人、上报人，选择组需支持当前用户所在组——20200904lvzk微信群提仅提供截图无补充tapd无细化需求
      return function(group) {
        let list = group || [];
        if (group.length > 0) {
          if (group.indexOf('user') > -1) {
            //当前登录人、上报人（20200908_zqp_后台确定要分2个类型获取，不在common做处理）
            list = this.$utils.concatArr(list, ['common', 'processUserType']);
          }
          if (group.indexOf('team') > -1) {
            //当前用户所在组
            list = this.$utils.concatArr(list, ['common']);
          }
        }
        return list;
      };
    },
    getincludeList() {
      //20200908_zqp_新增需求用户选择器选择用户需支持当前登录人、上报人，选择组需支持当前用户所在组——20200904lvzk微信群提仅提供截图无补充tapd无细化需求
      return function(group) {
        let list = [];
        if (group.length > 0) { 
          if (group.indexOf('user') > -1) {
            //当前登录人、上报人（20200908_zqp_后台确定要分2个类型获取，不在common做处理）
            list = list.concat(['common#loginuser', 'processUserType#owner']); 
          }
          if (group.indexOf('team') > -1) {
            //当前用户所在组
            list = list.concat(['common#loginteam']);
          }
        }
        return list;
      };
    },
    getexcludeList() {
      //20200908_zqp_新增需求用户选择器选择用户需支持当前登录人、上报人，选择组需支持当前用户所在组——20200904lvzk微信群提仅提供截图无补充tapd无细化需求
      return function(group) {
        let list = [];
        if (group.length > 0) { 
          if (group.indexOf('user') > -1) {
            //过滤掉工单用户除了上报人外的字段（20200908_zqp_后台确定字段数组接口写死，需前端单独过滤）
            list = this.$utils.concatArr(list, ['processUserType#major', 'processUserType#minor', 'processUserType#agent', 'processUserType#reporter', 'processUserType#worker']);
          }
          if (group.indexOf('common') < 0) {
            //没有选择common
            list = this.$utils.concatArr(list, ['common#alluser']); 
          }
        }
        return list;
      };
    }    
  },
  watch: {
    uuid: function(newValue) {}
  }
};
</script>
