#!/bin/bash

# check privelige
if [ "$EUID" -ne 0 ]
	then echo "root 권한으로 스크립트를 실행하여 주십시오."
	exit
fi

FILENAME="U-20"
TITLE="U-20(상) Anonymous FTP 비활성화"
REF="주요 정보통신 기반 시설 취약점 분석, 평가기준"

RESULT=true
CF=$FILENAME.json

echo "************************** 취약점 체크 시작 **************************" 
echo "{" > $CF 2>&1
echo '	"title" : "'$TITLE'",' >> $CF 2>&1
echo '	"ref" : "'$REF'",' >> $CF 2>&1
echo '	"detail" : ['  >> $CF 2>&1

if [ -e "/etc/vsftpd.conf" ]
	then	
		if [ "`cat /etc/vsftpd.conf | grep anonymous_enable | awk -F= '{print $2}'`" = NO ]
			then
				echo '		"[안전] FTP에 익명 접속이 불가능합니다."' >> $CF 2>&1
			else
				RESULT=false
				echo '		"[취약] FTP에 익명 접속이 가능합니다."' >> $CF 2>&1
		fi
	else
		echo '		"[안전] FTP 서비스가 활성화 되어 있지 않습니다."' >> $CF 2>&1
fi

echo '		],'  >> $CF 2>&1
echo '	"result" : ' $RESULT, >> $CF 2>&1
echo '	"timestamp" : "'`date "+%Y-%m-%d %H:%M:%S"`'"' >> $CF 2>&1
echo '}' >> $CF 2>&1
echo "************************** 취약점 체크 종료 **************************" 