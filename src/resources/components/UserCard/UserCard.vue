<template>
  <span
    v-click-outside:false="onClickOutside"
    v-click-outside:false.mousedown="onClickOutside"
    v-click-outside:false.touchstart="onClickOutside"
    class="usercard-container clearfix"
    tabindex="-1"
    @click.stop
  >
    <div v-if="initType != 'processUserType' && initType != 'common'" class="float-left userinfo-card-wrap">
      <Poptip
        ref="pop"
        v-model="isshow"
        :trigger="trigger"
        :word-wrap="true"
        width="400"
        transfer
        class="usercard-poptip no-font-size"        
        padding="0 0"
        :placement="placement"
        @on-popper-show="getInfo"
        @on-popper-hide="hidePopper"
      >
        <div class="overflow" :class="[name || config.name ? 'usercard' : '', !name || !config.name ? 'noCursor' : '' , alignMode == 'vertical' ? 'avatar-name-vertical' : '']">
          <slot>
            <TsAvatar
              v-if="!hideAvatar"
              :avatar="avatar || config.avatar"
              :vipLevel="vipLevel || config.vipLevel"
              :initType="initType"
              :pinyin="pinyin || config.pinyin"
              :size="iconSize"
              :name="name || config.name"
              :class="getgapClassName"
            />
            <template v-if="!hideName">
              {{ showName() }}
            </template>
          </slot>
        </div>
        <div
          v-if="name || config.name"
          slot="content"
          ref="dropdown"
          @click.stop
        >
          <Loading v-if="isLoading" loadingShow></Loading>
          <template v-else>
            <div class="userinfo-box radius-sm" :class="!multiple ? 'border-color-primary userinfo-box-border-top ' : ''">
              <UserInfo v-if="!multiple" :userInfo="userInfo"></UserInfo>
              <div v-else-if="initType == 'team' || initType == 'role'" class="padding">
                <TsRow v-if="userList.length > 0" :gutter="0">
                  <div class="padding-b">
                    {{ $t('page.name') }}：{{ name || config.name || $t('page.nodata') }}
                  </div>
                  <Col v-for="user in userList" :key="user.uuid" span="8">
                    <div class="usercard-li overflow" @click.stop="showUser(user)">
                      <TsAvatar v-bind="user" :size="iconSize" class="avatar" />
                      <span>{{ user.userName }}</span>
                    </div>
                  </Col>
                </TsRow>
                <div v-else class="text-center">{{ $t('page.nodata') }}</div>
              </div>
              <div v-if="(initType === 'team' || initType === 'role') && !multiple" class="ts-angle-left text-href userlist-wrap" @click.stop="backtoList">
                {{ $t('page.list') }}
              </div>
            </div>
          </template>
        </div>
      </Poptip>
    </div>
    <div v-else :class="alignMode == 'vertical' ? 'avatar-name-vertical' : 'float-left'">
      <TsAvatar
        v-if="!hideAvatar"
        :avatar="avatar || config.avatar"
        :vipLevel="vipLevel || config.vipLevel"
        :initType="initType"
        :pinyin="pinyin || config.pinyin"
        :size="iconSize"
        :name="name || config.name"
        :class="getgapClassName"
      />
      <template>{{ name || config.name }}</template>
    </div>
  </span>
</template>
<script>
import UserInfo from './UserInfo.vue';
import TsAvatar from 'components/TsAvatar/TsAvatar.vue';
import { directive as ClickOutside } from '@/resources/directives/v-click-outside-x.js';
import _ from 'lodash';
export default {
  name: 'UserCard',
  directives: { ClickOutside },
  components: {
    UserInfo,
    TsAvatar
  },
  inheritAttrs: false, //去掉多余的属性
  props: {
    trigger: { type: String, default: 'click' }, // 用户信息卡片显示出来的触发方式，默认是click，可选hover
    initType: { type: String, default: 'user' },
    initViaNet: { type: Boolean, default: false }, // 是否通过后台接口初始化头像和用户名，需传入userUuid
    avatar: { type: String },
    hideAvatar: { type: Boolean, default: false }, // 是否隐藏头像
    isInterface: { type: Boolean, default: true}, // 是否调用基础数据接口请求 (user/cache/get)，工单中心的列表用户是不调用接口的,默认是调用的
    vipLevel: { type: Number }, //VIP等级
    uuid: { type: String },
    name: { type: String },
    pinyin: { type: String },
    placement: { type: String }, //自定义提示位置
    iconSize: { type: Number, default: 24 },
    hideName: {type: Boolean, default: false}, // 是否隐藏名称
    nameLength: {type: [Boolean, Number], default: false}, //展示多少个字符:false默认不限制；true展示4个字符；number自定义,
    alignMode: {
      type: String, // 头像和名称的对齐方式，可选（水平对齐 horizontal）|| (垂直对齐 vertical)
      default: 'horizontal'
    }
  },
  data() {
    return {
      cancelAxios: null,
      isshow: false,
      isLoading: false,
      userInfo: {},
      multiple: this.initType === 'team' || this.initType === 'role', // 当前是显示多个用户，还是单个用户
      userList: [],
      config: {
        name: '',
        vipLevel: 0,
        avatar: '',
        isLoading: false
      },
      common: {
        alluser: this.$t('page.allofthem')
      }
    };
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.cancelAxios && this.cancelAxios.cancel();
    this.cancelAxios = null;
  },
  methods: {
    init() {
      if (this.initType == 'common') {
        this.config.name = this.common[this.uuid];
      }
    },
    initConfig() {
      //初始化 name 等信息，接口有缓存
      if (this.uuid && this.initType && this['init' + _.upperFirst(this.initType) + 'Config']) {
        this.cancelAxios = this.$https.CancelToken.source();
        this['init' + _.upperFirst(this.initType) + 'Config']();
      } else if (!this.uuid) {
        this.userInfo = {};
      }
    },
    initUserConfig() {
      if (!this.name || this.vipLevel === undefined || !this.avatar || !this.pinyin) {
        if (this.isInterface) {
          let uuid = this.uuid.includes('#') ? this.uuid.split('#')[1] : this.uuid;
          const params = { uuid };
          this.config.isLoading = true;
          return this.$https
            .get('/api/rest/user/cache/get', { params: params, headers: { unConsole: 1 }, cancelToken: this.cancelAxios.token })
            .then(res => {
              if (res && res.Return) {
                this.config.name = res.Return.name;
                this.config.vipLevel = res.Return.vipLevel || 0;
                this.config.avatar = res.Return.avatar;
                this.config.pinyin = res.Return.pinyin;
              }
            }).finally(() => {
              this.config.isLoading = false;
            });
        } else {
          this.config.name = this.name;
          this.config.vipLevel = this.vipLevel || 0;
          this.config.avatar = this.avatar;
          this.config.pinyin = this.pinyin;
        }
      }
    },
    initTeamConfig() {
      if (!this.name) {
        let uuid = this.uuid.includes('#') ? this.uuid.split('#')[1] : this.uuid;
        const params = { uuid };
        this.config.isLoading = true;
        return this.$https.get('/api/rest/team/cache/get', { params: params, headers: { unConsole: 1 }, cancelToken: this.cancelAxios.token }).then(res => {
          this.config.name = res.Return.name;
        }).finally(() => {
          this.config.isLoading = false;
        });
      }
    },
    initRoleConfig() {
      if (!this.name) {
        let uuid = this.uuid.includes('#') ? this.uuid.split('#')[1] : this.uuid;
        const params = { uuid };
        this.config.isLoading = true;
        return this.$https.get('/api/rest/role/cache/get', { params: params, headers: { unConsole: 1 }, cancelToken: this.cancelAxios.token }).then(res => {
          this.config.name = res.Return.name;
        }).finally(() => {
          this.config.isLoading = false;
        });
      }
    },
    getInfo() {
      if ((this.isshow && this.initType != 'team' && this.initType != 'role') || !this.cancelAxios) {
        return;
      }
      let cancel = this.cancelAxios;
      cancel && (this.cancelAxios = null) && cancel.cancel();
      const CancelToken = this.$https.CancelToken;
      this.cancelAxios = CancelToken.source();

      if (this.initType === 'user') {
        this.getUserInfo(this.uuid);
        this.multiple = false;
        this.$emit('showPop', true); //用户展示详情的时候返回函数（目前用于通知策略）
      } else if (this.initType == 'team') {
        this.multiple = true;
        this.getTeamUserList(this.uuid);
        this.$emit('showPop', true);
      } else if (this.initType == 'role') {
        this.multiple = true;
        this.getRoleUserList(this.uuid);
        this.$emit('showPop', true);
      }
    },
    getUserInfo(userUuid) {
      if (!userUuid) {
        return;
      }
      let _this = this;
      userUuid = userUuid.includes('#') ? userUuid.split('#')[1] : userUuid;
      if (this.userInfo.uuid === userUuid) return;
      const params = { userUuid };
      this.isLoading = true;
      return this.$https
        .get('/api/rest/user/get', {
          params: params,
          headers: { unConsole: 1 },
          cancelToken: this.cancelAxios.token
        })
        .then(res => {
          setTimeout(function() {
            _this.$refs.pop && _this.$refs.pop.updatePopper();
          }, 200);
          if (res.Status === 'OK') {
            this.userInfo = res.Return;
          }
        })
        .catch(error => {
          this.userInfo = {};
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    getTeamUserList(teamUuid) {
      if (!teamUuid) {
        return;
      }
      let _this = this;
      if (this.userList.length > 0) return;
      const params = { teamUuid };
      this.isLoading = true;
      return this.$https
        .post('/api/rest/team/user/list', params, { headers: { unConsole: 1 }, cancelToken: this.cancelAxios.token })
        .then(res => {
          setTimeout(function() {
            _this.$refs.pop && _this.$refs.pop.updatePopper();
          }, 200);
          if (res.Status == 'OK') {
            this.userList = res.Return.teamUserList || [];
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    getRoleUserList(roleUuid) {
      if (!roleUuid) {
        return;
      }
      let _this = this;
      if (this.userList.length > 0) return;
      const params = {
        keyword: '',
        needPage: false,
        roleUuid
      };
      this.isLoading = true;
      this.$https
        .post('/api/rest/user/search', params, { headers: { unConsole: 1 }, cancelToken: this.cancelAxios.token })
        .then(res => {
          setTimeout(function() {
            _this.$refs.pop && _this.$refs.pop.updatePopper();
          }, 200);
          if (res.Status == 'OK') {
            this.userList = res.Return.tbodyList || [];
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    onClickOutside(event) {
      const $el = this.$refs.dropdown ? this.$refs.dropdown || null : null;
      if (!$el || $el === event.target || $el.contains(event.target)) {
        return;
      }
      this.isshow = false;
    },
    showUser(user) {
      this.multiple = false;
      if (this.initType === 'team') {
        this.getUserInfo(user.uuid);
      } else if (this.initType === 'role') {
        this.getUserInfo(user.uuid);
      }
    },
    backtoList() {
      this.multiple = true;
      this.userInfo = {};
    },
    removeUser() {
      //关闭提示框
      this.isshow = false;
      this.$emit('showPop', false);
    },
    hidePopper() {
      this.$emit('showPop', false);
    }
  },
  computed: {
    showName() { //展示用户/角色/组的名称
      return () => {
        let text = null;
        if (this.name) {
          text = this.name;
        } else {
          if (this.isInterface) {
            if (this.config.isLoading) {
              text = '加载中';
            } else {
              text = this.config.name;
            }
          } 
        }
        if (text && this.nameLength) {
          if (typeof this.nameLength == 'number') {
            text.length > this.nameLength && (text = text.slice(0, this.nameLength) + '...');
          } else {
            text.length > 4 && (text = text.slice(0, 4) + '...');
          } 
        } else if (!text) {
          if (this.initType === 'user') {
            text = '-';
          } else if (this.initType === 'team') {
            text = '-';
          } else if (this.initType === 'role') {
            text = '-';
          }
        }
        return text;
      };
    },
    getgapClassName() {
      // 获取间隙类名
      let className = 'mr-xs';
      if (this.alignMode == 'vertical') {
        className = 'mb-xs';
      }
      return className;
    }
  },
  watch: {
    uuid: {
      handler(val) {
        this.initConfig();
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.avatar {
  margin-right: 6px;
}
.radius-sm{
  max-height: 210px;
  overflow: auto;
  overflow-x: hidden;
}
.btn-close-usercard {
  cursor: pointer;
  float: right;
}

.usercard-container {
  display: inline-block;
  &:focus {
    outline: none;
  }
  .no-font-size {
    font-size: 0;
  }
  .usercard {
    cursor: pointer;
    display: flex; //文字与头像对齐问题
    align-items: center;
    font-size: 1rem;
    line-height: 1rem;
  }
  .noCursor{
    display: flex; //文字与头像对齐问题
    align-items: center;
    font-size: 1rem;
    line-height: 1rem;
  }
 
}
// 用户卡片边框
.userinfo-box-border-top {
  border: none;
  border-top: 6px solid;
}
.userinfo-card-wrap {
  font-size: 0;
  width:100%;
}
.usercard-li {
  padding-top: 4px;
  padding-bottom: 4px;
  cursor: pointer;
}
 // 用户列表文案间距样式
  .userlist-wrap {
    display: inline-block;
    padding: 0 0 14px 14px;
  }

  .avatar-name-vertical {
    display: flex;
    align-items: center;
    flex-direction: column;
  }

</style>
