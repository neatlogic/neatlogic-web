<template>
  <TsDialog v-bind="dialogConfig" @on-ok="save()" @on-close="close()">
    <template v-slot>
      <div>
        <TsForm ref="form" v-model="objectData" :item-list="formConfig"></TsForm>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    id: { type: Number }
  },
  data() {
    return {
      dialogConfig: {
        title: this.id ? this.$t('dialog.title.edittarget', { target: this.$t('page.object') }) : this.$t('dialog.title.addtarget', { target: this.$t('page.object') }),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      objectData: {},
      formConfig: [
        {
          name: 'objCategory',
          label: this.$t('term.cmdb.objectcategory'),
          type: 'text',
          validateList: ['required']
        },
        {
          name: 'objType',
          label: this.$t('page.itemtype'),
          type: 'text',
          validateList: ['required']
        },
        {
          name: 'ciId',
          label: this.$t('page.model'),
          type: 'select',
          url: 'api/rest/cmdb/ci/list',
          params: {isVirtual: 0, isAbstract: 0 },
          transfer: true
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    if (this.id) {
      this.getObjectById();
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
    getObjectById() {
      if (this.id) {
        this.$api.cmdb.sync.getObjectById(this.id).then(res => {
          this.objectData = res.Return;
        });
      }
    },
    save() {
      const form = this.$refs['form'];
      if (form && form.valid()) {
        this.$api.cmdb.sync.saveObject(this.objectData).then(res => {
          if (res.Status === 'OK') {
            this.$Message.success('修改成功');
            this.close(true);
          }
        });
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
