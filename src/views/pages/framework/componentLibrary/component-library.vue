<template>
  <div class="component-library">
    <TsContain>
      <template slot="topLeft">
        <div class="action-group toolbar-right">
          <span class="action-item tsfont-plus" @click="addCom">组件</span>
        </div>
      </template>
      <template slot="topRight">
        <TsFormInput
          v-model="keyword"
          search
          placeholder="请输入组件名称"
          clearable
          width="400px"
          @on-enter="getPagedata(1)"
          @on-clear="getPagedata(1)"
        ></TsFormInput>
      </template>
      <div slot="content" class="content">
        <div class="card-wrapper">
          <div v-if="true">
            <div class="card-top text-grey">
              <TsRow>
                <Col span="3">
                  预览
                </Col>
                <Col span="6">
                  组件名称
                </Col>
                <Col span="4">
                  插件
                </Col>
                <Col span="4">
                  组件类型
                </Col>
                <Col span="7">
                  操作
                </Col>
              </TsRow>
            </div>
            <div class="card-item bg-op block-container">
              <TsRow>
                <Col span="3">
                </Col>
                <Col span="6">
                  优先级统计
                </Col>
                <Col span="4">
                  ITSM
                </Col>
                <Col span="4">
                  数值图
                </Col>
                <Col span="7" class="action">
                  <ul class="action-group">
                    <li class="tsfont-edit action-item" @click="edit()">{{ $t('page.edit') }}</li>
                    <li class="action-item">
                      <Dropdown transfer trigger="click">
                        引用列表
                        <DropdownMenu slot="list">
                          <DropdownItem>
                            1111
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </li>
                    <li class="tsfont-trash-o action-item" @click="edit()">{{ $t('page.delete') }}</li>

                  </ul>
                </Col>
              </TsRow>
            </div>
          </div>
          <div v-else>
            <no-data v-show="!loadingShow"></no-data>
          </div>
        </div>
      </div>
    </TsContain>
    <TsDialog
      type="modal"
      :isShow.sync="alertDialog"
      :maskClose="false"
      :hasFooter="true"
      width="50%"
    >
      <template v-slot:header>
        <div>{{ alertTitle }}</div>
      </template>
      <!-- <TsForm ref="addTacticsForm" :itemList="tacticsForm" type="type"></TsForm> -->
      <addComponent ref="addComponent"></addComponent>
      <template v-slot:footer>
        <Button @click="alertDialog = false">取消</Button>
        <Button type="primary" @click="submit">确定</Button>
      </template>
    </TsDialog>
  </div>
</template>

<script>
export default {
  name: '',
  components: {
    addComponent: resolve => require(['./component.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: [],
  data() {
    return {
      keyword: '',
      loadingShow: false,
      alertDialog: false,
      alertTitle: '新增组件'
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
    addCom() {
      this.alertDialog = true;
    },
    getPagedata() {},
    edit() {
      this.alertDialog = true;
      this.alertTitle = '编辑组件';
    },
    submit() {
      this.$refs.addComponent.submit();
    }
  },

  filter: {},

  computed: {},

  watch: {}
};
</script>
<style lang='less' scoped>
@import '~@/resources/assets/css/framework/manage.less';

.component-library {
  .content {
    .card-wrapper {
      padding: @space-base;
      .card-top {
        padding: 0 20px 8px 20px;
        .action {
          text-align: center;
        }
      }
      .card-item {
        height: 56px;
        line-height: 56px;
        padding: 0 20px;
        margin-bottom: 8px;
        .cuont {
          > span {
            margin-left: 5px;
          }
        }
        .tstable-action-ul {
          li {
            display: inline-block;
            padding: 0 @space-xs;
            &:not(:last-of-type) {
              position: relative;
              &::after {
                content: '|';
                width: 1px;
                height: 14px;
                color: @dividing-color;
                right: 0px;
                position: absolute;
              }
            }
            &::before {
              margin-right: 4px;
            }
          }
        }
      }
    }
  }
}
</style>
