"""Browser interaction smoke without network navigation. Emulates module origin using data: URLs.
Actual HTTP deployment is separately verified after publishing. Browser worker is shimmed
with the same simulation module because about:blank cannot create module workers.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import subprocess,re
ROOT=Path(__file__).resolve().parents[1]; SITE=ROOT/'site'
subprocess.run(['node','tests/browser-bundle.mjs'],cwd=ROOT,check=True,capture_output=True)
app_url=(ROOT/'.browser-module-url.txt').read_text()
import base64
subprocess.run(['node','tests/browser-bundle.mjs','site/simulation.mjs'],cwd=ROOT,check=True,capture_output=True)
sim_url=(ROOT/'.browser-module-url.txt').read_text()
subprocess.run(['node','tests/browser-bundle.mjs'],cwd=ROOT,check=True,capture_output=True)
subprocess.run(['node','tests/browser-bundle.mjs','site/loom.mjs'],cwd=ROOT,check=True,capture_output=True)
loom_url=(ROOT/'.browser-module-url.txt').read_text()
html=(SITE/'index.html').read_text();html=re.sub(r'<link rel="stylesheet"[^>]+>','',html);html=html.replace('<script type="module" src="./app.mjs"></script>','').replace('</head>',f'<style>{(SITE/"styles.css").read_text()}</style></head>')
for viewport,name in [({'width':390,'height':844},'mobile'),({'width':1440,'height':900},'desktop')]:
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  page=browser.new_page(viewport=viewport,device_scale_factor=1)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='domcontentloaded')
  page.evaluate('''() => {const m=new Map();Object.defineProperty(window,'localStorage',{value:{getItem(k){return m.get(k)||null},setItem(k,v){m.set(k,String(v))},removeItem(k){m.delete(k)}}});}''')
  assert page.evaluate('async u => {await import(u);return true}',app_url)
  page.wait_for_selector('.hero h1')
  page.evaluate('(u)=>{window.__loomModule=u}',loom_url)
  page.evaluate('''url => {window.Worker=class {constructor(){this.closed=false}postMessage(msg){import(url).then(async mod=>{let payload=msg.type==='sensitivity'?mod.compareConstants(msg.config):msg.type==='loom-study'?(await import(window.__loomModule)).runLoomStudy(msg.config):mod.runBatch(msg.config);if(!this.closed)this.onmessage?.({data:{id:msg.id,ok:true,payload}})}).catch(err=>this.onmessage?.({data:{id:msg.id,ok:false,error:String(err)}}))}terminate(){this.closed=true}}}''',sim_url)
  assert 'Prove the change' in page.locator('h1').inner_text()
  page.screenshot(path=str(ROOT.parent/f'preview-{name}.png'),full_page=True)
  # Damage Lab interactive calculation
  page.evaluate('id => document.querySelector(`[data-page=\"${id}\"]`)?.click()', 'damage')
  assert 'Damage Lab' in page.locator('h1').inner_text()
  before=page.locator('.result-head strong').first.inner_text()
  page.locator('#damageAP').fill('75');page.locator('#damageAP').dispatch_event('change')
  after=page.locator('.result-head strong').first.inner_text()
  assert before!=after,(before,after)
  page.locator('[data-action="save-damage"]').click()
  page.evaluate('id => document.querySelector(`[data-page=\"${id}\"]`)?.click()', 'evidence')
  assert '1 records' in page.locator('.panel-title').all_inner_texts()[1]
  # Loom
  page.evaluate('id => document.querySelector(`[data-page=\"${id}\"]`)?.click()', 'loom')
  assert page.locator('[data-cell]').count()==49
  page.locator('[data-action="loom-auto"]').click()
  assert 'Moves played' in page.locator('.stat-box span').all_inner_texts()
  assert page.locator('.log-row').count()>=1
  page.locator('[data-action="loom-study"]').click()
  page.wait_for_selector('[data-action="loom-study-export"]:not([disabled])',timeout=25000)
  # Draft
  page.evaluate('id => document.querySelector(`[data-page=\"${id}\"]`)?.click()', 'draft')
  page.locator('[data-action="draft-auto"]').click()
  assert 'Draft complete' in page.locator('main').inner_text()
  assert page.locator('[data-pick]:disabled').count()==6
  page.locator('[data-action="draft-to-sim"]').click()
  assert 'Battle Simulator' in page.locator('h1').inner_text()
  # Worker shim exercises same runBatch calculations; browser loader itself doesn't allow workers at about:blank.
  page.locator('#simRuns').select_option('10')
  page.locator('[data-action="sim-run"]').click()
  page.wait_for_selector('[data-action="sim-evidence"]',timeout=20000)
  assert page.locator('.result-head strong').first.inner_text().endswith('%')
  page.screenshot(path=str(ROOT.parent/f'preview-{name}-sim.png'),full_page=True)
  # Experiment tab
  page.evaluate('id => document.querySelector(`[data-page=\"${id}\"]`)?.click()', 'experiments')
  page.locator('#experimentRuns').select_option('10')
  page.locator('[data-action="experiment-run"]').click()
  page.wait_for_selector('[data-action="experiment-export"]:not([disabled])',timeout=20000)
  # Archive and settings
  page.evaluate('id => document.querySelector(`[data-page=\"${id}\"]`)?.click()', 'archive')
  assert page.locator('.form-card').count()==12
  page.locator('#archiveAspect').select_option('Aqua')
  assert page.locator('.form-card').count()==2
  page.evaluate('id => document.querySelector(`[data-page=\"${id}\"]`)?.click()', 'settings')
  assert 'Settings & Sources' in page.locator('h1').inner_text()
  page.locator('#settingsRuleset').select_option('v0.1.2')
  page.locator('[data-action="settings-apply"]').click()
  assert page.locator('#ruleset').input_value()=='v0.1.2'
  # no horizontal overflow at mobile or desktop width
  dims=page.evaluate('''() => ({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth})''')
  assert dims['scroll']<=dims['client']+1,dims
  assert errors==[],errors
  print(name, 'PASS', 'width', dims, 'DOM errors',len(errors))
  browser.close()
