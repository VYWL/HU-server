#!/bin/bash

# 

# check privelige
if [ "$EUID" -ne 0 ]
	then echo "root 권한으로 스크립트를 실행하여 주십시오."
	exit
fi

FILENAME="U-06"
TITLE="U-06(상) 파일 및 디렉터리 소유자 설정"
REF="주요 정보통신 기반 시설 취약점 분석, 평가기준"

RESULT=true
CF=$FILENAME.json

echo "************************** 취약점 체크 시작 **************************" 
echo "{" > $CF 2>&1
echo '	"title" : "'$TITLE'",' >> $CF 2>&1
echo '	"ref" : "'$REF'",' >> $CF 2>&1
echo '	"detail" : ['  >> $CF 2>&1

if [ "`find / \( -nouser -o -nogroup \) -xdev -ls 2>/dev/null | wc -l`" = 0 ]
	then
		echo '		"[안전] 소유자 혹은 그룹이 없는 파일 및 디렉터리가 존재하지 않습니다."' >> $CF 2>&1
	else
		RESULT=false
		echo '		"[취약] 소유자 혹은 그룹이 없는 파일 및 디렉터리가 존재합니다."' >> $CF 2>&1		
fi

echo '		],'  >> $CF 2>&1
echo '	"result" : ' $RESULT, >> $CF 2>&1
echo '	"timestamp" : "'`date "+%Y-%m-%d %H:%M:%S"`'"' >> $CF 2>&1
echo '}' >> $CF 2>&1
echo "************************** 취약점 체크 종료 **************************" 