<template>
  <div>
    <Tabs v-if="documentTypeList && documentTypeList.length > 0">
      <TabPane
        v-for="documentType in documentTypeList"
        :key="documentType.type"
        :label="documentType.typeName"
        :name="documentType.type"
      >
        <TsCard
          v-if="documentType.documentList"
          v-bind="documentData(documentType.type)"
          :sm="12"
          :lg="8"
          :xl="6"
          :xxl="4"
        ><template v-slot:header="{ row }"><h4 style="font-size:16px" class="ml-xs"><a :href="row.targetUrl">{{ row.title }}</a></h4></template>
          <template slot-scope="{ row }"><div v-html="row.highlightContent"></div></template>
        </TsCard>
        <!--<component
        :is="'result_'+documentType.type"
        ref="resultHandler"
        :documentList="documentType.documentList"
      ></component>-->
      </TabPane>
    </Tabs>
  </div>
</template>
<script>
//import * as handlers from './resultcomponent/index.js';
import TsCard from '@/resources/components/TsCard/TsCard.vue';

export default {
  name: '',
  components: {
    // ...handlers
    TsCard
  },
  props: {
    documentTypeList: { type: Array }
  },
  data() {
    return {};
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
  methods: {},
  filter: {},
  computed: {
    documentData() {
      return type => {
        const data = {};
        const documentType = this.documentTypeList.find(d => d.type == type);
        if (documentType) {
          data.cardList = documentType.documentList;
          data.rowNum = documentType.rowNum;
          data.pageCount = documentType.pageCount;
        }
        return data;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
.highlight{
  color:red;
  vertical-align:top;
}
</style>
