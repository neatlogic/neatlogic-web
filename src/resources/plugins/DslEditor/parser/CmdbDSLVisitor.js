// Generated from CmdbDSL.g4 by ANTLR 4.13.0
// jshint ignore: start
import utils from '@/resources/assets/js/util.js';
import antlr4 from 'antlr4';
import CmdbDSLParser from './CmdbDSLParser';

// This class defines a complete generic visitor for a parse tree produced by CmdbDSLParser.

export default class CmdbDSLVisitor extends antlr4.tree.ParseTreeVisitor {
  constructor(expressionList, attrList) {
    super();
    this.expressionList = expressionList;
    this.attrList = attrList;
    this.expressionMap = new Map();
    this.rootExpression = null;
  }
  // Visit a parse tree produced by CmdbDSLParser#calculateExpressions.
  visitCalculateExpressions(ctx) {
    return this.visitChildren(ctx);
  }

  // Visit a parse tree produced by CmdbDSLParser#expressionJoin.
  visitExpressionJoin(ctx) {
    return this.visitChildren(ctx);
  }

  createSearchExpression(ctx, childCtx) {
    let searchExpression = {};
    if (this.expressionMap.get(ctx)) {
      searchExpression = this.expressionMap.get(ctx);
    } else {
      this.expressionMap.set(ctx, searchExpression);
    }
    
    if (ctx instanceof CmdbDSLParser.ExpressionJoinContext) {
      searchExpression['type'] = 'join';
      searchExpression['uuid'] = utils.setUuid();
      if (ctx.expressions().length > 0) {
        if (this.expressionMap.get(ctx.expressions()[0])) {
          searchExpression['left'] = this.expressionMap.get(ctx.expressions()[0]);
        }
      }
      if (ctx.expressions().length > 1) {
        if (this.expressionMap.get(ctx.expressions()[1])) {
          searchExpression['right'] = this.expressionMap.get(ctx.expressions()[1]);
        }
      }
      if (ctx.logicalOperator && ctx.logicalOperator()) {
        searchExpression['connector'] = ctx.logicalOperator().getText();
      }
    } else if (ctx instanceof CmdbDSLParser.ExpressionGroupContext) {
      searchExpression['type'] = 'group';
      searchExpression['uuid'] = utils.setUuid();
      if (childCtx) {
        if (!searchExpression['children']) {
          searchExpression['children'] = [];
        }
        if (!searchExpression['children'].includes(this.expressionMap.get(childCtx))) {
          searchExpression['children'].push(this.expressionMap.get(childCtx));
        }
      }
    } else {
      searchExpression['type'] = 'expression';
      searchExpression['uuid'] = utils.setUuid();
      if (ctx.attrs && ctx.attrs()) {
        searchExpression['attr'] = ctx.attrs().getText();
        searchExpression['start'] = ctx.start.start;
        searchExpression['end'] = ctx.start.stop;
      }
      if (ctx.comparisonOperator && ctx.comparisonOperator()) {
        searchExpression['connector'] = ctx.comparisonOperator().getText();
      }
      if (ctx.NUMBER && ctx.NUMBER() != null) {
        searchExpression['value'] = ctx.NUMBER().getText();
        searchExpression['valuetype'] = 'number';
      } else if (ctx.STRING && ctx.STRING() != null) {
        searchExpression['value'] = ctx.STRING().getText();
        searchExpression['valuetype'] = 'string';
      } else if (ctx.NUMBER_ARRAY && ctx.NUMBER_ARRAY() != null) {
        searchExpression['value'] = ctx.NUMBER_ARRAY().getText();
        searchExpression['valuetype'] = 'numbers';
      } else if (ctx.STRING_ARRAY && ctx.STRING_ARRAY() != null) {
        searchExpression['value'] = ctx.STRING_ARRAY().getText();
        searchExpression['valuetype'] = 'strings';
      } else if (ctx.calculateExpressions && ctx.calculateExpressions() != null) {
        searchExpression['value'] = ctx.calculateExpressions().getText();
        searchExpression['valuetype'] = 'calc';
      }
    }
    
    if (ctx.parentCtx) {
      this.createSearchExpression(ctx.parentCtx, ctx);
    } else {
      if (this.rootExpression != searchExpression) {
        this.rootExpression = searchExpression;
      }
    }
    return searchExpression;
  }

  getRootExpression() {
    return this.rootExpression;
  }

  // Visit a parse tree produced by CmdbDSLParser#expression.
  visitExpression(ctx) {
    if (ctx.parentCtx) {
      const pExpression = this.createSearchExpression(ctx.parentCtx);
    }
    const searchExpression = this.createSearchExpression(ctx);
    let parentCtx = ctx.parentCtx;
    let currentSearchExpression = searchExpression;
    return this.visitChildren(ctx);
  }

  // Visit a parse tree produced by CmdbDSLParser#expressionGroup.
  visitExpressionGroup(ctx) {
    return this.visitChildren(ctx);
  }

  // Visit a parse tree produced by CmdbDSLParser#attrs.
  visitAttrs(ctx) {
    return this.visitChildren(ctx);
  }

  // Visit a parse tree produced by CmdbDSLParser#logicalOperator.
  visitLogicalOperator(ctx) {
    return this.visitChildren(ctx);
  }

  // Visit a parse tree produced by CmdbDSLParser#comparisonOperator.
  visitComparisonOperator(ctx) {
    return this.visitChildren(ctx);
  }

  // Visit a parse tree produced by CmdbDSLParser#calculateOperator.
  visitCalculateOperator(ctx) {
    return this.visitChildren(ctx);
  }
}
