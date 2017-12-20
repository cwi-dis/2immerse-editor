FROM python:2.7

ENV PYTHONUNBUFFERED 1

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb http://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    curl -sL https://deb.nodesource.com/setup_8.x | bash -

RUN apt-get install -y nodejs yarn && \
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
    apt-get remove -y yarn

EXPOSE 8000
CMD ["python", "run.py"]
