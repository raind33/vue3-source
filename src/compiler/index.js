import { generate } from "./generate";
import { htmlParser } from "./html-parser";

export function compileToFunction (template) {
  const ast = htmlParser(template)
  const code = generate(ast)

  const render = new Function(`with(this){return ${code}}`)
  console.log(render)
  return render
}