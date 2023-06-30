<template>
  <div class="user-info-wrap">
    <div v-if="!userInfo" class="usercard-no-user">
      <TsAvatar :size="36" class="default-avatar" />
      <span>{{ $t('page.user') }} {{ $t('page.nonexistent') }}</span>
    </div>
    <div v-else class="usercard-body">
      <header class="header-wrap">
        <!--<div class="center-circle">
          <div class="circle bg-primary"></div>
        </div>-->
        <div class="userinfo-avatar">
          <!-- 头像 -->
          <TsAvatar v-bind="userInfo" :size="66" />
        </div>
      </header>

      <nav class="userinfo-wrap bg-op">
        <span class="left-text">
          <span class="name-text">
            <!-- 用户名称 -->
            {{ userInfo.userName || '-' }}
          </span>
          <span class="userid-text" :title="getUserInfo(userInfo)">
            <!-- 用户id -->
            {{ userInfo.userId || '-' }}
          </span>
        </span>
      </nav>
      <!-- 分割线 -->
      <div class="divide-line border-color"></div>
      <ul class="content-wrap">
        <li>
          <span class="content-label text-grey">{{ $t('page.phone') }}</span>
          <span class="content-text">
            {{ userInfo.phone || '-' }}
          </span>
        </li>
        <li>
          <span class="content-label text-grey">{{ $t('page.email') }}</span>
          <span class="content-text">
            {{ userInfo.email || '-' }}
          </span>
        </li>
        <li>
          <span class="content-label text-grey">{{ $t('page.role') }}</span>
          <span v-if="userInfo.roleList && userInfo.roleList.length > 0" class="content-text">
            <Tag v-for="(role,index) in userInfo.roleList" :key="index">
              {{ role.description }}
            </Tag>
            <!-- {{ getName(userInfo.roleList) }}-->
          </span>
          <span v-else class="content-text">-</span>
        </li>
        <li>
          <span class="content-label text-grey">{{ $t('page.group') }}</span>
          <span v-if="userInfo.teamNameList && userInfo.teamNameList.length > 0" class="content-text">
            <!--{{ getName(userInfo.teamNameList, false) }}-->
            <Tag v-for="(team,index) in userInfo.teamNameList" :key="index">
              {{ team }}
            </Tag>
          </span>
          <span v-else class="content-text">-</span>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import TsAvatar from 'components/TsAvatar/TsAvatar';
export default {
  name: 'UserInfo',
  components: {
    TsAvatar
  },
  props: {
    userInfo: { type: Object }
  },
  methods: {
    getName(list, isBool = true) {
      // 获取名称，list 数组，isBool true 表示角色，false表示分组
      let name = '';
      for (let i = 0; i < list.length; i++) {
        name += (isBool ? list[i].description : list[i]) + this.getSymbol(list.length, i);
      }
      return name;
    },
    getSymbol(arrLength, rindex) {
      // 处理分隔符顿号
      return arrLength - 1 != rindex ? '、' : '';
    },
    getUserInfo(obj) {
      // 获取用户名和用户id
      if (obj && obj.userName) {
        return obj.userId ? `${obj.userName}(${obj.userId})` : '';
      } else {
        return obj.userId ? obj.userId : '';
      }
    }
  },
  computed: {
    vipIcon() {
      return this.$store.getters.getVipIconByLevel(this.userInfo.vipLevel);
    }
  }
};
</script>
<style lang="less" scoped>
@user-prev: usercard;
.@{user-prev}-body {
  box-sizing: border-box;
  width: 400px;
  max-height: 221px;
  overflow-x: hidden;
  .userinfo-wrap {
    position: relative;
    top: -1px;
    box-sizing: border-box;
    width: 100%;
    padding: 16px 0 0 35px;
    max-height: 221px;
    .name-text {
      display: inline-block;
      font-size: 16px;
      // font-weight: bold;
      margin-right: 6px;
    }
    .userid-text {
      display: inline-block;
      width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 13px;
    }
  }
  .header-wrap {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    overflow: hidden;
    // 头像样式
    .userinfo-avatar {
      position: absolute;
      //right: 49px;
      // top: -10px;
      right: 20px;
      top:30px;
      z-index: 1;
      /deep/ .ts-avatar .vip-icon {
        width: 16px !important;
        bottom: 0px !important;
        right: 2px !important;
      }
    }
    .circle {
      width: 78px;
      height: 39px;
      border-radius: 39px 39px 0 0;
      border-bottom: none;
    }
    .center-circle {
      position: absolute;
      top: -15px;
      right: 43px;
      z-index: -1;
    }
  }
  .divide-line {
    box-sizing: border-box;
    width: 247px;
    height: 1px;
    border-bottom: 1px solid;
    margin: 10px 0 15px 35px;
  }
  .content-wrap {
    width: 100%;
    box-sizing: border-box;
    padding: 0 16px 0  0;
    li {
      display: flex;
      flex-wrap: nowrap;
      width: 100%;
      padding: 0 0 13px 0;
      &:last-of-type {
        padding-bottom: 32px;
      }
    }
    .content-label {
      display: inline-block;
      width: 70px;
      margin-right: 15px;
      font-size: 12px;
      text-align: right;
    }
    .content-text {
      display: inline-block;
      width: 317px;
      white-space: normal;
    }
  }
}
</style>
