/*
Copyright 2025 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOU WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runCodeInSandbox } from '../../lib/code-execution.js';

test('runCodeInSandbox should call fetch with the correct arguments', async (t) => {
  const fetch = t.mock.fn(async (url, options) => {
    return {
      ok: true,
      text: async () => 'sandbox output',
    };
  });

  global.fetch = fetch;

  const code = 'print("hello")';
  const url = 'http://sandbox.example.com';
  const result = await runCodeInSandbox(code, url);

  assert.strictEqual(result, 'sandbox output');
  assert.strictEqual(fetch.mock.calls.length, 1);
  assert.strictEqual(fetch.mock.calls[0].arguments[0], `${url}/execute`);
  assert.deepStrictEqual(fetch.mock.calls[0].arguments[1], {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: code,
  });
});
