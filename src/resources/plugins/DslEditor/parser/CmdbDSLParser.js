// Generated from CmdbDSL.g4 by ANTLR 4.13.0
// jshint ignore: start
import antlr4 from 'antlr4';
import CmdbDSLListener from './CmdbDSLListener.js';
import CmdbDSLVisitor from './CmdbDSLVisitor.js';

const serializedATN = [
  4, 1, 25, 73, 2, 0, 7, 0, 2, 1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3, 2, 4, 7, 4, 2, 5, 7, 5, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 3, 0, 20, 8, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 5, 0, 28, 8, 0, 10, 0, 12, 0, 31, 9, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 41, 8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 47, 8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 53, 8, 1, 10, 1, 12, 1, 56, 9, 1, 1, 2, 1, 2, 5, 2, 60, 8, 2, 10, 2, 12, 2, 63, 9, 2, 1, 2, 1, 2, 1, 3, 1, 3, 1, 4, 1, 4, 1, 5, 1, 5, 1, 5, 0, 2, 0, 2, 6, 0, 2, 4, 6, 8, 10, 0, 5, 1, 0, 16, 17, 1, 0, 14, 15, 1, 0, 7, 8, 2, 0, 9, 13, 18, 22, 1, 0, 14, 17, 77, 0, 19, 1, 0, 0, 0, 2, 46, 1, 0, 0, 0, 4, 61, 1, 0, 0, 0, 6, 66, 1, 0, 0, 0, 8, 68, 1, 0, 0, 0, 10, 70, 1, 0, 0, 0, 12, 13, 6, 0, -1, 0, 13, 20, 3, 4, 2, 0, 14, 20, 5, 4, 0, 0, 15, 16, 5, 5, 0, 0, 16, 17, 3, 0, 0, 0, 17, 18, 5, 6, 0, 0, 18, 20, 1, 0, 0, 0, 19, 12, 1, 0, 0, 0, 19, 14, 1, 0, 0, 0, 19, 15, 1, 0, 0, 0, 20, 29, 1, 0, 0, 0, 21, 22, 10, 5, 0, 0, 22, 23, 7, 0, 0, 0, 23, 28, 3, 0, 0, 6, 24, 25, 10, 4, 0, 0, 25, 26, 7, 1, 0, 0, 26, 28, 3, 0, 0, 5, 27, 21, 1, 0, 0, 0, 27, 24, 1, 0, 0, 0, 28, 31, 1, 0, 0, 0, 29, 27, 1, 0, 0, 0, 29, 30, 1, 0, 0, 0, 30, 1, 1, 0, 0, 0, 31, 29,
  1, 0, 0, 0, 32, 33, 6, 1, -1, 0, 33, 34, 3, 4, 2, 0, 34, 40, 3, 8, 4, 0, 35, 41, 5, 24, 0, 0, 36, 41, 5, 4, 0, 0, 37, 41, 5, 2, 0, 0, 38, 41, 5, 3, 0, 0, 39, 41, 3, 0, 0, 0, 40, 35, 1, 0, 0, 0, 40, 36, 1, 0, 0, 0, 40, 37, 1, 0, 0, 0, 40, 38, 1, 0, 0, 0, 40, 39, 1, 0, 0, 0, 41, 47, 1, 0, 0, 0, 42, 43, 5, 5, 0, 0, 43, 44, 3, 2, 1, 0, 44, 45, 5, 6, 0, 0, 45, 47, 1, 0, 0, 0, 46, 32, 1, 0, 0, 0, 46, 42, 1, 0, 0, 0, 47, 54, 1, 0, 0, 0, 48, 49, 10, 2, 0, 0, 49, 50, 3, 6, 3, 0, 50, 51, 3, 2, 1, 3, 51, 53, 1, 0, 0, 0, 52, 48, 1, 0, 0, 0, 53, 56, 1, 0, 0, 0, 54, 52, 1, 0, 0, 0, 54, 55, 1, 0, 0, 0, 55, 3, 1, 0, 0, 0, 56, 54, 1, 0, 0, 0, 57, 58, 5, 23, 0, 0, 58, 60, 5, 1, 0, 0, 59, 57, 1, 0, 0, 0, 60, 63, 1, 0, 0, 0, 61, 59, 1, 0, 0, 0, 61, 62, 1, 0, 0, 0, 62, 64, 1, 0, 0, 0, 63, 61, 1, 0, 0, 0, 64, 65, 5, 23, 0, 0, 65, 5, 1, 0, 0, 0, 66, 67, 7, 2, 0, 0, 67, 7, 1, 0, 0, 0, 68, 69, 7, 3, 0, 0, 69, 9, 1, 0, 0, 0, 70, 71, 7, 4, 0, 0, 71, 11, 1, 0, 0, 0, 7, 19, 27, 29, 40, 46, 54, 61
];

const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map((ds, index) => new antlr4.dfa.DFA(ds, index));

const sharedContextCache = new antlr4.atn.PredictionContextCache();

export default class CmdbDSLParser extends antlr4.Parser {
  static grammarFileName = 'CmdbDSL.g4';
  static literalNames = [null, "'.'", null, null, null, "'('", "')'", "'&&'", "'||'", "'=='", "'>'", "'<'", "'<='", "'>='", "'+'", "'-'", "'*'", "'/'", "'!='", "'not like'", "'like'", "'include'", "'exclude'"];
  static symbolicNames = [null, null, 'NUMBER_ARRAY', 'STRING_ARRAY', 'NUMBER', 'BRACKET_LEFT', 'BRACKET_RIGHT', 'AND', 'OR', 'EQ', 'GT', 'LT', 'LE', 'GE', 'PLUS', 'SUBTRACT', 'MULTIPLY', 'DIVIDE', 'NOTEQ', 'NOTLIKE', 'LIKE', 'INCLUDE', 'EXCLUDE', 'ATTR', 'STRING', 'WHITESPACE'];
  static ruleNames = ['calculateExpressions', 'expressions', 'attrs', 'logicalOperator', 'comparisonOperator', 'calculateOperator'];

  constructor(input) {
    super(input);
    this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
    this.ruleNames = CmdbDSLParser.ruleNames;
    this.literalNames = CmdbDSLParser.literalNames;
    this.symbolicNames = CmdbDSLParser.symbolicNames;
  }

  sempred(localctx, ruleIndex, predIndex) {
    switch (ruleIndex) {
      case 0:
        return this.calculateExpressions_sempred(localctx, predIndex);
      case 1:
        return this.expressions_sempred(localctx, predIndex);
      default:
        throw new Error('No predicate with index:' + ruleIndex);
    }
  }

  calculateExpressions_sempred(localctx, predIndex) {
    switch (predIndex) {
      case 0:
        return this.precpred(this._ctx, 5);
      case 1:
        return this.precpred(this._ctx, 4);
      default:
        throw new Error('No predicate with index:' + predIndex);
    }
  }

  expressions_sempred(localctx, predIndex) {
    switch (predIndex) {
      case 2:
        return this.precpred(this._ctx, 2);
      default:
        throw new Error('No predicate with index:' + predIndex);
    }
  }

  calculateExpressions(_p) {
    if (_p === undefined) {
      _p = 0;
    }
    const _parentctx = this._ctx;
    const _parentState = this.state;
    let localctx = new CalculateExpressionsContext(this, this._ctx, _parentState);
    let _prevctx = localctx;
    const _startState = 0;
    this.enterRecursionRule(localctx, 0, CmdbDSLParser.RULE_calculateExpressions, _p);
    var _la = 0;
    try {
      this.enterOuterAlt(localctx, 1);
      this.state = 19;
      this._errHandler.sync(this);
      switch (this._input.LA(1)) {
        case 23:
          this.state = 13;
          this.attrs();
          break;
        case 4:
          this.state = 14;
          this.match(CmdbDSLParser.NUMBER);
          break;
        case 5:
          this.state = 15;
          this.match(CmdbDSLParser.BRACKET_LEFT);
          this.state = 16;
          this.calculateExpressions(0);
          this.state = 17;
          this.match(CmdbDSLParser.BRACKET_RIGHT);
          break;
        default:
          throw new antlr4.error.NoViableAltException(this);
      }
      this._ctx.stop = this._input.LT(-1);
      this.state = 29;
      this._errHandler.sync(this);
      var _alt = this._interp.adaptivePredict(this._input, 2, this._ctx);
      while (_alt != 2 && _alt != antlr4.atn.ATN.INVALID_ALT_NUMBER) {
        if (_alt === 1) {
          if (this._parseListeners !== null) {
            this.triggerExitRuleEvent();
          }
          _prevctx = localctx;
          this.state = 27;
          this._errHandler.sync(this);
          var la_ = this._interp.adaptivePredict(this._input, 1, this._ctx);
          switch (la_) {
            case 1:
              localctx = new CalculateExpressionsContext(this, _parentctx, _parentState);
              this.pushNewRecursionContext(localctx, _startState, CmdbDSLParser.RULE_calculateExpressions);
              this.state = 21;
              if (!this.precpred(this._ctx, 5)) {
                throw new antlr4.error.FailedPredicateException(this, 'this.precpred(this._ctx, 5)');
              }
              this.state = 22;
              localctx.op = this._input.LT(1);
              _la = this._input.LA(1);
              if (!(_la === 16 || _la === 17)) {
                localctx.op = this._errHandler.recoverInline(this);
              } else {
                this._errHandler.reportMatch(this);
                this.consume();
              }
              this.state = 23;
              this.calculateExpressions(6);
              break;

            case 2:
              localctx = new CalculateExpressionsContext(this, _parentctx, _parentState);
              this.pushNewRecursionContext(localctx, _startState, CmdbDSLParser.RULE_calculateExpressions);
              this.state = 24;
              if (!this.precpred(this._ctx, 4)) {
                throw new antlr4.error.FailedPredicateException(this, 'this.precpred(this._ctx, 4)');
              }
              this.state = 25;
              localctx.op = this._input.LT(1);
              _la = this._input.LA(1);
              if (!(_la === 14 || _la === 15)) {
                localctx.op = this._errHandler.recoverInline(this);
              } else {
                this._errHandler.reportMatch(this);
                this.consume();
              }
              this.state = 26;
              this.calculateExpressions(5);
              break;
          }
        }
        this.state = 31;
        this._errHandler.sync(this);
        _alt = this._interp.adaptivePredict(this._input, 2, this._ctx);
      }
    } catch (error) {
      if (error instanceof antlr4.error.RecognitionException) {
        localctx.exception = error;
        this._errHandler.reportError(this, error);
        this._errHandler.recover(this, error);
      } else {
        throw error;
      }
    } finally {
      this.unrollRecursionContexts(_parentctx);
    }
    return localctx;
  }

  expressions(_p) {
    if (_p === undefined) {
      _p = 0;
    }
    const _parentctx = this._ctx;
    const _parentState = this.state;
    let localctx = new ExpressionsContext(this, this._ctx, _parentState);
    let _prevctx = localctx;
    const _startState = 2;
    this.enterRecursionRule(localctx, 2, CmdbDSLParser.RULE_expressions, _p);
    try {
      this.enterOuterAlt(localctx, 1);
      this.state = 46;
      this._errHandler.sync(this);
      switch (this._input.LA(1)) {
        case 23:
          localctx = new ExpressionContext(this, localctx);
          this._ctx = localctx;
          _prevctx = localctx;

          this.state = 33;
          this.attrs();
          this.state = 34;
          this.comparisonOperator();
          this.state = 40;
          this._errHandler.sync(this);
          var la_ = this._interp.adaptivePredict(this._input, 3, this._ctx);
          switch (la_) {
            case 1:
              this.state = 35;
              this.match(CmdbDSLParser.STRING);
              break;

            case 2:
              this.state = 36;
              this.match(CmdbDSLParser.NUMBER);
              break;

            case 3:
              this.state = 37;
              this.match(CmdbDSLParser.NUMBER_ARRAY);
              break;

            case 4:
              this.state = 38;
              this.match(CmdbDSLParser.STRING_ARRAY);
              break;

            case 5:
              this.state = 39;
              this.calculateExpressions(0);
              break;
          }
          break;
        case 5:
          localctx = new ExpressionGroupContext(this, localctx);
          this._ctx = localctx;
          _prevctx = localctx;
          this.state = 42;
          this.match(CmdbDSLParser.BRACKET_LEFT);
          this.state = 43;
          this.expressions(0);
          this.state = 44;
          this.match(CmdbDSLParser.BRACKET_RIGHT);
          break;
        default:
          throw new antlr4.error.NoViableAltException(this);
      }
      this._ctx.stop = this._input.LT(-1);
      this.state = 54;
      this._errHandler.sync(this);
      var _alt = this._interp.adaptivePredict(this._input, 5, this._ctx);
      while (_alt != 2 && _alt != antlr4.atn.ATN.INVALID_ALT_NUMBER) {
        if (_alt === 1) {
          if (this._parseListeners !== null) {
            this.triggerExitRuleEvent();
          }
          _prevctx = localctx;
          localctx = new ExpressionJoinContext(this, new ExpressionsContext(this, _parentctx, _parentState));
          this.pushNewRecursionContext(localctx, _startState, CmdbDSLParser.RULE_expressions);
          this.state = 48;
          if (!this.precpred(this._ctx, 2)) {
            throw new antlr4.error.FailedPredicateException(this, 'this.precpred(this._ctx, 2)');
          }
          this.state = 49;
          this.logicalOperator();
          this.state = 50;
          this.expressions(3);
        }
        this.state = 56;
        this._errHandler.sync(this);
        _alt = this._interp.adaptivePredict(this._input, 5, this._ctx);
      }
    } catch (error) {
      if (error instanceof antlr4.error.RecognitionException) {
        localctx.exception = error;
        this._errHandler.reportError(this, error);
        this._errHandler.recover(this, error);
      } else {
        throw error;
      }
    } finally {
      this.unrollRecursionContexts(_parentctx);
    }
    return localctx;
  }

  attrs() {
    let localctx = new AttrsContext(this, this._ctx, this.state);
    this.enterRule(localctx, 4, CmdbDSLParser.RULE_attrs);
    try {
      this.enterOuterAlt(localctx, 1);
      this.state = 61;
      this._errHandler.sync(this);
      var _alt = this._interp.adaptivePredict(this._input, 6, this._ctx);
      while (_alt != 2 && _alt != antlr4.atn.ATN.INVALID_ALT_NUMBER) {
        if (_alt === 1) {
          this.state = 57;
          this.match(CmdbDSLParser.ATTR);
          this.state = 58;
          this.match(CmdbDSLParser.T__0);
        }
        this.state = 63;
        this._errHandler.sync(this);
        _alt = this._interp.adaptivePredict(this._input, 6, this._ctx);
      }

      this.state = 64;
      this.match(CmdbDSLParser.ATTR);
    } catch (re) {
      if (re instanceof antlr4.error.RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  logicalOperator() {
    let localctx = new LogicalOperatorContext(this, this._ctx, this.state);
    this.enterRule(localctx, 6, CmdbDSLParser.RULE_logicalOperator);
    var _la = 0;
    try {
      this.enterOuterAlt(localctx, 1);
      this.state = 66;
      _la = this._input.LA(1);
      if (!(_la === 7 || _la === 8)) {
        this._errHandler.recoverInline(this);
      } else {
        this._errHandler.reportMatch(this);
        this.consume();
      }
    } catch (re) {
      if (re instanceof antlr4.error.RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  comparisonOperator() {
    let localctx = new ComparisonOperatorContext(this, this._ctx, this.state);
    this.enterRule(localctx, 8, CmdbDSLParser.RULE_comparisonOperator);
    var _la = 0;
    try {
      this.enterOuterAlt(localctx, 1);
      this.state = 68;
      _la = this._input.LA(1);
      if (!((_la & ~0x1f) === 0 && ((1 << _la) & 8142336) !== 0)) {
        this._errHandler.recoverInline(this);
      } else {
        this._errHandler.reportMatch(this);
        this.consume();
      }
    } catch (re) {
      if (re instanceof antlr4.error.RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  calculateOperator() {
    let localctx = new CalculateOperatorContext(this, this._ctx, this.state);
    this.enterRule(localctx, 10, CmdbDSLParser.RULE_calculateOperator);
    var _la = 0;
    try {
      this.enterOuterAlt(localctx, 1);
      this.state = 70;
      _la = this._input.LA(1);
      if (!((_la & ~0x1f) === 0 && ((1 << _la) & 245760) !== 0)) {
        this._errHandler.recoverInline(this);
      } else {
        this._errHandler.reportMatch(this);
        this.consume();
      }
    } catch (re) {
      if (re instanceof antlr4.error.RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
}

CmdbDSLParser.EOF = antlr4.Token.EOF;
CmdbDSLParser.T__0 = 1;
CmdbDSLParser.NUMBER_ARRAY = 2;
CmdbDSLParser.STRING_ARRAY = 3;
CmdbDSLParser.NUMBER = 4;
CmdbDSLParser.BRACKET_LEFT = 5;
CmdbDSLParser.BRACKET_RIGHT = 6;
CmdbDSLParser.AND = 7;
CmdbDSLParser.OR = 8;
CmdbDSLParser.EQ = 9;
CmdbDSLParser.GT = 10;
CmdbDSLParser.LT = 11;
CmdbDSLParser.LE = 12;
CmdbDSLParser.GE = 13;
CmdbDSLParser.PLUS = 14;
CmdbDSLParser.SUBTRACT = 15;
CmdbDSLParser.MULTIPLY = 16;
CmdbDSLParser.DIVIDE = 17;
CmdbDSLParser.NOTEQ = 18;
CmdbDSLParser.NOTLIKE = 19;
CmdbDSLParser.LIKE = 20;
CmdbDSLParser.INCLUDE = 21;
CmdbDSLParser.EXCLUDE = 22;
CmdbDSLParser.ATTR = 23;
CmdbDSLParser.STRING = 24;
CmdbDSLParser.WHITESPACE = 25;

CmdbDSLParser.RULE_calculateExpressions = 0;
CmdbDSLParser.RULE_expressions = 1;
CmdbDSLParser.RULE_attrs = 2;
CmdbDSLParser.RULE_logicalOperator = 3;
CmdbDSLParser.RULE_comparisonOperator = 4;
CmdbDSLParser.RULE_calculateOperator = 5;

class CalculateExpressionsContext extends antlr4.ParserRuleContext {
  constructor(parser, parent, invokingState) {
    if (parent === undefined) {
      parent = null;
    }
    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }
    super(parent, invokingState);
    this.parser = parser;
    this.ruleIndex = CmdbDSLParser.RULE_calculateExpressions;
    this.op = null;
  }

  attrs() {
    return this.getTypedRuleContext(AttrsContext, 0);
  }

  NUMBER() {
    return this.getToken(CmdbDSLParser.NUMBER, 0);
  }

  BRACKET_LEFT() {
    return this.getToken(CmdbDSLParser.BRACKET_LEFT, 0);
  }

  calculateExpressions = function(i) {
    if (i === undefined) {
      i = null;
    }
    if (i === null) {
      return this.getTypedRuleContexts(CalculateExpressionsContext);
    } else {
      return this.getTypedRuleContext(CalculateExpressionsContext, i);
    }
  };

  BRACKET_RIGHT() {
    return this.getToken(CmdbDSLParser.BRACKET_RIGHT, 0);
  }

  MULTIPLY() {
    return this.getToken(CmdbDSLParser.MULTIPLY, 0);
  }

  DIVIDE() {
    return this.getToken(CmdbDSLParser.DIVIDE, 0);
  }

  PLUS() {
    return this.getToken(CmdbDSLParser.PLUS, 0);
  }

  SUBTRACT() {
    return this.getToken(CmdbDSLParser.SUBTRACT, 0);
  }

  enterRule(listener) {
    if (listener instanceof CmdbDSLListener) {
      listener.enterCalculateExpressions(this);
    }
  }

  exitRule(listener) {
    if (listener instanceof CmdbDSLListener) {
      listener.exitCalculateExpressions(this);
    }
  }

  accept(visitor) {
    if (visitor instanceof CmdbDSLVisitor) {
      return visitor.visitCalculateExpressions(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

class ExpressionsContext extends antlr4.ParserRuleContext {
  constructor(parser, parent, invokingState) {
    if (parent === undefined) {
      parent = null;
    }
    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }
    super(parent, invokingState);
    this.parser = parser;
    this.ruleIndex = CmdbDSLParser.RULE_expressions;
  }

  copyFrom(ctx) {
    super.copyFrom(ctx);
  }
}

class ExpressionJoinContext extends ExpressionsContext {
  constructor(parser, ctx) {
    super(parser);
    super.copyFrom(ctx);
  }

  expressions = function(i) {
    if (i === undefined) {
      i = null;
    }
    if (i === null) {
      return this.getTypedRuleContexts(ExpressionsContext);
    } else {
      return this.getTypedRuleContext(ExpressionsContext, i);
    }
  };

  logicalOperator() {
    return this.getTypedRuleContext(LogicalOperatorContext, 0);
  }

  enterRule(listener) {
    if (listener instanceof CmdbDSLListener) {
      listener.enterExpressionJoin(this);
    }
  }

  exitRule(listener) {
    if (listener instanceof CmdbDSLListener) {
      listener.exitExpressionJoin(this);
    }
  }

  accept(visitor) {
    if (visitor instanceof CmdbDSLVisitor) {
      return visitor.visitExpressionJoin(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

CmdbDSLParser.ExpressionJoinContext = ExpressionJoinContext;

class ExpressionContext extends ExpressionsContext {
  constructor(parser, ctx) {
    super(parser);
    super.copyFrom(ctx);
  }

  attrs() {
    return this.getTypedRuleContext(AttrsContext, 0);
  }

  comparisonOperator() {
    return this.getTypedRuleContext(ComparisonOperatorContext, 0);
  }

  STRING() {
    return this.getToken(CmdbDSLParser.STRING, 0);
  }

  NUMBER() {
    return this.getToken(CmdbDSLParser.NUMBER, 0);
  }

  NUMBER_ARRAY() {
    return this.getToken(CmdbDSLParser.NUMBER_ARRAY, 0);
  }

  STRING_ARRAY() {
    return this.getToken(CmdbDSLParser.STRING_ARRAY, 0);
  }

  calculateExpressions() {
    return this.getTypedRuleContext(CalculateExpressionsContext, 0);
  }

  enterRule(listener) {
    if (listener instanceof CmdbDSLListener) {
      listener.enterExpression(this);
    }
  }

  exitRule(listener) {
    if (listener instanceof CmdbDSLListener) {
      listener.exitExpression(this);
    }
  }

  accept(visitor) {
    if (visitor instanceof CmdbDSLVisitor) {
      return visitor.visitExpression(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

CmdbDSLParser.ExpressionContext = ExpressionContext;

class ExpressionGroupContext extends ExpressionsContext {
  constructor(parser, ctx) {
    super(parser);
    super.copyFrom(ctx);
  }

  BRACKET_LEFT() {
    return this.getToken(CmdbDSLParser.BRACKET_LEFT, 0);
  }

  expressions() {
    return this.getTypedRuleContext(ExpressionsContext, 0);
  }

  BRACKET_RIGHT() {
    return this.getToken(CmdbDSLParser.BRACKET_RIGHT, 0);
  }

  enterRule(listener) {
    if (listener instanceof CmdbDSLListener) {
      listener.enterExpressionGroup(this);
    }
  }

  exitRule(listener) {
    if (listener instanceof CmdbDSLListener) {
      listener.exitExpressionGroup(this);
    }
  }

  accept(visitor) {
    if (visitor instanceof CmdbDSLVisitor) {
      return visitor.visitExpressionGroup(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

CmdbDSLParser.ExpressionGroupContext = ExpressionGroupContext;

class AttrsContext extends antlr4.ParserRuleContext {
  constructor(parser, parent, invokingState) {
    if (parent === undefined) {
      parent = null;
    }
    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }
    super(parent, invokingState);
    this.parser = parser;
    this.ruleIndex = CmdbDSLParser.RULE_attrs;
  }

  ATTR = function(i) {
    if (i === undefined) {
      i = null;
    }
    if (i === null) {
      return this.getTokens(CmdbDSLParser.ATTR);
    } else {
      return this.getToken(CmdbDSLParser.ATTR, i);
    }
  };

  enterRule(listener) {
    if (listener instanceof CmdbDSLListener) {
      listener.enterAttrs(this);
    }
  }

  exitRule(listener) {
    if (listener instanceof CmdbDSLListener) {
      listener.exitAttrs(this);
    }
  }

  accept(visitor) {
    if (visitor instanceof CmdbDSLVisitor) {
      return visitor.visitAttrs(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

class LogicalOperatorContext extends antlr4.ParserRuleContext {
  constructor(parser, parent, invokingState) {
    if (parent === undefined) {
      parent = null;
    }
    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }
    super(parent, invokingState);
    this.parser = parser;
    this.ruleIndex = CmdbDSLParser.RULE_logicalOperator;
  }

  AND() {
    return this.getToken(CmdbDSLParser.AND, 0);
  }

  OR() {
    return this.getToken(CmdbDSLParser.OR, 0);
  }

  enterRule(listener) {
    if (listener instanceof CmdbDSLListener) {
      listener.enterLogicalOperator(this);
    }
  }

  exitRule(listener) {
    if (listener instanceof CmdbDSLListener) {
      listener.exitLogicalOperator(this);
    }
  }

  accept(visitor) {
    if (visitor instanceof CmdbDSLVisitor) {
      return visitor.visitLogicalOperator(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

class ComparisonOperatorContext extends antlr4.ParserRuleContext {
  constructor(parser, parent, invokingState) {
    if (parent === undefined) {
      parent = null;
    }
    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }
    super(parent, invokingState);
    this.parser = parser;
    this.ruleIndex = CmdbDSLParser.RULE_comparisonOperator;
  }

  EQ() {
    return this.getToken(CmdbDSLParser.EQ, 0);
  }

  GT() {
    return this.getToken(CmdbDSLParser.GT, 0);
  }

  LT() {
    return this.getToken(CmdbDSLParser.LT, 0);
  }

  LE() {
    return this.getToken(CmdbDSLParser.LE, 0);
  }

  GE() {
    return this.getToken(CmdbDSLParser.GE, 0);
  }

  NOTEQ() {
    return this.getToken(CmdbDSLParser.NOTEQ, 0);
  }

  INCLUDE() {
    return this.getToken(CmdbDSLParser.INCLUDE, 0);
  }

  EXCLUDE() {
    return this.getToken(CmdbDSLParser.EXCLUDE, 0);
  }

  LIKE() {
    return this.getToken(CmdbDSLParser.LIKE, 0);
  }

  NOTLIKE() {
    return this.getToken(CmdbDSLParser.NOTLIKE, 0);
  }

  enterRule(listener) {
    if (listener instanceof CmdbDSLListener) {
      listener.enterComparisonOperator(this);
    }
  }

  exitRule(listener) {
    if (listener instanceof CmdbDSLListener) {
      listener.exitComparisonOperator(this);
    }
  }

  accept(visitor) {
    if (visitor instanceof CmdbDSLVisitor) {
      return visitor.visitComparisonOperator(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

class CalculateOperatorContext extends antlr4.ParserRuleContext {
  constructor(parser, parent, invokingState) {
    if (parent === undefined) {
      parent = null;
    }
    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }
    super(parent, invokingState);
    this.parser = parser;
    this.ruleIndex = CmdbDSLParser.RULE_calculateOperator;
  }

  PLUS() {
    return this.getToken(CmdbDSLParser.PLUS, 0);
  }

  SUBTRACT() {
    return this.getToken(CmdbDSLParser.SUBTRACT, 0);
  }

  MULTIPLY() {
    return this.getToken(CmdbDSLParser.MULTIPLY, 0);
  }

  DIVIDE() {
    return this.getToken(CmdbDSLParser.DIVIDE, 0);
  }

  enterRule(listener) {
    if (listener instanceof CmdbDSLListener) {
      listener.enterCalculateOperator(this);
    }
  }

  exitRule(listener) {
    if (listener instanceof CmdbDSLListener) {
      listener.exitCalculateOperator(this);
    }
  }

  accept(visitor) {
    if (visitor instanceof CmdbDSLVisitor) {
      return visitor.visitCalculateOperator(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

CmdbDSLParser.CalculateExpressionsContext = CalculateExpressionsContext;
CmdbDSLParser.ExpressionsContext = ExpressionsContext;
CmdbDSLParser.AttrsContext = AttrsContext;
CmdbDSLParser.LogicalOperatorContext = LogicalOperatorContext;
CmdbDSLParser.ComparisonOperatorContext = ComparisonOperatorContext;
CmdbDSLParser.CalculateOperatorContext = CalculateOperatorContext;
