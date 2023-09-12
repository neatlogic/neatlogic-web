import antlr4 from 'antlr4';
class ErrorListener extends antlr4.error.ErrorListener {
  syntaxError(recognizer, offendingSymbol, line, column, msg, e) {
    throw new Error(`语法错误：${column} ${msg}`);
  }
}
export default ErrorListener;
