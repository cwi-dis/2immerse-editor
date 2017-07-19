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


def get_head_revision(branch="master"):
    with open("./.git/refs/heads/" + branch, "r") as revfile:
        return revfile.read().replace("\n", "")
