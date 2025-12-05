#!/bin/bash
source config.sh
# Usage: mehrexpense.sh AMOUNT CATEGORY [DESCRIPTION]
curl --data token=$TOKEN $BASE_URL/submit/q/general_stats/
  