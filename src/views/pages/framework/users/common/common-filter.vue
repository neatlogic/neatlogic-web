<!--过滤-->
<template>
  <div class="commonFilter">
    <div class="top-title">
      <p>{{ $t('term.framework.filterbypermission') }}</p>
    </div>
    <div class="item">
      <div class="item-title">
        <div v-for="(item, index) in fliterList" :key="index" class="group">
          <p>{{ item.displayName }}</p>
          <RadioGroup v-model="filterSelect" vertical @on-change="onChange">
            <Radio v-for="(citem, cindex) in item.authVoList" :key="cindex" :label="citem.name">
              <span>{{ citem.displayName }}</span>
            </Radio>
          </RadioGroup>
        </div>
      </div>
    </div>
    <div v-if="type == 'user'" class="role-filter">
      <div class="top-title">
        <p>{{ $t('term.framework.filterbyrole') }}</p>
      </div>
      <div class="item">
        <div class="item-title">
          <RadioGroup v-model="filterRole" vertical @on-change="onChangeRole">
            <Radio v-for="(item, index) in allroleList" :key="index" :label="item.name">
              <span>{{ item.name }}</span>
            </Radio>
          </RadioGroup>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommonFilter',
  components: {},
  props: {
    authList: {
      type: Array
    },
    type: {
      type: String
    }
  },
  data() {
    let _this = this;
    return {
      filterSelect: '',
      filterRole: '',
      fliterList: _this.authList,
      allroleList: [] //所有角色列表
    };
  },

  created() {
    if (this.type == 'user') {
      this.getAllrole();
    }
    // this.fliterList.forEach(item => {
    //   item.authVoList.map(citem => {
    //     citem.name = item.name + "#" + citem.name;
    //   })
    // })
  },

  beforeMount() {},

  mounted() {},

  methods: {
    onChange: function(val) {
      this.filterSelect = val;
      this.$emit('filterSelect', this.filterSelect);
    },
    onChangeRole: function(val) {
      this.filterRole = val;
      this.$emit('filterRole', this.filterRole);
    },
    //获取所有角色
    getAllrole: function() {
      let param = {
        needPage: false
      };
      this.$api.framework.role
        .roleList(param)
        .then(res => {
          if (res.Status == 'OK') {
            this.allroleList = res.Return.tbodyList;
          }
        })
        .catch(error => {
          this.$Notice.error({ title: error.data.Message });
        });
    }
  },

  computed: {},

  watch: {}
};
</script>
<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';
.commonFilter {
  .top-title {
    font-size: @font-size-chart;
    padding-bottom: 16px;
  }
  .item {
    .item-title {
      font-size: @font-size-menu;
    }
    .group {
      padding-bottom: 10px;
    }
  }
  .role-filter {
    padding-top: 12px;
    border-top: 1px solid @dividing-color;
  }
}
</style>
