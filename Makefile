.PHONY: run venv

ifndef LISTEN_ADDR
LISTEN_ADDR=127.0.0.1
endif
ifndef LISTEN_PORT
LISTEN_PORT=5000
endif
APP_SRC=src/app.py
VENV=.venv

run:
	$(VENV)/bin/python3 $(APP_SRC)

venv:
	python3 -m venv $(VENV)
	$(VENV)/bin/pip3 install --upgrade pip
	$(VENV)/bin/pip3 install -r requirements.txt