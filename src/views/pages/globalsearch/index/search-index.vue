<template>
  <div>
    <TsContain>
      <div slot="content">
        <div>
          <div class="padding" style="text-align:center">
            <TsRow :gutter="0">
              <Col :span="6"></Col>
              <Col :span="10">
                <TsFormInput v-model="searchParam.keyword"></TsFormInput>
              </Col>
              <Col :span="2"><Button type="primary" @click="search()">搜索</Button></Col>
              <Col :span="6"></Col>
            </TsRow>
          </div>
          <div style="text-align:center">
            <TsFormCheckbox
              v-model="searchParam.typeList"
              :dataList="typeList"
              valueName="type"
              textName="typeName"
            ></TsFormCheckbox>
          </div>
          <div>
            <SearchResult :documentTypeList="documentTypeList"></SearchResult>
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
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput.vue'),
    TsFormCheckbox: () => import('@/resources/plugins/TsForm/TsFormCheckbox'),
    SearchResult: () => import('./search-result.vue')
  },
  props: {},
  data() {
    return {
      typeList: [],
      searchParam: { keyword: '', typeList: [], pageSize: 24},
      documentTypeList: [],
      wordList: []//分词结果
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getDocumentTypeList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    search() {
      this.$api.globalsearch.document.searchDocument(this.searchParam).then(res => {
        this.documentTypeList = res.Return.documentTypeList;
        this.wordList = res.Return.wordList;
      });
    },
    getDocumentTypeList() {
      this.$api.globalsearch.document.getDocumentTypeList().then(res => {
        this.typeList = res.Return;
        this.typeList.forEach(type => {
          this.searchParam.typeList.push(type.type);
        });
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
