#!/bin/bash

# check privelige
if [ "$EUID" -ne 0 ]
	then echo "root 권한으로 스크립트를 실행하여 주십시오."
	exit
fi

FILENAME="U-12"
TITLE="U-12(상) /etc/services  파일 소유자 및 권한 설정"
REF="주요 정보통신 기반 시설 취약점 분석, 평가기준"

RESULT=true
CF=$FILENAME.json

echo "************************** 취약점 체크 시작 **************************" 
echo "{" > $CF 2>&1
echo '	"title" : "'$TITLE'",' >> $CF 2>&1
echo '	"ref" : "'$REF'",' >> $CF 2>&1
echo '	"detail" : ['  >> $CF 2>&1

SERVICE="/etc/services"

if [ -e SERVICE ]
	then
		IO=`ls -l $SERVICE | awk '{print $3}'`
		IP=`ls -l $SERVICE | awk '{print $1}'`

		if [ $IO = root ] || [ $IO = bin ] || [ $IO = sys ]
			then
				echo '		"[안전] /etc/services 파일 소유자 : '$IO'"' >> $CF 2>&1
			else
				RESULT=false
				echo '		"[취약] /etc/services 파일 소유자 : '$IO'"' >> $CF 2>&1
		fi

		if [ $IP = -rw------- ]
			then
				echo '		"[안전] /etc/services 파일 권한 : '$IP'"' >> $CF 2>&1
			else
				RESULT=false
				echo '		"[취약] /etc/services 파일 권한 : '$IP'"' >> $CF 2>&1
		fi
	else
		echo '		"[안전] /etc/services 파일이 존재하지 않습니다."' >> $CF 2>&1
fi

echo '		],'  >> $CF 2>&1
echo '	"result" : ' $RESULT, >> $CF 2>&1
echo '	"timestamp" : "'`date "+%Y-%m-%d %H:%M:%S"`'"' >> $CF 2>&1
echo '}' >> $CF 2>&1
echo "************************** 취약점 체크 종료 **************************" 