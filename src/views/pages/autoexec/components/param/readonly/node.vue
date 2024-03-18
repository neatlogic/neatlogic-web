
<template>
  <div class="node-main">
    <template v-if="value && !$utils.isEmpty(value)">
      <div v-for="(item, index) in getShowList(value)" :key="item.id ||index" class="list">
        <div class="overflow node-text border-color" :title="targetText(item)"> {{ targetText(item) }}</div>
      </div>
      <template v-if="value.length > showNumber">
        <div class="text-tip-active list" @click="lookData">
          {{ $t('page.viewall') }}
        </div>
      </template>
    </template>
    <template v-else>{{ $t('page.notarget', {target: $t('page.defaultvalue')}) }}</template>
    <MoreTarget
      v-if="showAllDialog"
      v-model="showAllDialog"
      :isReadonly="true"
      :dataList="value"
      @on-ok="okMore"
    ></MoreTarget> 
  </div>
</template>

<script>

export default {
  name: '',
  components: {
    MoreTarget: resolve => require(['@/resources/components/FormMaker/formedit/view/resourceinput/more-target.vue'], resolve)
  },
  props: {
    value: Array
  },
  data() {
    return {
      showNumber: 3,
      showAllDialog: false
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
      this.showAllDialog = true;
    },
    okMore() {
      this.showAllDialog = false;
    }
  },
  filter: {},
  computed: {
    getShowList() {
      return function(list) {
        let showList = list.slice(0, this.showNumber);
        return showList;
      };
    },
    targetText() {
      return data => {
        return data.port && data.name ? data.ip + ':' + data.port + '/' + data.name : data.port && !data.name ? data.ip + ':' + data.port : data.ip;
      };
    }
  },
  watch: {}
};
</script>
<style lang='less' scoped>
.node-main{
  .list{
    display: inline-block;
    max-width: 25%;
    &:not(:last-child){
      padding-right: 10px;
    }
    .node-text{
      height: 32px;
      line-height: 30px;
      padding: 0 10px;
      border: 1px solid;
      text-align: center;
      border-radius: 4px;
    }
  }
}

</style>

