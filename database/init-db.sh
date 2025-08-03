#!/bin/bash
cd /opt/database
/root/.bun/bin/bun install
/root/.bun/bin/bun drizzle-kit generate
/root/.bun/bin/bun drizzle-kit push
/root/.bun/bin/bun seed.ts