/*
Copyright 2025 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * Calls the code sandbox to execute Python code.
 * @param {string} code The Python code to execute.
 * @param {string} url The URL of the code sandbox.
 * @returns {Promise<string>} The result of the execution.
 */
export async function runCodeInSandbox(code, url) {
  const response = await fetch(`${url}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: code,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }

  return await response.text();
}
