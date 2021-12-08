#!/bin/bash

# check privelige
if [ "$EUID" -ne 0 ]
	then echo "root 권한으로 스크립트를 실행하여 주십시오."
	exit
fi

FILENAME="U-31"
TITLE="U-31(상) 스팸 메일 릴레이 제한"
REF="주요 정보통신 기반 시설 취약점 분석, 평가기준"

RESULT=true
CF=$FILENAME.json

echo "************************** 취약점 체크 시작 **************************" 
echo "{" > $CF 2>&1
echo '	"title" : "'$TITLE'",' >> $CF 2>&1
echo '	"ref" : "'$REF'",' >> $CF 2>&1
echo '	"detail" : ['  >> $CF 2>&1

if [ -n "`ps -ef | grep sendmail | grep -v "grep"`" ]
	then
		if [ -n "`cat /etc/mail/sendmail.cf | grep "R$\*" | grep "Relaying denied"`" ]
			then
				echo '		"[안전] SMTP 서비스를 사용하며, 릴레이 제한이 설정되어 있습니다."' >> $CF 2>&1
			else
				RESULT=false
				echo '		"[취약] SMTP 서비스를 사용하며, 릴레이 제한이 설정되어 있지 않습니다."' >> $CF 2>&1
		fi
	else
		echo '		"[안전] SMTP 서비스가 활성화 되어 있지 않습니다."' >> $CF 2>&1
fi

echo '		],'  >> $CF 2>&1
echo '	"result" : ' $RESULT, >> $CF 2>&1
echo '	"timestamp" : "'`date "+%Y-%m-%d %H:%M:%S"`'"' >> $CF 2>&1
echo '}' >> $CF 2>&1
echo "************************** 취약점 체크 종료 **************************" 