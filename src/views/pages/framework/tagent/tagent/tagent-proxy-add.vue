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
  <!-- tagent组管理/添加代理 -->
  <div>
    <TsDialog
      v-bind="addTsDialog"
      :isShow.sync="proxyConfig.isShowProxyAdd"
      @on-close="close"
      @on-ok="saveAdd"
    >
      <template v-slot:header>
        <div>{{ dialogTitle }}</div>
      </template>
      <template v-slot>
        <div class="editForm">
          <TsForm ref="proxyForm" :item-list="formConfig">
          </TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import TsForm from '@/resources/plugins/TsForm/TsForm.vue';
export default {
  name: 'TagentProxyAdd',
  components: {
    TsForm
  },
  filters: {
  },
  props: {
    // 是否显示模态框
    proxyConfig: {
      type: Object,
      default: function() {
        return {};
      }
    },
    value: {
      type: [Array, Object],
      default: function() {
        return [];
      }
    }
  },
  data() {
    return {
      addTsDialog: {
        // 弹框配置信息
        type: 'slider'
      },
      dialogTitle: '', // 弹框标题的文字，是编辑还是添加
      formConfig: {
        id: {
          type: 'text',
          name: 'id',
          value: null,
          defaultValue: null,
          isHidden: true,
          label: this.$t('page.primarykey')
        },
        name: {
          type: 'text', 
          label: this.$t('page.groupname'), 
          value: '', 
          validateList: ['required']
        },
        url: {
          type: 'text', 
          label: 'url', 
          value: '', 
          validateList: ['required']
        },
        accessKey: {
          type: 'text', 
          label: this.$t('page.username'), 
          value: '', 
          validateList: ['required']
        },
        accessSecret: {
          type: 'password', 
          label: this.$t('page.password'), 
          value: '', 
          validateList: ['required']
        },
        nettyIp: {
          type: 'text', 
          label: 'IP', 
          value: '', 
          validateList: ['required']
        },
        nettyPort: {
          type: 'text',
          label: this.$t('term.framework.nettyport'),
          value: '',
          validateList: ['required']
        },
        groupId: {
          type: 'select',
          label: this.$t('term.framework.proxygroup'),
          textName: '', // 显示值
          valueName: '', // 获取值
          disabled: true, // 不可编辑
          validateList: ['required']
        },
        authType: {
          type: 'select',
          label: this.$t('page.authtype'),
          value: '',
          dynamicUrl: '/api/rest/universal/enum/get',
          params: {enumClass: 'neatlogic.framework.tagent.enums.RunnerAuthType'},
          validateList: ['required'],
          transfer: true
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
    close() {
      // 弹框取消关闭按钮
      this.addTsDialog.isShow = false;
    },
    saveAdd() {
      // 点击弹框确认按钮
      this.addTsDialog.isShow = false;
      let form = this.$refs.proxyForm;
      if (form.valid()) {
        let params = form.getFormValue();
        this.$https.post('/api/rest/runner/save', params).then((res) => {
          // console.log('添加代理成功', res);
          this.$emit('update:proxyConfig', 'success');
        });
      }
    }
  },
  computed: {},
  watch: {
    proxyConfig: {
      handler(val) {
        // console.log('watch监听的值', val);
        this.$set(this.formConfig.groupId, 'textName', val.name);
        this.$set(this.formConfig.groupId, 'valueName', val.row && val.row.id);
        this.$set(this.formConfig.id, 'value', val.row && val.row.id);
      }, 
      deep: true,
      immediate: true
    }
  }
};
</script>
