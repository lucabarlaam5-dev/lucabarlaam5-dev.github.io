# Genera site/index.html: inserisce le icone Phosphor (MIT) come sprite SVG
import re, pathlib, sys
A = pathlib.Path(sys.argv[1])  # cartella @phosphor-icons/core/assets
icons = {'storefront':'regular/storefront','headphones':'regular/headphones','waveform':'regular/waveform',
 'share-network':'regular/share-network','instagram':'regular/instagram-logo','tiktok':'regular/tiktok-logo',
 'linkedin':'regular/linkedin-logo','play':'fill/play-fill','caret-down':'regular/caret-down',
 'arrow-up-right':'regular/arrow-up-right','arrow-right':'regular/arrow-right','x':'regular/x','phone':'regular/phone'}
syms = []
for k, f in icons.items():
    s = (A / f"{f}.svg").read_text()
    inner = re.search(r'<svg[^>]*>(.*)</svg>', s, re.S).group(1)
    syms.append(f'<symbol id="i-{k}" viewBox="0 0 256 256">{inner}</symbol>')
sprite = '<svg width="0" height="0" style="position:absolute" aria-hidden="true">' + ''.join(syms) + '</svg>'
t = pathlib.Path('src/index.template.html').read_text().replace('{{SPRITE}}', sprite)
pathlib.Path('site/index.html').write_text(t)
print('ok', len(t))
