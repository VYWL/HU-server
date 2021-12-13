#!/bin/bash

# check privelige
if [ "$EUID" -ne 0 ]
	then echo "root 권한으로 스크립트를 실행하여 주십시오."
	exit
fi

FILENAME="U-21"
TITLE="U-21(상) r 계열 서비스 비활성화"
REF="주요 정보통신 기반 시설 취약점 분석, 평가기준"

RESULT=true
CF=$FILENAME.json

echo "************************** 취약점 체크 시작 **************************" 
echo "{" > $CF 2>&1
echo '	"title" : "'$TITLE'",' >> $CF 2>&1
echo '	"ref" : "'$REF'",' >> $CF 2>&1
echo '	"detail" : ['  >> $CF 2>&1

TMP="`systemctl list-units --type service --all | grep rlogin | awk '{print $3}'`"

if [ "$TMP" != "" ]
	then	
		if [ "$TMP" = "active" ]
			then
				echo '		"[안전] rlogin 서비스가 설치되어 있으나, 비활성화 되어 있습니다."' >> $CF 2>&1
			else
				RESULT=false
				echo '		"[취약] rlogin 서비스가 설치되어 있고, 활성화 되어 있습니다."' >> $CF 2>&1
		fi
	else
		echo '		"[안전] rlogin 서비스가 설치되어 있지 않습니다."' >> $CF 2>&1
fi

echo '		],'  >> $CF 2>&1
echo '	"result" : ' $RESULT, >> $CF 2>&1
echo '	"timestamp" : "'`date "+%Y-%m-%d %H:%M:%S"`'"' >> $CF 2>&1
echo '}' >> $CF 2>&1
echo "************************** 취약점 체크 종료 **************************" 