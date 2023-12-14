#
# Copyright(c) 2022 Neatlogic Co., Ltd. All Rights Reserved.
#

POM_VERSION=`cat package.json|grep version|sed -n '1p'`
POM_VERSION=${POM_VERSION%\"*}
POM_VERSION=${POM_VERSION##*\"}
echo $POM_VERSION
if [ $POM_VERSION != "" ]; then
	PROJECT_ID=$1
	REF=$2
	curl -H "PRIVATE-TOKEN: 5zWk91yBpWfrbrN5fZDV" -X POST -d "tag_name=$POM_VERSION&ref=$REF" http://192.168.0.82:7070/api/v4/projects/$PROJECT_ID/repository/tags
fi
