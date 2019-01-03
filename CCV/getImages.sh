#!/bin/bash

# This file downloads all the tagged images from the Azure Custom Computer Vision website, and stores the in the tag directory

TrainingKey=7efXXXXXXXXXXXXX330
ProjectID=cXXXX5-4XX8-4XX0-9XX4-2XXXXXb
EndPoint=https://southcentralus.api.cognitive.microsoft.com/customvision/v2.2/Training/projects/

AllTags=$(curl -X GET "${EndPoint}${ProjectID}/tags" -H "Training-Key: ${TrainingKey}")
echo ${AllTags} | jq 'to_entries[] | .value.name' | tr -d '"' > tags.txt

cat tags.txt | while read myTag
do
  rm -r ${myTag}
  mkdir ${myTag}
  imageCounter=0
  TagId=$(echo ${AllTags} | jq '.[] | select(.name=="'${myTag}'").id' | tr -d '"') 
  TagCount=$(curl -X GET "${EndPoint}${ProjectID}/images/tagged/count?&tagIds={$TagId}" -H "Training-Key: ${TrainingKey}")
  CurrentCount=0
  while [ ${CurrentCount} -lt ${TagCount} ]
  do
     CurrentImages=""
     CurrentImages=$(curl -X GET "${EndPoint}${ProjectID}/images/tagged?tagIds={$TagId}&take=50&skip={$CurrentCount}" -H "Training-Key: ${TrainingKey}")
     echo ${CurrentImages} | jq 'to_entries[] | .value.resizedImageUri' | tr -d '"' > images.txt
     cat images.txt | while read URL
     do
       # CURL does not normally support HTTPS using wget instead
       wget ${URL} -O "${myTag}/b${CurrentCount}-c${imageCounter}.jpg"
       imageCounter=$((imageCounter+1))
     done
     CurrentCount=$((CurrentCount+50))
  done
done
rm images.txt
rm tags.txt
