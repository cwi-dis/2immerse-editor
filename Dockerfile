FROM alpine:3.7 AS build
ARG nojs

ADD . /code/

RUN if [ -z "$nojs" ]; then \
      apk add --no-cache nodejs yarn git && \
      cd /code/app/static && \
      yarn install && \
      yarn run webpack && \
      yarn cache clean && \
      rm -r node_modules/; \
    else \
      echo "Skipping JS setup"; \
    fi

FROM alpine:3.7
ENV PYTHONUNBUFFERED 1

WORKDIR /code
COPY --from=build /code .

RUN apk add --no-cache python2 py2-pip py-gevent && \
    pip install -r requirements.txt

EXPOSE 8000
CMD ["python", "run.py"]
