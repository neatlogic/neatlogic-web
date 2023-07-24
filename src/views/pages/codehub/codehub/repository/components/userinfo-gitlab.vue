<template>
  <Poptip v-model="visible" width="400" transfer>
    <div class="cursor-pointer">
      <Avatar v-if="type == 'group'" src="~@/resources/assets/images/avatar/team.png" size="small"></Avatar>
      <Avatar v-else-if="row['avatar_url']" :src="row['avatar_url']" size="small"></Avatar>
      <span class="ml-xs">{{ row.name }}
        <span v-if="row.username" class="text-grey">{{ `(${row.username})` }}</span>
      </span>
    </div>
    <div slot="title">
      <!-- 头部用户名和右边的关闭按钮 -->
      <h4>{{ row.name }}</h4>
      <span class="tsfont-close text-action remove-icon-box" @click="visible = false;"></span>
    </div>
    <div slot="content">
      <div>
        <div v-if="type == 'group'">
          <!-- 分组gitlab用户头像列表 -->
          <ul v-if="userList" class="clearfix group-ul">
            <li v-for="u in userList" :key="u.id" class="group-li">
              <Avatar v-if="u['avatar_url']" :src="u['avatar_url']" size="small"></Avatar>
              <span class="ml-xs">{{ u.name }}</span>
            </li>
          </ul>
          <Loading v-else loadingShow></Loading>
        </div>
        <div v-else>
          <table v-if="userInfo" class="table">
            <colgroup>
              <col width="50" />
              <col />
              <col />
            </colgroup>
            <tbody>
              <tr>
                <td> 
                  <Avatar v-if="userInfo['avatar_url']" :src="userInfo['avatar_url']" size="large"></Avatar>
                </td>
                <td class="userinfo">
                  <div>
                    <span class="text-tip mr-xs">ID:</span>
                    <span>{{ userInfo['id'] ||'-' }}</span>
                  </div>
                  <div>
                    <span class="text-tip mr-xs">{{ $t('page.username') }}:</span>
                    <span>{{ userInfo['username'] ||'-' }}</span>
                  </div>
                  <div>
                    <span class="text-tip mr-xs">{{ $t('page.email') }}:</span>
                    <span>{{ userInfo['email'] ||'-' }}</span>
                  </div>
                  <div>
                    <span class="text-tip mr-xs">{{ $t('page.status') }}:</span>
                    <span>{{ userInfo['state'] ||'-' }}</span>
                  </div>
                </td>
              </tr>
              <tr>
              </tr>
            </tbody>
          </table>
          <Loading v-else loadingShow></Loading>
        </div>
      </div>
    </div>            
  </Poptip>
</template>
<script>
export default {
  name: '',
  components: {},
  filters: {},
  props: {
    row: Object,
    type: String,
    repositoryId: Number,
    id: [String, Number]
  },
  data() {
    return {
      userList: null,
      visible: false,
      userInfo: null
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
    async getInfo() {
      try {
        if (this.type === 'group') {
          const param = {
            repositoryId: this.repositoryId,
            group: this.id
          };
          const res = await this.$api.codehub.repositorydetail.getGroupUser(param);
          this.userList = res && res.Status === 'OK' ? res.Return || [] : [];
        } else {
          const param = {
            repositoryId: this.repositoryId,
            id: this.id
          };
          const res = await this.$api.codehub.repositorydetail.getUser(param);
          this.userInfo = res && res.Status === 'OK' ? res.Return || {} : this.row;
        }
      } catch (error) {
        this.userList = [];
        this.userInfo = this.row;
      }
    }
  },
  computed: {},
  watch: {
    visible: {
      handler: function(val) {
        if (val && ((!this.userList && this.type === 'group') || !this.userInfo)) {
          this.getInfo();
        }
      },
      immediate: true
    }
  }
};

</script>
<style lang='less' scoped>
.group-ul{
  max-height: 300px;
  overflow-y: scroll;
  .group-li{
    float: left;
    min-width:33%;
    padding: 4px 2px;
  }
}
.userinfo>*{
  line-height: 24px;
}
.remove-icon-box {
  position: absolute;
  top: 4px;
  right: 10px;
  line-height: 30px;
}
</style>
