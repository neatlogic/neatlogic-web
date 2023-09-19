<template>
  <Poptip
    v-if="type !='person'"
    v-model="visible"
    width="400"
    transfer
  >
    <div class="cursor-pointer">
      <span :class="row.type =='person'?'tsfont-userinfo':'ts-team'" class="icon-right"></span>
      <span>
        {{ row.name }}
        <span v-if="row.sid && row.sid != ''" class="text-grey">{{ `(${row.sid})` }}</span>
      </span>
    </div>
    <div slot="title">
      <h4>{{ row.name }}</h4>
      <span class="tsfont-close text-action remove-icon-box" @click="visible = false;"></span>
    </div>
    <div slot="content">
      <div>
        <div v-if="type == 'group'">
          <ul v-if="userList && userList.length" class="clearfix group-ul">
            <li v-for="(u,uindex) in userList" :key="uindex" class="group-li">
              <span class="tsfont-userinfo icon-right">{{ u.text }}</span>
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
    <span class="tsfont-userinfo icon-right"></span>
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
        const param = {
          repositoryId: this.repositoryId
        };

        if (this.type === 'group') {
          param.groupName = this.row.name;

          const res = await this.$api.codehub.repositorydetail.searchSvnMember(param);
          if (res && res.Status === 'OK') {
            this.userList = res.Return || [];
          } else {
            this.userList = [];
          }
        } else {
          param.id = this.id;

          const res = await this.$api.codehub.repositorydetail.getUser(param);
          if (res && res.Status === 'OK') {
            this.userInfo = res.Return || {};
          } else {
            this.userInfo = this.row;
          }
        }
      } catch (error) {
        if (this.type === 'group') {
          this.userList = [];
        } else {
          this.userInfo = this.row;
        }
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
  max-height: 300px;
  overflow-y: scroll;
  .group-li{
    float: left;
    min-width:33.3%;
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
