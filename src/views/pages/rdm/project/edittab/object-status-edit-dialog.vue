<template>
  <TsDialog
    v-bind="dialogConfig"
    @close="close"
  >
    <template v-slot>
      <TsForm
        v-model="statusData"
        :item-list="formConfig"
      ></TsForm>
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
      statusData: null,
      dialogConfig: {
        title: '编辑属性',
        isShow: true,
        width: 'small',
        type: 'modal',
        maskClose: false
      },
      formConfig: {
        id: {
          type: 'text',
          isHidden: true
        },
        name: {
          type: 'text',
          label: '唯一标识',
          validateList: ['required', 'char']
        },
        label: {
          type: 'text',
          label: '名称',
          validateList: ['required']
        },
        color: {
          type: 'slot',
          label: '颜色'
        },
        description: {
          type: 'textarea',
          label: '说明'
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getStatusById();
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
    getStatusById() {
      if (this.id) {
        this.$api.rdm.project.getStatusById(this.id).then(res => {
          this.statusData = res.Return;
        });
      }
    },
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
