<template>
  <TsDialog v-bind="dialogConfig" @on-close="close()" @on-ok="save()">
    <template v-slot>
      <div v-if="projectUser.userTypeList && projectUser.userTypeList.length == 1">
        {{ $t('dialog.content.deleteconfirm', { target: $t('term.rdm.projectmember') }) }}
      </div>
      <div v-if="projectUser.userTypeList && projectUser.userTypeList.length > 1">
        <div class="text-grey mt-md">{{ $t('term.rdm.pleaseselectrole') }}</div>
        <TsFormCheckbox
          v-model="userTypeList"
          :vertical="true"
          :dataList="projectUser.userTypeList"
          valueName="userType"
          textName="userTypeName"
        ></TsFormCheckbox>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormCheckbox: resolve => require(['@/resources/plugins/TsForm/TsFormCheckbox'], resolve)
  },
  props: {
    projectUser: { type: Object }
  },
  data() {
    return {
      userTypeList: [],
      dialogConfig: {
        title: this.$t('dialog.title.deletetarget', { target: this.$t('page.user') }),
        type: 'modal',
        maskClose: false,
        isShow: true,
        btnType: 'error',
        width: 'small'
      }
    };
  },
  beforeCreate() {},
  created() {
    if (this.projectUser.userTypeList.length == 1) {
      this.userTypeList = this.projectUser.userTypeList[0].userType;
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
    close() {
      this.$emit('close');
    },
    save() {
      this.$emit('close', this.userTypeList);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped></style>
