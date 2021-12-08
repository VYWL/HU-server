#!/bin/bash

# check privelige
if [ "$EUID" -ne 0 ]
	then echo "root 권한으로 스크립트를 실행하여 주십시오."
	exit
fi

FILENAME="U-23"
TITLE="U-23(상) DoS 공격에 취약한 서비스 비활성화"
REF="주요 정보통신 기반 시설 취약점 분석, 평가기준"

RESULT=true
CF=$FILENAME.json

echo "************************** 취약점 체크 시작 **************************" 
echo "{" > $CF 2>&1
echo '	"title" : "'$TITLE'",' >> $CF 2>&1
echo '	"ref" : "'$REF'",' >> $CF 2>&1
echo '	"detail" : ['  >> $CF 2>&1

ETMP="`systemctl list-units --type service --all | grep echo | awk '{print $3}'`"
DTMP="`systemctl list-units --type service --all | grep discard | awk '{print $3}'`"
TTMP="`systemctl list-units --type service --all | grep daytime | awk '{print $3}'`"
CTMP="`systemctl list-units --type service --all | grep chargen | awk '{print $3}'`"

if [ "$ETMP" != "" ]
	then	
		if [ "$ETMP" = "active" ]
			then
				echo '		"[안전] echo 서비스가 설치되어 있으나, 비활성화 되어 있습니다.",' >> $CF 2>&1
			else
				RESULT=false
				echo '		"[취약] echo 서비스가 설치되어 있고, 활성화 되어 있습니다.",' >> $CF 2>&1
		fi
	else
		echo '		"[안전] echo 서비스가 설치되어 있지 않습니다.",' >> $CF 2>&1
fi

if [ "$DTMP" != "" ]
	then	
		if [ "$DTMP" = "active" ]
			then
				echo '		"[안전] discard 서비스가 설치되어 있으나, 비활성화 되어 있습니다.",' >> $CF 2>&1
			else
				RESULT=false
				echo '		"[취약] discard 서비스가 설치되어 있고, 활성화 되어 있습니다.",' >> $CF 2>&1
		fi
	else
		echo '		"[안전] discard 서비스가 설치되어 있지 않습니다.",' >> $CF 2>&1
fi

if [ "$TTMP" != "" ]
	then	
		if [ "$TTMP" = "active" ]
			then
				echo '		"[안전] daytime 서비스가 설치되어 있으나, 비활성화 되어 있습니다.",' >> $CF 2>&1
			else
				RESULT=false
				echo '		"[취약] daytime 서비스가 설치되어 있고, 활성화 되어 있습니다.",' >> $CF 2>&1
		fi
	else
		echo '		"[안전] daytime 서비스가 설치되어 있지 않습니다.",' >> $CF 2>&1
fi

if [ "$CTMP" != "" ]
	then	
		if [ "$CTMP" = "active" ]
			then
				echo '		"[안전] chargen 서비스가 설치되어 있으나, 비활성화 되어 있습니다."' >> $CF 2>&1
			else
				RESULT=false
				echo '		"[취약] chargen 서비스가 설치되어 있고, 활성화 되어 있습니다."' >> $CF 2>&1
		fi
	else
		echo '		"[안전] chargen 서비스가 설치되어 있지 않습니다."' >> $CF 2>&1
fi


echo '		],'  >> $CF 2>&1
echo '	"result" : ' $RESULT, >> $CF 2>&1
echo '	"timestamp" : "'`date "+%Y-%m-%d %H:%M:%S"`'"' >> $CF 2>&1
echo '}' >> $CF 2>&1
echo "************************** 취약점 체크 종료 **************************" 