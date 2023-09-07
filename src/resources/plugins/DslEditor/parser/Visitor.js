import { CmdbDSLVisitor } from './CmdbDSLVisitor';

class Visitor extends CmdbDSLVisitor {
  constructor(result) {
    super();
    this.result = result;
  }

  visitCalculateExpressions(ctx) {
    this.result.calculateExpressions = 'some_value'; // 你的逻辑
    return super.visitChildren(ctx);
  }

  visitExpression(ctx) {
    this.result.expression = 'another_value'; // 你的逻辑
    return super.visitChildren(ctx);
  }
}

export default Visitor;
