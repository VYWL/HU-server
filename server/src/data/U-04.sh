#!/bin/bash

# check privelige
if [ "$EUID" -ne 0 ]
	then echo "root 권한으로 스크립트를 실행하여 주십시오."
	exit
fi

FILENAME="U-04"
TITLE="U-04(상) 패스워드 파일 보호"
REF="주요 정보통신 기반 시설 취약점 분석, 평가기준"

RESULT=true
CF=$FILENAME.json

echo "************************** 취약점 체크 시작 **************************" 
echo "{" > $CF 2>&1
echo '	"title" : "'$TITLE'",' >> $CF 2>&1
echo '	"ref" : "'$REF'",' >> $CF 2>&1
echo '	"detail" : ['  >> $CF 2>&1

if [ "`cat /etc/passwd | grep "root" | awk -F: '{print $2}' | sed -n '1p'`" = x ]
	then
		echo '		"[안전] Shadow 패스워드 시스템을 사용중입니다"' >> $CF 2>&1
	else
		RESULT=false
		echo '		"[취약] Passwd 패스워드 시스템을 사용중입니다."' >> $CF 2>&1		
fi

echo '		],'  >> $CF 2>&1
echo '	"result" : ' $RESULT, >> $CF 2>&1
echo '	"timestamp" : "'`date "+%Y-%m-%d %H:%M:%S"`'"' >> $CF 2>&1
echo '}' >> $CF 2>&1
echo "************************** 취약점 체크 종료 **************************" 