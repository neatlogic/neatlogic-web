<template>
  <div>
    <TsContain>
      <div slot="topRight"><TsFormInput
        v-model="keyword"
        search
        placeholder="关键字"
        border="border"
        clearable
      ></TsFormInput></div>
      <div slot="content" class="content-main">
        <Loading v-if="isLoading" :loadingShow="isLoading" type="fix"></Loading>
        <div v-for="(collectionType, index) in filtedCollectionTypeList" :key="index" class="type-main">
          <div
            v-if="collectionType && collectionType.cardList && collectionType.cardList.length > 0"
            class="text-grey"
            style="cursor:pointer;text-decoration:underline"
            @click="toSyncManager(collectionType.name)"
          >
            <span>{{ collectionType.label }}</span>
            <span>({{ collectionType.name }})</span>
          </div>
          <div>
            <TsCard
              v-bind="collectionType"
              :sm="8"
              :lg="6"
              :xl="4"
              :xxl="4"
              :boxShadow="false"
            >
              <template slot-scope="{ row }">
                <div class="ci-main" @click="toSyncManager(collectionType.name, row.name)">
                  <div class="main-left">
                    <div class="ci-icon"><i v-if="row.name" :class="'tsfont-'+row.name"></i><i v-else :class="'tsfont-ci-o'"></i></div>
                  </div>
                  <div class="main-right">
                    <div class="ci-label overflow" :title="row.label">{{ row.label }}</div>
                    <div class="ci-name overflow text-grey" :title="row.name">{{ row.name }}</div>
                  </div>
                </div>
              </template>
            </TsCard>
          </div>
        </div>
      </div>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsCard: () => import('@/resources/components/TsCard/TsCard.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: {},
  data() {
    return {
      collectionTypeList: [],
      isLoading: false,
      keyword: ''
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getCollectionList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getCollectionList() {
      this.isLoading = true;
      this.$api.cmdb.sync.getCollectionList().then(res => {
        const collectionList = res.Return;
        this.collectionTypeList = [];
        collectionList.forEach(element => {
          let collectionType = this.collectionTypeList.find(d => d.name == element.collection);
          if (!collectionType) {
            collectionType = {name: element.collection, label: element.collection_label, cardList: []};
            this.collectionTypeList.push(collectionType);
          }
          collectionType.cardList.push({name: element.name, label: element.label});
        });
      }).finally(() => {
        this.isLoading = false;
      });
    },
    toSyncManager(collectionType, collection) {
      this.$router.push({path: '/sync-manage/' + collectionType + (collection ? '/' + collection : '')});
    },
    restoreHistory(data) {
      this.keyword = data['keyword'] || '';
    }
  },
  filter: {},
  computed: {
    filtedCollectionTypeList() {
      let returnList = [];
      const collectionTypeList = this.$utils.deepClone(this.collectionTypeList);
      if (collectionTypeList && collectionTypeList.length > 0) {
        if (this.keyword) {
          collectionTypeList.forEach(type => {
            if ((type.name && type.name.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1) ||
            (type.label && type.label.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1)) {
              returnList.push(type);
            } else {
              const collectionList = type.cardList.filter(d => (d.name && d.name.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1) ||
            (d.label && d.label.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1));
              if (collectionList && collectionList.length > 0) {
                type.cardList = collectionList;
                returnList.push(type);
              }
            }
          });
        } else {
          returnList = collectionTypeList;
        }
      }
      this.$addHistoryData('keyword', this.keyword);
      return returnList;
    }
  },
  watch: {
  }
};
</script>
<style lang="less" scoped>
.content-main {
  .type-main{
    margin-bottom:10px;
  }
  .tscard-container {
     /deep/.tscard-body{
      min-height: initial!important;
      padding: 16px 6px 0px 6px!important;
   }
 }
}
.ci-main {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin: 0px 10px 16px 10px;
  overflow: hidden;
  height:36px;
  .ci-icon {
    font-size: 24px;
    padding-right: 12px;
    position: absolute;
    top: -4px;
    left: 0px;
  }
  .main-right {
    overflow: hidden;
    margin-left: 35px;
  }
  .ci-label {
    font-size: 14px;
    margin-bottom: 2px;
    padding-right: 20px;
  }
  .ci-name {
    font-size: 12px;
  }
  .ci-control {
    cursor: pointer;
  }
  .ci-edit {
    position: absolute;
    right: 10px;
    top: -3px;
    display: none;
    cursor: pointer;
  }
}
</style>
