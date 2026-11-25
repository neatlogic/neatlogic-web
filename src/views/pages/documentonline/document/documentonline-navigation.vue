<template>
  <div>
    <NoData v-if="!headings.length" />
    <ul v-else>
      <li
        v-for="heading in headings"
        :key="heading.id"
        :style="{'padding-left': ((heading.level - minimumLevel) * 12) + 'px'}"
      >
        <button
          type="button"
          class="navigation-link"
          :class="{'is-current': anchorPointId === heading.id}"
          :title="heading.text"
          :aria-current="anchorPointId === heading.id ? 'location' : null"
          @click="$emit('select-heading', heading.id)"
        >{{ heading.text }}</button>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  props: {
    headings: { type: Array, default: () => [] },
    anchorPointId: String
  },
  computed: {
    minimumLevel() {
      return this.headings.length ? Math.min(...this.headings.map(heading => heading.level)) : 1;
    }
  }
};
</script>
