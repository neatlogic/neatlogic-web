<template>
  <div>
    <TsDialog
      :title="$t('page.edit')"
      type="slider"
      width="90%"
      :isShow="true"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <Loading :loadingShow="loadingShow" type="fix"></Loading>
        <div v-if="!loadingShow" class="pl-xs">
          <TsForm
            ref="formConfig"
            v-model="formData"
            :item-list="formConfig"
            labelPosition="left"
            :labelWidth="100"
            itemWidth="80%"
          ></TsForm>
          <div class="defaultpage-manage">
            <h4 class="title">{{ $t('page.defaultmodule') }}</h4>
            <ul class="module-list">
              <li
                v-for="module in moduleList"
                :key="module.moduleId"
                class="module bg-op border-base"
                :class="{'module-default' : module.isDefault}"
                @click="changeDefaultModule(module)"
              >
                <div class="module-icon" :class="'module-img-'+module.moduleId"></div>
                <div class="module-name overflow">{{ $t(module.moduleName) }}</div>
                <i class="module-check tsfont-check"></i>
              </li>
            </ul>
            <ul class="menu-list">
              <li
                v-for="module in moduleList"
                :key="module.moduleId"
                class="module"
              >
                <h4 class="title">{{ $t(module.moduleName) }}{{ $t('page.homepage') }}</h4>
                <Select
                  :value="module.defaultPage"
                  class="menu-select bg-op border-color radius-sm"
                  :placeholder="$t('page.default')"
                  clearable
                  transfer
                  transfer-class-name="menu-select"
                  @on-select="option=>changeModuleDefaultPage(module,option.value)"
                  @on-clear="changeModuleDefaultPage(module,'')"
                >
                  <OptionGroup
                    v-for="menuGroup in module.menuGroupList"
                    :key="menuGroup.menuTypeName"
                    :label="$t(menuGroup.menuTypeName)"
                  >
                    <Option
                      v-for="(menu,mindex) in menuGroup.menuList"
                      :key="menu.name+'_'+mindex"
                      :value="menu.path"
                      :label="$t(menu.name)"
                      :class="menu.icon"
                    >
                      <span class="pl-sm">{{ $t(menu.name) }}</span>
                    </Option>
                  </OptionGroup>
                </Select>
              </li>
            </ul>
          </div>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  filters: {
  },
  props: {
    id: Number
  },
  data() {
    return {
      loadingShow: true,
      formConfig: {
        isActive: {
          // labelWidth: 100,
          // labelPosition: 'left',
          type: 'switch',
          label: '是否激活',
          trueValue: 1,
          falseValue: 0
        },
        name: {
          type: 'text',
          label: '名称',
          maxlength: 50,
          validateList: ['required', { name: 'searchUrl', url: '/api/rest/homepage/save', params: () => ({ id: this.formData.id }) }]
        },
        authorityList: { 
          type: 'userselect',
          label: '用户',
          validateList: ['required'], 
          groupList: ['common', 'user', 'role', 'team'],
          isMultiple: true,
          transfer: true
        }
      },
      formData: {
        name: '',
        authorityList: [],
        isActive: 1
      },
      moduleList: [],
      homepageConfig: {}
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
    async init() {
      this.homepageConfig = {};
      const moduleList = this.$utils.deepClone(this.$store.state.topMenu.moduleList);
      await this.getHomePageConfig();
      if (!this.$utils.isEmpty(this.homepageConfig)) {
        this.formData = Object.assign({}, this.homepageConfig);
        if (this.homepageConfig.config && !this.$utils.isEmpty(this.homepageConfig.config.defaultModulePageList)) {
          this.moduleList = this.$utils.deepClone(this.homepageConfig.config.defaultModulePageList);
        }
      }
      moduleList.forEach(m => {
        let findItem = this.moduleList.find(item => item.group === m.moduleId);
        this.$delete(m, 'isDefault');
        this.$delete(m, 'defaultPage');
        if (findItem) {
          Object.assign(findItem, m);
        } else {
          this.moduleList.push({
            ...m,
            isDefault: 0,
            defaultPage: ''
          });
        }
      });
      this.loadingShow = false;
    },
    getHomePageConfig() {
      if (!this.id) {
        return;
      }
      return this.$api.framework.homepage.getHomepageConfig({id: this.id}).then(res => {
        if (res.Status == 'OK') {
          this.homepageConfig = res.Return;
        }
      });
    },
    changeDefaultModule(moduleSelected) {
      moduleSelected.isDefault = moduleSelected.isDefault === 1 ? 0 : 1; //更改被点击的模块的的默认值
      this.moduleList
        .filter(module => module !== moduleSelected)
        .forEach(module => {
          module.isDefault = 0; //其他模块都变成非默认模块
        });
    },
    // 更改模块的默认页
    changeModuleDefaultPage(moduleSelected, menuPath) {
      moduleSelected.defaultPage = menuPath;
    },
    valid() {
      let valid = this.$refs.formConfig.valid();
      return valid;
    },
    okDialog() {
      if (!this.valid()) {
        return;
      }
      this.save();
    },
    save() {
      const moduleList = this.moduleList.map(module => {
        const { moduleId: group, isDefault, defaultPage } = module;
        return { group, isDefault, defaultPage };
      });
      const params = {
        id: this.formData.id,
        name: this.formData.name,
        sort: this.formData.sort,
        authorityList: this.formData.authorityList,
        isActive: this.formData.isActive,
        config: {
          defaultModulePageList: moduleList
        }
      };
      this.$api.framework.homepage.saveHomepage(params).then(res => {
        if (res.Status == 'OK') {
          this.$emit('close', params);
        }
      });
    },
    closeDialog() {
      this.$emit('close');
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.defaultpage-manage {
  padding-bottom: 30px;
  .title {
    margin: 16px 0 8px;
    font-size: 13px;
    font-weight: normal;
  }
  .module-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, 128px);
    gap: 16px;
    .module {
      padding: 0 10px;
      height: 84px;
      border-radius: 2px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      transition: box-shadow 0.2s ease-out;
      .module-icon {
        width: 40px;
        height: 44px;
        overflow: hidden;
        text-align: center;
        background-size: auto 44px;
        background-position: center center;
      }
      .module-check {
        display: none;
      }
      &.module-default {
        background-color: fade(@default-primary-color, 10%);
        position: relative;
        .module-check {
          content: '';
          position: absolute;
          top: 2px;
          left: 97%;
          transform: translate(-50%, -50%);
          display: block;
          width: 24px;
          height: 24px;
          line-height: 24px;
          text-align: center;
          border-radius: 50%;
          color: @default-blockbg;
          background-color: @default-primary-color;
        }
      }
      .module-name {
        max-width: 100%;
      }
    }
  }
}
.menu-select {
  width: 50%;
  /deep/ .ivu-select-selection {
    border: 1px solid @border-color-base !important;
  }
}
</style>
