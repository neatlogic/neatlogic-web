<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-ok="okSetting"
      @on-close="closeSetting"
    >
      <template v-slot:header>
        <div>
          {{ $t('term.autoexec.jobparam') }}
        </div>
      </template>
      <template v-slot>
        <div class="params-main input-border">
          <div class="simple-mode">
            <ParamDetail 
              v-if="isEditSetting"
              ref="paramList"
              :list="paramList"
              :typeList="paramsTypeList"
              :isEdit="isEditSetting"
              :setValidComponentsList="setValidComponentsList"
              :opType="opType"
            ></ParamDetail>
            <ParamsReadonly
              v-for="(param, index) in paramList"
              v-else
              :key="index"
              :typeList="paramsTypeList"
              :config="param"
            ></ParamsReadonly>
          </div>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import ParamDetail from './params/param-detail.vue';
import ParamsReadonly from '@/views/pages/autoexec/components/param/params-readonly.vue';
export default {
  name: '',
  components: {
    ParamDetail,
    ParamsReadonly
  },
  filters: {},
  props: {
    id: [Number, String],
    isEditSetting: Boolean,
    paramsTypeList: Array,
    runtimeParamList: {
      type: Array,
      default: () => []
    },
    opType: String
  },
  data() {
    let _this = this;
    return {
      dialogConfig: {
        type: 'slider',
        width: '1200px',
        isShow: true,
        hasFooter: _this.isEditSetting
      },
      paramList: [
        {
          key: '',
          defaultValue: '',
          description: '',
          isRequired: 1,
          type: 'text',
          editable: 1
        }
      ],
      setValidComponentsList: ['text']
    };
  },
  beforeCreate() {},
  created() {
    this.paramList = this.runtimeParamList;
  },
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {
    
  },
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    closeSetting() {
      this.$emit('close');
    },
    okSetting() {
      if (this.$refs.paramList.validName().length > 0) {
        return;
      }
      if (!this.validParamList()) {
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('term.deploy.deleteallcite'),
          btnType: 'error',
          'on-ok': vnode => {
            this.saveParamList();
            vnode.isShow = false;
          }
        });
      } else {
        this.saveParamList();
      }
    },
    saveParamList() {
      this.$emit('saveParams', this.$refs.paramList.saveParamList());
      this.closeSetting();
    },
    validParamList() { //校验默认的参数列表key是否发生改变
      let isValid = true;
      let paramList = this.$refs.paramList.saveParamList();
      if (!this.$utils.isSame(this.runtimeParamList, paramList)) {
        this.runtimeParamList.forEach(item => {
          let findParam = paramList.find(p => p.key == item.key);
          if (!findParam) {
            isValid = false;
          }
        });
      }
      return isValid;
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang='less' scoped></style>
