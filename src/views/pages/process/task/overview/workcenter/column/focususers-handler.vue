<template>
  <div>
    <div
      v-if="rowData.rowClassName != 'hide-task' && rowData.status.value != 'draft'"
      :class="{ disable: isFocusing }"
      :style="{ cursor: isFocusing ? 'not-allowed' : 'pointer' }"
      @click.stop="updateFocus(rowData)"
    >
      <Icon
        v-if="isFocusing"
        type="ios-loading"
        size="14"
        class="loading"
      ></Icon>
      <i v-else-if="rowData[headerKey] && rowData[headerKey].isCurrentUserFocus" :class="['text-danger', 'tsfont-heart-s']" :title="$t('term.process.notfocustask')"></i>
      <i v-else :class="['text-danger', 'tsfont-heart-o', 'not-focus']" :title="$t('term.process.focustask')"></i>
    </div>
  </div>
</template>
<script>
import mixin from './mixin';
export default {
  mixins: [mixin],
  data() {
    return {
      isFocusing: false
    };
  },
  methods: {
    updateFocus(rowData) {
      if (this.isFocusing) {
        return;
      }
      this.isFocusing = true;
      // 工单关注
      rowData.focususers.isCurrentUserFocus = rowData.focususers.isCurrentUserFocus ? 0 : 1;
      const params = {
        processTaskId: rowData.id,
        isFocus: rowData.focususers.isCurrentUserFocus
      };
      this.$api.process.processtask
        .updateFocus(params)
        .then(res => {
          if (res.Status === 'OK') {
            rowData.focususers.isCurrentUserFocus = res.Return.isFocus;
            this.$Message.success(this.$t('message.executesuccess'));
            this.$emit('updateMenu');
          }
        })
        .catch(error => {
          rowData.focususers.isCurrentUserFocus = rowData.focususers.isCurrentUserFocus ? 0 : 1;
        })
        .finally(() => {
          this.isFocusing = false;
        });
    }
  }
};
</script>
<style lang="less" scoped>
.tstable-tr {
  .not-focus {
    visibility: hidden;
  }
  &:hover {
    .not-focus {
      visibility: visible;
    }
  }
}
</style>
