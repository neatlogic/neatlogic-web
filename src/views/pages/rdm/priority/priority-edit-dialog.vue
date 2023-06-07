<template>
  <TsDialog v-bind="dialogConfig" @on-ok="save" @on-close="close">
    <template v-slot>
      <TsForm ref="form" v-model="priorityData" :item-list="formConfig">
        <template v-slot:color>
          <ColorPicker
            v-model="priorityData.color"
            :transfer="true"
            recommend
            class="colorPicker"
            transfer-class-name="color-picker-transfer-class"
          />
        </template>
      </TsForm>
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
    id: {type: Number}
  },
  data() {
    return {
      dialogConfig: {
        title: this.id ? this.$t('dialog.title.edittarget', {'target': this.$t('page.priority')}) : this.$t('dialog.title.addtarget', {'target': this.$t('page.priority')}),
        isShow: true,
        maskClose: false,
        width: 'small'
      },
      priorityData: {},
      formConfig: [
        {
          type: 'text',
          label: this.$t('page.name'),
          name: 'name',
          validateList: ['required']
        },
        {
          type: 'slot',
          label: this.$t('page.color'),
          name: 'color'
        }]
    };
  },
  beforeCreate() {},
  created() {
    this.getPriorityById();
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
    getPriorityById() {
      if (this.id) {
        this.$api.rdm.priority.getPriorityById(this.id).then(res => {
          this.priorityData = res.Return;
        });
      }
    },
    save() {
      if (this.$refs['form'].valid()) {
        this.$api.rdm.priority.savePriority(this.priorityData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.updatesuccess'));
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
