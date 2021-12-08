#!/bin/bash

# check privelige
if [ "$EUID" -ne 0 ]
	then echo "root 권한으로 스크립트를 실행하여 주십시오."
	exit
fi

FILENAME="U-07"
TITLE="U-07(상) /etc/passwd 파일 소유자 및 권한 설정"
REF="주요 정보통신 기반 시설 취약점 분석, 평가기준"

RESULT=true
CF=$FILENAME.json

echo "************************** 취약점 체크 시작 **************************" 
echo "{" > $CF 2>&1
echo '	"title" : "'$TITLE'",' >> $CF 2>&1
echo '	"ref" : "'$REF'",' >> $CF 2>&1
echo '	"detail" : ['  >> $CF 2>&1

PP=`ls -l /etc/passwd | awk {'print $1'}`
PO=`ls -l /etc/passwd | awk {'print $3'}`
PG=`ls -l /etc/passwd | awk {'print $4'}`

if [ $PP = -rw-r--r-- ]
	then
		echo '		"[안전] /etc/passwd 권한   : '$PP'",' >> $CF 2>&1
	else
		RESULT=false
		echo '		"[취약] /etc/passwd 권한   : '$PP'",' >> $CF 2>&1
fi

if [ $PO = root ]
	then
		echo '		"[안전] /etc/passwd 소유자   : '$PO'",' >> $CF 2>&1
	else
		RESULT=false
		echo '		"[취약] /etc/passwd 소유자   : '$PO'",' >> $CF 2>&1
fi

if [ $PG = root ]
	then
		echo '		"[안전] /etc/passwd 그룹   : '$PG'"' >> $CF 2>&1
	else
		RESULT=false	
		echo '		"[취약] /etc/passwd 그룹   : '$PG'"' >> $CF 2>&1
fi

echo '		],'  >> $CF 2>&1
echo '	"result" : ' $RESULT, >> $CF 2>&1
echo '	"timestamp" : "'`date "+%Y-%m-%d %H:%M:%S"`'"' >> $CF 2>&1
echo '}' >> $CF 2>&1
echo "************************** 취약점 체크 종료 **************************" 