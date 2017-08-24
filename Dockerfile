FROM python:2.7

ENV PYTHONUNBUFFERED 1

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb http://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -

RUN apt-get update
RUN apt-get install -y nodejs yarn

RUN npm install --global webpack

RUN mkdir -p /code/app/static/

ADD requirements.txt /code/
ADD app/static/package.json /code/app/static/
ADD app/static/yarn.lock /code/app/static/

WORKDIR /code

RUN pip install -r requirements.txt
RUN cd app/static; yarn install

ADD . /code/

RUN cd app/static; webpack

RUN rm -r app/static/node_modules
RUN npm uninstall -g webpack
RUN apt-get remove -y yarn nodejs

EXPOSE 8000
CMD ["python", "run.py"]
