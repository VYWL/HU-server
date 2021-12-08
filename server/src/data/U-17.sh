#!/bin/bash

# 
# check privelige
if [ "$EUID" -ne 0 ]
	then echo "root 권한으로 스크립트를 실행하여 주십시오."
	exit
fi

FILENAME="U-17"
TITLE="U-17(상) $HOME/.rhosts, hosts.equiv 사용 금지"
REF="주요 정보통신 기반 시설 취약점 분석, 평가기준"

RESULT=true
CF=$FILENAME.json

echo "************************** 취약점 체크 시작 **************************" 
echo "{" > $CF 2>&1
echo '	"title" : "'$TITLE'",' >> $CF 2>&1
echo '	"ref" : "'$REF'",' >> $CF 2>&1
echo '	"detail" : ['  >> $CF 2>&1

STEP1="$HOME/.rhosts"
STEP2="hosts.equiv"

if [ -e STEP1 ]
	then
		IO=`ls -l $STEP1 | awk '{print $3}'`
		IP=`ls -l $STEP1 | awk '{print $1}'`

		if [ $IO = root ] || [ $IO = `whoami` ]
			then
				echo '		"[안전] $HOME/.rhosts 파일 소유자 : '$IO'",' >> $CF 2>&1
			else
				RESULT=false
				echo '		"[취약] $HOME/.rhosts 파일 소유자 : '$IO'",' >> $CF 2>&1
		fi

		if [ $IP = -r-------- ]
			then
				echo '		"[안전] $HOME/.rhosts 파일 권한 : '$IP'",' >> $CF 2>&1
			else
				RESULT=false
				echo '		"[취약] $HOME/.rhosts 파일 권한 : '$IP'",' >> $CF 2>&1
		fi
	else
		echo '		"[안전] $HOME/.rhosts를 사용하지 않고 있습니다.",' >> $CF 2>&1
fi

if [ -e STEP2 ]
	then
		IO=`ls -l $STEP2 | awk '{print $3}'`
		IP=`ls -l $STEP2 | awk '{print $1}'`

		if [ $IO = root ] || [ $IO = `whoami` ]
			then
				echo '		"[안전] hosts.equiv 파일 소유자 : '$IO'"' >> $CF 2>&1
			else
				RESULT=false
				echo '		"[취약] hosts.equiv 파일 소유자 : '$IO'"' >> $CF 2>&1
		fi

		if [ $IP = -r-------- ]
			then
				echo '		"[안전] hosts.equiv 파일 권한 : '$IP'"' >> $CF 2>&1
			else
				RESULT=false
				echo '		"[취약] hosts.equiv 파일 권한 : '$IP'"' >> $CF 2>&1
		fi
	else
		echo '		"[안전] hosts.equiv를 사용하지 않고 있습니다."' >> $CF 2>&1
fi

echo '		],'  >> $CF 2>&1
echo '	"result" : ' $RESULT, >> $CF 2>&1
echo '	"timestamp" : "'`date "+%Y-%m-%d %H:%M:%S"`'"' >> $CF 2>&1
echo '}' >> $CF 2>&1
echo "************************** 취약점 체크 종료 **************************" 