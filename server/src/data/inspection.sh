#!/bin/bash

filenames=`ls ./U-??.sh`
for eachfile in $filenames
do
   echo $eachfile
   $eachfile
done

resultnames=`ls ./U-??.json`
for eachfile in $resultnames
do
   echo $eachfile
   cat $eachfile
done