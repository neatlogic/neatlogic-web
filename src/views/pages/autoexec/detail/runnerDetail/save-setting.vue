/*
 * Copyright(c) 2023 NeatLogic Co., Ltd. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<template>
  <div>
    <TsDialog
      type="modal"
      :isShow.sync="showDialog"
      :title="$t('term.autoexec.savejob')"
      @on-ok="onOk"
    >
      <TsForm
        ref="formConfig"
        v-model="formValueConfig"
        v-bind="formConfig"
        type="type"
      ></TsForm>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  filters: {
  },
  model: {
    prop: 'visible',
    event: 'change'
  },
  props: {
  },
  data() {
    let _this = this;
    return {
      showDialog: true,
      formConfig: {
        itemList: {
          planStartTime: {
            type: 'datetime',
            transfer: true,
            label: this.$t('page.plantime'),
            desc: this.$t('term.autoexec.taskexpirationtip'),
            selectableRange: () => {
              const now = new Date().getTime();
              return [now + 5 * 60 * 1000, 0];
            },
            validateList: ['required']
          },
          triggerType: {
            type: 'select',
            transfer: true,
            label: this.$t('term.autoexec.triggertype'),
            dataList: [],
            validateList: ['required']
          }
        }
      },
      formValueConfig: {
        planStartTime: null,
        triggerType: null
      }
    };
  },
  beforeCreate() {},
  created() {
    this.initData();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    initData() {
      this.getTriggerTypeLit();
      this.formValueConfig.planStartTime = (new Date()).getTime() + 60 * 10 * 1000; //默认十分钟之后
    },
    getTriggerTypeLit() { //触发方式
      let data = {enumClass: 'neatlogic.framework.autoexec.constvalue.JobTriggerType'};
      this.$api.common.getSelectList(data).then(res => {
        if (res.Status == 'OK') {
          let dataList = res.Return || [];
          this.formConfig.itemList.triggerType.dataList = dataList;
          dataList.length > 1 && (this.formValueConfig.triggerType = dataList[1].value);
        }
      });
    },
    getDataList() {
      let num = 10;
      let dataList = [];
      for (let i = 0; i <= num; i++) {
        dataList.push({value: Math.pow(2, i)});
      }
      return dataList;
    },
    onOk() {
      if (this.$refs.formConfig.valid()) {
        this.showDialog = false;
        this.$emit('on-ok', this.$refs.formConfig.getFormValue());
      }
    }
  },
  computed: {
   
  },
  watch: {
    showDialog() {
      this.$emit('change', this.showDialog);
    }
  }
};
</script>
