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
  <div class="tagent-add-wrap">
    <TsContain>
      <template v-slot:navigation>
        <span class="ts-angle-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <span>{{ serviceName }}</span>
      </template>
      <template v-slot:topRight>
        <div class="action-group text-right">
          <span class="action-item">
            <Button
              type="primary"
              ghost
              icon="tsfont tsfont-save"
              @click="saveService"
            >{{ $t('button.save') }}</Button>
          </span>
          <span class="action-item last">
            <Button
              type="primary"
              icon="tsfont tsfont-run"
              @click="saveExecuteService"
            >{{ $t('term.autoexec.immediateexecution') }}</Button>
          </span>
        </div>
      </template>
      <template v-slot:content>
        <div>
          <FormServiceEdit v-if="formUuid == 'form'" ref="formServiceEdit" :serviceData="serviceData"></FormServiceEdit>
          <NoFormServiceEdit v-if="formUuid == 'noform'" ref="noFormServiceEdit" :serviceData="serviceData"></NoFormServiceEdit>
        </div>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    FormServiceEdit: resolve => require(['./form-service-edit.vue'], resolve),
    NoFormServiceEdit: resolve => require(['./no-form-service-edit.vue'], resolve)
  },
  filters: {},
  props: {},
  data() {
    return {
      serviceId: null,
      serviceName: '',
      formUuid: '',
      serviceData: {}
    };
  },
  beforeCreate() {},
  created() {
    let query = this.$route.query;
    if (query && query.id) {
      this.serviceId = parseInt(query.id);
      this.serviceName = query.name;
      this.initData();
    }
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
      // 初始化
      this.formUuid = '';
      this.serviceData = {};
      this.loadingShow = true;
      this.$api.autoexec.catalogManage.getSeriveInfo({id: this.serviceId}).then(res => {
        if (res.Status == 'OK') {
          let dataInfo = res.Return;
          this.formUuid = dataInfo && dataInfo.formUuid ? 'form' : 'noform';
          this.serviceData = dataInfo;
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    saveService() {
      if (this.formUuid == 'form') {
        this.$refs.formServiceEdit && this.$refs.formServiceEdit.saveService();
      } else if (this.formUuid == 'noform') {
        this.$refs.noFormServiceEdit && this.$refs.noFormServiceEdit.saveService();
      }
    },
    saveExecuteService() {
      if (this.formUuid == 'form') {
        this.$refs.formServiceEdit && this.$refs.formServiceEdit.saveExecuteService();
      } else if (this.formUuid == 'noform') {
        this.$refs.noFormServiceEdit && this.$refs.noFormServiceEdit.saveExecuteService();
      }
    }
  },
  computed: {},
  watch: {}
};
</script>

<style lang="less" scoped>
</style>
