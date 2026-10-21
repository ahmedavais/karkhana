A `describe` block over 100 lines points at the module under test, not at the test file. Each test inside may be short and focused; the block is long because the module has many behaviors, and that often means it has more than one responsibility.

Do not shorten the block to get under the limit. Splitting it into two `describe`s, moving tests to another file, or squeezing several assertions into one test hides the signal and leaves the module as it was.

Look at the module instead:

- Name the behaviors the tests cover, one short phrase each, and group them by the concept they belong to.
- If the groups are separate concepts (for example, parsing input, applying rules and formatting output), the module likely holds more than one responsibility. Propose extracting a concept into its own module, with its tests moving to that module's own test file. Ask before reshaping an interface other code depends on.
- If every group is the same concept tested through many cases, look for repeated test shapes that a table of cases would express more clearly.
- If it is truly one cohesive responsibility with many behaviors, say so and explain why, rather than restructuring for the limit.

Nested `describe`s by concept are a good way to see the seams, but they don't shorten the outer block: the fix is in the module.
