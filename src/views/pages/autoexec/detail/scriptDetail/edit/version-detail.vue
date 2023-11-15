
<template>
  <div
    v-if="config"
    ref="versionDetail"
    class="version-detail"
    :class="readonly?'':'version-edit bg-op radius-lg'"
  >
    <div id="versionDetail">
      <div class="version-centent">
        <div v-if="versionVo && versionVo.rejectReason" class="rejectReason">
          <div class="bg-error-grey padding-sm mb-md radius-sm">
            <span class="tsfont-danger-o text-danger btn-icon"></span>
            <span style="display: inline-block;">
              <UserCard v-bind="versionVo.reviewerVo"></UserCard>
            </span>
            <span>{{ $t('term.autoexec.rejectreason') }}</span>
            <span :title="versionVo.rejectReason">{{ versionVo.rejectReason }}</span>
          </div>
        </div>
        <VersionEdit
          ref="versionEdit"
          :typeList="paramsTypeList"
          :outputParamTypeList="outputParamTypeList"
          :config="versionVo"
          :isEdit="!readonly"
        ></VersionEdit>
      </div>
    </div>
  </div>
</template>
<script>
import VersionEdit from '../common/version-edit.vue';
import UserCard from '@/resources/components/UserCard/UserCard.vue';
export default {
  name: '',
  components: {
    VersionEdit,
    UserCard
  },
  filters: {
  },
  props: {
    config: {
      type: Object,
      default: () => {}
    },
    type: String //版本类型 
  },
  data() {
    return {
      readonly: false, //发布版本的是否只读
      paramsTypeList: [],
      outputParamTypeList: [], //输出参数类型
      versionVo: null,
      isReviewShow: false,
      userType: 'submit', //审核人权限
      reviewDialog: false,
      formConfig: {
        content: {
          type: 'textarea',
          label: this.$t('page.reason'),
          width: '100%',
          labelWidth: '60',
          maxlength: 500,
          autosize: { minRows: 3 },
          validateList: ['required']
        }
      },
      defaultVersionList: [],
      versionList: [],
      targetVersionId: null,
      isCompareShow: false,
      validList: [{text: '', type: '', config: {}}] //校验产生的数据列表
    };
  },
  beforeCreate() {},
  created() {
   
  },
  async beforeMount() {
    await this.getParamsTypeLit();
  },
  mounted() {
    this.initdata();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    initdata() {
      if (this.config && this.config.versionVo) {
        let versionVo = this.config.versionVo;
        versionVo.isLib = this.config.isLib;
        this.versionVo = versionVo;
      }
      if (this.type == 'passed') {
        this.readonly = true;
      } else {
        this.readonly = false;
      }
    },
    getParamsTypeLit() { //选择组件类型
      let data = {
        enumClassList: ['neatlogic.framework.autoexec.constvalue.ParamType', 'neatlogic.framework.autoexec.constvalue.OutputParamType']
      };
      return this.$api.common.getBatchSelectList(data).then(res => {
        if (res.Status == 'OK') {
          let obj = res.Return || {};
          this.paramsTypeList = obj['neatlogic.framework.autoexec.constvalue.ParamType'] || [];
          this.outputParamTypeList = obj['neatlogic.framework.autoexec.constvalue.OutputParamType'] || [];
        }
      });
    },
    valid() {
      this.validVisible = true;
      let validList = this.$refs.versionEdit.valid();
      return validList;
    },
    save() {
      return this.$refs.versionEdit.save();
    }
  },
  computed: {},
  watch: {
    config: {
      handler(val) {
        this.initdata();
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.version-detail{
  position: relative;
  height: 100%;
  overflow-y: auto;
  /deep/ .version-top{
    display: flex;
    justify-content: space-between;
    padding-bottom: 16px;
    margin-bottom: 16px;
    border-bottom:1px solid;
    .version-number{
      flex: 1;
    }
    .tsfont{
      &::before{
        margin-right: 3px;
      }
    }
  }
  /deep/ .item-list{
    padding-bottom: 16px;
    .text-title{
      padding-bottom: 8px;
    }
  }
  .rejectReason{
    padding-bottom: 8px;
  }
}
.btn-icon{
  &:before{
    padding-right: 4px;
  }
}
.version-edit {
  padding: 16px 16px 16px 28px;
}
</style>
