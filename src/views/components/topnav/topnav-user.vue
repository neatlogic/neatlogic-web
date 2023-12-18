<template>
  <div class="topnav-user">
    <Dropdown
      trigger="click"
      placement="bottom-end"
      transfer
      transfer-class-name="topnav-user-dropdown"
      @on-visible-change="toggleDropdown"
    >
      <div class="user-info">
        <TsAvatar
          v-bind="userInfo"
          :avatar="avatarUrl"
          :size="24"
          class="user-avatar"
        ></TsAvatar>
        <i class="tsfont-down" :class="{'arrow-dropdown':isDropdown}"></i>
      </div>
      <DropdownMenu slot="list" class="dropdown-menu" style="width:180px;">
        <DropdownItem class="ban-hover">
          <b>{{ userInfo.userName }}</b><span>({{ userInfo.userId }})</span>
        </DropdownItem>
        <DropdownItem divided @click.native="toUsersetting()">
          <i class="tsfont-user dropdown-icon"></i>
          <span>{{ $t('page.personalsetting') }}</span>
        </DropdownItem>
        <DropdownItem @click.native="changeTheme()">
          <i class="dropdown-icon" :class="themeClass =='theme-default'?'tsfont-night':'tsfont-day'"></i>
          <span>{{ themeClass =='theme-default'?$t('page.themedark'):$t('page.themelight') }}</span>
        </DropdownItem>
        <DropdownItem @click.native="changeLanguage()">
          <i class="tsfont-flow dropdown-icon"></i>
          <span>{{ $t('page.language') }}</span>
        </DropdownItem>
        <DropdownItem divided @click.native="logout()">
          <i class="tsfont-export dropdown-icon"></i>
          <span>{{ $t('page.logout') }}</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>

<script>
import TsAvatar from 'components/TsAvatar/TsAvatar';
import ThemeUtils from '@/views/pages/framework/theme/themeUtils.js';
import {mutations} from '@/views/pages/framework/theme/state.js';
export default {
  name: 'TopnavUser',
  inject: {
    reloadRouter: {
      from: 'reloadRouter',
      default: null
    }
  },
  components: {
    TsAvatar
  },
  data() {
    return {
      themeClass: localStorage.getItem('themeClass') || 'theme-default',
      isDropdown: false
      // env: null
    };
  },
  mounted() {
    this.initLanguage();
    this.initTheme();
    // this.env = process.env.NODE_ENV;
  },
  methods: {
    initLanguage() {
      let lang = BASELANGUAGES;
      this.$i18n.locale = lang;
      // this.$i18n.locale = 'zh';
    },
    changeLanguage() {
      let lang = this.$i18n.locale;
      if (lang == 'zh') {
        this.$i18n.locale = 'en';
      } else {
        this.$i18n.locale = 'zh';
      }
      this.$utils.setCookie('neatlogic_language', this.$i18n.locale, 7);
      this.reloadRouter && this.reloadRouter();
    },
    initTheme() {
      document.documentElement.classList.add(this.themeClass);
      // 存起来
      this.$store.commit('setThemeType', this.themeClass);
    },
    changeTheme() {
      let htmlClassList = document.documentElement.classList;
      htmlClassList.toggle('theme-default');
      htmlClassList.toggle('theme-dark');
      localStorage.setItem('themeClass', htmlClassList[0]);
      this.$set(this, 'themeClass', htmlClassList[0]);
      ThemeUtils.activeTheme(); //获取定制主题
      ThemeUtils.updateThemeValue(mutations, 'setLogo', 'logo'); // 这个方法，主要是更新状态管理器，setlogo 是参数名称
      // 把当前的theme主题存放到vuex中
      this.$store.commit('setThemeType', htmlClassList[0]);
      // 触发切换dashboard主题
      var myEvent = new CustomEvent('chartThemeChange', {
        detail: { theme: htmlClassList[0] }
      });
      if (window.dispatchEvent) {
        window.dispatchEvent(myEvent);
      } else {
        window.fireEvent(myEvent);
      }
    },
    logout() {
      let data = {};
      this.$api.common.logout(data).then(res => {
        if (res.Status == 'OK') {
          sessionStorage.removeItem('neatlogic_authorization');
          this.$utils.removeCookie('neatlogic_authorization');
          let url = res.Return.url || '';
          if (url) {
            url = url.indexOf('http://') == -1 || url.indexOf('https://') == -1 ? 'http://' + url : url;
            window.open(url, '_self');
          } else {
            window.location.href = HOME + '/login.html';
          }
        }
      });
    },
    toggleDropdown(isDropdown) {
      this.isDropdown = isDropdown;
    },
    toUsersetting() {
      if (this.moduleId == 'framework') {
        this.$router.push({ path: '/user-setting' });
      } else {
        let that = this.$root.$children[0] ? this.$root.$children[0].$refs.root : null;//获取router-view 的vue 对象
        this.$utils.gotoHref(HOME + '/framework.html#/user-setting', that);
      }
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo;
    },
    avatarUrl() {
      return this.$store.getters.userAvatar;
    }
  }
};
</script>

<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.topnav-user {
  .user-info {
    cursor: pointer;
    text-align: center;
    position: relative;
    width: 64px;

    .tsfont-down {
      margin-left: 5px;
      margin-right: 16px;
      .transition(300ms);

      &.arrow-dropdown {
        transform: rotate(180deg);
      }
    }
  }

  .dropdown-icon {
    margin-right: 4px;
    width: 16px;
  }

  .ivu-dropdown-item.ban-hover:hover {
    background: initial;
    cursor: text;
  }
}
</style>
