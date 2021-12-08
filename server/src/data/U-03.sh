#!/bin/bash

# check privelige
if [ "$EUID" -ne 0 ]
	then echo "root 권한으로 스크립트를 실행하여 주십시오."
	exit
fi

FILENAME="U-03"
TITLE="U-03(상) 계정 잠금 임계값 설정"
REF="주요 정보통신 기반 시설 취약점 분석, 평가기준"

RESULT=true
CF=$FILENAME.json

echo "************************** 취약점 체크 시작 **************************" 
echo "{" > $CF 2>&1
echo '	"title" : "'$TITLE'",' >> $CF 2>&1
echo '	"ref" : "'$REF'",' >> $CF 2>&1
echo '	"detail" : ['  >> $CF 2>&1

LOCK=`cat /etc/pam.d/common-auth | grep -E "deny=(-)?[0-9]*" | awk '{print $6}' | awk -F = '{print $2}'`

if [ $LOCK ]
	then
		if [ $LOCK -le 10 ]
			then
				echo '		"[안전] 계정 잠금 임계값이 10회 이하의 값으로 설정되어 있습니다."' >> $CF 2>&1
			else
				result=false
				echo '		"[취약] 계정 잠금 임계값이 10회 이상의 값으로 설정되어 있습니다."' >> $CF 2>&1		
		fi
	else
		RESULT=false
		echo '		"[취약] 계정 잠금 임계값이 설정되어 있지 않습니다."' >> $CF 2>&1		
fi

echo '		],'  >> $CF 2>&1
echo '	"result" : ' $RESULT, >> $CF 2>&1
echo '	"timestamp" : "'`date "+%Y-%m-%d %H:%M:%S"`'"' >> $CF 2>&1
echo '}' >> $CF 2>&1
echo "************************** 취약점 체크 종료 **************************" 