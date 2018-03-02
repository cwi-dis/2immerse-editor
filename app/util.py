from hashlib import sha256
from socketIO_client import SocketIO, SocketIONamespace
from api.globalSettings import GlobalSettings


def hash_file(path):
    h = sha256()

    with open(path, 'rb') as f:
        while True:
            data = f.read(2**16)

            if not data:
                break

            h.update(data)

    return h.hexdigest()


def get_current_branch():
    try:
        with open("./.git/HEAD", "r") as headfile:
            return headfile.read().strip().split("/")[-1]
    except:
        raise IOError("Could not determine branch")


def get_head_revision():
    try:
        branch = get_current_branch()

        with open("./.git/refs/heads/" + branch, "r") as revfile:
            return branch, revfile.read().strip()
    except:
        with open("./REVISION", "r") as revfile:
            [branch, revision] = revfile.read().strip().split("/")

            if not revision or not branch:
                raise IOError("Could not determine revision")

            return branch, revision
