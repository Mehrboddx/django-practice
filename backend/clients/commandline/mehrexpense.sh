#!/bin/bash
source config.sh
# Usage: mehrexpense.sh AMOUNT CATEGORY [DESCRIPTION]
curl --data amount=$1\&text=$2\&token=$TOKEN $BASE_URL/submit/expense/
  