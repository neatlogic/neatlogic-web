<template>
  <Poptip
    v-if="type !='person'"
    v-model="visible"
    width="400"
    transfer
  >
    <div class="cursor-pointer">
      <span :class="row.type =='person'?'ts-user':'ts-team'" class="icon-right"></span>
      <span>{{ row.name }}{{ row.sid && row.sid != '' ? ' [' + row.sid + ']' : '' }}</span>
    </div>
    <div slot="title">
      <h4>{{ row.name }}</h4>
      <span class="tsfont-close text-action" style="position:absolute;right:0;top:0;line-height:30px;" @click="visible = false;"></span>
    </div>
    <div slot="content">
      <div>
        <div v-if="type == 'group'">
          <ul v-if="userList && userList.length" class="clearfix group-ul">
            <li v-for="(u,uindex) in userList" :key="uindex" class="group-li">
              <span class="ts-user icon-right">{{ u.text }}</span>
            </li>
          </ul>
          <div v-else-if="userList" class="text-tip" style="line-height:2">{{ $t('term.codehub.nogroupmembers') }}</div>
          <Loading v-else loadingShow></Loading>
        </div>
        <div v-else>
        </div>
      </div>
    </div>            
  </Poptip>
  <div v-else>
    <span class="ts-user icon-right"></span>
    <span>{{ row.name }} {{ row.sid && row.sid != '' ? ' [' + row.sid + ']' : '' }}</span>
  </div>
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
        // 获取分组列表
        let param = {
          repositoryId: this.repositoryId,
          groupName: this.row.name       
        };
        await this.$api.codehub.repositorydetail.searchSvnMember(param).then(res => {
          if (res && res.Status == 'OK') {
            this.userList = res.Return || [];
          }
        }).catch(res => {
          this.userList = [];
        });
      } else {
        // 获取单个数据
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
    min-width:33.3%;
    padding: 4px 2px;
  }
}
.userinfo>*{
  line-height: 24px;
}
</style>
