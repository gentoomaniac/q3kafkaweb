.PHONY: dev-api test clean ui

ifndef LISTEN_ADDR
LISTEN_ADDR=127.0.0.1
endif
ifndef LISTEN_PORT
LISTEN_PORT=5000
endif
VENV=.venv

ui:
	cd q3web && npm start

dev-api: .venv
	$(VENV)/bin/pip3 install -e .
	$(VENV)/bin/q3web -vvvv

.venv:
	python3 -m venv $(VENV)
	$(VENV)/bin/pip3 install --upgrade pip

test:
	$(VENV)/bin/python -m unittest -v

clean:
	find . -type d -name '__pycache__' -exec rm -rf {} \;
	find . -type d -name '*.egg-info' -exec rm -rf {} \;
