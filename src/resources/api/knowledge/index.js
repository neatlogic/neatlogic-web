//api接口的出口
import template from './template/template'; //知识库模板
import circle from './circle/circle'; //知识圈
import overview from './overview/overview'; //知识文档概览
import { default as knowledgeKnowledge } from './knowledge/knowledge'; //知识库文档

const knowledge = {
  template,
  circle,
  overview,
  knowledge: knowledgeKnowledge
};
export default {
  template,
  circle,
  overview,
  knowledge: knowledgeKnowledge
};
