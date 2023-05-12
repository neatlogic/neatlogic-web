<template>
  <div class="password-view">
    <div v-if="attrEntity.valueList && attrEntity.valueList.length > 0" class="item">
      <div class="text">{{ password }}</div>
      <Poptip
        v-if="authData && authData.passwordview"
        title="密码明文"
        :transfer="true"
        :content="passwordPlaintext"
        @on-popper-show="showPassword"
        @on-popper-hide="hidePassword"
      >
        <i
          class="btn-icon tsfont-eye"
        ></i>
      </Poptip>
    </div>
  </div>
</template>

<script>
import Axios from 'axios';
export default {
  name: '',
  components: {},
  props: {
    mode: {type: String, default: 'list'},
    attrEntity: {type: Object},
    authData: {type: Object}
  },
  data() {
    return {
      isShow: false,
      password: '******',
      passwordPlaintext: ''
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
    showPassword() {
      if (this.attrEntity.ciEntityId) {
        this.$api.cmdb.cientity.getPasswordPlaintext(this.attrEntity.ciEntityId, this.attrEntity.attrId).then(res => {
          this.passwordPlaintext = res.Return;
        });
      } else { //临时保存时直接打开明文
        this.passwordPlaintext = this.attrEntity.valueList[0];
      }
    },
    hidePassword() {
      this.passwordPlaintext = '';
    }
  },
  filter: {},
  computed: {
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.password-view {
  position: relative;
  .item {
    display: flex;
    align-items: center;
    &.hide-pwd {
      opacity: 0;
      z-index: -1;
      position: relative;
    }
    .text {
      padding-right: 10px;
    }
    .btn-icon {
      cursor: pointer;
    }
  }

  .hide-item {
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>
