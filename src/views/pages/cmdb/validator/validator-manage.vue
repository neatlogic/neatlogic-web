<template>
  <div>
    <TsContain border="border">
      <template slot="topLeft">
        <span class="text-action tsfont-plus" @click="addValidator()">{{ $t('page.rule') }}</span>
      </template>
      <template slot="topRight">
        <InputSearcher v-model="searchParam.keyword" @change="searchValidator()"></InputSearcher>
      </template>
      <div slot="content" ref="maintable">
        <TsTable v-if="validatorData" v-bind="validatorData" @operation="operation">
          <template slot="isActive" slot-scope="{ row }">
            <span v-if="row.isActive == 1" class="text-success">{{ $t('page.yes') }}</span>
            <span v-else class="text-grey">{{ $t('page.no') }}</span>
          </template>
          <template v-slot:invokeCount="{ row }">
            <div>
              <Poptip
                v-if="row.invokeCount"
                :transfer="true"
                width="400"
                trigger="click"
              >
                <a href="javascript:void(0)" @click="changeInvokeId(row.id)">{{ row.invokeCount }}</a>
                <div slot="title">
                  <i>{{ $t('term.cmdb.attributelist') }}</i>
                </div>
                <div slot="content">
                  <Tag
                    v-for="attr in attrList"
                    :key="attr.id"
                    style="cursor:pointer"
                    @click.native="toCi(attr.ciId)"
                  >
                    {{ attr.label }}
                    <span class="text-grey fz10">({{ attr.ciLabel }})</span>
                  </Tag>
                </div>
              </Poptip>
              <span v-else>-</span>
            </div>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <!--<li @click.stop>
                  <TsFormSwitch
                    v-model="row.isActive"
                    :true-value="1"
                    :false-value="0"
                    showStatus
                    @on-change="toggleIsActive(row)"
                  ></TsFormSwitch>
                </li>-->
                <!-- <li class="tsfont-edit" @click.stop="editValidator(row)">编辑</li> -->
                <li class="tsfont-trash-o" :class="row.invokeCount ? 'disable' : ''" @click.stop="delValidator(row)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
    <ValidatorEdit v-if="isEditValidatorShow" :id="validatorId" @close="close"></ValidatorEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    //TsFormSwitch:()=>import('@/resources/plugins/TsForm/TsFormSwitch'),
    ValidatorEdit: () => import('./validator-edit.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue')
  },
  props: {},
  data() {
    return {
      searchParam: {},
      validatorData: {},
      validatorId: null,
      invokeId: null,
      isEditValidatorShow: false,
      attrList: [], //引用的属性列表
      theadList: [{ key: 'name', title: this.$t('page.name'), type: 'linktext', textValue: 'view' }, { key: 'isActive', title: this.$t('term.report.isactive') }, { key: 'handlerName', title: this.$t('page.component') }, { key: 'invokeCount', title: this.$t('page.invokecount') }, { key: 'description', title: this.$t('page.description') }, { key: 'action' }]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchValidator();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchValidator(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      } else {
        this.searchParam.currentPage = 1;
      }
      this.$api.cmdb.validator.searchValidator(this.searchParam).then(res => {
        this.validatorData = res.Return;
        this.validatorData.theadList = this.theadList;
      });
    },
    operation(row, view) {
      if (view == 'view') {
        this.editValidator(row);
      }
    },
    editValidator(row) {
      this.validatorId = row.id;
      this.isEditValidatorShow = true;
    },
    delValidator(row) {
      if (row.invokeCount > 0) {
        return;
      }
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deletetargetconfirm', { target: row.name }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.cmdb.validator.deleteValidatorById(row.id).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
              this.searchValidator();
            }
          });
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
    },
    addValidator() {
      this.validatorId = null;
      this.isEditValidatorShow = true;
    },
    close(needRefresh) {
      this.isEditValidatorShow = false;
      this.validatorId = null;
      if (needRefresh) {
        this.searchValidator();
      }
    },
    toggleIsActive(row) {},
    changeInvokeId(id) {
      this.invokeId = id;
    },
    toCi(ciId) {
      this.$router.push({ path: '/ci-detail/' + ciId });
    }
  },
  filter: {},
  computed: {},
  watch: {
    invokeId: {
      handler: function(val) {
        if (val) {
          this.attrList = [];
          this.$api.cmdb.ci.searchAttr({ validatorId: val }).then(res => {
            this.attrList = res.Return;
          });
        }
      }
    }
  }
};
</script>
<style lang="less"></style>
