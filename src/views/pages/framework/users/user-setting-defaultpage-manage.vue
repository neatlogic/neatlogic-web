<template>
  <div class="defaultpage-manage">
    <h4 class="title flex-start">
      <span class="pr-nm">{{ $t('page.defaultmodule') }}</span>
      <TsFormSwitch
        v-model="isCustome"
        :trueValue="true"
        :falseValue="false"
        :trueText="$t('page.custom')"
        :falseText="$t('page.referenceglobal')"
        showStatus
        style="flex: 1;"
        @on-change="changeCustome"
      ></TsFormSwitch>
    </h4>
    <template v-if="isCustome">
      <ul class="module-list">
        <li
          v-for="module in currentModuleList"
          :key="module.moduleId"
          class="module padding-sm"
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
          v-for="module in currentModuleList"
          :key="module.moduleId"
          class="module"
        >
          <h4 class="title">{{ $t(module.moduleName) }}{{ $t('page.homepage') }}</h4>
          <Select
            :value="module.defaultPage"
            class="menu-select bg-op"
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
                v-for="(menu,mindex) in getFinalmenu(menuGroup.menuList)"
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
    </template>
  </div>
</template>

<script>
export default {
  name: 'DefaultpageManage',
  components: {
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  data() {
    return {
      isCustome: false,
      currentModuleList: []
    };
  },
  async created() {
    await this.getUserSetting();
    this.$store.dispatch('updateMenu');
  },

  methods: {
    getUserSetting() {
      this.currentModuleList = [];
      return this.$api.framework.user.getUserSetting({type: 'defaultModulePage'}).then(res => {
        if (!this.$utils.isEmpty(res.Return)) {
          this.currentModuleList = res.Return.data.defaultModulePageList || [];
          this.isCustome = true;
        } else {
          this.isCustome = false;
        }
        this.updateCurrentModuieList();
      });
    },
    updateCurrentModuieList() { // 更新当前模块列表
      let list = [];
      if (!this.$utils.isEmpty(this.moduleList)) {
        this.moduleList.forEach(m => {
          const findItem = this.currentModuleList.find(item => item.moduleId === m.moduleId); // 假设是moduleId而非group
          const obj = Object.assign({}, m, findItem || {});
          list.push(obj);
        });
      }
      this.currentModuleList = list;
    },
    changeCustome(val) { // 切换自定义和全局设置
      if (!val) {
        this.$api.framework.user.deleteUserSetting({type: 'defaultModulePage'}).then(res => {
          if (res.Status === 'OK') {
            this.currentModuleList = [];
            this.updateCurrentModuieList();
            this.$Message.success(this.$t('message.updatesuccess'));
          }
        });
      } else {
        this.currentModuleList.forEach(module => {
          module.isDefault = 0; 
          module.defaultPage = '';
        });
        this.saveDefaultPageOnline();
      }
    },
    // 更改默认模块
    changeDefaultModule(moduleSelected) {
      moduleSelected.isDefault = moduleSelected.isDefault === 1 ? 0 : 1; //更改被点击的模块的的默认值
      this.currentModuleList
        .filter(module => module !== moduleSelected)
        .forEach(module => {
          module.isDefault = 0; //其他模块都变成非默认模块
        });
      this.saveDefaultPageOnline();
    },
    // 更改模块的默认页
    changeModuleDefaultPage(moduleSelected, menuPath) {
      moduleSelected.defaultPage = menuPath;
      this.saveDefaultPageOnline();
    },
    // 在后台服务器保存默认模块和模块默认首页设置
    saveDefaultPageOnline() {
      const moduleList = this.currentModuleList.map(module => {
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
    },
    getFinalmenu() {
      return function(list) {
        //需要过滤掉那种作为菜单但是是菜单二级分类的，比如工单中心和知识库的知识分类
        let groupList = [];
        if (list && list.length > 0) {
          groupList = list.filter(l => {
            return !l.istitle;
          });
        }
        return groupList;
      };
    }
  },
  watch: {
    moduleList: {
      handler(val) {
        this.updateCurrentModuieList();
      },
      deep: true
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
      display: grid;
      grid-template-columns: repeat(auto-fill, 128px);
      gap: 16px;
      .module {
        height: 84px;
        border-radius: 2px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
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
        .module-name {
          max-width: 100%;
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
