<!-- 授权 -->
<template>
  <div class="common-auth">
    <div v-if="authList && authList.length > 0" class="wrapper">
      <div v-for="(item, index) in authList" :key="index" class="item mb-md">
        <div class="title text-grey">{{ item.displayName }}</div>
        <div class="radius-lg" :class="isReadOnly() ? 'title-wrapper not-allowed border-color' : 'bg-op'">
          <div
            v-if="!isReadOnly() && getEditableAuthList(item).length"
            class="pl-nm pt-nm h2 flex-start"
            :class="isCheckAll(item) ? 'tsfont-check-square-o':'tsfont-minus-square'"
            @click.stop="handleCheckAll(item)"
          >
            <span class="text check-all-text-pr" :class="isReadOnly() ? 'not-allowed' : ''">
              {{ isCheckAll(item) ? $t('page.unselectall') : $t('page.selectall') }}
            </span>
          </div>
          <div class="item-cli pl-nm pr-nm">
            <CheckboxGroup :value="displayAuthSelectList[item.name] || []" @input="updateAuthSelection(item.name, $event)">
              <div
                v-for="(citem, cindex) in item.authVoList"
                :key="cindex"
                class="auth-option"
              >
                <!-- 来源提示保留600px最大宽度，减少多来源路径的换行。 -->
                <Tooltip
                  class="auth-checkbox-tooltip"
                  theme="light"
                  max-width="600"
                  :disabled="!isDisabled(citem, item.name)"
                  transfer
                >
                  <Checkbox :label="citem.name" :disabled="isDisabled(citem, item.name) || isReadOnly()">
                    <span class="auth-checkbox-name">{{ citem.displayName }}</span>
                  </Checkbox>
                  <!-- 全部来源按接口顺序显示编号路径，名称使用文本插值及现有图标，不添加点击行为。 -->
                  <div slot="content">
                    <div :class="getReadonlyAuthTips(citem, item.name).details.length ? 'mb-md' : ''">{{ getReadonlyAuthTips(citem, item.name).summary }}</div>
                    <div v-for="(tip, tipIndex) in getReadonlyAuthTips(citem, item.name).details" :key="tipIndex" class="mb-md">
                      <span>{{ $t('term.framework.authsourcenumber', {index: tipIndex + 1, description: tip.description}) }}</span>
                      <span v-for="(node, nodeIndex) in tip.nodes" :key="nodeIndex">
                        <span v-if="nodeIndex"> → </span>
                        <span class="text-action" :class="{'tsfont-team-s': node.type === 'team', 'tsfont-role': node.type === 'role', 'tsfont-security': node.type === 'permission'}">{{ node.name }}</span>
                      </span>
                    </div>
                  </div>
                </Tooltip>
                <Tooltip
                  class="auth-name-tooltip"
                  theme="light"
                  max-width="300"
                  transfer
                >
                  <span
                    class="check-all-text-pr"
                    :class="isDisabled(citem, item.name) || isReadOnly() ? 'not-allowed' : ''"
                    @click="toggleAuth(citem, item.name)"
                  >
                    {{ citem.displayName }}
                    <span v-if="citem.name" class="auth-code text-grey">{{ citem.name }}</span>
                  </span>
                  <div slot="content">
                    <div v-html="citem.description"></div>
                  </div>
                </Tooltip>
              </div>
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
    //来源仅影响提示，不参与权限勾选、禁用和保存；旧调用方可不传。
    authRoleAuthSourcePathList: {
      type: Array,
      default: () => []
    },
    //后端展开的代码权限只用于勾选和禁用，默认不影响普通用户授权入口。
    authCodeSelectList: {
      type: Object,
      default: () => ({})
    },
    readOnly: {
      type: [Boolean, String],
      default: false
    }
  },
  data() {
    return {
      authSelectList: {}, //仅维护页面授权，供既有调用方读取和保存。
      userIdList: [],
      batch: false,
      authUserIdList: [] //批量添加用户列表
    };
  },
  beforeMount() {},
  mounted() {},
  methods: {
    //代码授权和空来源沿用原提示；其余来源使用固定说明及编号路径，不合并同名来源。
    getReadonlyAuthTips(row, groupName) {
      if (this.isCodeAuth(row, groupName)) {
        return {summary: this.$t('term.framework.codeauthreadonly'), details: []};
      }
      const sources = (this.roleAuthSourcePathMap[groupName] || {})[row.name] || [];
      if (!sources.length) {
        return {summary: this.$t('term.framework.notcancelauth'), details: []};
      }
      const details = sources.map(source => this.getReadonlyAuthSource(source, row, groupName));
      return {
        summary: this.$t('term.framework.authsourcepathintro'),
        details
      };
    },
    //每个来源生成分组、角色及权限节点；资料缺失时保留该条编号并回退原提示，不拼造来源。
    getReadonlyAuthSource(source, row, groupName) {
      const info = source || {};
      const path = Array.isArray(info.includeAuthPathList) ? info.includeAuthPathList : [];
      const isIncluded = path.length > 1;
      const teamPath = Array.isArray(info.teamPathNameList) ? info.teamPathNameList : [];
      const teamName = teamPath[teamPath.length - 1];
      if ((!isIncluded && !info.roleName) || (info.roleUuid && !info.roleName) || (info.teamUuid && (!info.roleName || !teamName)) || path.some(auth => !auth || !auth.auth || !auth.authGroup)) {
        return {description: this.$t('term.framework.notcancelauth'), nodes: []};
      }
      //分组仅显示所属分组原名；包含来源使用完整权限链，普通角色来源补上当前权限。
      const nodes = [];
      if (info.teamUuid) {
        nodes.push({type: 'team', name: teamName});
      }
      if (info.roleName) {
        nodes.push({type: 'role', name: info.roleName});
      }
      const authPath = isIncluded ? path : [{authGroup: groupName, auth: row.name}];
      authPath.forEach(auth => {
        nodes.push({type: 'permission', name: (this.authDisplayNameMap[auth.authGroup] || {})[auth.auth] || auth.auth});
      });
      return {description: '', nodes};
    },
    //角色继承和代码授权均不可取消；传入权限组，避免跨组误匹配。
    isDisabled(row, groupName) {
      const groups = groupName ? [groupName] : Object.keys(this.authRoleSelectList);
      return this.isCodeAuth(row, groupName) || groups.some(group => (this.authRoleSelectList[group] || []).includes(row.name));
    },
    //代码来源独立判断，用于禁用权限和控制勾选框上的提示。
    isCodeAuth(row, groupName) {
      const groups = groupName ? [groupName] : Object.keys(this.authCodeSelectList);
      return groups.some(group => (this.authCodeSelectList[group] || []).includes(row.name));
    },
    //只读集合只参与显示，不能因勾选变化新增页面记录。
    getReadonlyAuthList(groupName) {
      return [...new Set([...(this.authRoleSelectList[groupName] || []), ...(this.authCodeSelectList[groupName] || [])])];
    },
    //分组操作只针对当前目录中允许编辑的权限。
    getEditableAuthList(row) {
      return (row.authVoList || []).filter(auth => !this.isDisabled(auth, row.name)).map(auth => auth.name);
    },
    //说明文案与勾选框分开提示，点击权限名称仍沿用勾选行为，固定权限禁止切换。
    toggleAuth(row, groupName) {
      if (this.isReadOnly() || this.isDisabled(row, groupName)) {
        return;
      }
      const values = this.authSelectList[groupName] || [];
      this.updateAuthSelection(groupName, values.includes(row.name) ? values.filter(auth => auth !== row.name) : [...values, row.name]);
    },
    //从展示集合提取页面选择，已有双重来源记录保持原样，代码独有权限不会写入页面授权。
    updateAuthSelection(groupName, values) {
      if (this.isReadOnly()) {
        return;
      }
      const readonlyAuths = this.getReadonlyAuthList(groupName);
      const existingAuths = this.authSelectList[groupName] || [];
      const pageAuths = [...new Set([
        ...existingAuths.filter(auth => readonlyAuths.includes(auth)),
        ...values.filter(auth => !readonlyAuths.includes(auth))
      ])].sort();
      if (pageAuths.length) {
        this.$set(this.authSelectList, groupName, pageAuths);
      } else {
        this.$delete(this.authSelectList, groupName);
      }
    },
    //组件整体只读时，拦截单选与批量选择。
    isReadOnly() {
      return this.readOnly === true || this.readOnly === 'true';
    },
    valid: function() {
      return this.$refs.authUserBatch.valid();
    },
    //全选状态只依据可编辑项，固定勾选不影响全选和取消全选。
    isCheckAll(row) {
      if (this.isReadOnly()) {
        return false;
      }
      const editableAuths = this.getEditableAuthList(row);
      return editableAuths.length > 0 && editableAuths.every(auth => (this.authSelectList[row.name] || []).includes(auth));
    },
    //保留固定来源及目录之外的已有记录，只切换当前组的可编辑权限。
    handleCheckAll(row) {
      if (this.isReadOnly()) {
        return;
      }
      const editableAuths = this.getEditableAuthList(row);
      if (!editableAuths.length) {
        return;
      }
      const existingAuths = this.authSelectList[row.name] || [];
      const values = this.isCheckAll(row)
        ? existingAuths.filter(auth => !editableAuths.includes(auth))
        : [...existingAuths, ...editableAuths];
      this.updateAuthSelection(row.name, values);
    }
  },
  computed: {
    //权限名称按组和编码查找，避免跨组串名；目录未加载或缺少定义时由提示回退编码。
    authDisplayNameMap() {
      const result = Object.create(null);
      (this.authList || []).forEach(group => {
        const names = result[group.name] || (result[group.name] = Object.create(null));
        (group.authVoList || []).forEach(auth => {
          names[auth.name] = auth.displayName;
        });
      });
      return result;
    },
    //按组和编码保存全部来源，同权限的多条外层记录顺序合并，不排序或去重。
    roleAuthSourcePathMap() {
      const result = Object.create(null);
      this.authRoleAuthSourcePathList.forEach(source => {
        const group = result[source.authGroup] || (result[source.authGroup] = Object.create(null));
        group[source.auth] = [...(group[source.auth] || []), ...(Array.isArray(source.sourcePathList) ? source.sourcePathList : [])];
      });
      return result;
    },
    //生成独立的勾选并集，CheckboxGroup 的交互不会修改父组件传入的授权数据。
    displayAuthSelectList() {
      const groups = new Set([...Object.keys(this.authSelectList), ...Object.keys(this.authRoleSelectList), ...Object.keys(this.authCodeSelectList)]);
      const result = {};
      groups.forEach(group => {
        result[group] = [...new Set([...(this.authSelectList[group] || []), ...this.getReadonlyAuthList(group)])];
      });
      return result;
    }
  },
  watch: {
    isBatch: {
      handler(newValue, oldValue) {
        this.batch = newValue;
      },
      deep: true,
      immediate: true
    },
    //首次加载和重新加载均恢复页面记录，空结果也清理旧用户的勾选。
    authUserSelectList: {
      handler(val) {
        this.authSelectList = this.$utils.isEmptyObj(val) ? {} : this.$utils.deepClone(val);
      },
      deep: true,
      immediate: true
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
        .auth-option {
          width: 20%;
          margin-right: 50px;
          padding: 12px 0;
          display: inline-flex;
          align-items: flex-start;
          vertical-align: top;
        }
        .auth-checkbox-tooltip {
          flex-shrink: 0;
        }
        .auth-name-tooltip {
          flex: 1;
          min-width: 0;
          .check-all-text-pr {
            max-width: 100%;
            //长权限标识在当前列内换行，名称与标识共用原有点击和说明提示。
            overflow-wrap: anywhere;
          }
          .auth-code {
            display: block;
          }
          ::v-deep .ivu-tooltip-rel {
            max-width: 100%;
          }
        }
        .auth-checkbox-name {
          //保留勾选框的可访问名称，视觉提示仅由鼠标所在区域的 Tooltip 展示。
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
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
  ::v-deep .ivu-checkbox {
    line-height: revert;
  }
  ::v-deep .ivu-checkbox-checked .ivu-checkbox-inner:after {
    top: -1px;
  }
}
</style>
