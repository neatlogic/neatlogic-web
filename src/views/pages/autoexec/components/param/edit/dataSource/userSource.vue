<template>
  <TsDialog
    v-bind="dialogConfig"
    @on-ok="okDialog"
    @on-close="closeDialog"
  >
    <template v-slot>
      <TsFormItem :label="$t('term.autoexec.selectionrange')" required>
        <TsFormCheckbox
          v-model="groupList"
          :dataList="groupDataList"
          :validateList="validateList"
          @change="changeValue"
        ></TsFormCheckbox>
      </TsFormItem>
      <TsFormItem :label="$t('page.singleoption') + '/' + $t('page.multipleselection')" required>
        <TsFormRadio
          v-model="isMultiple"
          :dataList="dataList"
          :validateList="validateList"
          @change="changeValue"
        ></TsFormRadio>
      </TsFormItem>
      <TsFormItem :label="$t('page.defaultvalue')">
        <UserSelect
          v-model="defaultValue"
          :multiple="!!isMultiple"
          :groupList="groupList"
          border="border"
          transfer
        ></UserSelect>
      </TsFormItem>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormCheckbox: () => import('@/resources/plugins/TsForm/TsFormCheckbox'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect.vue')
  },
  props: {
    config: Object
  },
  data() {
    return {
      dialogConfig: {
        title: this.$t('dialog.title.edittarget', {target: this.$t('page.datasource')}),
        type: 'modal',
        isShow: true
      },
      groupList: ['user', 'role', 'team'],
      isMultiple: 1,
      defaultValue: null,
      groupDataList: [
        { text: this.$t('page.user'), value: 'user' },
        { text: this.$t('page.role'), value: 'role' },
        { text: this.$t('page.group'), value: 'team' }
      ],
      dataList: [
        { text: this.$t('page.singleoption'), value: 0 },
        { text: this.$t('page.multipleselection'), value: 1 }
      ],
      validateList: ['required']
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
    changeValue() {
      this.defaultValue = null;
    },
    closeDialog() {
      this.$emit('close');
    },
    okDialog() {
      let data = {
        groupList: this.groupList,
        isMultiple: this.isMultiple,
        defaultValue: this.defaultValue
      };
      if (!this.isMultiple) {
        this.defaultValue && this.$set(data, 'defaultValue', [this.defaultValue]);
      }
      this.$emit('close', data);
    }
  },
  filter: {},
  computed: {},
  watch: {
    config: {
      handler(val) {
        if (val) {
          let data = this.$utils.deepClone(val);
          data.groupList && (this.groupList = data.groupList);
          data.hasOwnProperty('isMultiple') && (this.isMultiple = data.isMultiple);
          if (this.isMultiple) {
            this.defaultValue = data.defaultValue || [];
          } else {
            this.defaultValue = data.defaultValue && data.defaultValue[0] ? data.defaultValue[0] : null;
          }
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less">
</style>
