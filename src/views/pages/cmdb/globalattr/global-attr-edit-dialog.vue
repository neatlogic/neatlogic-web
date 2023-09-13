<template>
  <TsDialog v-bind="dialogConfig" @on-ok="save()" @on-close="close()">
    <template v-slot>
      <div>
        <TsForm v-model="attrData" :item-list="formConfig">
          <template v-slot:itemList>
            选项
          </template>
        </TsForm>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {},
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        title: this.id ? this.$t('dialog.title.edittarget', { target: this.$t('page.attribute') }) : this.$t('dialog.title.addtarget', { target: this.$t('page.attribute') }),
        width: 'small',
        isShow: true,
        maskClose: false
      },
      attrData: {},
      formConfig: [
        {
          type: 'text',
          name: 'id',
          isHidden: true
        },
        {
          type: 'text',
          name: 'name',
          label: this.$t('page.uniquekey')
        },
        {
          type: 'text',
          name: 'label',
          label: this.$t('page.name')
        },
        {
          type: 'switch',
          name: 'isActive',
          label: this.$t('page.enable')
        },
        {
          type: 'switch',
          name: 'isMultiple',
          label: this.$t('page.multipleselection')
        },
        {
          type: 'slot',
          name: 'itemList',
          label: this.$t('page.option')
        }
      ]
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
    save() {},
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
