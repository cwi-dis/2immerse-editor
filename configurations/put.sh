#!/bin/bash
case x$1 in
x)
	echo Usage: $0 "http[s]://host:port" config.json
	exit 1
	;;
esac
url=$1/api/v1/configuration
curl --request PUT --header "Content-Type: application/json" --data @"$2" $url 
