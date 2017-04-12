import argparse
import imp
import os.path

from migrate.versioning import api

from app import db
from config import SQLALCHEMY_DATABASE_URI
from config import SQLALCHEMY_MIGRATE_REPO


def create():
    db.create_all()

    if not os.path.exists(SQLALCHEMY_MIGRATE_REPO):
        api.create(SQLALCHEMY_MIGRATE_REPO, "database repository")
        api.version_control(SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO)
    else:
        api.version_control(
            SQLALCHEMY_DATABASE_URI,
            SQLALCHEMY_MIGRATE_REPO,
            api.version(SQLALCHEMY_MIGRATE_REPO)
        )


def addmigration():
    version = api.db_version(SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO)
    migration = "%s/versions/%03d_migration.py" % (
        SQLALCHEMY_MIGRATE_REPO,
        version + 1
    )

    tmp_module = imp.new_module('old_model')
    old_model = api.create_model(
        SQLALCHEMY_DATABASE_URI,
        SQLALCHEMY_MIGRATE_REPO
    )

    exec(old_model, tmp_module.__dict__)

    script = api.make_update_script_for_model(
        SQLALCHEMY_DATABASE_URI,
        SQLALCHEMY_MIGRATE_REPO,
        tmp_module.meta,
        db.metadata
    )
    open(migration, "wt").write(script)

    api.upgrade(SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO)
    version = api.db_version(SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO)

    print "New migration saved as", str(migration)
    print "Current database version:", str(version)


def upgrade():
    api.upgrade(SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO)
    version = api.db_version(SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO)
    print "Current database version:", str(version)


def downgrade():
    version = api.db_version(SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO)

    api.downgrade(
        SQLALCHEMY_DATABASE_URI,
        SQLALCHEMY_MIGRATE_REPO,
        version - 1
    )

    version = api.db_version(SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO)
    print 'Current database version: ' + str(version)


def main():
    parser = argparse.ArgumentParser(
        description="""Script for performing migrations on the database."""
    )

    commands = parser.add_subparsers()

    subparser = commands.add_parser(
        "create",
        help="Initialise database from scratch"
    )
    subparser.set_defaults(command="create")

    subparser = commands.add_parser(
        "addmigration",
        help="Create new migration from model changes"
    )
    subparser.set_defaults(command="addmigration")

    subparser = commands.add_parser(
        "upgrade",
        help="Run pending migrations"
    )
    subparser.set_defaults(command="upgrade")

    subparser = commands.add_parser(
        "downgrade",
        help="Revert to previous migration"
    )
    subparser.set_defaults(command="downgrade")

    return parser.parse_args().command


if __name__ == "__main__":
    command = main()
    locals()[command]()
