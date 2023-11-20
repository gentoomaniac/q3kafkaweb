import logging
import sys

import click

import q3webApi.server as server

log = logging.getLogger(__name__)


def _configure_logging(verbosity):
    loglevel = max(3 - verbosity, 0) * 10
    logging.basicConfig(level=loglevel,
                        format='[%(asctime)s] %(name)s %(levelname)s: %(message)s',
                        datefmt='%Y-%m-%d %H:%M:%S')
    if loglevel >= logging.DEBUG:
        # Disable debugging logging for external libraries
        for loggername in 'urllib3':
            logging.getLogger(loggername).setLevel(logging.CRITICAL)


@click.command()
@click.option('-v', '--verbosity', help='Verbosity', default=0, count=True)
def cli(verbosity: int):
    _configure_logging(verbosity)

    logging.getLogger('kafka').setLevel(logging.CRITICAL)

    server.start(port=8000, debug=True)

    return 0


if __name__ == '__main__':
    # pylint: disable=E1120
    sys.exit(cli())
