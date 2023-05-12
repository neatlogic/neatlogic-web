<template>
  <div class="profile-setting">
    <div class="profile-top">
      <span class="text-tip profile-tip">{{ $t('term.autoexec.presetparameterset') }}</span>
      <span v-if="canEdit">
        <TsFormSwitch
          v-model="isActive"
          class="pl-xs"
          @on-change="toggleAction"
        ></TsFormSwitch>
      </span>
    </div>
    <div class="profile-form">
      <TsFormSelect
        ref="profileForm"
        v-model="profileId"
        v-bind="profileForm"
        :disabled="!canEdit || !isActive"
        :readonly="!canEdit"
        @first="gotoProfile()"
      ></TsFormSelect>
    </div>
    <div class="btn">
      <i v-if="profileId && jumpToProfile" class="tsfont-location-o pl-xs text-tip-active" @click="jumpToItem(profileId)"></i>
      <i
        v-if="canEdit && isActive && profileId"
        class="tsfont-edit pl-xs text-tip-active"
        :title="$t('page.edit')"
        @click="editProfile()"
      ></i>
      <i
        v-if="canEdit && isActive"
        class="tsfont-rotate-right pl-xs text-tip-active"
        :title="$t('page.refresh')"
        @click="refreshProfile(true)"
      ></i>
    </div>
    <ToolProfileEdit 
      v-if="isShow"
      :toolProfileId="profileId"
      @close="closeDialog"
    >
    </ToolProfileEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    ToolProfileEdit: resolve => require(['@/views/pages/autoexec/config/profile/component/tool-profile-edit.vue'], resolve)
  },
  inject: {
    getProfileList: {
      default: () => {}
    },
    jumpToProfile: {
      default: null
    }
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    config: Object,
    canEdit: Boolean
  },
  data() {
    return {
      isActive: 0,
      profileConfig: {},
      profileId: null,
      profileForm: {
        dynamicUrl: '/api/rest/autoexec/profile/search',
        rootName: 'tbodyList',
        valueName: 'id',
        textName: 'name',
        border: 'border',
        validateList: ['required'],
        transfer: true,
        firstSelect: false,
        firstText: this.$t('term.autoexec.presetparameterset'),
        firstLi: true,
        onChange: (val) => {
          this.changeProfileId(val);
        }
      },
      isShow: false
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
    initProfileConfig(val) { //初始化
      this.profileConfig = val.config || {};
      this.profileId = this.profileConfig.profileId || null;
      if (this.profileId || this.profileConfig.isActive) {
        this.isActive = 1;
      }
    },
    updateProfile() { //更新预置参数集
      this.$emit('updateProfile', this.profileConfig);
    },
    toggleAction(val) {
      if (!val) {
        this.$set(this.profileForm, 'validateList', []);
      } else {
        this.$set(this.profileForm, 'validateList', ['required']);
      }
      this.$set(this.profileConfig, 'isActive', this.isActive);
      this.changeProfileId();
    },
    changeProfileId(val) { //改变预置参数集
      let value = val || null;
      this.$set(this.profileConfig, 'profileId', value);
      this.updateProfile();
    },
    editProfile() { //编辑
      this.isShow = true;
    },
    closeDialog(needRefresh) { //关闭编辑框
      this.isShow = false;
      if (needRefresh) {
        this.refreshProfile();
        this.getProfileList();
      }
    },
    refreshProfile(isMessage) { //刷新
      this.profileForm.dynamicUrl = '/api/rest/autoexec/profile/search?uuid=' + this.$utils.setUuid();
      isMessage && this.$Message.success(this.$t('message.refreshsuccess'));
      this.profileId && this.$emit('refreshProfile', this.profileId);
    },
    gotoProfile() { //新增预置参数集
      window.open(HOME + '/autoexec.html#/tool-profile-manage?isAdd=true', '_blank');
    },
    valid() { //校验
      let isVaild = true;
      if (this.$refs.profileForm && !this.$refs.profileForm.valid()) {
        isVaild = false;
      }
      return isVaild;
    },
    jumpToItem(id) {
      this.jumpToProfile && typeof this.jumpToProfile == 'function' && this.jumpToProfile(id);
    }
  },
  filter: {},
  computed: {},
  watch: {
    config: {
      handler(val) {
        if (val && !this.$utils.isSame(val, this.profileConfig)) {
          this.initProfileConfig(val);
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.profile-setting {
   position: relative;
  .profile-top {
    padding:  16px 0 10px;
    display: flex;
  }
  .btn {
    position: absolute;
    right: 0px;
    top: 16px
  }
  
}

</style>
