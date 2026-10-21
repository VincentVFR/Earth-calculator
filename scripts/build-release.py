from pathlib import Path
import subprocess, zipfile, json, datetime, argparse
parser=argparse.ArgumentParser(); parser.add_argument('--output-dir',required=True); args=parser.parse_args()
root=Path(__file__).resolve().parent.parent
version=json.loads((root/'packages/math/package.json').read_text(encoding='utf-8'))['version']
commit=subprocess.check_output(['git','-C',str(root),'rev-parse','HEAD']).decode().strip()
epoch=int(subprocess.check_output(['git','-C',str(root),'show','-s','--format=%ct','HEAD']))
files=['index.html','app.js','geometry.js','solar.js','solar-ui.js','styles.css','config.js','favicon.svg','LICENSE']
config=(root/'config.js').read_text(encoding='utf-8'); assert "mapboxToken: ''" in config and "geocodingEndpoint: ''" in config
entries={name:(root/name).read_bytes().replace(b'\r\n',b'\n') for name in files}
entries['release.json']=(json.dumps({'name':'GlobePath','version':version,'sourceCommit':commit,'sourceRepository':'https://github.com/VincentVFR/Earth-calculator'},indent=2)+'\n').encode()
entries['START-HERE.md']=f"""# GlobePath {version}

Extraire cette archive dans un dossier. Avec Python 3, ouvrir un terminal dans ce dossier et lancer :

```sh
python -m http.server 8080 --bind 127.0.0.1
```

Ouvrir http://127.0.0.1:8080 dans le navigateur. Aucune dépendance à installer.

Comparer deux lieux sur Terre ou deux des huit planètes. Les villes intégrées, les coordonnées libres et le globe schématique fonctionnent sans fournisseur externe. Carte détaillée et recherche distante sont désactivées dans config.js.

Les distances terrestres utilisent une sphère ; les orbites planétaires sont circulaires, coplanaires et fixes. Le modèle ne donne pas les positions actuelles des planètes ni des éphémérides. Préversion : interface et API peuvent évoluer.

Sources et documentation : https://github.com/VincentVFR/Earth-calculator/tree/{commit}
Licence : MIT, fichier LICENSE inclus.
""".encode('utf-8')
html=entries['index.html'].decode('utf-8')
import re
for ref in re.findall(r'(?:src|href)=["\']([^"\']+)["\']',html):
 if not re.match(r'^(?:https?:|#|data:)',ref): assert ref.split('?')[0] in entries, 'Missing runtime asset: '+ref
out=Path(args.output_dir).resolve();out.mkdir(parents=True,exist_ok=True)
archive=out/f'GlobePath-v{version}.zip';prefix=f'GlobePath-v{version}/'
date=datetime.datetime.fromtimestamp(epoch,datetime.timezone.utc).timetuple()[:6]
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for name,data in entries.items():
  info=zipfile.ZipInfo(prefix+name,date);info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o100644<<16;z.writestr(info,data)
print(str(archive))
