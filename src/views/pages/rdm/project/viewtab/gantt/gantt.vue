<template>
  <div>
    <TsContain>
      <template v-slot:navigation><span>导航</span></template>
      <template v-slot:topLeft>上左</template>
      <template v-slot:topCenter>上中</template>
      <template v-slot:topRight>
        <div class="action-group">
          <div class="action-item" :class="{ 'text-primary': viewscale === 'Day' }" @click="changeViewSacle('Day')">日</div>
          <div class="action-item" :class="{ 'text-primary': viewscale === 'Week' }" @click="changeViewSacle('Week')">周</div>
          <div class="action-item" :class="{ 'text-primary': viewscale === 'Month' }" @click="changeViewSacle('Month')">月</div>
        </div>
      </template>
      <template v-slot:content>
        <div ref="main" class="grid" :style="{ '--left': left + 'px' }">
          <div class="table-container">
            <table>
              <thead style="position: sticky;top:0px;background:#fff">
                <tr>
                  <th v-for="(th, index) in theadList" :key="index">{{ th.title }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(tr,index) in tbodyList" :key="index">
                  <td v-for="(td, tindex) in theadList" :key="tindex">
                    {{ tr[td.key] }}
                  </td>
                </tr>
              </tbody>
            </table>
            <!--<TsTable
              ref="table"
              :tbodyList="tbodyList"
              :theadList="theadList"
              @scroll="scrollTable"
            >
              <template v-slot:start="{ row }">{{ row.start | formatDate('yyyy-mm-dd') }}</template>
              <template v-slot:end="{ row }">{{ row.end | formatDate('yyyy-mm-dd') }}</template>
            </TsTable>-->
          </div>
          <div class="divider" @mousedown="startResize"></div>
          <div id="gantt"></div>
        </div>
      </template>
    </TsContain>
  </div>
</template>
<script>
import Gantt from '@/resources/plugins/TsGantt/gantt.js';
export default {
  name: '',
  components: {
    //TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  props: {},
  data() {
    return {
      left: 800,
      gantt: null,
      resizing: false,
      viewscale: 'Day',
      theadList: [
        { key: 'name', title: '名称' },
        { key: 'start', title: '开始' },
        { key: 'end', title: '结束' }
      ],
      tbodyList: Array.from({ length: 50 }, (_, i) => ({
        id: 'Task' + (i + 1),
        name: `任务 ${i + 1}`,
        start: new Date(2023, 0, 1 + i),
        end: new Date(2023, 0, 1 + i + Math.floor(Math.random() * 90)),
        progress: 30
      })),
      tasks: [
        {
          id: 'Task 2',
          name: 'Redesign website2',
          start: '2016-10-02',
          end: '2016-11-03',
          progress: 20,
          custom_class: 'bar-milestone' // optional
        },
        {
          id: 'Task 3',
          name: 'Redesign website3',
          start: '2016-10-28',
          end: '2016-11-31',
          progress: 20,
          custom_class: 'bar-milestone' // optional
        },
        {
          id: 'Task 1',
          name: 'Redesign website',
          start: '2016-12-28',
          end: '2016-12-31',
          progress: 20,
          dependencies: 'Task 2, Task 3',
          custom_class: 'bar-milestone' // optional
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.initGantt();
    window.addEventListener('resize', this.initSize);
    window.addEventListener('mousemove', this.doResize);
    window.addEventListener('mouseup', this.stopResize);
    setTimeout(() => {
      this.initSize();
    }, 300);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    window.removeEventListener('resize', this.initSize);
    window.removeEventListener('mousemove', this.doResize);
    window.removeEventListener('mouseup', this.stopResize);
  },
  destroyed() {},
  methods: {
    changeViewSacle(scale) {
      this.viewscale = scale;
      this.gantt.change_view_mode(scale);
    },
    initSize() {
      const main = this.$refs['main'];
      const height = window.innerHeight - main.getBoundingClientRect().top - 20;
      const width = window.innerWidth - this.left - 5;
      if (this.gantt) {
        this.gantt.setHeight(height);
        this.gantt.setWidth(width);
      }
    },
    scrollTable(scrollTop) {
      this.gantt.setScrollTop(scrollTop);
    },
    initGantt() {
      this.gantt = new Gantt('#gantt', this.tbodyList, {
        header_height: 50,
        column_width: 30,
        step: 24,
        view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
        bar_height: 20.89,
        bar_corner_radius: 3,
        arrow_curve: 5,
        padding: 18,
        view_mode: 'Day',
        date_format: 'YYYY-MM-DD',
        language: 'zh', // or 'es', 'it', 'ru', 'ptBr', 'fr', 'tr', 'zh', 'de', 'hu'
        custom_popup_html: null,
        onScroll: t => {
          this.$refs['table'].setScrollTop(t);
        }
      });
    },
    startResize(e) {
      this.resizing = true;
      this.startX = e.clientX;
      this.oldLeft = this.left;
    },
    doResize(e) {
      if (!this.resizing) return;
      const dx = e.clientX - this.startX;
      this.left = this.oldLeft + dx;
      if (this.left <= 600) {
        this.left = 600;
      }
    },
    stopResize() {
      this.resizing = false;
    }
  },
  filter: {},
  computed: {},
  watch: {
    height: {
      handler: function(val) {
        this.gantt.setHeight(val);
      }
    },
    left: {
      handler: function(val) {
        this.initSize();
      }
    },
    tasks: {
      handler: function(val) {},
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.table-container {
  padding-top: 22px;
  overflow: auto;
}
.grid {
  display: grid;
  grid-template-columns: auto 5px calc(100vw - 5px - var(--left));
  width: 100%;
}
.divider {
  width: 5px;
  background-color: #ccc;
  cursor: ew-resize;
  height: 100%;
}
.gantt-char {
  overflow: auto;
}
</style>
