import CmdbDslLexer from '@/resources/plugins/DslEditor/parser/CmdbDSLLexer.js';
class ErrorLexer extends CmdbDslLexer {
  constructor(input) {
    super(input);
    this.errors = [];
  }
  //覆盖CmdbDslLexter，在分析语法时遇到错误直接抛出异常，不要继续解析
  recover(re) {
    /*this.errors.push({
      line: this._tokenStartLine,
      column: this._tokenStartColumn,
      msg: `token recognition error at: '${this.text}'`,
      type: 'TokenRecognitionError'
    });*/
    throw new Error(`token recognition error at: '${this.text}'`);
    //super.recover(re);
  }

  getAllErrors() {
    return this.errors;
  }
}
export default ErrorLexer;
