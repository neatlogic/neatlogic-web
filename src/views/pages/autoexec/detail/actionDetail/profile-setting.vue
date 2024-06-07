<template>
  <div class="proflie-setting padding">
    <div
      v-for="item in list"
      :id="'profile_' + item.id"
      :key="item.id"
      class="list border-color radius-md"
    >
      <div class="top">
        <div class="overflow">{{ item.name }}</div>
        <div class="btn-list">
          <i v-if="$AuthUtils.hasRole('AUTOEXEC_MODIFY')" class="tsfont-edit text-tip-active pr-xs" @click="editProfile(item)"></i>
          <i class="tsfont-down text-tip-active" @click="toggleshow(item)"></i>
        </div>
      </div>
      <div v-if="!item.isHide" class="params-list pt-md">
        <div v-if="item.profileParamVoList && item.profileParamVoList.length > 0">
          <TsRow class="pb-sm">
            <Col span="12" class="text-tip">{{ $t('term.autoexec.paramsname') }}</Col>
            <Col span="12" class="text-tip">{{ $t('term.autoexec.paramsvalue') }}</Col>
          </TsRow>
          <TsRow v-for="p in item.profileParamVoList" :key="p.key" class="params-text">
            <Col span="12">
              <div class="overflow" :title="p.name.length > 10? p.name : ''">{{ p.name }}</div>
            </Col>
            <Col v-if="p.mappingMode == 'globalparam'" span="12">
              <div class="overflow">
                <Globalparam :value="p.defaultValue" :params="{typeList: [p.type]}" :readonly="true"></Globalparam>
              </div>
            </Col>
            <Col v-else span="12">
              <div class="overflow">
                <Items
                  :is="handleType(p.type)"
                  v-model="p.defaultValue"
                  :config="getConfig(p.config)"
                  :readonly="true"
                ></Items>
              </div>
            </Col>
          </TsRow>
        </div>
        <div v-else class="text-tip">{{ $t('page.notarget',{target:$t('page.inputparam')}) }}</div>
      </div>
    </div>
    <ToolProfileEdit
      v-if="isShow"
      :toolProfileId="id"
      @close="closeDialog"
    >
    </ToolProfileEdit>
  </div>
</template>
<script>
import Items from '@/views/pages/autoexec/components/param/view/index.js';
export default {
  name: '',
  components: {
    ...Items,
    ToolProfileEdit: () => import('@/views/pages/autoexec/config/profile/component/tool-profile-edit.vue'),
    Globalparam: () => import('@/views/pages/autoexec/components/script/item/param/globalparam.vue')
  },
  props: {
    profileList: Array
  },
  data() {
    return {
      list: [],
      isShow: false,
      id: null
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
    closeDialog(needRefresh) {
      this.isShow = false;
      if (needRefresh) {
        this.$emit('updateProfileList');
      }
    },
    editProfile(item) {
      this.id = item.id;
      this.isShow = true;
    },
    toggleshow(item) {
      if (item.isHide) {
        this.$set(item, 'isHide', false);
      } else {
        this.$set(item, 'isHide', true);
      }
    }
  },
  filter: {},
  computed: {
    handleType() {
      return (value) => {
        let type = value + 'Handler';
        type = Items[type] ? type : 'defaultInput';
        return type;
      };
    },
    getConfig() {
      return (config) => {
        if (config && config.type == 'node') {
          config.showNumber = 1;
        }
        return config;
      };
    }
  },
  watch: {
    profileList: {
      handler(val) {
        this.list = this.$utils.deepClone(val) || [];
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.proflie-setting {
  .list {
    border: 1px solid;
    padding: 10px 16px;
    &:not(:last-child) {
      margin-bottom: 10px;
    }
    .top {
      position: relative;
      padding-right: 40px;
    }
    .btn-list {
      position: absolute;
      right: 0;
      top: 0;
    }
    .params-text {
      &:not(:last-child) {
        margin-bottom: 12px;
      }
    }
  }
}
</style>
