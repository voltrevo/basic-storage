FROM denoland/deno:1.23.2

ADD . /app
WORKDIR /app

RUN deno cache run.ts

CMD [ \
  "deno", \
  "run", \
  "-A", \
  "run.ts" \
]
