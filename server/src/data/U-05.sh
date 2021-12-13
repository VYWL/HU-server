#!/bin/bash

# check privelige
if [ "$EUID" -ne 0 ]
	then echo "root 권한으로 스크립트를 실행하여 주십시오."
	exit
fi

FILENAME="U-05"
TITLE="U-05(상) root홈, 패스 디렉터리 권한 및 패스 설정"
REF="주요 정보통신 기반 시설 취약점 분석, 평가기준"

RESULT=true
CF=$FILENAME.json

echo "************************** 취약점 체크 시작 **************************" 
echo "{" > $CF 2>&1
echo '	"title" : "'$TITLE'",' >> $CF 2>&1
echo '	"ref" : "'$REF'",' >> $CF 2>&1
echo '	"detail" : ['  >> $CF 2>&1

GRDP=`cat /etc/passwd | grep root | sed -n '1p' | awk -F: '{print$6}' | ls -l /../ | awk '{print $1$9}' | grep root | awk -F. '{print $1}'`
RDP=drwx------root 

if [ $GRDP = $RDP ]
	then
		echo '		"[안전] root 홈 디렉터리 권한 : '$GRDP'",' >> $CF 2>&1
	else
		RESULT=false
		echo '		"[취약] root 홈 디렉터리 권한 : '$GRDP'",' >> $CF 2>&1
fi

if [ -z "`cat /etc/profile 2>/dev/null | grep PATH= | grep -E "(:)?\.:"`" ]
	then
		echo '		"[안전] /etc/profile PATH 환경변수에 “.” 이 맨 앞이나 중간에 포함되지 않습니다.",' >> $CF 2>&1
	else
		RESULT=false
		echo '		"[취약] /etc/profile PATH 환경변수에 “.” 이 맨 앞이나 중간에 포함되어 있습니다.",' >> $CF 2>&1		
fi

if [ -z "`cat $HOME/.profile 2>/dev/null | grep PATH= | grep -E "(:)?\.:"`" ]
	then
		echo '		"[안전] /etc/profile PATH 환경변수에 “.” 이 맨 앞이나 중간에 포함되지 않습니다.",' >> $CF 2>&1
	else
		RESULT=false
		echo '		"[취약] /etc/profile PATH 환경변수에 “.” 이 맨 앞이나 중간에 포함되어 있습니다.",' >> $CF 2>&1		
fi

if [ -z "`cat $HOME/.cshrc 2>/dev/null | grep PATH= | grep -E "(:)?\.:"`" ]
	then
		echo '		"[안전] $HOME/.cshrc PATH 환경변수에 “.” 이 맨 앞이나 중간에 포함되지 않습니다.",' >> $CF 2>&1
	else
		RESULT=false
		echo '		"[취약] $HOME/.cshrc PATH 환경변수에 “.” 이 맨 앞이나 중간에 포함되어 있습니다.",' >> $CF 2>&1		
fi

if [ -z "`cat $HOME/.login 2>/dev/null | grep PATH= | grep -E "(:)?\.:"`" ]
	then
		echo '		"[안전] $HOME/.login PATH 환경변수에 “.” 이 맨 앞이나 중간에 포함되지 않습니다.",' >> $CF 2>&1
	else
		RESULT=false
		echo '		"[취약] $HOME/.login PATH 환경변수에 “.” 이 맨 앞이나 중간에 포함되어 있습니다.",' >> $CF 2>&1		
fi

if [ -z "`cat /etc/.login 2>/dev/null | grep PATH= | grep -E "(:)?\.:"`" ]
	then
		echo '		"[안전] /etc/.login PATH 환경변수에 “.” 이 맨 앞이나 중간에 포함되지 않습니다.",' >> $CF 2>&1
	else
		RESULT=false
		echo '		"[취약] /etc/.login PATH 환경변수에 “.” 이 맨 앞이나 중간에 포함되어 있습니다.",' >> $CF 2>&1		
fi

if [ -z "`cat $HOME/kshrc 2>/dev/null | grep PATH= | grep -E "(:)?\.:"`" ]
	then
		echo '		"[안전] $HOME/kshrc PATH 환경변수에 “.” 이 맨 앞이나 중간에 포함되지 않습니다.",' >> $CF 2>&1
	else
		RESULT=false
		echo '		"[취약] $HOME/kshrc PATH 환경변수에 “.” 이 맨 앞이나 중간에 포함되어 있습니다.",' >> $CF 2>&1		
fi

if [ -z "`cat $HOME/.bash_profile 2>/dev/null | grep PATH= | grep -E "(:)?\.:"`" ]
	then
		echo '		"[안전] $HOME/.bash_profile PATH 환경변수에 “.” 이 맨 앞이나 중간에 포함되지 않습니다."' >> $CF 2>&1
	else
		RESULT=false
		echo '		"[취약] $HOME/.bash_profile PATH 환경변수에 “.” 이 맨 앞이나 중간에 포함되어 있습니다."' >> $CF 2>&1		
fi

echo '		],'  >> $CF 2>&1
echo '	"result" : ' $RESULT, >> $CF 2>&1
echo '	"timestamp" : "'`date "+%Y-%m-%d %H:%M:%S"`'"' >> $CF 2>&1
echo '}' >> $CF 2>&1
echo "************************** 취약점 체크 종료 **************************" 