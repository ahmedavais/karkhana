import { builtinRules } from 'eslint/use-at-your-own-risk';

const coreRule = builtinRules.get('max-lines-per-function');

function isDescribeCallback(node) {
  const call = node.parent;
  return call.type === 'CallExpression' && call.callee.name === 'describe' && call.arguments.includes(node);
}

function describeLimit(context) {
  return coreRule.create(
    Object.create(context, {
      options: { value: [{ max: 100 }] },
      report: {
        value: ({ node, data }) => {
          if (isDescribeCallback(node)) context.report({ node, messageId: 'describeTooLong', data });
        },
      },
    }),
  );
}

export const maxLinesPerFunction = {
  meta: {
    type: 'suggestion',
    messages: {
      describeTooLong:
        'describe has too many lines ({{lineCount}}). Maximum allowed is {{maxLines}}: does the module under test do more than one thing?',
    },
    schema: [],
  },
  create: describeLimit,
};
