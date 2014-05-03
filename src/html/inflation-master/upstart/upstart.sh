#!/bin/bash

pushd `dirname $0`
cd "$(git rev-parse --show-toplevel)"
mkdir -p /var/log/inflation

echo "starting @ `date`"

# node
NODE_ENV=production
supervisor web/app.js 2>> /var/log/inflation/node.err.log 1>> /var/log/inflation/node.out.log &

for job in `jobs -p`
do
echo $job
  wait $job
done

popd
