<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-ok="save()"
      @on-close="close()"
    >
      <template v-slot>
        <div>
          <TsForm ref="nameForm" :itemList="formConfig"></TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    uuid: {type: String}
  },
  data() {
    return {
      dialogConfig: {
        title: this.$t('dialog.title.edittarget', {target: this.$t('page.name')}),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      workcenterData: {},
      formConfig: [
        {
          type: 'text',
          name: 'name',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: ['required', 'name-special']
        },
        {
          type: 'text',
          name: 'catalogName',
          label: this.$t('term.process.menutype'),
          maxlength: 50
        },
        {
          name: 'isShowTotal',
          type: 'switch',
          label: this.$t('page.showtotal'),
          trueValue: 1,
          falseValue: 0,
          desc: this.$t('term.process.workordertypenumdes')
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getWorkcenterByUuid();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    getWorkcenterByUuid() {
      if (this.uuid) {
        this.$api.process.processtask.getWorkcenterByUuid(this.uuid).then(res => {
          this.workcenterData = res.Return;
          this.formConfig.forEach(element => {
            this.$set(element, 'value', this.workcenterData[element.name]);
          });
        });
      }
    },
    save() {
      if (this.$refs['nameForm'].valid()) {
        const data = this.$refs['nameForm'].getFormValue();
        data.uuid = this.uuid;
        this.$api.process.processtask.renameWorkcenter(data).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
