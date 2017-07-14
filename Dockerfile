FROM python:2.7

ENV PYTHONUNBUFFERED 1

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb http://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -

RUN apt-get update
RUN apt-get install -y nodejs
RUN apt-get install -y yarn

RUN npm install --global webpack

RUN mkdir /code
WORKDIR /code

ADD . /code/

RUN pip install -r requirements.txt
RUN cd app/static; yarn install
RUN cd app/static; webpack
