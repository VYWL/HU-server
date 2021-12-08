#!/bin/bash

# check privelige
if [ "$EUID" -ne 0 ]
	then echo "root 권한으로 스크립트를 실행하여 주십시오."
	exit
fi

FILENAME="U-09"
TITLE="U-09(상) /etc/hosts 파일 소유자 및 권한 설정"
REF="주요 정보통신 기반 시설 취약점 분석, 평가기준"

RESULT=true
CF=$FILENAME.json

echo "************************** 취약점 체크 시작 **************************" 
echo "{" > $CF 2>&1
echo '	"title" : "'$TITLE'",' >> $CF 2>&1
echo '	"ref" : "'$REF'",' >> $CF 2>&1
echo '	"detail" : ['  >> $CF 2>&1

SP=`ls -l /etc/hosts | awk {'print $1'}`
SO=`ls -l /etc/hosts | awk {'print $3'}`

if [ $SP = -rw------- ]
	then
		echo '		"[안전] /etc/hosts 권한   : '$SP'",' >> $CF 2>&1
	else
		RESULT=false
		echo '		"[취약] /etc/hosts 권한   : '$SP'",' >> $CF 2>&1
fi

if [ $SO = root ]
	then
		echo '		"[안전] /etc/hosts 소유자   : '$SO'"' >> $CF 2>&1
	else
		RESULT=false
		echo '		"[취약] /etc/hosts 소유자   : '$SO'"' >> $CF 2>&1
fi

echo '		],'  >> $CF 2>&1
echo '	"result" : ' $RESULT, >> $CF 2>&1
echo '	"timestamp" : "'`date "+%Y-%m-%d %H:%M:%S"`'"' >> $CF 2>&1
echo '}' >> $CF 2>&1
echo "************************** 취약점 체크 종료 **************************" 