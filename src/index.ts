const TOKENIZER_NUM = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
// 浮点数校验
const floatReg = /^([+]\d+[.]\d+|\d+[.]\d+|[+]\d+|\d+)$/i
const TOKENIZER_SYMBOL = ['+', '-', '*', '/', '(', ')', '.', '=']
const TOKENIZER_PLUS = '+'
const TOKENIZER_MINUS = '-'
const TOKENIZER_ASTR = '*'
const TOKENIZER_SLASH = '/'
const TOKENIZER_LPAREN = '('
const TOKENIZER_RPAREN = ')'
const TOKENIZER_DOT = '.'
const TOKENIZER_EQUALS = '='
const TOKENIZER_ENTER = 'Enter'

function validateInputValue(tokenizer: string, type: 'calc' | 'input') {
  if (TOKENIZER_NUM.includes(tokenizer)) {
    return tokenizer
  }
  return type === 'calc' && TOKENIZER_SYMBOL.includes(tokenizer) ? tokenizer : null
}

type options = {
  el: Element | string
  onChange: (value: number) => void
}

class Calculator {
  private el: Element | null
  private inputStack: Array<number | string> = []
  private calcFlag: boolean = false
  private onChangeCallback(value: number | string) {}

  constructor(options: options) {
    const { el } = options

    this.el = typeof el === 'string' ? document.querySelector(el) : el
    if (this.el === null) {
      console.warn('el is not Valid Element!')
      return
    }

    ;(this.el as HTMLElement).addEventListener('keydown', this.onChange)

    this.onChangeCallback = options.onChange
      ? options.onChange
      : (value: number) => {
          console.info(value)
        }
  }

  onChange(e: KeyboardEvent) {
    let result: number | string = 0
    if (e.key === TOKENIZER_EQUALS && !this.inputStack.length) {
      this.calcFlag = true
      this.inputStack.push(e.key)
    }

    if (!this.calcFlag) {
    } else {
    }

    let value = validateInputValue(e.key, this.calcFlag ? 'calc' : 'input')

    if (value !== null) {
      this.inputStack.push(value)
    }

    this.onChangeCallback(result)
  }
}

export default Calculator
