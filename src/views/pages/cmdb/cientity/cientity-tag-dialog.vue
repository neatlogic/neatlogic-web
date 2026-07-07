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
        title: this.$t('term.cmdb.addtag'),
        isShow: true,
        maskClose: false,
        width: 'small'
      },
      formConfig: {
        mode: {
          type: 'radio',
          name: 'mode',
          label: this.$t('term.cmdb.editmode'),
          dataList: [
            {
              value: 'append',
              text: this.$t('page.append')
            },
            {
              value: 'replace',
              text: this.$t('page.replace')
            }
          ]
        },
        tagIdList: {
          type: 'select',
          name: 'tagIdList',
          label: this.$t('page.tag'),
          multiple: true,
          transfer: true,
          search: true,
          dynamicUrl: '/api/rest/cmdb/tag/search',
          textName: 'name',
          valueName: 'id',
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseselect', { target: this.$t('page.tag') }) }]
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
