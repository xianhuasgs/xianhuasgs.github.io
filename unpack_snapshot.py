import hashlib
import io
import json
import pathlib
import sys
import zipfile

info = json.loads(pathlib.Path('snapshot-info.json').read_text(encoding='utf-8'))
data = b''.join(pathlib.Path(name).read_bytes() for name in info['parts'])
if len(data) != info['bytes'] or hashlib.sha256(data).hexdigest() != info['sha256']:
    raise ValueError('Game snapshot integrity check failed')
destination = pathlib.Path(sys.argv[1]).resolve()
destination.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(io.BytesIO(data)) as archive:
    for member in archive.infolist():
        if not (destination / member.filename).resolve().is_relative_to(destination):
            raise ValueError('Invalid archive path')
    archive.extractall(destination)
manifest = json.loads(pathlib.Path('assets-manifest.json').read_text(encoding='utf-8'))
for name, expected in manifest['files'].items():
    content = (destination / name).read_bytes()
    if len(content) != expected['size'] or hashlib.sha256(content).hexdigest() != expected['sha256']:
        raise ValueError('Asset integrity check failed: ' + name)
print(f"Verified {len(manifest['files'])} independent game assets")
