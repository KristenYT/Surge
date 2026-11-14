from pathlib import Path
p=Path('/var/minis/workspace/youtube-integrated')
a=(p/'source/aioneas.response.js').read_text()
m=(p/'source/maasea.response.js').read_text()
# Extract only the caption function. No Maasea ad removal/initplayback/log_event code.
start=m.index('function Pi(')
end=m.index('function Br(', start)
caption=m[start:end]
caption=caption.replace('Pi(l,e)', 'integratedCaption(l,e)').replace('ce(l,','integratedWalk(l,').replace('be.create(', 'he.create(').replace('ke.create(', 'ye.create(').replace('Object.entries(Oi)', 'Object.entries(integratedLanguages)')
# Chrome extension workaround: fetch Hans; OpenCC cn -> twp on timedtext response.
# Set the marker in the generated track itself, so conversion is not dependent on
# which URL Surge exposes after an http-request URL modification.
caption=caption.replace('if(Array.isArray(n)){', 'if(Array.isArray(n)&&n.length){')
caption=caption.replace('n[o].baseUrl+`&tlang=${e}`', 'n[o].baseUrl.replace(/([?&])tlang=[^&]*&?/g,"$1").replace(/&$/,"")+(e==="zh-Hant"?"&tlang=zh-Hans&origin_tlang=zh-Hant":`&tlang=${encodeURIComponent(e)}`)')
lang_start=m.index('var Oi=')
lang_end=m.index(';function Pi(', lang_start)
languages=m[lang_start:lang_end+1].replace('var Oi=', 'var integratedLanguages=')
walk='function integratedWalk(l,e,t){let n=l!=null&&typeof l==="object"?[l]:[];for(;n.length;){let i=n.pop();for(let r of Object.keys(i)){if(r===e&&t(i))return;i[r]!=null&&typeof i[r]==="object"&&n.push(i[r])}}}'
s=a.index('addTranslateCaption(){')
e=a.index('}},$e=class', s)
a=a[:s]+'addTranslateCaption(){integratedCaption(this.message,this.argument.captionLang)}'+a[e+1:]
pos=a.index('var oe=class extends G')
a=a[:pos]+walk+languages+caption+a[pos:]
(p/'youtube.response.js').write_text('// Integrated: Aioneas adblock + Maasea caption-only function.\n// Upstream snapshots and provenance: see README.md.\n'+a)
print('Built caption-only integration:',len(a))
vendor=p/'source/opencc.cn2t.js'
if vendor.exists():
    (p/'youtube.tc.response.js').write_text(vendor.read_text()+'\n'+(p/'tc-response-tail.js').read_text())
