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
    v-if="isShow"
    v-bind="setting"
    :isShow="isShow"
    @on-close="close()"
    @on-cancel="close()"
    @on-ok="confirmEdit()"
  >
    <template v-slot:header>
      <div>{{ $t('term.autoexec.publishcombinetool') }}</div>
    </template>
    <template v-slot>
      <div>
        <TsForm ref="settingForm" v-model="settingConfig" :itemList="settingForm"></TsForm>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: 'ScriptEdit',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  filters: {
  },
  props: {
    isShow: {
      type: Boolean,
      default: false,
      bgOp: true
    },
    id: {
      type: [String, Number]
    },
    operationType: {
      type: String,
      default: 'script'
    }
  },
  data() {
    return {
      setting: {
        maskClose: false
      },
      settingConfig: {
        name: '',
        typeId: '',
        description: ''
      },
      settingForm: [
        {
          type: 'text',
          name: 'name',
          value: '',
          maxlength: 50,
          label: this.$t('page.name'),
          validateList: [
            'required', 
            'name-special',
            { name: 'searchUrl',
              url: '/api/rest/autoexec/combop/save', 
              key: 'name',
              message: this.$t('message.targetisexists', {target: this.$t('page.name')})
            }
          ]
        },
        {
          type: 'select',
          name: 'typeId',
          value: '',
          dataList: [],
          label: this.$t('page.type'),
          multiple: false,
          placeholder: this.$t('term.autoexec.pleaseselectcategory'),
          validateList: ['required'],
          search: true,
          dynamicUrl: '/api/rest/autoexec/type/search',
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getToolClassificationList,
          transfer: true
        },
        {
          type: 'textarea',
          name: 'description',
          value: '',
          label: this.$t('page.description'),
          transfer: true,
          maxlength: 500
        }
      ] 
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.id) {
      this.getConfig();
    }
  },
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
    confirmEdit() {
      if (!this.$refs.settingForm.valid()) {
        return;
      }
      let data = {
        operationId: this.id,
        operationType: this.operationType,
        ...this.settingConfig
      };
      this.$api.autoexec.script.generateAction(data).then(res => {
        if (res.Status == 'OK' && res.Return) {
          this.$router.push({
            path: '/action-detail',
            query: {
              id: res.Return,
              versionStatus: 'passed'

            }
          });
        }
      });
    },
    getConfig() {
      let param = {
        id: this.id,
        status: 'passed'
      };
      this.$api.autoexec.script.getScriptDetail(param).then(res => {
        if (res.Status == 'OK' && res.Return) {
          let scriptConfig = res.Return.script || null;
          scriptConfig && Object.keys(this.settingConfig).forEach(key => {
            let i = scriptConfig[key];
            this.settingConfig[key] = i;
          });
        }
      });
    }
  },
  computed: {},
  watch: {}
};
</script>
