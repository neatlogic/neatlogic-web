<template>
  <div class="user-detail">
    <div v-if="userDetail != null">
      <div class="detail-left">
        <div class="head-icon">
          <TsAvatar v-bind="userDetail" size="40" />
          <span class="name" :title="userDetail.userName">{{ userDetail.userName }}</span>
        </div>
      </div>
      <div class="detail-right">
        <div class="detail-item name overflow">
          <span class="label text-grey">ID</span>
          <span class="text" :title="userDetail.userId">{{ userDetail.userId || '-' }}</span>
        </div>
        <div class="detail-item overflow">
          <span class="label text-grey">{{ $t('page.phone') }}</span>
          <span class="text" :title="userDetail.phone">{{ userDetail.phone || '-' }}</span>
        </div>
        <div class="detail-item overflow">
          <span class="label text-grey">{{ $t('page.email') }}</span>
          <span class="text" :title="userDetail.email">{{ userDetail.email || '-' }}</span>
        </div>
        <div class="detail-item overflow">
          <span class="label text-grey">{{ $t('page.role') }}</span>
          <span class="text" :title="showRole(userDetail.roleList)">{{ showRole(userDetail.roleList) }}</span>
        </div>
      </div>
    </div>
    <div v-if="roleDetail != null">
      <div class="detail-left">
        <div class="head-icon" style="width:60px">
          <TsAvatar v-bind="roleDetail" size="40" />
        </div>
      </div>
      <div class="detail-right role-item">
        <div class="detail-item overflow">
          <span class="label text-grey">ID</span>
          <span class="text username" :title="roleDetail.name">{{ roleDetail.name || '-' }}</span>
        </div>
        <div class="detail-item overflow">
          <span class="label text-grey">{{ $t('page.description') }}</span>
          <span class="text" :title="roleDetail.description">{{ roleDetail.description || '-' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TsAvatar from 'components/TsAvatar/TsAvatar.vue';
export default {
  name: '',
  components: {
    TsAvatar
  },
  props: {
    uuid: {
      type: String,
      default: null
    },
    type: {
      type: String,
      default: 'user'
    }
  },
  data() {
    return {
      userDetail: null,
      roleDetail: null
    };
  },

  beforeCreate() {},

  created() {
    if (this.uuid != null && this.type == 'user') {
      this.getUserDetail(this.uuid);
    }
    if (this.uuid != null && this.type == 'role') {
      this.getRoleDetail(this.uuid);
    }
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
    //获取用户信息
    getUserDetail(val) {
      let data = {
        userUuid: val
      };
      this.$api.common.getUser(data).then(res => {
        if (res.Status == 'OK') {
          this.userDetail = res.Return;
        }
      });
    },
    getRoleDetail(val) {
      let data = {
        uuid: val
      };
      this.$api.common.getRole(data).then(res => {
        if (res.Status == 'OK') {
          this.roleDetail = res.Return;
          this.roleDetail.initType = 'role';
        }
      });
    }
  },

  filter: {},

  computed: {
    showRole() {
      return function(list) {
        let text = '';
        if (list && list.length > 0) {
          list.forEach((item, index) => {
            if (index != list.length - 1) {
              text += item.description + '、';
            } else {
              text += item.description;
            }
          });
          return text;
        } else {
          return '-';
        }
      };
    }
  },

  watch: {}
};
</script>
<style lang="less">
.user-detail {
  .detail-left {
    width: 74px;
    height: 78px;
    display: flex;
    align-items: center;
    float: left;
    text-align: center;
    .role-icon {
      font-size: 26px;
    }
    .head-icon {
      text-align: center;
      .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 58px;
        height: 24px;
        line-height: 24px;
        display: block;
      }
    }
  }
  .detail-right {
    padding-left: 64px;
    .name {
      width: 65%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      .name-left {
        padding-right: 8px;
      }
    }
    .detail-item {
      position: relative;
      > .label {
        position: absolute;
        top: 0.5px;
      }
      .text {
        vertical-align: top;
        padding-left: 40px;
      }
    }
  }
  .role-item {
    padding-top: 15px;
  }
}
</style>
