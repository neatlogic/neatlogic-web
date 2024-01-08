<template>
  <TsFormItem
    labelPosition="left"
    :label="$t('term.cmdb.subci')"
  >
    <div>
      <a
        href="javascript:void(0)"
        @click.stop="addNewRelEntity()"
      >
        <i class="tsfont-plus"></i>
        {{ $t('page.choose') }}
      </a>
      <Poptip
        v-model="isRelPopShow"
        placement="right"
        trigger="hover"
        :transfer="true"
        :width="620"
        word-wrap
      >
        <a></a>
        <div slot="content">
          <div v-if="childrenCiList" :style="'overflow:auto;max-height:300px;'">
            <div
              v-for="relci in childrenCiList"
              :key="relci.id"
              style="text-align: center; float: left; width: 90px"
              class="pr-sm"
              :class="isDisabled(relci.id)?'text-disabled':'text-href'"                    
              @click="()=>{
                if(!isDisabled()){
                  newCiEntity(relci.id)
                }
              }"
            >
              <div>
                <span><i style="font-size: 20px" :class="relci.icon"></i></span>
              </div>
              <div class="overflow" :title="relci.label">
                <span>{{ relci.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </Poptip>
    </div>
    <div v-if="!$utils.isEmpty(ciEntityData.children)">                   
      <Tag
        v-for="(item, index) in ciEntityData.children"
        :key="index"                 
        color="success"
        type="dot"
        size="large"
        :closable="true"
        style="cursor:pointer"
        @click.native="
          element => {
            element.stopPropagation();
            editNewRelEntity(item);
          }
        "
        @on-close="delRelEntity(item, index)"
      >
        <span>{{ item.ciEntityName }}</span>
      </Tag>
    </div>
  </TsFormItem>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve)
  },
  props: {
    ciId: Number,
    ciEntityData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      isRelPopShow: false,
      childrenCiList: []
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
    addNewRelEntity() {
      this.childrenCiList = []; //子模型
      this.isRelPopShow = false;
      let children = this.ciEntityData.children || [];
      this.$api.cmdb.ci.getDownwardCiList(this.ciId).then(res => {
        let list = res.Return || [];
        this.childrenCiList = list.filter(item => {
          return !item.isAbstract;
        });
        if (this.childrenCiList.length > 1) {
          this.isRelPopShow = true;
        } else if (this.childrenCiList.length == 1) {
          this.isRelPopShow = false;
          if (children.length > 0) {
            this.editNewRelEntity(children[0]);
          } else {
            this.newCiEntity(this.childrenCiList[0].id);
          }
        }
      });
    },
    newCiEntity(ciId) {
      let data = {
        ciId: ciId,
        _rootId: this.ciEntityData.ciId,
        _rootUuid: this.ciEntityData.uuid,
        isChildren: true //标识：初始模型是抽象模型的子模型
      };
      this.$emit('newCiEntity', data);
    },
    editNewRelEntity(ciConfig) {
      let data = {
        ...ciConfig,
        _rootId: this.ciEntityData.ciId,
        _rootUuid: this.ciEntityData.uuid,
        isChildren: true //标识：初始模型是抽象模型的子模型
      };
      this.$emit('editNewRelEntity', data);
    },
    delRelEntity(relentity, index) {
      this.$delete(this.ciEntityData.children, index);
      this.$emit('remove', relentity);
    }
  },
  filter: {},
  computed: {
    isDisabled() {
      return (ciId) => {
        let isDisabled = false;
        let findItem = this.ciEntityData.children.find(item => item.ciId === ciId);
        if (findItem) {
          isDisabled = true;
        }
        return isDisabled;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
