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
      v-bind="dialogSetting"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsForm ref="form" v-model="formValue" :itemList="formSetting"></TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: 'ToolCatalogAdd', // 目录工具(添加-编辑)
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve)
  },
  filters: {},
  props: {
    value: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      formValue: {
        ...this.value
      },
      dialogSetting: {
        type: 'modal',
        title: this.value.id ? this.$t('button.edittarget', {target: this.$t('term.autoexec.directorytool')}) : this.$t('button.addtarget', {target: this.$t('term.autoexec.directorytool')}),
        isShow: true
      },
      formSetting: {
        id: {
          type: 'text',
          isHidden: true,
          label: '#id'
        },
        parentId: {
          type: 'text',
          isHidden: true,
          label: this.$t('term.autoexec.parentnodeid')
        },
        name: {
          type: 'text',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: [
            'required', 
            'name-special',
            { 
              name: 'searchUrl', // 字段必须，不能更改
              url: '/api/rest/autoexec/catalog/save',
              key: 'name', // key值
              params: {id: this.value.id, parentId: this.value.parentId}
            }]
        }
      }
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
    closeDialog(needRefresh = false, params = {}) {
      this.$emit('close', needRefresh, params);
    },
    okDialog() {
      let form = this.$refs.form;
      if (!form.valid()) {
        return false;
      }
      let params = {
        ...form.getFormValue()
      };
      this.$api.autoexec.catalog.saveCatalog(params).then((res) => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.content.executesuccess'));
          this.closeDialog(true, params);
        }
      });
    }
  },
  computed: {},
  watch: {}
};
</script>
