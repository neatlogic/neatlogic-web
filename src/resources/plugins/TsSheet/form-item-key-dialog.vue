<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-close="close()"
      @on-ok="save()"
    >
      <template v-slot>
        <div>
          <Alert type="warning" show-icon>{{ $t('page.uniquenotedit') }}</Alert>
          <template v-if="!$utils.isEmpty(componentList)">
            <template v-for="(item,index) in componentList">
              <TsFormItem v-if="!item.notUniqueKey" :key="index" :label="item.label">
                <TsFormInput
                  ref="itemKey"
                  v-model="item.key"
                  v-bind="formItemConfig"
                ></TsFormInput>
              </TsFormItem>
            </template>
          </template>
          <TsFormItem v-else :label="$t('page.uniquekey')" required>
            <TsFormInput
              ref="itemKey"
              v-model="value"
              v-bind="formItemConfig"
            ></TsFormInput>
          </TsFormItem>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: {
    formItemList: {
      type: Array,
      default: () => []
    },
    copyedCell: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        isShow: true,
        title: this.$t('page.setting')
      },
      value: '',
      formItemConfig: {
        placeholder: this.$t('page.uniquekey'),
        validateList: [
          'required',
          {
            name: 'regex',
            trigger: 'change',
            pattern: /^[A-Za-z\d_]+$/,
            message: this.$t('message.plugin.enName')
          },
          {
            name: 'custom',
            trigger: 'change',
            message: this.$t('message.cannotrepeat', {'target': this.$t('page.uniquekey')}),
            validator: (rule, val) => {
              if (!this.$utils.isEmpty(this.formItemList)) {
                return !this.formItemList.find(item => item.key === val);
              }
              return true;
            }
          }
        ],
        border: 'border'
      },
      itemConfig: null,
      componentList: []
    };
  },
  beforeCreate() {},
  created() {
    this.init();
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
    init() {
      if (!this.$utils.isEmpty(this.copyedCell) && !this.$utils.isEmpty(this.copyedCell.component.component)) {
        this.copyedCell.component.component.forEach(item => {
          this.componentList.push({
            ...item,
            key: ''
          });
        });
      }
    },
    close() {
      this.$emit('close');
    },
    save() {
      let isValid = true;
      let refs = this.$refs;
      for (let key in refs) {
        if (refs[key] instanceof Array && refs[key].length) {
          refs[key].forEach((item) => {
            if (item && item.valid && !item.valid()) {
              isValid = false;
            }
          });
        } else {
          if (refs[key] && refs[key].valid && !refs[key].valid()) {
            isValid = false;
          }
        }
      }
      if (isValid) {
        if (!this.$utils.isEmpty(this.componentList)) {
          this.itemConfig = this.$utils.deepClone(this.copyedCell);
          this.itemConfig.component.uuid = this.$utils.setUuid();
          this.itemConfig.component.component = this.componentList;
          this.itemConfig.component.component.forEach(item => {
            let uuid;
            if (!item.notUniqueKey) {
              uuid = this.$md5(item.key);
            } else {
              uuid = this.$utils.setUuid();
            }
            if (this.itemConfig.component.config.tabList) {
              this.itemConfig.component.config.tabList.forEach(tab => {
                let findIIndex = tab.component.findIndex(c => c === item.uuid);
                if (findIIndex !== -1) {
                  tab.component[findIIndex] = uuid;
                }
              });
            }
            item.uuid = uuid;
          });
        }
        this.$emit('close', this.value, this.itemConfig);
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
