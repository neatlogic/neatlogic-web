
<template>
  <div class="file-main">
    <template v-if="value && !$utils.isEmpty(value)">
      <div v-for="(item, index) in getShowList(value.fileList)" :key="item.id ||index" class="list">
        <div class="tsfont-attachment file-name overflow " :title="item.name">
          {{ item.name }}
        </div>
      </div>
      <template v-if="value.fileList.length > showNumber">
        <div class="text-tip-active list" @click="lookData">
          {{ $t('page.viewall') }}
        </div>
      </template>
    </template>
    <template v-else>{{ $t('page.notarget', {target: $t('page.defaultvalue')}) }}</template>
    <TsDialog
      :isShow.sync="showDialog"
      :title="$t('page.viewall')"
      :hasFooter="false"
      :maskClose="true"
    >
      <template v-slot>
        <div class="all-file input-border">
          <div class="search">
            <TsFormInput
              v-model="keyword"
              search
              @on-change="searchKeyWord"
            ></TsFormInput>
          </div>
          <div class="file-content">
            <TsRow v-if="searchList && searchList.length > 0">
              <Col
                v-for="(item, index) in searchList"
                :key="index"
                span="12"
                :class="item.isHide?'hide':''"
              >
                <div class="file-detail overflow">
                  <span class="tsfont-attachment overflow file-name">{{ item.name }}</span>
                </div>
              </Col>
            </TsRow>
            <NoData v-else-if="!searchList || !searchList.length"></NoData>
          </div>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
export default {
  name: '',
  components: {
    TsFormInput
  },
  filters: {},
  props: {
    value: Object
  },
  data() {
    return {
      showNumber: 2,
      searchList: [],
      keyword: '',
      showDialog: false
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
    lookData() {
      this.searchList = this.value.fileList || [];
      this.showDialog = true;
    },
    searchKeyWord() {
      this.searchList = [];
      if (this.keyword && this.keyword != '') {
        this.value.fileList.forEach(i => {
          if (i.name.indexOf(this.keyword) > -1) {
            this.searchList.push(i);
          }
        });
      } else {
        this.searchList = this.value.fileList;
      }
    }
  },
  computed: {
    getShowList() {
      return function(list) {
        let showList = list.slice(0, this.showNumber);
        return showList;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.file-main{
  .list{
    display: inline-block;
    max-width: 30%;
    &:not(:last-child){
      padding-right: 10px;
    }
  }
}
.all-file {
  width: 100%;
  line-height: 32px;
  .search {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 16px;
  }
  .file-content{
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    height: 300px;
  }
}
</style>

