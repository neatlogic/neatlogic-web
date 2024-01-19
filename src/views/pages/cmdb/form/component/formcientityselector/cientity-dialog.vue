<template>
  <TsDialog
    v-bind="dialogConfig"
    @on-close="close"
  >
    <template v-slot:header>
      <div>选择配置项</div>
    </template>
    <template v-slot>
      <Row>
        <Col span="6">
          <div class="ci-left">
            <CiTypeList
              :ciFilter="filterCiIdList"
              :toggleable="false"
              :ciId="ciId"
              @click="changeCi"
            ></CiTypeList>
          </div>
        </Col>
        <Col span="18">
          <CiEntityList
            ref="CiEntityList"
            :ciId="ciId"
            :selectedData="selectedCiEntityIdList"
            :needAction="false"
            :needCheck="true"
            :pageSize="10"
            keyName="id"
            :selectedRemain="true"
            @getCheckedCiEntity="getCiEntity"
          ></CiEntityList>
        </Col>
      </Row>
    </template>
    <template v-slot:footer>
      <Button @click="close()">取消</Button>
      <Button type="primary" @click="save()">确定</Button>
    </template>
  </TsDialog>
</template>
<script>
import CiTypeList from '@/views/pages/cmdb/components/ci/ci-type-list.vue';
import CiEntityList from '@/views/pages/cmdb/cientity/cientity-list.vue';
export default {
  name: '',
  components: {
    CiTypeList,
    CiEntityList
  },
  props: {
    ciEntityIdList: {type: Array},
    config: {type: Object}
  },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'large'
      },
      ciId: null,
      ciTypeList: [],
      selectedCiEntityIdList: []
    };
  },
  beforeCreate() {},
  created() {
    this.init();
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
    init() {
      this.selectedCiEntityIdList = this.ciEntityIdList;
    },
    searchCiType() {
      this.$api.cmdb.ci.searchCiTypeCi({}).then(res => {
        if (res.Return.length > 0) {
          if (this.config.ciList && this.config.ciList.length > 0) {
            const ciTypeList = res.Return;
            ciTypeList.forEach(citype => {
              const ciList = citype.ciList.filter(d => this.config.ciList.find(configci => configci.id === d.id));
              if (ciList.length > 0) {
                citype.ciList = ciList;
                this.ciTypeList.push(citype);
              }
            });
          } else {
            this.ciTypeList = res.Return; 
          }
          if (this.ciTypeList.length > 0 && this.ciTypeList[0].ciList.length > 0) {
            this.ciId = this.ciTypeList[0].ciList[0].id;
          }
        }
      });
    },
    changeCi(ci) {
      this.ciId = ci.id;
    },
    getCiEntity(itemList, indexList) {
      this.selectedCiEntityIdList = indexList;
    },
    close() {
      this.$emit('close');
    },
    save() {
      this.$emit('close', this.selectedCiEntityIdList);
    }
  },
  filter: {},
  computed: {
    filterCiIdList() {
      const ciIdList = [];
      if (this.config.ciList && this.config.ciList.length > 0) {
        this.config.ciList.forEach(d => {
          ciIdList.push(d.id);
        });
      }
      return ciIdList;
    }
  },
  watch: {
  }
};
</script>
<style lang="less">
</style>
