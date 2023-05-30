<template>
  <div>
    <TsContain>
      <div slot="content">
        <Loading v-if="loading" loadingShow style="min-height:100px"></Loading>
        <TsCard
          v-else
          v-bind="cardConfig"
          :cardList="credentialList"
          class="credential-container"
        >
          <template slot-scope="{ row }">
            <div>
              <div class="credential-img">
                <!-- <img :src="imgsrc[row.repoType]" /> -->
              </div>
              <CredentialEdit :item="row" :typeDataList="typeDataList" @close="close">
              </CredentialEdit>
            </div>
          </template>
        </TsCard>
      </div>
    </TsContain>
  </div>
</template>
<script>
// import gitlabimg from '@/resources/assets/images/codehub/logo/gitlab.png';
// import svnimg from '@/resources/assets/images/codehub/logo/svn.png';
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
      // imgsrc: {
      //   //不同类型映射的名字
      //   gitlab: gitlabimg,
      //   svn: svnimg
      // },
      loading: false, //加载中
      credentialList: [
        {'repoType': 'gitlab'},
        {'repoType': 'svn'}
      ], //凭证列表（最多2个，svn或者git，一个的时候直接不通过tab渲染）
      editItem: null, //编辑的数据
      isEdit: false, //是否处于编辑模式
      typeDataList: [
        {
          text: 'GITLAB',
          value: 'gitlab'
        },
        {
          text: 'SVN',
          value: 'svn'
        }
      ],
      credTypeList: [
        {
          text: '密码',
          value: 'password'
        },
        {
          text: 'token',
          value: 'token'
        }
      ],
      cardConfig: {
        span: 24,
        xs: 24,
        sm: 24,
        lg: 24,
        xl: 24,
        xxl: 24,
        nodataText: '暂无凭证',
        classname: 'credentialList'
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getList();
  },
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
          this.loading = false;
          if (res && res.Status == 'OK') {
            let resultList = res.Return || [];
            if (resultList && resultList.length > 0) {
              this.credentialList.forEach((c) => {
                let matchList = resultList.filter((r) => {
                  return r.repoType === c.repoType;
                });
                if (matchList.length) {
                  let resultConfig = matchList[0];
                  Object.assign(c, resultConfig);
                }
              });
            }
          }
        })
        .catch(e => {
          this.loading = false;
          this.credentialList = [];
        });
    },
    editCredential(item) {
      //没有入参数则为新增，有则为修改
      this.editItem = item || null;
      this.isEdit = true;
    },
    close(isreload) {
      //如果有修改的需要更新页面
      this.isEdit = false;
      this.editItem = null;
      if (isreload) {
        this.getList();
      }
    },
    saveEdit() {
      if (this.$refs.editform.valid()) {
        let param = {
          repoType: this.editConfig.repoType,
          credType: this.editConfig.credType,
          repoUsername: null,
          repoCredential: this.editConfig.repoCredential        
        };
        if (this.editConfig.credType == 'password') {
          Object.assign(param, {
            repoUsername: this.editConfig.repoUsername
          });
        }
        this.saving = true;
        this.$api.codehub.credential.save(param).then((res) => {
          this.saving = false;
          if (res && res.Status == 'OK') {
            this.$Message.success('保存成功');
            this.$emit('close', true);
          }
        }).catch((e) => {
          this.saving = false;
        });
      }
    },
    hidePassword(text) {
      let str = '';
      if (text && text.toString().length > 0) { 
        str = text.toString().replace(/./g, '*');
      }
      return str;
    }
  },
  computed: {
    setTypeText() {
      return function(type, list) {
        let str = '';
        list.forEach(t => {
          if (t.value == type) {
            str = t.text;
          }
        });
        return str;
      };
    },
    hideText() {
      return function(text) {
        let str = '';
        if (text && text.toString().length > 0) { 
          str = text.toString().replace(/./g, '*');
        }
        return str;
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
      img {
        width: 40px;
        height: 40px;
        display: block;
        margin-top: 20px;
        margin-left: 20px;
      }
    }
  }
}
.credential-container.tscard-container{
  /deep/ .tscard-li{
    padding: 20px 20%;
  }
}
</style>
