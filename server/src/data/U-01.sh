#!/bin/bash

# check privelige
if [ "$EUID" -ne 0 ]
	then echo "root 권한으로 스크립트를 실행하여 주십시오."
	exit
fi

FILENAME="U-01"
TITLE="U-01(상) root 계정 원격접속 제한"
REF="주요 정보통신 기반 시설 취약점 분석, 평가기준"

RESULT=true
CF=$FILENAME.json

echo "************************** 취약점 체크 시작 **************************" 
echo "{" > $CF 2>&1
echo '	"title" : "'$TITLE'",' >> $CF 2>&1
echo '	"ref" : "'$REF'",' >> $CF 2>&1
echo '	"detail" : ['  >> $CF 2>&1

if [ -e "/etc/ssh/sshd_config" ]
	then
		if [ "PermitRootLogin no" = "`cat /etc/ssh/sshd_config | grep -E "^PermitRootLogin"`" ]
			then
				echo '		"[안전] ssh 서비스가 활성화 되어 있고, root 로그인이 불가능합니다.",' >> $CF 2>&1
			else
				RESULT=false
				echo '		"[취약] ssh 서비스가 활성화 되어 있고, root 로그인이 가능합니다.",' >> $CF 2>&1		
		fi
	else	
		echo '		"[안전] ssh 서비스가 활성화 되어 있지 않습니다.",' >> $CF 2>&1
fi

if [ -e "/etc/pam.d/login" ]
	then
		if [ -n "`cat /etc/pam.d/login | grep -E "^auth required /lib/security/pam_securetty.so"`" ]
			then
				echo '		"[안전] telnet 서비스가 활성화 되어 있고, root 로그인이 불가능합니다.",' >> $CF 2>&1
			else
				RESULT=false
				echo '		"[취약] telnet 서비스가 활성화 되어 있고, root 로그인이 가능합니다.",' >> $CF 2>&1						
		fi
	else	
		echo '		"[안전] telnet 서비스가 활성화 되어 있지 않습니다.",' >> $CF 2>&1
fi

if [ -e "/etc/securetty" ]
	then
		if [ -z "`cat /etc/securetty | grep -E "pst/[0-9]*"`" ]
			then
				echo '		"[안전] telnet 서비스가 활성화 되어 있고, root 로그인이 불가능합니다."' >> $CF 2>&1
			else
				RESULT=false			
				echo '		"[취약] telnet 서비스가 활성화 되어 있고, root 로그인이 가능합니다."' >> $CF 2>&1							
		fi
	else	
		echo '		"[안전] telnet 서비스가 활성화 되어 있지 않습니다."' >> $CF 2>&1
fi


echo '		],'  >> $CF 2>&1
echo '	"result" : ' $RESULT, >> $CF 2>&1
echo '	"timestamp" : "'`date "+%Y-%m-%d %H:%M:%S"`'"' >> $CF 2>&1
echo '}' >> $CF 2>&1
echo "************************** 취약점 체크 종료 **************************"