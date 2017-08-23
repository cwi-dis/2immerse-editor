from hashlib import sha256


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
        with open("./REVISION", "r") as revfile:
            branch = revfile.read().strip().split("/")[0]

            if not branch:
                raise "Could not determine branch"

            return branch


def get_head_revision(branch="master"):
    try:
        with open("./.git/refs/heads/" + branch, "r") as revfile:
            return revfile.read().strip()
    except:
        with open("./REVISION", "r") as revfile:
            revision = revfile.read().strip().split("/")[1]

            if not revision:
                raise "Could not determine revision"

            return revision
