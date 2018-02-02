FROM alpine:3.7

ENV PYTHONUNBUFFERED 1

RUN apk add --no-cache nodejs yarn python2 py2-pip git && \
    npm install --unsafe-perm --global webpack jest

RUN mkdir -p /code/app/static/

ADD requirements.txt /code/
ADD app/static/package.json app/static/yarn.lock /code/app/static/

WORKDIR /code

RUN pip install -r requirements.txt && \
    cd app/static && \
    yarn install

ADD . /code/

RUN cd app/static && \
    webpack

RUN npm uninstall -g webpack && \
    apk del py2-pip git && \
    rm -rf app/static/node_modules

EXPOSE 8000
CMD ["python", "run.py"]
