<template>
  <div>
    <Alert show-icon>
      {{ $t('page.help') }}：
      <template slot="desc">
        <div>{{ $t('term.framework.paramcheckdesc') }}</div>
        <div>
          <b v-if="needValid == 1" style="margin-right:10px" class="text-primary">{{ $t('term.framework.checkenable') }}</b>
          <b v-if="needValid == 0" style="margin-right:10px">{{ $t('term.framework.checkenable') }}</b>
          <i-switch
            v-model="needValid"
            size="large"
            :true-value="1"
            :false-value="0"
          ></i-switch>
        </div>
        <div>{{ $t('term.framework.aftercheckdesc') }}</div>
      </template>
    </Alert>
    <div v-if="(allowEditParam == 1 && paramList && paramList.length > 0) || (allowEditParam == 0 && handlerPattern && handlerPattern.length > 0)" class="tstable-container">
      <table class="tstable-body">
        <thead>
          <tr>
            <th style="width:20%">{{ $t('page.name') }}</th>
            <th style="width:20%">{{ $t('term.framework.paramtype') }}</th>
            <th style="width:20%">{{ $t('term.report.datatype.name') }}</th>
            <th style="width:10%">{{ $t('page.require') }}</th>
            <th style="width:30%">{{ $t('page.description') }}</th>
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
              <span v-if="item.isRequired==1">{{ $t('page.yes') }}</span>
              <span v-if="item.isRequired==0">{{ $t('page.no') }}</span>
            </td>
            <td>
              {{ item.description }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="allowEditParam == 1 && (!paramList || paramList.length == 0)" class="text-action tsfont-plus" @click="addParam">{{ $t('page.param') }}</div>
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
        { value: 'input', text: this.$t('page.inputparam') },
        { value: 'output', text: this.$t('page.outputparam') }
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
