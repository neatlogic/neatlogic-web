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
  <TsDialog
    v-bind="dialogConfig"
    @on-close="close"
  >
    <div class="job-param">
      <div>
        <Divider orientation="start">{{ $t('term.autoexec.jobparam') }}</Divider>
        <TsTable v-if="paramTable.tbodyList && paramTable.tbodyList.length > 0" v-bind="paramTable">
          <template slot="value" slot-scope="{row}">
            <Item keyName="value" :config="row"></Item>
          </template>
        </TsTable>
        <NoData v-else></NoData>
      </div>
      <div>
        <Divider orientation="start">{{ $t('term.autoexec.environmentvariable') }}</Divider>
        <TsTable v-if="envTable.tbodyList && envTable.tbodyList.length > 0" v-bind="envTable">
          <template slot="value" slot-scope="{row}">
            <Item keyName="value" :config="row"></Item>
          </template>
        </TsTable>
        <NoData v-else></NoData>
      </div>
    </div>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    Item: resolve => require(['./phase/node/param-item.vue'], resolve)
  },
  filters: {},
  directives: { },
  props: {
    id: [Number, String] //作业id
  },
  data() {
    return {
      dialogConfig: {
        type: 'slider',
        maskClose: true,
        isShow: true,
        width: 'large',
        title: this.$t('term.autoexec.paramsdetail'),
        hasFooter: false
      },
      paramTable: {
        theadList: [{
          title: this.$t('term.autoexec.paramsname'),
          key: 'name'
        }, 
        {
          title: this.$t('page.value'),
          key: 'value'
        },
        {
          title: this.$t('page.description'),
          key: 'description'
        }],
        tbodyList: []
      },
      envTable: {
        theadList: [{
          title: this.$t('term.autoexec.paramsname'),
          key: 'name'
        }, 
        {
          title: this.$t('page.value'),
          key: 'value'
        }],
        tbodyList: []
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getJobParam();
    this.getJobEnv();
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
    close() {
      this.$emit('close');
    },
    getJobParam() {
      this.$api.autoexec.job.getJobParam({jobId: this.id}).then(res => {
        this.paramTable.tbodyList = res.Return.runTimeParamList;
      });
    },
    getJobEnv() {
      this.$api.autoexec.job.getJobEnv({jobId: this.id}).then(res => {
        this.envTable.tbodyList = res.Return;
      });
    }
  },
  computed: {

  },
  watch: {}
};
</script>
<style lang="less" scoped>
.job-param{
  .param-title {
      padding-bottom: 10px;
      padding-top: 16px;
  }
} 
</style>
