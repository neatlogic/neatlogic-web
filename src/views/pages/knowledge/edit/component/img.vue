<template>
  <section
    :data_id="uuid"
    class="edit-img"
    type="img"
    z-index="0"
    contenteditable="false"
    @click="handlerClick"
    @paste.stop
  >
    <div class="wrapper" :class="align">
      <div class="img">
        <div class="top tool bg-op shadow">
          <div :title="$t('term.knowledge.leftalign')" @click="setAlign('left')"><span class="tsfont-horizontal-left text-action" :class="{'text-primary' : align=='left'}"></span></div>
          <div :title="$t('page.centeralign')" @click="setAlign('center')"><span class="tsfont-horizontal-center text-action" :class="{'text-primary' : align=='center'}"></span></div>
          <div :title="$t('term.knowledge.rightalign')" @click="setAlign('right')"><span class="tsfont-horizontal-right text-action" :class="{'text-primary' : align=='right'}"></span></div>
          <div :title="$t('page.delete')" class="delete" @click="removeItem"><span class="tsfont-trash-s text-action"></span></div>
        </div>
        <div v-if="isError" class="img-loading bg-op text-error">{{ $t('term.knowledge.imageloadfail') }}</div>
        <div v-else-if="loading || !config.url" class="img-loading bg-op"><span class="loading ivu-icon ivu-icon-ios-loading"></span>{{ $t('term.knowledge.imageloadding') }}</div>
        <img
          v-if="config.url"
          ref="img"
          :src="imgSrc"
          :alt="config.name"
          width="100%"
          :title="config.title"
          @load="handlerLoad"
        />
        <textarea
          ref="editorInput"
          v-model="pasteTitle"
          class="img-input text-default"
          :placeholder="$t('form.placeholder.pleaseinput', {target: $t('term.knowledge.imagedesc')})"
        />
        <span
          ref="editorSpan"
          class="editorSpan"
          contenteditable
          @keydown.stop="complexComHandlerKeydown"
          @input.stop="complexComHandlerKeydown"
        ></span>
      </div>
    </div>
  </section>
</template>
<script>
import editorMixins from './common/mixins.js';
export default {
  name: '',
  components: {},
  filters: {},
  mixins: [editorMixins],
  props: {
    uuid: String,
    handler: String,
    content: String,
    config: Object,
    tipShow: Boolean //选中工具栏是否显示
  },
  data() {
    const _this = this;
    return {
      imgStyle: null,
      loading: true,
      isError: false,
      align: _this.config.align || 'left', //图片位置
      pasteTitle: '' //图片说明
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.$refs.img.addEventListener('onerror', this.handlerError);
    this.pasteTitle = this.config.value || '';
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
  },
  destroyed() {},
  methods: {
    getContent() {
      this.config.align = this.config.align || 'left';
      this.$set(this.config, 'value', this.pasteTitle);
      return {
        config: this.config || {}
      };
    },
    setAlign(val) {
      this.align = val;
      this.config.align = val;
    },
    handlerLoad() {
      this.loading = false;
      this.$fn.changeToolBtn();
    },
    handlerClick(e) {
      this.comClick();
      if (e.target != this.$refs.editorInput) {
        this.$refs.editorSpan && this.$refs.editorSpan.focus();
      }
    },
    handlerError() {
      this.isError = true;
    }
  },
  computed: {
    imgSrc() {
      return this.config.url.indexOf(BASEURLPREFIX + '/') != 0 ? BASEURLPREFIX + '/' + this.config.url : this.config.url;
    }
  },
  watch: {
    content: {
      handler: function(val) {},
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang='less' scoped>
@import (reference) '~@/resources/assets/css/variable.less';
section.edit-img {
  &:hover {
    border: 1px solid transparent !important;
  }
}
p {
  vertical-align: middle;
  line-height: 20px;
}

.img-loading{
    display: inline-block;
    position: absolute;
    min-width: 100px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.edit-img {
  .left {
    display: flex;
    flex-direction: row;
    .img {
      max-width: 50%;
    }
  }
  .right {
    display: flex;
    flex-direction: row-reverse;
    .img {
      max-width: 50%;
    }
  }
  .center {
    display: flex;
    justify-content: center;
    .img {
      max-width: 80%;
    }
  }
  .wrapper {
    text-align: left;
    .img {
      position: relative;
      padding: 10px;

      cursor: pointer;
      .top {
        position: absolute;
        top: -45px;
        left: 0;
        z-index: 10000;
        box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.2);
        border-radius: 2px;
        padding: 5px 0 5px 5px;
        display: none;
        > div {
          padding: 7px 8px;
          border-radius: 5px;
          display: inline-block;
          cursor: pointer;
          margin-right: 10px;
        }
        .delete {
          position: relative;
          margin-left: 5px;
          &::after {
            content: '';
            position: absolute;
            left: -10px;
            top: 7px;
            height: 14px;
            width: 1px;
            background-color: rgba(0, 0, 0, 0.1);
          }
        }
      }
      .img-input {
        display: block;
        border: none;
        width: 100%;
        margin-top: 7px;
        background: transparent;
      }
      &:hover {
        background: @gray-color;
        .top {
          display: block;
        }
      }
     .editorSpan{
        position: absolute;
        right: 1px;
        bottom: 0px;
        width: 3px;
        height: 24px;
        outline: none;
         z-index: 3;
      }
    }
  }
}
.theme-dark {
  .img {
    &:hover {
      background: @dark-blockbg !important;
    }
  }
}
</style>
