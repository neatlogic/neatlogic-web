<template>
  <div class="defaultpage-manage">
    <h4 class="title">{{ $t('page.defaultmodule') }}</h4>
    <ul class="module-list">
      <li
        v-for="module in moduleList"
        :key="module.moduleId"
        class="module"
        :class="{'module-default' : module.isDefault}"
        @click="changeDefaultModule(module)"
      >
        <div class="module-icon" :class="'module-img-'+module.moduleId"></div>
        <div class="module-name">{{ $t(module.moduleName) }}</div>
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
          class="menu-select"
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
              class="menu-option"
            >
              <span class="menu-name">{{ $t(menu.name) }}</span>
            </Option>
          </OptionGroup>
        </Select>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'DefaultpageManage',
  created() {
    this.$store.dispatch('updateMenu');
  },

  methods: {
    // 更改默认模块
    changeDefaultModule(moduleSelected) {
      const initialModuleList = this.$utils.deepClone(this.moduleList); //保存原始数据
      moduleSelected.isDefault = moduleSelected.isDefault === 1 ? 0 : 1; //更改被点击的模块的的默认值
      this.moduleList
        .filter(module => module !== moduleSelected)
        .forEach(module => {
          module.isDefault = 0; //其他模块都变成非默认模块
        });
      this.saveDefaultPageOnline().then(res => {
        this.$store.commit('setModuleList', this.moduleList);
      }).catch(() => {
        this.$store.commit('setModuleList', initialModuleList);
      });
    },
    // 更改模块的默认页
    changeModuleDefaultPage(moduleSelected, menuPath) {
      const initialDefaultPage = moduleSelected.defaultPage;
      moduleSelected.defaultPage = menuPath;
      this.saveDefaultPageOnline().then(res => {
        this.$store.commit('setModuleList', this.moduleList);
      }).catch(() => {
        moduleSelected.defaultPage = initialDefaultPage;
        this.$store.commit('setModuleList', this.moduleList);
      });
    },
    // 在后台服务器保存默认模块和模块默认首页设置
    saveDefaultPageOnline() {
      const moduleList = this.moduleList.map(module => {
        const { moduleId: group, isDefault, defaultPage } = module;
        return { group, isDefault, defaultPage };
      });
      const param = {
        defaultModulePageList: moduleList,
        type: 'defaultModulePage'
      };
      return this.$api.framework.user.saveDefaultPage(param)
        .then(res => {
          this.$Message.success(this.$t('message.updatesuccess'));
        });
    }
  },

  computed: {
    isDarkMode() {
      return this.$store.getters.themeType === 'dark';
    },
    moduleList() {
      return this.$store.state.topMenu.moduleList;
    }
  }
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
      display: flex;
      .module {
        width: 128px;
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
        & + .module {
          margin-left: 24px;
        }
      }
    }
  }
  .menu-select {
    width: 381px;
    .menu-option {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      .menu-name {
        margin-left: 10px;
      }
    }
    .ivu-select-dropdown {
      margin-left: -1px;
      width: 382px;
    }
  }
</style>
