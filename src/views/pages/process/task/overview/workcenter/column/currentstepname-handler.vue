<template>
  <div>
    <div v-if="rowData[headerKey] && rowData[headerKey].length > 0">
      <span
        v-for="(item, index) in sliceFn(rowData[headerKey], true)"
        :key="index"
        class="mr-sm"
      >{{ item }}</span>
      <span v-if="rowData[headerKey].length > 2">
        <Poptip
          transfer
          placement="bottom-start"
          popper-class="workcenterpoper"
          offset="-16"
          style="position: relative;top: 3px;"
        >
          <span class="tsfont-option-horizontal text-tip"></span>
          <div slot="content">
            <div v-for="(item, index) in sliceFn(rowData[headerKey], false)" :key="index" @click.stop>{{ item }}</div>
          </div>
        </Poptip>
      </span>
    </div>
  </div>

</template>
<script>
import mixin from './mixin';
export default {
  mixins: [mixin],
  methods: {}
};
</script>
