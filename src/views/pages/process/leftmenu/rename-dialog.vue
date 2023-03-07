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
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    uuid: {type: String}
  },
  data() {
    return {
      dialogConfig: { 
        title: '编辑名称',
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
          label: '菜单类型',
          maxlength: 50
        },
        {
          name: 'isShowTotal',
          type: 'switch',
          label: '显示总数',
          trueValue: 1,
          falseValue: 0,
          desc: '左侧工单分类是否显示总数,默认为否,显示待办数'
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
            this.$Message.success(this.$t('message.content.savesuccess'));
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
