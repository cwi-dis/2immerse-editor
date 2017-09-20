#!/bin/bash
case x$1 in
x)
	echo Usage: $0 "http[s]://host:port"
	exit 1
	;;
esac
url=$1/api/v1/configuration
curl $url
