<template>
  <TsDialog
    v-bind="dialogConfig"
    @on-ok="save"
    @on-close="close"
  >
    <template v-slot>
      <TsForm
        v-model="data"
        :item-list="formConfig"
      ></TsForm>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
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
      formConfig: [
        {
          type: 'text',
          name: 'name'
        },
        {
          type: 'slot',
          name: 'color'
        }]
    };
  },
  beforeCreate() {},
  created() {
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
    save() {
      
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
<style lang="less">
</style>
