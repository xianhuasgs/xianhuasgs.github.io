import concurrent.futures
import hashlib
import json
import pathlib
import sys
import time
import urllib.parse
import urllib.request

manifest = json.loads(pathlib.Path('assets-manifest.json').read_text(encoding='utf-8'))
destination = pathlib.Path(sys.argv[1]).resolve()
destination.mkdir(parents=True, exist_ok=True)

def download(item):
    name, expected = item
    target = (destination / name).resolve()
    if not target.is_relative_to(destination):
        raise ValueError('Invalid asset path: ' + name)
    url = manifest['origin'] + '/' + urllib.parse.quote(name, safe='/')
    for attempt in range(4):
        try:
            with urllib.request.urlopen(url, timeout=60) as response:
                data = response.read()
            if len(data) != expected['size'] or hashlib.sha256(data).hexdigest() != expected['sha256']:
                raise ValueError('Snapshot integrity check failed: ' + name)
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
            return name
        except Exception:
            if attempt == 3:
                raise
            time.sleep(2 ** attempt)

with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
    for index, _ in enumerate(pool.map(download, manifest['files'].items()), 1):
        if index % 100 == 0:
            print(f'Verified {index} assets', flush=True)
(destination / '.nojekyll').touch()
print(f"Snapshot ready: {len(manifest['files'])} verified assets", flush=True)
