#!/bin/bash

# check privelige
if [ "$EUID" -ne 0 ]
	then echo "root 권한으로 스크립트를 실행하여 주십시오."
	exit
fi

FILENAME="U-02"
TITLE="U-02(상) 패스워드 복잡성 설정"
REF="주요 정보통신 기반 시설 취약점 분석, 평가기준"

RESULT=true
CF=$FILENAME.json

echo "************************** 취약점 체크 시작 **************************" 
echo "{" > $CF 2>&1
echo '	"title" : "'$TITLE'",' >> $CF 2>&1
echo '	"ref" : "'$REF'",' >> $CF 2>&1
echo '	"detail" : ['  >> $CF 2>&1

MINLEN=`cat /etc/pam.d/common-password | grep -o -E "minlen=(-)?[0-9]*" |  awk -F= '{print $2}'`
LCREDIT=`cat /etc/pam.d/common-password | grep -o -E "lcredit=(-)?[0-9]*" |  awk -F= '{print $2}'`
UCREDIT=`cat /etc/pam.d/common-password | grep -o -E "ucredit=(-)?[0-9]*" |  awk -F= '{print $2}'`
DCREDIT=`cat /etc/pam.d/common-password | grep -o -E "dcredit=(-)?[0-9]*" |  awk -F= '{print $2}'`
OCREDIT=`cat /etc/pam.d/common-password | grep -o -E "ocredit=(-)?[0-9]*" |  awk -F= '{print $2}'`

if [ $MINLEN ]
	then
		if [ $MINLEN -ge 8 ]
			then
				echo '		"[안전] 패스워드 최소 길이가 8자 이상입니다.",' >> $CF 2>&1
			else
				RESULT=false
				echo '		"[취약] 패스워드 최소 길이가 8자 미만입니다.",' >> $CF 2>&1		
		fi
	else
		RESULT=false
		echo '		"[취약] 패스워드 최소 길이가 설정되어 있지 않습니다.",' >> $CF 2>&1		
fi

if [ $LCREDIT ]
	then
		if [ $LCREDIT -eq -1 ]
			then
				echo '		"[안전] 패스워드가 최소 소문자 1자 이상을 요구합니다.",' >> $CF 2>&1
			else
				RESULT=false
				echo '		"[취약] 패스워드가 최소 소문자 1자 이상을 요구하지 않습니다.",' >> $CF 2>&1		
		fi
	else
		RESULT=false
		echo '		"[취약] 패스워드가 최소 소문자 1자 이상을 요구하지 않습니다.",' >> $CF 2>&1		
fi

if [ $UCREDIT ]
	then
		if [ $UCREDIT -eq -1 ]
			then
				echo '		"[안전] 패스워드가 최소 대문자 1자 이상을 요구합니다.",' >> $CF 2>&1
			else
				RESULT=false
				echo '		"[취약] 패스워드가 최소 대문자 1자 이상을 요구하지 않습니다.",' >> $CF 2>&1		
		fi
	else
		RESULT=false
		echo '		"[취약] 패스워드가 최소 대문자 1자 이상을 요구하지 않습니다.",' >> $CF 2>&1		
fi

if [ $DCREDIT ]
	then
		if [ $DCREDIT -eq -1 ]
			then
				echo '		"[안전] 패스워드가 최소 숫자 1자 이상을 요구합니다.",' >> $CF 2>&1
			else
				RESULT=false
				echo '		"[취약] 패스워드가 최소 숫자 1자 이상을 요구하지 않습니다.",' >> $CF 2>&1		
		fi
	else
		RESULT=false
		echo '		"[취약] 패스워드가 최소 숫자 1자 이상을 요구하지 않습니다.",' >> $CF 2>&1		
fi

if [ $OCREDIT ]
	then
		if [ $OCREDIT -eq -1 ]
			then
				echo '		"[안전] 패스워드가 최소 특수문자 1자 이상을 요구합니다."' >> $CF 2>&1
			else
				RESULT=false
				echo '		"[취약] 패스워드가 최소 특수문자 1자 이상을 요구하지 않습니다."' >> $CF 2>&1		
		fi
	else
		RESULT=false
		echo '		"[취약] 패스워드가 최소 특수문자 1자 이상을 요구하지 않습니다."' >> $CF 2>&1		
fi

echo '		],'  >> $CF 2>&1
echo '	"result" : ' $RESULT, >> $CF 2>&1
echo '	"timestamp" : "'`date "+%Y-%m-%d %H:%M:%S"`'"' >> $CF 2>&1
echo '}' >> $CF 2>&1
echo "************************** 취약점 체크 종료 **************************" 