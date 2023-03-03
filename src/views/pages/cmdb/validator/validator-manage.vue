<template>
  <div>
    <TsContain border="border"> 
      <template slot="topLeft">
        <span class="text-action tsfont-plus" @click="addValidator()">校验规则</span>
      </template>
      <template slot="topRight">
        <InputSearcher
          v-model="searchParam.keyword"
          @change="searchValidator()"
        ></InputSearcher>
      </template>
      <div slot="content" ref="maintable">
        <TsTable
          v-if="validatorData"
          v-bind="validatorData"
          @operation="operation"
        >
          <template slot="isActive" slot-scope="{ row }">
            <span v-if="row.isActive == 1" class="text-success">是</span>
            <span v-else class="text-grey">否</span>
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
                <div slot="title"><i>属性列表</i></div>
                <div slot="content">
                  <Tag
                    v-for="attr in attrList"
                    :key="attr.id"
                    style="cursor:pointer"
                    @click.native="toCi(attr.ciId)"
                  >
                    {{ attr.label }}<span class="text-grey fz10">({{ attr.ciLabel }})</span>
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
                <li class="tsfont-trash-o" :class="row.invokeCount?'disable':''" @click.stop="delValidator(row)">删除</li>
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
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    //TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    ValidatorEdit: resolve => require(['./validator-edit.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)
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
      theadList: [
        {key: 'name', title: '名称', type: 'linktext', textValue: 'view'},
        {key: 'isActive', title: '是否激活'},
        {key: 'handlerName', title: '组件'},
        {key: 'invokeCount', title: '引用次数'},
        {key: 'description', title: '描述'},
        {key: 'action'}]
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
        title: '警告',
        content: '确定删除校验规则：' + row.name + '？',
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.cmdb.validator
            .deleteValidatorById(row.id)
            .then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.content.deletesuccess'));
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
    toggleIsActive(row) {
    },
    changeInvokeId(id) {
      this.invokeId = id;
    },
    toCi(ciId) {
      this.$router.push({path: '/ci-detail/' + ciId});
    }
  },
  filter: {},
  computed: {},
  watch: {
    invokeId: {
      handler: function(val) {
        if (val) {
          this.attrList = [];
          this.$api.cmdb.ci.searchAttr({validatorId: val}).then(res => {
            this.attrList = res.Return;
          });
        }
      }
    }
  }
};
</script>
<style lang="less">
</style>
