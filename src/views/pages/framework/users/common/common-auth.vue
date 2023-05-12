<!-- 授权 -->
<template>
  <div class="common-auth">
    <div v-if="authList && authList.length > 0" class="wrapper">
      <div v-for="(item, index) in authList" :key="index" class="item mb-md">
        <div class="title text-grey">{{ item.displayName }}</div>
        <div class="radius-lg" :class="readOnly || readOnly == 'true' ? 'title-wrapper not-allowed border-color' : 'bg-op'">
          <div class="pl-nm pt-nm h2 flex-start" :class="isCheckAll(item) ? 'ts-check-square-o':'ts-minus-square'" @click.stop="handleCheckAll(item)">
            <span class="text check-all-text-pr" :class="isReadOnly() ? 'not-allowed' : ''">
              {{ isCheckAll(item) ? $t('page.unselectall') : $t('page.selectall') }}
            </span>
          </div>
          <div class="item-cli pl-nm pr-nm">
            <CheckboxGroup v-model="authSelectList[item.name]">
              <Checkbox 
                v-for="(citem, cindex) in item.authVoList"
                :key="cindex"
                :label="citem.name"
                style="width:20%" 
                :disabled="isDisabled(citem) || isReadOnly()"
                :class="isDisabled(citem) ? 'ivu-checkbox-checked' : ''"
              >
                <Tooltip theme="light" max-width="300" transfer>
                  <span class="check-all-text-pr" :class="isDisabled(citem) || isReadOnly() ? 'not-allowed' : ''">{{ citem.displayName }}</span>
                  <div slot="content">
                    <div v-html="citem.description"></div>
                    <div v-if="isDisabled(citem)">({{ $t('term.framework.notcancelauth') }})</div>
                  </div>
                </Tooltip>
              </Checkbox>
            </CheckboxGroup>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommonAuth',
  components: {
  },
  props: {
    type: {
      type: String,
      default: 'user'
    },
    authList: {
      type: Array
    },
    authUserSelectList: {
      //授权选中列表
      type: [Object, Array],
      default: () => {
        return [];
      }
    },
    authRoleSelectList: {
      type: [Object, Array],
      default: () => {
        return [];
      }
    },
    readOnly: {
      type: [Boolean, String],
      default: false
    }
  },
  data() {
    return {
      authSelectList: {},
      userIdList: [],
      batch: false,
      authUserIdList: [] //批量添加用户列表
    };
  },

  created() {
    // 修复切换到基本信息，选择不保存，再次切换到授权tab时，没有恢复为原始数据
    if (!this.$utils.isEmptyObj(this.authUserSelectList)) {
      this.authSelectList = this.$utils.deepClone(this.authUserSelectList);
    }
  },

  beforeMount() {},
  mounted() {},
  methods: {
    isDisabled(row) {
      // 继承角色权限，不允许取消授权
      let isDisabled = false;
      let authRoleObj = JSON.stringify(this.authRoleSelectList);
      let hasAuthRole = authRoleObj.indexOf(row.name);
      isDisabled = hasAuthRole != '-1';
      return isDisabled;
    },
    isReadOnly() {
      // 只读
      return !!((this.readOnly == 'true' || this.readOnly));
    },
    valid: function() {
      return this.$refs.authUserBatch.valid();
    },
    isCheckAll(row) {
      if (this.isReadOnly()) {
        return false;
      }
      let authSelectListNum = this.authSelectList[row.name] ? this.authSelectList[row.name].length : 0; // 选中的数量
      let authVoListNum = row.authVoList ? row.authVoList.length : 0;
      return authSelectListNum >= authVoListNum;
    },
    handleCheckAll(row) {
      // 处理全选/取消全选
      let authNameList = [];
      if (row && !this.$utils.isEmpty(row.authVoList)) {
        let moduleName = row.name; // 模块名称
        row.authVoList.forEach((item) => {
          authNameList.push(item.name);
        });
        if (this.authSelectList && !this.$utils.isEmptyObj(this.authSelectList)) {
          for (let key in this.authSelectList) {
            if (key == moduleName) {
              this.$set(this.authSelectList, key, this.isCheckAll(row) ? [] : authNameList.sort());
              if (this.authSelectList[key] && this.authSelectList[key].length == 0) {
                delete this.authSelectList[key];
              }
              return false;
            } else if (!this.isCheckAll(row)) {
              this.$set(this.authSelectList, moduleName, authNameList.sort());
              return false;
            }
          }
        } else {
          this.$set(this.authSelectList, moduleName, authNameList.sort());
        }
      }
    }
  },
  computed: {},
  watch: {
    isBatch: {
      handler(newValue, oldValue) {
        this.batch = newValue;
      },
      deep: true,
      immediate: true
    },
    authUserSelectList: function(val) {
      if (JSON.stringify(val) != '{}') {
        this.authSelectList = this.$utils.deepClone(val);
      }
    },
    authRoleSelectList: {
      handler(newValue, oldValue) {
        // console.log(newValue);
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.common-auth {
  overflow: auto;
  height: calc(100vh - 50px - 50px - 106px);
  .check-all-text-pr {
    display: inline-block;
    padding-left: 4px;
    cursor: pointer;
  }
  .wrapper {
    width: 100%;
    .item {
      .title {
        margin-bottom: 6px;
      }
      .item-cli {
        width: 100%;
        border: 1px solid transparent;
        label {
          margin-right: 50px;
          padding: 12px 0;
          display: inline-flex;
        }
      }
      .title-wrapper {
         overflow: hidden;
         border: 1px solid;
      }
      .not-allowed {
        cursor: not-allowed;
      }
    }
  }
  /deep/ .ivu-checkbox {
    line-height: revert;
  }
  /deep/ .ivu-checkbox-checked .ivu-checkbox-inner:after {
    top: -1px;
  }
}
</style>
