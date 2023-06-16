<template>
  <Poptip v-model="visible" width="400" transfer>
    <div class="cursor-pointer">
      <Avatar v-if="type == 'group'" src="@/resources/assets/images/avatar/team.png" size="small"></Avatar>
      <Avatar v-else-if="row['avatar_url']" :src="row['avatar_url']" size="small"></Avatar>
      <span class="mr-xs">{{ row.name }}{{ row.username ? `[${row.username}]` : '' }}</span>
    </div>
    <div slot="title">
      <h4>{{ row.name }}</h4>
      <span class="ts-remove text-action" style="position:absolute;right:0;top:0;line-height:30px;" @click="visible = false;"></span>
    </div>
    <div slot="content">
      <div>
        <div v-if="type == 'group'">
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
              <col width="40" />
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
    repositoryId: String,
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
      if (this.type == 'group') {
        let param = {
          repositoryId: this.repositoryId,
          group: this.id        
        };
        await this.$api.codehub.repositorydetail.getGroupUser(param).then(res => {
          if (res && res.Status == 'OK') {
            this.userList = res.Return || [];
          } else {
            this.userList = [];
          }
        }).catch(res => {
          this.userList = [];
        });
      } else {
        let param = {
          repositoryId: this.repositoryId,
          id: this.id        
        };
        this.$api.codehub.repositorydetail.getUser(param).then(res => {
          if (res && res.Status == 'OK') {
            this.userInfo = res.Return || {};
          } else {
            this.userInfo = this.row;
          }
        }).catch(res => {
          this.userInfo = this.row;
        });        
      }
    }
  },
  computed: {},
  watch: {
    visible: {
      handler: function(val) {
        if (val) {
          if (this.type == 'group' && !this.userList) {
            this.getInfo();
          } else if (!this.userInfo) {
            this.getInfo();
          }
        }
      },
      immediate: true
    }
  }
};

</script>
<style lang='less' scoped>
.group-ul{
  .group-li{
    float: left;
    min-width:33%;
    padding: 4px 2px;
  }
}
.userinfo>*{
  line-height: 24px;
}
</style>
