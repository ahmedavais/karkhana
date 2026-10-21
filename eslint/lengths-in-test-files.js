import { builtinRules } from 'eslint/use-at-your-own-risk';

const coreRule = builtinRules.get('max-lines-per-function');

function namesIn(callee) {
  if (callee.type === 'MemberExpression') return [...namesIn(callee.object), callee.property.name];
  if (callee.type === 'CallExpression') return namesIn(callee.callee);
  if (callee.type === 'TaggedTemplateExpression') return namesIn(callee.tag);
  return [callee.name];
}

function isDescribeCallback(node) {
  const call = node.parent;
  return call.type === 'CallExpression' && namesIn(call.callee).includes('describe') && call.arguments.includes(node);
}

function coreRuleLimitedTo(max, context, report) {
  return coreRule.create(
    Object.create(context, {
      options: { value: [{ max }] },
      report: { value: report },
    }),
  );
}

export const maxLinesPerDescribe = {
  meta: {
    type: 'suggestion',
    messages: {
      describeTooLong:
        'describe has too many lines ({{lineCount}}). Maximum allowed is {{maxLines}}: does the module under test do more than one thing?',
    },
    schema: [],
  },
  create: (context) =>
    coreRuleLimitedTo(100, context, ({ node, data }) => {
      if (isDescribeCallback(node)) context.report({ node, messageId: 'describeTooLong', data });
    }),
};

export const maxLinesPerFunction = {
  meta: {
    type: 'suggestion',
    messages: coreRule.meta.messages,
    schema: [],
  },
  create: (context) =>
    coreRuleLimitedTo(30, context, (descriptor) => {
      if (!isDescribeCallback(descriptor.node)) context.report(descriptor);
    }),
};
