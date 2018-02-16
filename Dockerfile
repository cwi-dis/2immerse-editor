FROM alpine:3.7 AS build

RUN apk add --no-cache nodejs yarn git && \
    npm install --unsafe-perm --global webpack

ADD . /code/
WORKDIR /code

RUN cd app/static && \
    yarn install && \
    webpack

RUN npm uninstall -g webpack && \
    yarn cache clean && \
    rm -r app/static/node_modules/

FROM alpine:3.7
ENV PYTHONUNBUFFERED 1

WORKDIR /code
COPY --from=build /code .

RUN apk add --no-cache python2 py2-pip && \
    pip install -r requirements.txt

EXPOSE 8000
CMD ["python", "run.py"]
