<template>
  <div>
    <TsDialog :is-show="isShow" v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div>{{ $t('term.cmdb.chooseci') }}</div>
      </template>
      <template v-slot>
        <div class="padding" style="padding-top:0px">
          <TsFormInput
            border="bottom"
            :search="true"
            @on-change="searchCi"
          ></TsFormInput>
        </div>
        <div v-for="(ciType, index) in filterCiTypeList" :key="index">
          <div v-if="ciType.ciList && ciType.ciList.length">
            <div class="text-type"><span class="text-grey">{{ ciType.name }}</span></div>
            <div
              v-for="(ci, ciindex) in ciType.ciList"
              :key="ciindex"
              class="text-ci"
              :class="ci.id == (selectedCi.id||ciId)?'actived':''"
              @click="chooseCi(ci)"
            >
              <i :class="ci.icon" style="margin-right:3px"></i>{{ ci.label }}
            </div>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: {
    isShow: {type: Boolean},
    ciId: {type: Number}
  },
  data() {
    return {
      keyword: '',
      selectedCi: {},
      dialogConfig: {
        type: 'slide',
        maskClose: false,
        isShow: false,
        width: '400px',
        zindex: 1000
      },
      ciTypeList: [],
      searchParam: {isVirtual: 0}//关系不支持虚拟模型
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
   
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchCi(val) {
      if (val) {
        this.keyword = val.trim();
      } else {
        this.keyword = val;
      }
    },
    getCiTypeList: function() {
      this.$api.cmdb.ci.searchCiTypeCi(this.searchParam).then(res => {
        this.ciTypeList = res.Return;
      });
    },
    close: function(targetCi) {
      this.$emit('close', targetCi);
    },
    chooseCi: function(ci) {
      this.selectedCi = ci;
    },
    save: function() {
      if (!this.$utils.isEmpty(this.selectedCi)) {
        this.close(this.selectedCi);
      } else {
        this.$Message.info(this.$t('message.cmdb.selectci'));
      }
    }
  },
  filter: {},
  computed: { 
    filterCiTypeList() {
      if (!this.keyword) {
        return this.ciTypeList;
      } else {
        const filterCiTypeList = JSON.parse(JSON.stringify(this.ciTypeList));
        filterCiTypeList.forEach(type => {
          if (type.ciList && type.ciList.length > 0) {
            type.ciList = type.ciList.filter(ci => ci.label.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1 || ci.name.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1);
          }
        });
        return filterCiTypeList;
      }
    }
  },
  watch: {
    isShow: {
      handler: function(val) {
        if (val) {
          this.getCiTypeList();
          this.selectedCi = {};
        }
      }
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.text-type{
    padding-top:@space-xs;
    padding-left:@space-md;
  }
  .text-ci{
    padding-top:@space-xs;
    padding-left:@space-lg;
    cursor:pointer;
  }
  .text-ci.actived{
    color:@primary-color;
  }
</style>
