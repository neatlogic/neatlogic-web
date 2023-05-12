/*
 * Copyright(c) 2023 NeatLogic Co., Ltd. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<template>
  <span class="fz10" :style="getStyle">{{ text||'' }}</span>
</template>
<script>
export default {
  name: '',
  components: {
  },
  filters: {
  },
  props: {
    text: String,
    color: {
      type: String,
      default: '#212121'
    },
    opacity: {
      type: Number,
      default: 0.2
    }
  },
  data() {
    return {
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {},
  computed: {
    getStyle() {
      return {
        'padding': '0 8px',
        'height': '20px',
        'line-height': '20px',
        'border-radius': '10px',
        'margin-right': '6px',
        'font-weight': 'normal',
        'vertical-align': 'initial',
        'color': this.color,
        'background': this.$utils.getLightColor(this.color, this.opacity),
        'display': 'inline-block'
      };
    }
  },
  watch: {}
};
</script>
