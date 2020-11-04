/* Private typedef -----------------------------------------------------------*/

const TOKENIZER_ERROR = "Error";
const TOKENIZER_ENDOFINPUT = "End of input";
const TOKENIZER_NUMBER = "number";
const TOKENIZER_PLUS = "+";
const TOKENIZER_MINUS = "-";
const TOKENIZER_ASTR = "*";
const TOKENIZER_SLASH = "/";
const TOKENIZER_LPAREN = "(";
const TOKENIZER_RPAREN = ")";

//  错误代码
const no_error = "no error";
const syntax_error = "syntax error";

// 错误代码与对应的消息
enum error_table_t {
  error_code = "",
  message = "",
}

/* Private define ------------------------------------------------------------*/
let EXPR_LEN: number = 512; // 允许表达式长度
let MAX_NUM_LEN = 5; // 运算数长度

// 按键
const KEY_BACKSPACE = 8;
const KEY_DEL = 127;
const KEY_ENTER = 13;
const KEY_ESC = 27;
const KEY_EQUAL = 61;

/* Private variables ---------------------------------------------------------*/
let curr_char: string | number = 0; // 表达式中当前分析到的字符
let next_char: number = 0; // 表达式中下一个字符
let current_token = TOKENIZER_ERROR;
let error_code = no_error;

// 错误表
const error_table = [
  { error_code: no_error, message: "no error" },
  { error_code: syntax_error, message: "syntax error!" },
];

/**
 * @brief  获取表达式输入, 只接收数字与加减乘除运算符与括号
 * @param  buf 用于存储表达式的缓存
 * @return 接收的字符数
 */
function get_input(buf: number | any) {
  let i = 0;
  let ch;

  while (i < EXPR_LEN) {
    // ch = getch();
    // 只接收数字与运算符, 括号
    if (ch >= "(" && ch <= "9" && ch != "," && ch != ".") {
      buf = ch;
      // putchar(*buf);
      console.log("%c", buf);
      buf++;
      i++;
    }
    // 处理退格
    else if (ch == KEY_BACKSPACE || ch == KEY_DEL) {
      if (i != 0) {
        console.log("\b \b");
        i--;
        buf--;
      }
    } else if (ch == KEY_ESC) return;
    // 回车, 输入完毕
    else if (ch == KEY_ENTER || ch == KEY_EQUAL) break;
  }
  buf = "\0";

  return i;
}

/**
 * @brief  获取单字符token类型
 *
 * @return token类型
 */
function siglechar() {
  switch (curr_char) {
    case "+":
      return TOKENIZER_PLUS;
    case "-":
      return TOKENIZER_MINUS;
    case "*":
      return TOKENIZER_ASTR;
    case "/":
      return TOKENIZER_SLASH;
    case "(":
      return TOKENIZER_LPAREN;
    case ")":
      return TOKENIZER_RPAREN;
    default:
      break;
  }

  return TOKENIZER_ERROR;
}

/**
 * @brief  获取一个token
 *
 * @return token类型
 */
function get_next_token() {
  let i;

  // 表达式结束
  if (curr_char == "\0") return TOKENIZER_ENDOFINPUT;
  if (Number.isSafeInteger(curr_char)) {
    // 不可超过允许数字长度
    for (i = 0; i <= MAX_NUM_LEN; i++) {
      // 数字结束
      if (!Number.isSafeInteger(Number(curr_char) + i)) {
        next_char = Number(curr_char) + i;
        return TOKENIZER_NUMBER;
      }
    }
  }
  // 分界符
  else if (siglechar()) {
    next_char++;
    return siglechar();
  }

  return TOKENIZER_ERROR;
}

function tokenizer_finished() {
  return curr_char == "\0" || current_token == TOKENIZER_ENDOFINPUT;
}

/**
 * @brief  错误处理
 *
 * @param  err 错误类型
 */
function error(err: string) {
  error_code = err;
  return;
}

/**
 * @brief  解析下一个token
 */
function tokenizer_next() {
  if (tokenizer_finished()) return;
  curr_char = next_char;
  current_token = get_next_token();

  return;
}

/**
 * @brief  得到当前token
 */
function tokenizer_token() {
  return current_token;
}

/**
 * @brief  将ASCII形式的数字转为数值
 */
function tokenizer_num() {
  return Number(curr_char);
}

/**
 * @brief  匹配token
 */
function accept(token: string) {
  if (token != tokenizer_token()) error(syntax_error);
  tokenizer_next();
}

/**
 * @brief  取得当前因子的值, 若当前因子(类似上式中的M)是一个表达式, 进行递归求值
 */
function factor(): any {
  let r;

  // 当前token的类型
  switch (tokenizer_token()) {
    // 数字(终结符)
    case TOKENIZER_NUMBER:
      // 将其由ASCII转为数字值
      r = tokenizer_num();
      // 根据语法规则匹配当前token
      accept(TOKENIZER_NUMBER);
      break;
    // 左括号
    case TOKENIZER_LPAREN:
      accept(TOKENIZER_LPAREN);
      // 将括号里的值当作一个新的表达式, 递归计算(递归是从函数expr()开始的)
      r = expr();
      // 当括号里的表达式处理完毕后下一个token一定是右括号
      accept(TOKENIZER_RPAREN);
      break;
    // 除左括号和数字之外的其它token已经被上一级处理掉了
    // 若有其token, 一定是表达式语法错误
    default:
      error(syntax_error);
  }

  // 返回因子的值
  return r;
}

/**
 * @brief  求第二级优先级(乘除)表达式的值
 */
function term() {
  let f1, f2;
  let op;

  // 获取左操作数(因子)
  f1 = factor();
  // 获取操作符
  op = tokenizer_token();

  // 操作符只能是乘或者除(同一优先级)
  while (op == TOKENIZER_ASTR || op == TOKENIZER_SLASH) {
    // 下一个token
    tokenizer_next();
    // 获取右操作数(因子)
    f2 = factor();
    switch (op) {
      case TOKENIZER_ASTR:
        f1 = f1 * f2;
        break;
      case TOKENIZER_SLASH:
        f1 = f1 / f2;
        break;
    }
    // 上面计算完毕的这个值将做为左操作数
    op = tokenizer_token();
  }

  return f1;
}

/**
 * @brief  求第一级优先级(加减)表达式的值
 */
function expr() {
  let t1,
    t2 = 0;
  let op;

  // 第一个操作数
  t1 = term();
  // 获取运算符
  op = tokenizer_token();

  // 操作符只能是加或者减(同一优先级)
  while (op == TOKENIZER_PLUS || op == TOKENIZER_MINUS) {
    // 下一个token
    tokenizer_next();
    // 第二个操作数
    t2 = term();
    switch (op) {
      case TOKENIZER_PLUS:
        t1 = t1 + t2;
        break;
      case TOKENIZER_MINUS:
        t1 = t1 - t2;
        break;
    }
    op = tokenizer_token();
  }

  return t1;
}

/**
 * @brief  词法分析器初始化
 *
 * @param  expr 输入的表达式字符串
 */
function tokenizer_init(expr: any) {
  curr_char = next_char = expr;
  current_token = get_next_token();
  return;
}

function main() {
  let i;
  let e: any[] = [];
  let r;

  while (1) {
    console.log("\n>>> ");

    i = get_input(e);

    // 如果未输入任何字符, 则不进入接下来的处理流程
    if (i == 0) continue;

    tokenizer_init(e);

    r = expr();

    if (error_code != no_error) {
      // 查找错误代码并打印对应消息
      for (let i = 0; i < error_table.length; i++) {
        if (error_table[i].error_code == error_code)
          console.log("\n%s\n", error_table[i].message);
      }
      error_code = no_error;
      continue;
    }

    console.log("=%d", r);
  }

  return 0;
}
