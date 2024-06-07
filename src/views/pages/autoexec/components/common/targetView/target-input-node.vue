
<template>
  <div>
    <div class="input-border" style="text-align: right;">
      <Input
        v-model="keyword"
        style="width:240px"
        search
        :placeholder="$t('form.placeholder.pleaseinput', {target: $t('page.ip')})"
        @on-search="filterData"
      />
    </div>
    <div style="padding-top:16px">
      <TsRow :gutter="10">
        <template v-for="(data,index) in currentDataList">
          <Col
            v-if="!data._isHidden"
            :key="index"
            :span="8"
          >
            <div class="item bg-op border-color overflow" :title="targetText(data)">
              {{ targetText(data) }} 
            </div>
          </Col>
        </template>  
      </TsRow>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  filters: {
  },
  props: {
    config: Object
  },
  data() {
    return {
      keyword: '',
      currentDataList: []
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
    filterData() {
      let _this = this;
      this.currentDataList.forEach(item => {
        let nameStr = _this.targetText(item);
        this.$set(item, '_isHidden', _this.keyword ? !nameStr.includes(_this.keyword) : false);
      });
    }
  },
  computed: {
    targetText() {
      return data => {
        return data.port && data.name ? data.ip + ':' + data.port + '/' + data.name : data.port && !data.name ? data.ip + ':' + data.port : data.ip;
      };
    }
  },
  watch: {
    config: {
      handler(val) {
        val && (this.currentDataList = val.inputNodeList || []);
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang='less' scoped>
.item{
  width: 100%;
  margin-bottom: 10px;
  display: inline-block;
  position: relative;
  height: 32px;
  line-height: 30px;
  padding: 0 4px;
  border: 1px solid;
  text-align: center;
  border-radius: 6px;
}
</style>
