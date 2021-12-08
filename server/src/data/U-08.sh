#!/bin/bash

# check privelige
if [ "$EUID" -ne 0 ]
	then echo "root 권한으로 스크립트를 실행하여 주십시오."
	exit
fi

FILENAME="U-08"
TITLE="U-08(상) /etc/shadow 파일 소유자 및 권한 설정"
REF="주요 정보통신 기반 시설 취약점 분석, 평가기준"

RESULT=true
CF=$FILENAME.json

echo "************************** 취약점 체크 시작 **************************" 
echo "{" > $CF 2>&1
echo '	"title" : "'$TITLE'",' >> $CF 2>&1
echo '	"ref" : "'$REF'",' >> $CF 2>&1
echo '	"detail" : ['  >> $CF 2>&1

SP=`ls -l /etc/shadow | awk {'print $1'}`
SO=`ls -l /etc/shadow | awk {'print $3'}`
SG=`ls -l /etc/shadow | awk {'print $4'}`

if [ $SP = -r-------- ]
	then
		echo '		"[안전] /etc/shadow 권한   : '$SP'",' >> $CF 2>&1
	else
		RESULT=false
		echo '		"[취약] /etc/shadow 권한   : '$SP'",' >> $CF 2>&1
fi

if [ $SO = root ]
	then
		echo '		"[안전] /etc/shadow 소유자   : '$SO'",' >> $CF 2>&1
	else
		RESULT=false
		echo '		"[취약] /etc/shadow 소유자   : '$SO'",' >> $CF 2>&1
fi

if [ $SG = shadow ]
	then
		echo '		"[안전] /etc/shadow 그룹   : '$SG'"' >> $CF 2>&1
	else
		RESULT=false	
		echo '		"[취약] /etc/shadow 그룹   : '$SG'"' >> $CF 2>&1
fi

echo '		],'  >> $CF 2>&1
echo '	"result" : ' $RESULT, >> $CF 2>&1
echo '	"timestamp" : "'`date "+%Y-%m-%d %H:%M:%S"`'"' >> $CF 2>&1
echo '}' >> $CF 2>&1
echo "************************** 취약점 체크 종료 **************************" 