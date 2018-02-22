FROM alpine:3.7 AS build

ADD . /code/

RUN apk add --no-cache nodejs yarn git && \
    cd /code/app/static && \
    yarn install && \
    yarn run webpack && \
    yarn cache clean && \
    rm -r node_modules/

FROM alpine:3.7
ENV PYTHONUNBUFFERED 1

WORKDIR /code
COPY --from=build /code .

RUN apk add --no-cache python2 py2-pip py-gevent && \
    pip install -r requirements.txt

EXPOSE 8000
CMD ["python", "run.py"]
