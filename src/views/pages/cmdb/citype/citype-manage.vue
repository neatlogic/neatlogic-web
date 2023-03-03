<template>
  <div>
    <TsDialog :is-show="true" v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div>编辑类型</div>
      </template>
      <template v-slot>
        <div>
          <div class="card-head">
            <div class="block-handler text-grey">排序</div>
            <div class="block-name text-grey">名称</div>
            <div class="block-key text-grey">关键类型</div>
            <div class="block-topo text-grey">拓扑中显示</div>
            <div class="block-type text-grey">模型数量</div>
            <div class="block-showtype text-grey"></div>
          </div>
          <draggable
            v-bind="dragOptions"
            tag="div"
            class="dataSource-ul"
            :list="ciTypeList"
            :group="{ name: 'item-sub' }"
            handle=".ts-bars"
            :forceFallback="false"
            @start="moveStart"
            @end="moveEnd"
          >
            <div v-for="(item,index) in ciTypeList" :key="index" class="card-item">
              <div class="block-handler">
                <div v-if="!item.isDeleted"><i class="ts-bars move"></i></div>
              </div>
              <div class="block-name">
                <div v-if="!item.isDeleted">
                  <TsFormInput
                    v-model="item.name"
                    :maxlength="30"
                    border="border"
                    :validateList="['required']"
                  ></TsFormInput>
                </div>
                <div v-else style="text-decoration:line-through" class="text-grey">{{ item.name }}</div>
              </div>
              <div class="block-key">
                <div v-if="!item.isDeleted">
                  <i-switch v-model="item.isMenu" :true-value="1" :false-value="0"></i-switch>
                </div>
              </div>
              <div class="block-topo">
                <div v-if="!item.isDeleted">
                  <i-switch v-model="item.isShowInTopo" :true-value="1" :false-value="0"></i-switch>
                </div>
              </div>
              <div class="block-type">
                <Badge :count="item.ciCount" type="primary">
                </Badge>
              </div>
              <div class="block-showtype">
                <div v-if="!item.ciCount">
                  <div
                    v-if="!item.isDeleted"
                    class="tsfont-close-o"
                    style="cursor:pointer"
                    @click="removeCiType(item)"
                  >删除</div>
                  <div
                    v-else
                    class="ts-rotate-right"
                    style="cursor:pointer"
                    @click="recoverCiType(item)"
                  >恢复</div>
                </div>
              </div>
            </div>
          </draggable>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">取消</Button>
        <Button type="primary" @click="saveCiType()">确定</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import draggable from 'vuedraggable';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';

export default {
  name: '',
  components: {
    draggable,
    TsFormInput
  },
  props: { 
    id: {type: Number},
    isShow: {type: Boolean}
  },
  data() {
    const _this = this;
    return { 
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: '600px'
      },
      dragOptions: {
        animation: 150,
        scroll: true,
        group: 'description',
        disabled: false,
        ghostClass: 'ghost'
      },
      ciTypeList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() { 
    this.getCiTypeList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    removeCiType(ciType) {
      this.$set(ciType, 'isDeleted', true);
    },
    recoverCiType(ciType) {
      this.$set(ciType, 'isDeleted', null);
    },
    saveCiType() {
      this.$api.cmdb.citype.saveAllCiType({
        ciTypeList: this.ciTypeList
      }).then(res => {
        if (res.Status == 'OK') {
          this.close(true);
        }
      });
    },
    getCiTypeList() {
      this.$api.cmdb.citype.listCiType().then(res => {
        if (res.Status == 'OK') {
          this.ciTypeList = res.Return;
        }
      });
    }, 
    moveStart() {

    },
    moveEnd() {
      
    },
    close: function(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  watch: { 
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/my-theme.less';
.card-head{
  position:relative;
  height:30px;
  line-height:30px;
  .block-handler{
    position:absolute;
    left:10px;
  }
  .block-name{
    position:absolute;
    left:60px;
  }
  .block-key{
    position:absolute;
    left:280px;
  }
  .block-topo{
    position:absolute;
    left:350px;
  }
  .block-type{
    position:absolute;
    left:430px;
  }
  .block-showtype{
    position:absolute;
    right:0;
    // left:500px;
  }
}
.card-item {
  margin-bottom:10px;
  position:relative;
  height:30px;
  line-height:30px;
  .block-handler{
    position:absolute;
    left:15px;
    cursor:move;
  }
  .block-name{
    position:absolute;
    left:60px;
  }
  .block-key{
    position:absolute;
    left:280px;
  }
  .block-topo{
    position:absolute;
    left:350px;
  }
  .block-type{
    position:absolute;
    left:445px;
  }
  .block-showtype{
    position:absolute;
    // left:500px;
    right:0;
  }
}
</style>
