SHELL := /usr/bin/env bash

all: server

server: create_db activate requirements migrate
	. activate && python manage.py runserver

migrate: activate
	. activate && python manage.py migrate

activate: venv
	@ [ -f activate ] || ln -s venv/bin/activate .

requirements:
	venv/bin/pip install -r requirements.txt

venv: virtualenv
	@ [ -d venv ] || virtualenv venv

virtualenv:
	@ which virtualenv > /dev/null 2>&1 || [[ "$$(type -t deactivate)" == 'function' ]] || pip install virtualenv

freeze:
	venv/bin/pip freeze > requirements.txt

POSTGRES_LONG_VERSION = 9.4.5.0
POSTGRES_SHORT_VERSION = 9.4
POSTGRES_ARCHIVE_NAME = Postgres-$(POSTGRES_LONG_VERSION).zip
POSTGRES_URL = https://github.com/PostgresApp/PostgresApp/releases/download/$(POSTGRES_LONG_VERSION)/$(POSTGRES_ARCHIVE_NAME)

# assumes a Mac OS X env, will fail miserably otherwise
postgres: install_postgres
	@ psql -tAc 'SELECT 1' > /dev/null 2>&1 \
		|| ($(MAKE) install_postgres && open -a postgres && sleep 3)

# installs pgsql from http://postgresapp.com/
install_postgres:
	@ [ -d /Applications/Postgres.app ] \
		|| (cd /tmp \
			&& wget $(POSTGRES_URL) \
			&& unzip $(POSTGRES_ARCHIVE_NAME) \
			&& sudo mv Postgres.app /Applications/ \
			&& echo -e "\nexport PATH=\"\$$PATH:/Applications/Postgres.app/Contents/Versions/$(POSTGRES_SHORT_VERSION)/bin\"\n" >> ~/.bash_profile)

DB_NAME = techfugees_db

create_db: postgres
	@ [[ $$(psql -tAc "SELECT 1 FROM pg_database WHERE datname='$(DB_NAME)'") == '1' ]] \
	  || psql --dbname template1 --single-transaction --command 'CREATE DATABASE $(DB_NAME);'

drop_db: postgres
	@ psql --dbname template1 --single-transaction --command 'DROP DATABASE IF EXISTS $(DB_NAME);'

db_shell: postgres
	psql $(DB_NAME)

.PHONY: \
	all \
	create_db \
	drop_db \
	freeze \
	install_postgres \
	migrate \
	postgres \
	requirements \
	server \
	virtualenv
