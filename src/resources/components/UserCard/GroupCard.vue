<template>
  <div
    v-click-outside:false="onClickOutside"
    v-click-outside:false.mousedown="onClickOutside"
    v-click-outside:false.touchstart="onClickOutside"
    class="groupcard-container"
  >
    <Poptip v-model="isshow" width="400" transfer>
      <span @click="getGroupinfo(uuid)">
        <span>{{ name || item.name }}</span>
      </span>
      <div slot="content" ref="dropdown">
        <div class="clearfix"><i class="tsfont-close btn-close-groupcard" @click.stop="close()"></i></div>
        <div v-if="groupList">
          <ul class="groupcard-ul clearfix" @click.stop>
            <li v-for="li in groupList.tbodyList" :key="li.uuid" class="groupli-main">
              <Poptip transfer>
                <div class="groupli-body">
                  <TsAvatar
                    :avatar="avatar"
                    type="team"
                    size="small"
                    class="groupli-img"
                  />
                  <div class="groupli-name overflow">{{ li.userName }}</div>
                </div>
                <div slot="content" ref="tooltip">
                  <div class="groupli-more">
                    <div>ID：{{ li.userId }}</div>
                    <div>{{ $t('page.email') }}：{{ li.email }}</div>
                    <div>{{ $t('page.phone') }}：{{ li.phone }}</div>
                  </div>
                </div>
              </Poptip>
            </li>
          </ul>
        </div>
      </div>
    </Poptip>
  </div>
</template>
<script>
import { directive as ClickOutside } from '@/resources/directives/v-click-outside-x.js';
import TsAvatar from 'components/TsAvatar/TsAvatar.vue';

export default {
  name: 'GroupCard',
  directives: { ClickOutside },
  components: {
    TsAvatar
  },
  props: {
    uuid: [String, Number],
    name: [String],
    avatar: [String],
    type: {
      type: String,
      default: 'role'
    }
  },
  data() {
    return {
      isshow: false,
      groupList: null,
      currentPage: 1
    };
  },

  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
  beforeDestroy() {
  },

  methods: {
    getGroupinfo() {
      if (!this.isshow) {
        this.getGrouplist();
      }
    },
    getGrouplist(page) {
      let _this = this;
      _this.isshow = false;
      _this.currentPage = page || _this.currentPage;
      let param = {keyword: '', currentPage: _this.currentPage, pageSize: 12};
      param[_this.type + 'Uuid'] = _this.uuid;
      this.$https.post('/api/rest/user/search/forselect', param).then(res => {
        if (res && res.Status == 'OK') {
          _this.isshow = true;
          _this.$set(_this, 'groupList', res.Return);
        }
      });
    },
    close() {
      this.isshow = false;
    },
    show() {
      this.isshow = true;
    },
    onClickOutside(event) {
      const $el = this.$refs.dropdown ? (this.$refs.dropdown || this.$refs.tooltip) || null : null;
      if (!$el || $el === event.target || $el.contains(event.target)) {
        return;
      }
      this.isshow = false;
    }
  },
  computed: {}
};
</script>
<style lang="less" scoped>
.btn-close-groupcard{
  cursor: pointer;
  float: right;
}
.groupli-main{
  width: 25%;
  float: left;
  padding: 2px 4px;
}
.groupli-body{
  position: relative;
  padding-left: 30px;
  height: 30px;
  .groupli-img{
    position: absolute;
    left: 2px;
    top: 2px;
  }
  .groupli-name{
    line-height: 30px;
  }
}
.groupli-more {
  padding: 4px;

}
</style>
