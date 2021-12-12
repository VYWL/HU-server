#!/bin/bash

command="iptables-restore"
rule_file="iptables.rules"
status=0

# iptable 명령어 확인
check() {
        echo "Check Command $1"
        which $1

        if [ $? -ne 0 ]; then
         status=1
        fi
}

# rule 적용
apply() {
        echo "Apply Iptables Rule"
        $1 < $2

        if [ $? -ne 0 ]; then
         status=1
        fi
}

check $command

apply $command $rule_file

exit $status