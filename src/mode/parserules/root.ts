import { StringStream } from 'codemirror';
import { TW5ModeState } from '../tw5';
import { ParseRule, ParametersRules, BlockRules } from './rules';
import ParagraphRule, { ParagraphRuleOption } from './blocks/paragraph';
import { matchRule } from '../utils';

interface RootRuleContext {
  parseParams: boolean;
  parsedWhitespace: boolean;
}

function init(options: Record<string, unknown>): RootRuleContext {
  return {
    parseParams: options.parseParams === true,
    parsedWhitespace: false,
  };
}

function parse(stream: StringStream, modeState: TW5ModeState, context: RootRuleContext): void {
  // Skip whitespace
  context.parsedWhitespace = !context.parsedWhitespace;
  if (context.parsedWhitespace) {
    modeState.skipWhitespace(false);
    return;
  }
  // Parse paramsters or blocks
  if (context.parseParams) {
    /* Parameter Rules Part */
    // Check if we've arrived at a pragma rule match
    const rule = matchRule(ParametersRules as ParseRule[], stream);
    // If not, just exit
    if (rule === undefined) {
      context.parseParams = false;
      return;
    }
    // Process the pragma rule
    modeState.push(rule);
  } else {
    /* Block Rules Part */
    // Look for a block rule that applies at the current position
    const rule = matchRule(BlockRules as ParseRule[], stream);
    // If not, just exit
    if (rule !== undefined) {
      modeState.push(rule);
    } else {
      // Treat it as a paragraph if we didn't find a block rule
      modeState.push<ParagraphRuleOption>(ParagraphRule);
    }
  }
}

const RootRule: ParseRule<RootRuleContext> = {
  init,
  name: 'Root',
  test: '',
  parse,
};

export default RootRule;
