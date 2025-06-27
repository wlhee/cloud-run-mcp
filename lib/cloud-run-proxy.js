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

import { spawn } from 'child_process';

let proxyProcess = null;

async function isProxyComponentInstalled() {
  return new Promise((resolve) => {
    const gcloud = spawn('gcloud', ['components', 'list', '--format=value(id)']);
    let output = '';
    gcloud.stdout.on('data', (data) => {
      output += data.toString();
    });
    gcloud.on('close', (code) => {
      if (code === 0) {
        resolve(output.includes('cloud-run-proxy'));
      } else {
        resolve(false);
      }
    });
    gcloud.on('error', () => {
      resolve(false);
    });
  });
}

export async function startProxy(project, region, service, port) {
  if (proxyProcess) {
    throw new Error("A proxy is already running. Please stop it before starting a new one.");
  }

  const isInstalled = await isProxyComponentInstalled();
  if (!isInstalled) {
    throw new Error("The 'cloud-run-proxy' component is not installed. Please run 'gcloud components install cloud-run-proxy' and try again.");
  }

  return new Promise((resolve, reject) => {
    proxyProcess = spawn('gcloud', [
      'run',
      'services',
      'proxy',
      service,
      `--project=${project}`,
      `--region=${region}`,
      `--port=${port}`,
    ]);

    proxyProcess.stdout.on('data', (data) => {
      console.log(`Proxy stdout: ${data}`);
      if (data.toString().includes('Proxying to Cloud Run service')) {
        resolve(`Proxy for service ${service} started on port ${port}.`);
      }
    });

    proxyProcess.stderr.on('data', (data) => {
      console.error(`Proxy stderr: ${data}`);
    });

    proxyProcess.on('close', (code) => {
      proxyProcess = null;
      if (code !== 0) {
        // This will be caught by the 'error' event handler
      }
    });

    proxyProcess.on('error', (err) => {
      proxyProcess = null;
      reject(new Error(`Failed to start proxy: ${err.message}`));
    });
  });
}

export function stopProxy() {
  if (proxyProcess) {
    return new Promise((resolve) => {
      proxyProcess.on('close', () => {
        proxyProcess = null;
        resolve("Proxy stopped.");
      });
      proxyProcess.kill();
    });
  } else {
    return Promise.resolve("No proxy is currently running.");
  }
}
