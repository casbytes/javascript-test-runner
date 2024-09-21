FROM python:3.9.20-slim-bookworm

WORKDIR /usr/py
COPY . .

RUN chmod +x script.sh
ENTRYPOINT ["bash", "./script.sh"]

