<template>
  <div>
    <Alert show-icon>
      帮助：
      <template slot="desc">
        <div>参数说明用于对外提供调用帮助，如需要系统根据参数说明进行参数校验，请启动以下选项。</div>
        <div>
          <b v-if="needValid == 1" style="margin-right:10px" class="text-primary">激活校验</b>
          <b v-if="needValid == 0" style="margin-right:10px">激活校验</b>
          <i-switch
            v-model="needValid"
            size="large"
            :true-value="1"
            :false-value="0"
          ></i-switch>
        </div>
        <div>激活校验后，非参数说明列表中的参数将会被丢弃。</div>
      </template>
    </Alert>
    <div v-if="(allowEditParam == 1 && paramList && paramList.length > 0) || (allowEditParam == 0 && handlerPattern && handlerPattern.length > 0)" class="tstable-container">
      <table class="tstable-body">
        <thead>
          <tr>
            <th style="width:20%">名称</th>
            <th style="width:20%">参数类型</th>
            <th style="width:20%">数据类型</th>
            <th style="width:10%">必填</th>
            <th style="width:30%">描述</th>
            <th v-if="allowEditParam == 1">
              <a href="javascript:void(0)" style="margin-right:5px" @click="addParam">
                <i class="tsfont-plus-o"></i>
              </a>
            </th>
          </tr>
        </thead>
        <tbody v-if="allowEditParam == 1 && paramList && paramList.length > 0">
          <tr v-for="(item, index) in paramList" :key="index">
            <td>
              <TsFormInput ref="txtParamName" v-model="item.name" :maxlength="30"></TsFormInput>
            </td>
            <td>
              <TsFormSelect v-model="item.mode" :data-list="modeList" transfer></TsFormSelect>
            </td>
            <td>
              <TsFormSelect
                v-model="item.type"
                :data-list="paramTypeList"
                transfer
                @change-label="changeLabel($event, index)"
              ></TsFormSelect>
            </td>
            <td>
              <i-switch
                v-if="item.mode == 'input'"
                v-model="item.isRequired"
                :true-value="1"
                :false-value="0"
              ></i-switch>
            </td>
            <td>
              <TsFormInput v-model="item.description" :maxlength="200" transfer></TsFormInput>
            </td>
            <td style="width:50px">
              <a href="javascript:void(0)" style="margin-right:5px" @click="addParam">
                <i class="tsfont-plus-o"></i>
              </a>
              <a href="javascript:void(0)" @click="delParam(index)">
                <i class="tsfont-minus-o"></i>
              </a>
            </td>
          </tr>
        </tbody>
        <tbody v-if="allowEditParam == 0 && handlerPattern && handlerPattern.length > 0">
          <tr v-for="(item, index) in handlerPattern" :key="index">
            <td>
              {{ item.name }}
            </td>
            <td>
              {{ getModeText(item.mode) }}
            </td>
            <td>
              {{ item.typeName }}
            </td>
            <td>
              <span v-if="item.isRequired==1">是</span>
              <span v-if="item.isRequired==0">否</span>
            </td>
            <td>
              {{ item.description }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="allowEditParam == 1 && (!paramList || paramList.length == 0)" class="text-action tsfont-plus" @click="addParam">参数</div>
  </div>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  components: { TsFormInput, TsFormSelect },
  props: {
    integration: { type: Object },
    allowEditParam: { type: Number },
    handlerPattern: { type: Array }
  },
  data() {
    return {
      paramList: [],
      paramTypeList: [],
      needValid: 0,
      modeList: [
        { value: 'input', text: '输入参数' },
        { value: 'output', text: '输出参数' }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getParamTypeList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getModeText: function(val) {
      for (var i = 0; i < this.modeList.length; i++) {
        if (this.modeList[i].value == val) {
          return this.modeList[i].text;
        }
      }
    },
    changeLabel: function(label, i) {
      this.paramList[i].typeName = label;
    },
    getParamTypeList: function() {
      this.$api.framework.integration.getParamTypeList().then(res => {
        if (res.Status == 'OK') {
          this.paramTypeList = res.Return;
        }
      });
    },
    addParam: function() {
      this.paramList.push({});
    },
    delParam: function(index) {
      this.paramList.splice(index, 1);
    }
  },
  filter: {},
  computed: {
    config: function() {
      return { needValid: this.needValid, paramList: this.paramList };
    }
  },
  watch: {
    integration: {
      handler: function(val) {
        if (val.config.param) {
          this.paramList = val.config.param.paramList || [];
          this.needValid = val.config.param.needValid;
        }
      },
      deep: true
    },
    config: {
      handler: function(val) {
        this.$emit('setParam', val);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less"></style>
