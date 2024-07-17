<template>
  <div class="score-edit padding">
    <div class="title">{{ $t('page.userrating') }}</div>
    <ul class="score-list clearfix">
      <li v-for="item in dimensionList" :key="item.id" class="score-item">
        <div class="item-name overflow">
          <Tooltip
            v-if="item.description"
            offset="-11px"
            theme="light"
            transfer
            max-width="300px"
            placement="top-start"
            class="tooltip"
          >
            <i class="tip tsfont-info-o text-grey"></i>
            <div slot="content" class="tooltip-content">{{ item.description }}</div>
          </Tooltip>
          <span class="name" :title="item.name">{{ item.name }}</span>
        </div>
        <div class="item-score">
          <Rate v-model="item.score" />
        </div>
      </li>
    </ul>
    <div class="editor">
      <TsCkeditor
        :value="content"
        width="100%"
        :showIconToggle="true"
        :placeholder="$t('term.process.workordersuggestion')"
        @on-change="content = $event"
      ></TsCkeditor>
    </div>
    <div class="score-btn">
      <Button type="primary" @click="submit">{{ $t('page.submit') }}</Button>
      <Button v-if="getRedoText" @click="redoTask">{{ getRedoText }}</Button>
    </div>
  </div>
</template>

<script>
import TsCkeditor from '@/resources/plugins/TsCkeditor/TsCkeditor';

export default {
  name: 'ScoreEdit',
  components: {
    TsCkeditor
  },
  inject: {
    $taskBox: {
      type: Object,
      default: null
    }
  },
  props: {
    actionConfig: {type: Object},
    processTaskConfig: {type: Object},
    processTaskId: { type: Number, required: true}
  },
  data() {
    return {
      scoreTemplateId: null,
      content: '',
      dimensionList: [],
      scoreTemplateVo: null
    };
  },
  created() {
  },
  methods: {
    submit() {
      const params = {
        processTaskId: this.processTaskId,
        scoreTemplateId: this.scoreTemplateId,
        scoreDimensionList: this.dimensionList,
        content: this.content
      };
      this.$api.process.scoreTemplate
        .submitScore(params)
        .then(res => {
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
            this.$router.push({
              name: 'refresh', replace: true, query: { path: 'task-detail?processTaskId=' + this.processTaskId }
            });
          }
        });
    },
    redoTask() { //工单回退
      if (this.$taskBox) {
        this.$taskBox.redoTask();
      }
    }
  },
  computed: {
    getRedoText() {
      // 获取评分前回退文案
      let redoText = '';
      let redoStepConfig = this.processTaskConfig && this.processTaskConfig.redoStepList.find((item) => item.aliasName);
      if (!this.$utils.isEmpty(redoStepConfig)) {
        redoText = redoStepConfig.aliasName;
      } else if (this.actionConfig.redo) {
        redoText = this.actionConfig.redo;
      }
      return redoText;
    }
  },
  watch: {
    processTaskConfig: {
      handler(val) {
        if (val) {
          let scoreTemplateVo = val.scoreTemplateVo;
          this.scoreTemplateId = scoreTemplateVo.id;
          this.dimensionList = scoreTemplateVo.dimensionList.map(item => {
            const {id: id, name: name, description} = item;
            let score = 5;
            return {id, name, description, score};
          });
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>

<style lang="less" scoped>
.score-edit {
	.score-list {
    padding-top: 16px;
		.score-item {
			float: left;
			width: 50%;
			padding-right: 15%;
			display: flex;
			align-items: center;
			justify-content: space-between;
      padding-bottom: 10px;
      .item-name{
        .name { 
          padding-left: 6px;
        }
      }
			.item-score {
				transform: translateY(-1px);
        flex-shrink: 0;
			}
		}
	}
	.editor {
    padding-bottom: 16px;
		/deep/ .ck-content {
			min-height: 90px;
		}
	}
  .score-btn{
    text-align: right;
    button {
      margin-left: 10px;
    }
  }
}
</style>
