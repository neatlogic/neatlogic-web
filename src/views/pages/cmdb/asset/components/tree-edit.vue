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
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <TsForm ref="form" :item-list="formConfig">
      </TsForm>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>  
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    ciId: {
      type: Number
    }
  },
  data() {
    const _this = this;
    return {
      formData: {
        ciId: this.ciId
      },
      dialogConfig: {
        title: '编辑',
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      formConfig: [
        {
          name: 'ciId',
          _belong: 'realci',
          type: 'tree',
          label: this.$t('根模型'),
          value: this.ciId,
          width: '100%',
          validateList: ['required'],
          url: 'api/rest/cmdb/ci/listtree',
          params: { ciId: null },
          valueName: 'id',
          textName: 'label',
          transfer: true,
          showPath: true,
          onChange: name => {
            if (name) {
              this.$set(_this.formData, 'ciId', name);
            } else {
              this.$set(_this.formData, 'ciId', null);
            }
          }
        }
      ]
    };
  },
  beforCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforedUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    close(action) {
      this.$emit('close', action);
    },
    save() {
      const form = this.$refs['form'];
      if (!form.valid()) {
        return false;
      }
      if (this.ciId == this.formData.ciId) {
        this.close();
        return false;
      }
      this.$api.cmdb.asset.saveResourceType(this.formData).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.close('refresh');
        }
      });
    }
  },
  computed: {},
  watch: {}
};
</script>
