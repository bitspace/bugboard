#!/bin/bash
cd "$(dirname "$0")/../db" || exit 1
dolt sql-server --port 3306
