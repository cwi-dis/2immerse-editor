FROM troeggla/flask-node:latest

RUN mkdir -p /code/app/static/

ADD requirements.txt /code/
ADD app/static/package.json app/static/yarn.lock /code/app/static/

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
