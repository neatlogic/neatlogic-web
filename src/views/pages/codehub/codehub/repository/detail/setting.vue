<template>
  <div
    :is="reposData.type||'svn'"
    :type="reposData.type||'svn'"
    :uuid="reposData.uuid"
    :reposData="reposData"
  ></div>
</template>

<script>
import editmixin from './edittabmixin.js';
import types from './setting/index.js';
export default {
  name: 'Setting',
  components: {
    ...types
  },
  mixins: [editmixin],
  props: {
    uuid: [String],
    reposData: [Object]
  },
  data() {
    return {
    };
  },

  beforeCreate() {},

  created() {},

  beforeMount() {},

  mounted() {},

  beforeUpdate() {},

  updated() {},

  activated() {
  },

  deactivated() {},

  beforeDestroy() {},

  destroyed() {},

  methods: {

  },

  filter: {},

  computed: {
  },

  watch: {

  }

};
</script>
<style lang="less"></style>
