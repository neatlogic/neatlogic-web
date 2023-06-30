<template>
  <div>
    <TsContain>
      <div slot="content">
        <Loading v-if="loading" loadingShow type="fix"></Loading>
        <TsCard
          v-else
          v-bind="cardConfig"
          :cardList="credentialList"
          class="credential-container"
        >
          <template slot-scope="{ row }">
            <div>
              <div class="credential-img">
                <span :class="getClassName(row.repoType)"></span>
              </div>
              <CredentialEdit :credentialData="row">
              </CredentialEdit>
            </div>
          </template>
        </TsCard>
      </div>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsContain: resolve => require(['@/resources/components/TsContain/TsContain.vue'], resolve),
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    CredentialEdit: resolve => require(['./edit/credential-edit.vue'], resolve)
  },
  filters: {},
  props: [''],
  data() {
    return {
      loading: true, //加载中
      credentialList: [],
      cardConfig: {
        span: 24,
        xs: 24,
        sm: 24,
        lg: 24,
        xl: 24,
        xxl: 24,
        nodataText: this.$t('page.nodata'),
        classname: 'credentialList',
        boxShadow: false
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getList();
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
    getList() {
      this.loading = true;
      this.$api.codehub.credential
        .getList()
        .then(res => {
          if (res && res.Status == 'OK') {
            let repoTypeList = 
            [
              {repoType: 'gitlab'},
              {repoType: 'svn'}
            ];
            let credentialList = res.Return || [];
            this.credentialList = [];
            if (!this.$utils.isEmpty(credentialList)) {
              credentialList.forEach((item) => {
                if (item.repoType && repoTypeList.find((v) => v.repoType == item.repoType)) {
                  this.credentialList.push(item);
                }
              });
            }
            // 补充类型没有的数据
            repoTypeList.forEach((item) => {
              if (!this.credentialList.find((v) => v.repoType == item.repoType)) {
                this.credentialList.push({
                  repoType: item.repoType
                });
              }
            });
          }
        })
        .finally(() => {
          this.loading = false;
        });
    }
  },
  computed: {
    getClassName() {
      return function(type) {
        let className = {
          gitlab: 'tsfont-gitlab text-danger',
          svn: 'tsfont-svn text-info'
        };
        return className[type];
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
/deep/.credentialList {
  padding: 30px 10px 20px;
  .tscard-body {
    position: relative;
    padding-left: 80px !important;
    div.line2 {
      line-height: 2.2;
    }
    div.line3 {
      line-height: 1.8;
    }
    .text-tip {
      width: 60px;
      display: inline-block;
      text-align-last: justify;
      text-align: justify;
      text-justify: distribute-all-lines;
    }
    .credential-img {
      position: absolute;
      top: 50%;
      left: 0;
      width: 80px;
      height: 80px;
      text-align: center;
      margin-top: -40px;
      span {
        display: inline-block;
        margin-left: 20px;
        font-size: 40px;
      }
    }
  }
}
.credential-container.tscard-container{
  /deep/ .tscard-li{
    padding: 20px 20% !important;
  }
}
</style>
