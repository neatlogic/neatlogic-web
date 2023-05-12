
<template>
  <div class="bg-warning-grey radius-sm">
    <div class="tip-div">
      <span class="text">{{ interactData.message }}</span> 
      <template v-if="interactData.opType=='button'">
        <div v-if="interactData.options && interactData.options.length>0" class="operation"> 
          <template v-for="btn in interactData.options">
            <Button :key="btn" :type="parmaryBtn.includes(btn)?'primary':'default'" @click="commit(btn)">{{ btn }}</Button> 
          </template>
        </div>
      </template>
      <template v-if="interactData.opType=='input'">
        <div class="operation"> 
          <TsFormInput
            ref="input"
            v-model="value"
            type="text"
            width="190px"
            class="value-item"
            :validateList="validateList"
          ></TsFormInput> 
          <Button type="primary" @click="commit()">{{ $t('page.continueexecute') }}</Button> 
        </div>
      </template>
      <template v-if="interactData.opType=='select' || interactData.opType=='mselect'">
        <div class="operation"> 
          <TsFormSelect
            ref="select"
            v-model="value"
            width="190px"
            class="value-item"
            :validateList="validateList"
            :isEqualValue="true"
            :multiple="interactData.opType=='mselect'?true:false"
            :dataList="getDataList"
          ></TsFormSelect>
          <Button type="primary" @click="commit()">{{ $t('page.continueexecute') }}</Button> 
        </div>
      </template>
    </div>
  </div>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: '',
  components: {
    TsFormInput, TsFormSelect
  },
  filters: {
  },
  props: {
    nodeData: {type: Object},
    interactData: {type: Object},
    jobData: {type: Object},
    phaseData: {type: Object}
  },
  data() {
    return {
      value: null,
      parmaryBtn: ['commit'],
      validateList: ['required']
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
    commit(val) {
      let valid = true;
      if (this.$refs[this.interactData.opType] && this.$refs[this.interactData.opType].valid) {
        valid = this.$refs[this.interactData.opType].valid();
      }
      if (!valid) {
        return;
      }
      let param = Object.assign({option: val || this.value}, this.params || {});
      this.$api.autoexec.job.exectWaitInput(param).then(res => {
        this.emit('on-ok');
      });
    }
  },
  computed: {
    getDataList() {
      let ary = [];
      if (this.interactData.opType == 'select') {
        this.interactData.options.forEach(item => {
          if (typeof item == 'object') {
            ary.push(item);
          } else {
            ary.push({text: item, value: item});
          }
        });
      }
      return ary;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
  .bg-warning-grey{
    padding:@space-sm @space-normal;
    margin-bottom: @space-normal;
  }
  .tip-div{
    display: flex;
    justify-content: space-between;
    align-items: center;
    .text{
      
    }
    .operation{
      flex-basis: 1;
      text-align: right;
      button+button{
         margin-left: 10px;
      }
      .value-item{
        margin-right: 6px;
        display: inline-block;
      }
    }
  }
</style>
