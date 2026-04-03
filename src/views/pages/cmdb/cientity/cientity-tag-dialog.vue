<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <TsForm
        ref="form"
        v-model="formData"
        :item-list="formConfig"
      >
      </TsForm>
    </template>
    <template v-slot:footer>
      <Button @click="close">{{ $t('page.cancel') }}</Button>
      <Button type="primary" :loading="isSaving" @click="save">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>

<script>
export default {
  name: 'CiEntityTagDialog',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    ciEntityList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isSaving: false,
      formData: {
        mode: 'append',
        tagIdList: []
      },
      dialogConfig: {
        type: 'modal',
        title: '添加标签',
        isShow: true,
        maskClose: false,
        width: 'small'
      },
      formConfig: {
        mode: {
          type: 'radio',
          name: 'mode',
          label: '编辑模式',
          dataList: [
            {
              value: 'append',
              text: '追加'
            },
            {
              value: 'replace',
              text: '覆盖'
            }
          ]
        },
        tagIdList: {
          type: 'select',
          name: 'tagIdList',
          label: '标签',
          multiple: true,
          transfer: true,
          search: true,
          dynamicUrl: '/api/rest/cmdb/tag/search',
          textName: 'name',
          valueName: 'id',
          validateList: [{ name: 'required', message: '请选择标签' }]
        }
      }
    };
  },
  methods: {
    close(needRefresh) {
      this.dialogConfig.isShow = false;
      this.$emit('close', needRefresh);
    },
    save() {
      if (!this.$refs.form.valid()) {
        return;
      }
      const ciEntityIdList = (this.ciEntityList || []).map(item => item.id);
      if (ciEntityIdList.length === 0) {
        this.close(false);
        return;
      }
      this.isSaving = true;
      this.$api.cmdb.cientity.batchAddTag({
        ciEntityIdList,
        mode: this.formData.mode,
        tagIdList: this.formData.tagIdList
      }).then(res => {
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.close(true);
        }
      }).finally(() => {
        this.isSaving = false;
      });
    }
  }
};
</script>
