/*
Copyright 2025 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { McpClient } from "@modelcontextprotocol/sdk/client/mcp.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";

async function runTest() {
  const project = process.env.GCLOUD_PROJECT;
  const service = 'cloud-run-mcp-test-service';
  const region = 'europe-west1';
  const port = 8081;

  if (!project) {
    console.error('GCLOUD_PROJECT environment variable not set.');
    process.exit(1);
  }

  const mcpProcess = spawn('node', ['mcp-server.js'], {
    env: { ...process.env, GCP_STDIO: 'true' },
  });

  const transport = new StdioClientTransport(mcpProcess);
  const client = new McpClient();
  await client.connect(transport);

  try {
    // Start the proxy
    const startResult = await client.tool('start_proxy', { project, service, region, port });
    console.log('Start proxy result:', startResult);

    // Stop the proxy
    const stopResult = await client.tool('stop_proxy', {});
    console.log('Stop proxy result:', stopResult);
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    mcpProcess.kill();
  }
}

runTest();
