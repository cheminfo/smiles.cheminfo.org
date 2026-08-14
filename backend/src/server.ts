import { stdout } from 'node:process';

import { buildApp } from './app.ts';
import { config } from './config.ts';

const fastify = await buildApp({ logger: true });

const address = await fastify.listen({ port: config.port, host: '0.0.0.0' });
stdout.write(`SMILES service listening at ${address}\n`);
