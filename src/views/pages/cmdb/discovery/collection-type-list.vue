<template>
  <div>
    <div class="padding">
      <TsFormInput
        border="bottom"
        :search="true"
        :placeholder="$t('form.placeholder.pleaseinput', { target: $t('page.keyword') })"
        @on-change="searchCollection"
      ></TsFormInput>
    </div>
    <ul style="height:calc(100vh - 205px);overflow-y:auto">
      <li v-for="(collectionType, index) in filterCollectionList" :key="index">
        <div class="text-grey  mb-sm pl-xs fz10 overflow" :class="index > 0 ? 'mt-md' : ''" :title="collectionType.label + '(' + collectionType.name + ')'">
          <span>{{ collectionType.label }}</span>
          <span class="pl-xs text-grey">({{ collectionType.name }})</span>
        </div>
        <ul>
          <li
            v-for="(collection, cindex) in collectionType.collectionList"
            :id="'collection-' + collection.name"
            :key="cindex"
            :class="currentCollection == collection.name ? 'bg-selected' : ''"
            class="padding-xs overflow treeList text-action radius-sm"
            :title="collection.label + '(' + collection.name + ')'"
            @click="changeCollection(collectionType.name, collection.name)"
          >
            <div class="grid">
              <div style="text-align:center;" class="pt-xs">
                <span class="h3" :class="'tsfont-' + collection.name"></span>
              </div>
              <div style="position:relative">
                <div class="text-grey" :title="collection.name">
                  {{ collection.name }}
                </div>
                <div class="overflow">
                  <span :title="collection.label">{{ collection.label }}</span>
                </div>
                <div style="position:absolute;top:10px;right:0px;width:36px;text-align:center">
                  <Badge :count="collection.dataCount" type="primary"></Badge>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: {
    currentCollection: { type: String }
  },
  data() {
    return {
      collectionKeyword: '',
      collectionTypeList: []
    };
  },
  beforeCreate() {},
  async created() {
    await this.getCollectionList();
    if (this.currentCollection) {
      this.$nextTick(() => {
        this.$utils.jumpTo('#collection-' + this.currentCollection);
      });
    }
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
    changeCollection(type, name) {
      if (this.currentCollection !== name) {
        this.$emit('change', type, name);
      }
    },
    async getCollectionList() {
      await this.$api.cmdb.sync.getCollectionList({ needCount: true }).then(res => {
        const collectionList = res.Return;
        this.collectionTypeList = [];
        collectionList.forEach(element => {
          let collectionType = this.collectionTypeList.find(d => d.name == element.collection);
          if (!collectionType) {
            collectionType = { name: element.collection, label: element.collection_label, collectionList: [] };
            this.collectionTypeList.push(collectionType);
          }
          collectionType.collectionList.push({ name: element.name, label: element.label, dataCount: element.dataCount });
        });
      });
    },
    searchCollection(val) {
      if (val) {
        this.collectionKeyword = val.trim();
      } else {
        this.collectionKeyword = val;
      }
    }
  },
  filter: {},
  computed: {
    filterCollectionList() {
      if (!this.collectionKeyword) {
        return this.collectionTypeList;
      } else {
        const collectionTypeList = this.$utils.deepClone(this.collectionTypeList);
        collectionTypeList.forEach(type => {
          if (type.name.toLowerCase().indexOf(this.collectionKeyword.toLowerCase()) == -1 && type.label.toLowerCase().indexOf(this.collectionKeyword.toLowerCase()) == -1) {
            if (type.collectionList && type.collectionList.length > 0) {
              type.collectionList = type.collectionList.filter(collection => collection.label.toLowerCase().indexOf(this.collectionKeyword.toLowerCase()) > -1 || collection.name.toLowerCase().indexOf(this.collectionKeyword.toLowerCase()) > -1);
            }
          }
        });
        return collectionTypeList.filter(ct => ct.collectionList.length > 0);
      }
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: 30px auto;
}
</style>
