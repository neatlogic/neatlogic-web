<template>
  <div class="user-info-wrap">
    <div v-if="!userInfo" class="usercard-no-user">
      <TsAvatar :size="36" class="default-avatar" />
      <span>{{ $t('page.user') }} {{ $t('page.nonexistent') }}</span>
    </div>
    <div v-else class="usercard-body">
      <header class="header-wrap">
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
        <li v-if="jobTitle">
          <span class="content-label text-grey">{{ $t('page.jobTitle') }}</span>
          <span class="content-text">{{ jobTitle }}</span>
        </li>
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
          </span>
          <span v-else class="content-text">-</span>
        </li>
        <li>
          <span class="content-label text-grey">{{ $t('page.group') }}</span>
          <div v-if="userInfo.teamList && userInfo.teamList.length" class="content-text team-list">
            <Tooltip
              v-for="team in userInfo.teamList"
              :key="team.uuid"
              :content="team.upwardNamePath"
              :disabled="!team.upwardNamePath || team.upwardNamePath === getTeamLabel(team)"
              :max-width="600"
              theme="light"
              placement="top-end"
              transfer
              transfer-class-name="usercard-team-path-tooltip"
              class="team-tooltip"
            >
              <Tag class="team-tag">{{ getTeamLabel(team) }}</Tag>
            </Tooltip>
          </div>
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
    getTeamLabel(team) {
      return (team.parentPathList || []).slice(-2).join('/') || '-';
    },
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
    jobTitle() {
      const position = this.userInfo?.userInfoObj?.position;
      return typeof position === 'string' ? position.trim() : '';
    },
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
  max-width: calc(100vw - 24px);
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
      right: 20px;
      top:30px;
      z-index: 1;
      ::v-deep .ts-avatar .vip-icon {
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
    .team-list {
      display: flex;
      flex-wrap: wrap;
      min-width: 0;
    }
    .team-tooltip {
      max-width: 100%;
    }
    .team-tag {
      height: auto;
      overflow-wrap: anywhere;
    }
  }
}
</style>

<style>
.usercard-team-path-tooltip {
  width: max-content;
  max-width: min(600px, calc(100vw - 24px));
}
</style>
