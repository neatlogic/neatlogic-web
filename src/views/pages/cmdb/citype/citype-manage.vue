<template>
  <div>
    <TsDialog :is-show="true" v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div>
          <TsRow class="mb-sm">
            <Col v-for="(item,index) in theadList" :key="index" :span="colSpanList[index]">
              {{ item.label }}
            </Col>
          </TsRow>
          <draggable
            v-bind="dragOptions"
            tag="div"
            class="dataSource-ul"
            :list="ciTypeList"
            :group="{ name: 'item-sub' }"
            handle=".tsfont-bar"
            :forceFallback="false"
            @start="moveStart"
            @end="moveEnd"
          >
            <Row
              v-for="(item) in ciTypeList"
              :key="item.id"
              class="mb-sm"
              type="flex"
              align="middle"
              :gutter="16"
            >
              <Col span="2">
                <span v-if="!item.isDeleted"><i class="tsfont-bar move"></i></span>
              </Col>
              <Col span="8">
                <div v-if="!item.isDeleted">
                  <TsFormInput
                    v-model="item.name"
                    :maxlength="30"
                    border="border"
                    :validateList="['required']"
                  ></TsFormInput>
                </div>
                <div v-else style="text-decoration:line-through" class="text-grey">{{ item.name }}</div>
              </Col>
              <!-- <Col span="2">
                <div class="block-key">
                <div v-if="!item.isDeleted">
                  <i-switch v-model="item.isMenu" :true-value="1" :false-value="0"></i-switch>
                </div>
              </div>
              </Col> -->
              <Col span="4">
                <div v-if="!item.isDeleted">
                  <i-switch v-model="item.isShowInTopo" :true-value="1" :false-value="0"></i-switch>
                </div>
              </Col>
              <Col span="4">
                <Badge :count="item.ciCount" type="primary"></Badge>
              </Col>
              <Col span="4">
                <div v-if="!item.ciCount">
                  <div
                    v-if="!item.isDeleted"
                    class="tsfont-close-o"
                    style="cursor:pointer"
                    @click="removeCiType(item)"
                  >{{ $t('page.delete') }}</div>
                  <div
                    v-else
                    class="tsfont-rotate-right"
                    style="cursor:pointer"
                    @click="recoverCiType(item)"
                  >{{ $t('page.recover') }}</div>
                </div>
              </Col>
            </Row>
          </draggable>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="saveCiType()">{{ $t('page.confirm') }}</Button>
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
    id: { type: Number },
    isShow: { type: Boolean }
  },
  data() {
    return {
      dialogConfig: {
        title: this.$t('dialog.title.edittarget', { target: this.$t('term.cmdb.cilevel') }),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: '600px'
      },
      colSpanList: [2, 8, 4, 4, 4],
      theadList: [
        {
          label: this.$t('page.sort'),
          uuid: this.$utils.setUuid()
        },
        {
          label: this.$t('page.name'),
          uuid: this.$utils.setUuid()
        },
        // {
        //   label: this.$t('term.cmdb.keylevel'),
        //   uuid: this.$utils.setUuid()
        // },
        {
          label: this.$t('term.cmdb.showintopo'),
          uuid: this.$utils.setUuid()
        },
        {
          label: this.$t('term.cmdb.cicount'),
          uuid: this.$utils.setUuid()
        },
        {
          label: this.$t('page.action'),
          uuid: this.$utils.setUuid()
        }
      ],
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
      this.$api.cmdb.citype
        .saveAllCiType({
          ciTypeList: this.ciTypeList
        })
        .then(res => {
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
    moveStart() {},
    moveEnd() {},
    close: function(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  watch: {}
};
</script>
<style lang="less" scoped>

</style>
