const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const K='freshcart_v1',ST=['Placed','Packed','Out for delivery','Delivered'],inr=n=>'₹'+Number(n).toFixed(0);
const SLOTS=['Today 6–8 PM','Tomorrow 8–10 AM','Tomorrow 12–2 PM','Tomorrow 6–8 PM'];
let db=null;try{db=JSON.parse(localStorage.getItem(K))}catch(e){}
function seed(){const P=[['Tomatoes 1kg','🍅','Vegetables',40],['Potatoes 1kg','🥔','Vegetables',35],['Onions 1kg','🧅','Vegetables',38],['Spinach bunch','🥬','Vegetables',20],['Bananas 1 doz','🍌','Fruits',60],['Apples 1kg','🍎','Fruits',150],['Mangoes 1kg','🥭','Fruits',120],['Milk 1L','🥛','Dairy',58],['Paneer 200g','🧀','Dairy',90],['Eggs 12','🥚','Dairy',84],['Basmati Rice 5kg','🍚','Staples',520],['Wheat Flour 5kg','🌾','Staples',260],['Toor Dal 1kg','🫘','Staples',165],['Bread loaf','🍞','Bakery',45],['Biscuits pack','🍪','Snacks',30],['Orange Juice 1L','🧃','Beverages',110]];
return{users:[{id:1,role:'admin',name:'Store Admin',user:'admin',pass:'admin123'},{id:2,role:'delivery',name:'Ravi Kumar',user:'delivery',pass:'deliver123'},{id:3,role:'customer',name:'Demo Customer',user:'customer',pass:'cust123'}],
products:P.map((p,i)=>({id:i+1,n:p[0],e:p[1],c:p[2],p:p[3],s:30+i*3})),orders:[],coupons:[{code:'FRESH10',pct:10,min:200,on:true},{code:'WELCOME20',pct:20,min:500,on:true}],nid:1001,nu:4,np:17}}
if(!db)db=seed();db.notes=db.notes||[];
const save=()=>{try{localStorage.setItem(K,JSON.stringify(db))}catch(e){toast('⚠ Could not save data in this browser')}};
let me=null;try{me=db.users.find(u=>u.id==localStorage.getItem('fc_me'))||null}catch(e){}
let ui={ai:false,nb:0,ep:0,chat:{customer:[],admin:[],delivery:[]},tab:'',q:'',cat:'All',cart:{},cp:null,role:'customer',mode:'login',err:''};
if(me)ui.tab={customer:'shop',admin:'dash',delivery:'tasks'}[me.role];
function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>t.style.display='none',2200)}
const go=t=>{ui.tab=t;R()};
function login(e){e.preventDefault();const f=e.target,u=f.user.value.trim(),p=f.pass.value;
const x=db.users.find(a=>a.user==u&&a.pass==p&&a.role==ui.role);
if(!x){ui.err='Invalid username or password for '+ui.role+' login.';return R()}
me=x;ui.err='';ui.tab={customer:'shop',admin:'dash',delivery:'tasks'}[x.role];try{localStorage.setItem('fc_me',x.id)}catch(e){}R()}
function signup(e){e.preventDefault();const f=e.target,u=f.user.value.trim();
if(db.users.some(a=>a.user==u)){ui.err='Username already taken.';return R()}
if(f.pass.value.length<4){ui.err='Password must be at least 4 characters.';return R()}
const x={id:db.nu++,role:'customer',name:f.name.value.trim(),user:u,pass:f.pass.value,phone:f.phone.value};db.users.push(x);save();me=x;ui.err='';ui.tab='shop';try{localStorage.setItem('fc_me',x.id)}catch(e){}R()}
function logout(){me=null;ui.ai=false;ui.nb=0;ui.ep=0;ui.cart={};ui.cp=null;ui.err='';try{localStorage.removeItem('fc_me')}catch(e){}R()}
const pid=id=>db.products.find(p=>p.id==id);
function add(id){const p=pid(id),q=ui.cart[id]||0;if(q>=p.s)return toast('Only '+p.s+' in stock');ui.cart[id]=q+1;toast(p.n+' added');R()}
function chg(id,d){const q=(ui.cart[id]||0)+d;if(q<=0)delete ui.cart[id];else if(q<=pid(id).s)ui.cart[id]=q;R()}
function tot(){let sub=0;for(const id in ui.cart)sub+=pid(id).p*ui.cart[id];const c=ui.cp&&db.coupons.find(x=>x.code==ui.cp&&x.on);
const disc=c&&sub>=c.min?Math.round(sub*c.pct/100):0;const fee=sub-disc>=500||!sub?0:40;return{sub,disc,fee,total:sub-disc+fee}}
function applyCp(){const v=$('#cp').value.trim().toUpperCase(),c=db.coupons.find(x=>x.code==v&&x.on);
if(!c)return toast('Invalid coupon');if(tot().sub<c.min)return toast('Minimum order '+inr(c.min));ui.cp=v;toast(c.pct+'% discount applied');R()}
function place(){const t=tot(),a=$('#addr').value.trim(),sl=$('#slot').value;if(!t.sub)return;if(!a)return toast('Enter delivery address');
const id=db.nid++,items=Object.keys(ui.cart).map(k=>{const p=pid(k);p.s-=ui.cart[k];if(p.s<10)note('r:admin','Low stock: '+p.n+' ('+p.s+' left)');return{id:p.id,n:p.n,e:p.e,c:p.c,p:p.p,q:ui.cart[k]}});
me.addr=a;db.orders.unshift({id,uid:me.id,cn:me.name,ph:me.phone||'',items,...t,code:t.disc?ui.cp:'',slot:sl,addr:a,status:'Placed',driver:null,date:new Date().toISOString(),hist:[{s:'Placed',t:new Date().toISOString()}]});
note(me.id,'Order #'+id+' placed successfully – total '+inr(t.total));note('r:admin','New order #'+id+' from '+me.name+' ('+inr(t.total)+')');
save();ui.cart={};ui.cp=null;toast('Order placed!');go('orders')}
function setStatus(id,s){const o=db.orders.find(x=>x.id==id);if(o.status==s)return;if(s=='Cancelled')o.items.forEach(i=>{const p=pid(i.id);if(p)p.s+=i.q});o.status=s;(o.hist=o.hist||[]).push({s,t:new Date().toISOString()});
const m={Packed:'is packed and ready',  'Out for delivery':'is out for delivery 🛵',Delivered:'was delivered. Enjoy! 🎉',Cancelled:'was cancelled'};
if(m[s])note(o.uid,'Order #'+id+' '+m[s]);if(o.driver&&s=='Packed')note(o.driver,'Order #'+id+' is packed – ready for pickup');if(s=='Delivered')note('r:admin','Order #'+id+' delivered');save();R()}
function cancelMine(id){if(confirm('Cancel this order?')){note('r:admin','Customer cancelled order #'+id);setStatus(id,'Cancelled')}}
function assign(id,v){const o=db.orders.find(x=>x.id==id);o.driver=v?+v:null;if(v){note(+v,'New delivery assigned: Order #'+id+' ('+o.slot+')');note(o.uid,'Order #'+id+' will be delivered by '+du(+v).name)}save();toast('Delivery person assigned');R()}
function nextSt(id){const o=db.orders.find(x=>x.id==id),i=ST.indexOf(o.status);if(i<3)setStatus(id,ST[i+1])}
const tagc=s=>s=='Out for delivery'?'Out':s;
function trk(o){if(o.status=='Cancelled')return'<span class="tag Cancelled">Cancelled</span>';const i=ST.indexOf(o.status),h=o.hist||[],pc=i/3*100;
return`<div class="road"><div class="fill" style="width:${pc}%"></div><span class="rider" style="left:${pc}%">${i==3?'🏠':'🛵'}</span></div><div class="trk">${ST.map((s,k)=>{const x=h.find(y=>y.s==s);return`<i class="${k<=i?'on':''}">${s}<br><small>${x?new Date(x.t).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'—'}</small></i>`}).join('')}</div>`}
function nav(tabs,badge){const u=mine().filter(n=>!n.r).length;return`<header><b>🛒 FreshCart</b><nav>${tabs.map(t=>`<button class="${ui.tab==t[0]?'on':''}" onclick="go('${t[0]}')">${t[1]}${t[0]=='cart'&&badge?` (${badge})`:''}</button>`).join('')}</nav><button onclick="ui.nb=!ui.nb;R()" title="Notifications">🔔${u?`<sup>${u}</sup>`:''}</button><span>${esc(me.name)} · ${me.role}</span><button onclick="logout()">Logout</button></header>`}
function authView(){const sg=ui.mode=='signup';return`<div class="auth"><div class="card"><h2 style="margin-top:0">🛒 FreshCart</h2><p class="mu">Fresh groceries, delivered to your door.</p>
<div class="tabs">${['customer','admin','delivery'].map(r=>`<button class="chip ${ui.role==r?'on':''}" onclick="ui.role='${r}';ui.mode='login';ui.err='';R()">${r[0].toUpperCase()+r.slice(1)}</button>`).join('')}</div>
${ui.err?`<p class="err">${ui.err}</p>`:''}
<form onsubmit="${sg?'signup':'login'}(event)">${sg?'<input name="name" placeholder="Full name" required><input name="phone" placeholder="Phone number" required>':''}<input name="user" placeholder="Username" required><input name="pass" type="password" placeholder="Password" required><button class="b" style="width:100%">${sg?'Create account':'Login as '+ui.role}</button></form>
${ui.role=='customer'?`<p class="mu" style="text-align:center">${sg?'Have an account?':'New here?'} <a href="#" onclick="ui.mode='${sg?'login':'signup'}';ui.err='';R();return false">${sg?'Login':'Sign up'}</a></p>`:''}
<p class="mu" style="font-size:13px;margin-bottom:0">Demo: customer/cust123 · admin/admin123 · delivery/deliver123</p></div></div>`}
function pcard(p){return`<div class="card prod">${p.img?`<img src="${p.img}" alt="">`:`<div class="e">${p.e}</div>`}<h4>${esc(p.n)}</h4><small>${esc(p.brand||p.c)}${p.unit?' · '+esc(p.unit):''}</small>${p.desc?`<div class="mu" style="font-size:12px">${esc(p.desc)}</div>`:''}<small class="mu">${p.s>0?(p.s<10?'⚠ Only '+p.s+' left':p.s+' in stock'):'Out of stock'}</small><div class="pr">${inr(p.p)}</div><button class="b s" ${p.s<1?'disabled':''} onclick="add(${p.id})">Add to cart</button></div>`}
function shop(){const cats=['All',...new Set(db.products.map(p=>p.c))],q=ui.q.toLowerCase();
const list=db.products.filter(p=>(ui.cat=='All'||p.c==ui.cat)&&p.n.toLowerCase().includes(q));
const mine=db.orders.filter(o=>o.uid==me.id&&o.status!='Cancelled'),bc=new Set(mine.flatMap(o=>o.items.map(i=>i.c)));
const rec=(bc.size?db.products.filter(p=>bc.has(p.c)&&p.s>0):db.products).slice(0,4);
return`<div class="row"><input id="q" placeholder="🔍 Search groceries" value="${esc(ui.q)}" oninput="ui.q=this.value;R(1)" style="flex:1;min-width:200px"></div>
<div class="row">${cats.map(c=>`<button class="chip ${ui.cat==c?'on':''}" onclick="ui.cat='${c}';R()">${c}</button>`).join('')}</div>
${!q&&ui.cat=='All'?`<h3>${bc.size?'Recommended for you':'Popular picks'}</h3><div class="grid">${rec.map(pcard).join('')}</div><h3>All products</h3>`:''}
<div class="grid">${list.map(pcard).join('')||'<p class="mu">No products found.</p>'}</div>`}
function cart(){const ids=Object.keys(ui.cart),t=tot();if(!ids.length)return'<div class="card">Your cart is empty. <a href="#" onclick="go(\'shop\');return false">Start shopping</a></div>';
const c=ui.cp&&db.coupons.find(x=>x.code==ui.cp);
return`<div class="two"><div class="card tw"><table><tr><th>Item</th><th>Price</th><th>Qty</th><th>Total</th></tr>${ids.map(id=>{const p=pid(id);return`<tr><td>${p.e} ${esc(p.n)}</td><td>${inr(p.p)}</td><td><button class="b s o" onclick="chg(${id},-1)">−</button> ${ui.cart[id]} <button class="b s o" onclick="chg(${id},1)">+</button></td><td>${inr(p.p*ui.cart[id])}</td></tr>`}).join('')}</table></div>
<div class="card"><h3 style="margin-top:0">Checkout</h3><div class="row"><input id="cp" placeholder="Coupon code" value="${ui.cp||''}" style="flex:1;min-width:0"><button class="b o" onclick="applyCp()">Apply</button></div>
<div class="row" style="display:block"><label class="mu">Delivery slot</label><br><select id="slot" style="width:100%">${SLOTS.map(s=>`<option>${s}</option>`).join('')}</select></div>
<textarea id="addr" rows="3" placeholder="Delivery address" style="width:100%;margin-bottom:10px">${esc(me.addr||'')}</textarea>
<p>Subtotal: <b>${inr(t.sub)}</b><br>Discount${c?' ('+c.code+')':''}: <b>−${inr(t.disc)}</b><br>Delivery: <b>${t.fee?inr(t.fee):'FREE'}</b><br><span style="font-size:18px">Total: <b>${inr(t.total)}</b></span></p><p class="mu" style="font-size:13px">Free delivery above ₹500.</p>
<button class="b" style="width:100%" onclick="place()">Place order</button></div></div>`}
function ordCard(o,role){const d=o.driver&&du(o.driver);return`<div class="card"><div class="row" style="justify-content:space-between;margin:0"><b>Order #${o.id}</b><span class="mu">${new Date(o.date).toLocaleString()}</span></div>
<div class="mu">${o.items.map(i=>i.e+' '+esc(i.n)+' ×'+i.q).join(', ')}</div><div class="mu" style="font-size:13px">📍 ${esc(o.addr)} · 🕒 ${o.slot}</div>${trk(o)}
<div class="row" style="margin:0;justify-content:space-between"><span>Total <b>${inr(o.total)}</b>${o.code?' · coupon '+o.code:''}</span>${d?`<span class="mu">🛵 ${esc(d.name)}${d.phone?' · 📞 '+esc(d.phone):''}${d.veh?' · '+esc(d.veh):''}</span>`:''}${role=='c'&&o.status=='Placed'?`<button class="b d s" onclick="cancelMine(${o.id})">Cancel</button>`:''}</div></div>`}
function myOrders(){const l=db.orders.filter(o=>o.uid==me.id);return l.length?l.map(o=>ordCard(o,'c')).join(''):'<div class="card">No orders yet.</div>'}
function dash(){const ok=db.orders.filter(o=>o.status!='Cancelled'),rev=ok.reduce((a,o)=>a+o.total,0),ds=ok.reduce((a,o)=>a+o.disc,0),low=db.products.filter(p=>p.s<10).length;
const bycat={};ok.forEach(o=>o.items.forEach(i=>bycat[i.c]=(bycat[i.c]||0)+i.p*i.q));const mx=Math.max(1,...Object.values(bycat));
return`<div class="stats"><div class="stat"><small>Total sales</small><h2>${inr(rev)}</h2></div><div class="stat"><small>Orders</small><h2>${ok.length}</h2></div><div class="stat"><small>Discounts given</small><h2>${inr(ds)}</h2></div><div class="stat"><small>Pending orders</small><h2>${db.orders.filter(o=>o.status=='Placed').length}</h2></div><div class="stat"><small>Low stock items</small><h2>${low}</h2></div></div>
<div class="card"><h3 style="margin-top:0">Sales by category</h3>${Object.keys(bycat).map(c=>`<div class="row"><span style="width:100px">${c}</span><div style="flex:1"><div class="bar" style="width:${bycat[c]/mx*100}%"></div></div><b>${inr(bycat[c])}</b></div>`).join('')||'<p class="mu">No sales yet.</p>'}</div>`}
function aOrders(){const dv=db.users.filter(u=>u.role=='delivery');return`<div class="card tw"><table><tr><th>#</th><th>Customer</th><th>Total</th><th>Slot</th><th>Status</th><th>Delivery person</th></tr>${db.orders.map(o=>`<tr><td>${o.id}</td><td>${esc(o.cn)}<br><small class="mu">${esc(o.addr)}</small></td><td>${inr(o.total)}</td><td>${o.slot}</td>
<td><select onchange="setStatus(${o.id},this.value)">${[...ST,'Cancelled'].map(s=>`<option ${s==o.status?'selected':''}>${s}</option>`).join('')}</select></td>
<td><select onchange="assign(${o.id},this.value)"><option value="">Unassigned</option>${dv.map(d=>`<option value="${d.id}" ${o.driver==d.id?'selected':''}>${esc(d.name)}</option>`).join('')}</select></td></tr>`).join('')||'<tr><td colspan=6 class="mu">No orders yet.</td></tr>'}</table></div>`}
function upd(id,k,v){const p=pid(id);p[k]=Math.max(0,+v);save();toast('Updated')}
function saveProd(e){e.preventDefault();const f=e.target,fi=f.img.files[0];
const fin=img=>{const d={n:f.n.value.trim(),e:f.e.value||'🛍️',c:f.c.value.trim(),brand:f.brand.value.trim(),unit:f.unit.value.trim(),p:+f.p.value,s:+f.s.value,desc:f.desc.value.trim()};if(img)d.img=img;
if(ui.ep)Object.assign(pid(ui.ep),d);else db.products.push({id:db.np++,...d});save();toast(ui.ep?'Product updated':'Product added');ui.ep=0;R()};
if(!fi)return fin();const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas'),k=Math.min(1,160/Math.max(im.width,im.height));c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);fin(c.toDataURL('image/jpeg',.7))};im.src=r.result};r.readAsDataURL(fi)}
function delProd(id){if(confirm('Delete product?')){db.products=db.products.filter(p=>p.id!=id);delete ui.cart[id];save();R()}}
function aProds(){const ep=pid(ui.ep)||{};return`<div class="card"><h3 style="margin-top:0">${ep.id?'Edit product #'+ep.id:'Add new product'}</h3><form class="row" onsubmit="saveProd(event)" style="margin:0" id="pf"><input name="n" placeholder="Product name" required value="${esc(ep.n||'')}"><input name="e" placeholder="Emoji" style="width:70px" value="${esc(ep.e||'')}"><input name="c" placeholder="Category" required list="cl" value="${esc(ep.c||'')}"><datalist id="cl">${[...new Set(db.products.map(p=>p.c))].map(c=>`<option>${c}</option>`).join('')}</datalist><input name="brand" placeholder="Brand" value="${esc(ep.brand||'')}"><input name="unit" placeholder="Unit (1 kg, 500 ml)" value="${esc(ep.unit||'')}"><input name="p" type="number" min="1" placeholder="Price ₹" required style="width:100px" value="${ep.p||''}"><input name="s" type="number" min="0" placeholder="Stock" required style="width:90px" value="${ep.s??''}"><input name="desc" placeholder="Description" style="flex:1;min-width:200px" value="${esc(ep.desc||'')}"><label class="mu">Photo <input type="file" name="img" accept="image/*"></label><button class="b">${ep.id?'Update product':'Add product'}</button>${ep.id?'<button type="button" class="b o" onclick="ui.ep=0;R()">Cancel</button>':''}</form></div>
<div class="card tw"><table><tr><th>Product</th><th>Category</th><th>Price ₹</th><th>Stock</th><th></th></tr>${db.products.map(p=>`<tr><td>${p.img?`<img src="${p.img}" width="26" height="26" style="border-radius:6px;vertical-align:middle">`:p.e} ${esc(p.n)}<br><small class="mu">${esc(p.brand||'')} ${esc(p.unit||'')}</small></td><td>${esc(p.c)}</td><td><input type="number" value="${p.p}" style="width:90px" onchange="upd(${p.id},'p',this.value)"></td><td><input type="number" value="${p.s}" style="width:80px" onchange="upd(${p.id},'s',this.value)"></td><td><button class="b o s" onclick="ui.ep=${p.id};R();scrollTo(0,0)">Edit</button> <button class="b d s" onclick="delProd(${p.id})">Delete</button></td></tr>`).join('')}</table></div>`}
function addCp(e){e.preventDefault();const f=e.target,c=f.code.value.trim().toUpperCase();if(db.coupons.some(x=>x.code==c))return toast('Code exists');db.coupons.push({code:c,pct:+f.pct.value,min:+f.min.value,on:true});save();R()}
function tglCp(c){const x=db.coupons.find(y=>y.code==c);x.on=!x.on;save();R()}
function delCp(c){db.coupons=db.coupons.filter(y=>y.code!=c);save();R()}
function aCoupons(){return`<div class="card"><form class="row" onsubmit="addCp(event)" style="margin:0"><input name="code" placeholder="CODE" required><input name="pct" type="number" min="1" max="90" placeholder="Discount %" required><input name="min" type="number" min="0" placeholder="Min order ₹" required><button class="b">Create coupon</button></form></div>
<div class="card tw"><table><tr><th>Code</th><th>Discount</th><th>Min order</th><th>Used</th><th>Status</th><th></th></tr>${db.coupons.map(c=>`<tr><td><b>${esc(c.code)}</b></td><td>${c.pct}%</td><td>${inr(c.min)}</td><td>${db.orders.filter(o=>o.code==c.code&&o.status!='Cancelled').length}×</td><td><span class="tag ${c.on?'':'Cancelled'}">${c.on?'Active':'Off'}</span></td><td><button class="b o s" onclick="tglCp('${c.code}')">${c.on?'Disable':'Enable'}</button> <button class="b d s" onclick="delCp('${c.code}')">Delete</button></td></tr>`).join('')}</table></div>`}
function aCust(){const cs=db.users.filter(u=>u.role=='customer');return`<div class="card tw"><table><tr><th>Name</th><th>Username</th><th>Phone</th><th>Address</th><th>Orders</th><th>Spent</th><th></th></tr>${cs.map(u=>{const o=db.orders.filter(x=>x.uid==u.id&&x.status!='Cancelled');return`<tr><td>${esc(u.name)}</td><td>${esc(u.user)}</td><td>${esc(u.phone||'-')}</td><td>${esc(u.addr||'-')}</td><td>${o.length}</td><td>${inr(o.reduce((a,x)=>a+x.total,0))}</td><td><button class="b d s" onclick="delUser(${u.id})">Remove</button></td></tr>`}).join('')}</table></div>`}
function delUser(id){if(confirm('Remove this user?')){db.users=db.users.filter(u=>u.id!=id);save();R()}}
function addStaff(e){e.preventDefault();const f=e.target;if(db.users.some(a=>a.user==f.user.value))return toast('Username taken');db.users.push({id:db.nu++,role:'delivery',name:f.name.value,user:f.user.value,pass:f.pass.value,phone:f.phone.value,veh:f.veh.value});save();R()}
function aStaff(){return`<div class="card"><form class="row" onsubmit="addStaff(event)" style="margin:0"><input name="name" placeholder="Name" required><input name="phone" placeholder="Phone" required><input name="veh" placeholder="Vehicle no."><input name="user" placeholder="Username" required><input name="pass" placeholder="Password" required><button class="b">Add delivery person</button></form></div>
<div class="card tw"><table><tr><th>Name</th><th>Phone</th><th>Vehicle</th><th>Username</th><th>Assigned</th><th>Delivered</th><th></th></tr>${db.users.filter(u=>u.role=='delivery').map(u=>`<tr><td>${esc(u.name)}</td><td>${esc(u.phone||'-')}</td><td>${esc(u.veh||'-')}</td><td>${esc(u.user)}</td><td>${db.orders.filter(o=>o.driver==u.id).length}</td><td>${db.orders.filter(o=>o.driver==u.id&&o.status=='Delivered').length}</td><td><button class="b d s" onclick="delUser(${u.id})">Remove</button></td></tr>`).join('')}</table></div>`}
function tasks(){const l=db.orders.filter(o=>o.driver==me.id),act=l.filter(o=>!['Delivered','Cancelled'].includes(o.status));
return`<div class="stats"><div class="stat"><small>Active deliveries</small><h2>${act.length}</h2></div><div class="stat"><small>Completed</small><h2>${l.filter(o=>o.status=='Delivered').length}</h2></div></div>
${l.map(o=>`<div class="card"><b>Order #${o.id}</b> · ${esc(o.cn)}${o.ph?' · 📞 '+esc(o.ph):''} · ${inr(o.total)}<br><span class="mu">📍 ${esc(o.addr)} · 🕒 ${o.slot}</span>${trk(o)}
${o.status=='Packed'?`<button class="b" onclick="nextSt(${o.id})">Pick up – Out for delivery</button>`:o.status=='Out for delivery'?`<button class="b" onclick="nextSt(${o.id})">Mark delivered</button>`:o.status=='Placed'?'<span class="mu">Waiting for store to pack this order</span>':''}</div>`).join('')||'<div class="card">No deliveries assigned yet.</div>'}`}
const du=id=>db.users.find(u=>u.id==id)||{name:'(removed)'};
function note(to,msg){db.notes.unshift({id:Date.now()+Math.random(),to,msg,t:new Date().toISOString(),r:0});db.notes=db.notes.slice(0,200)}
const mine=()=>db.notes.filter(n=>n.to===me.id||n.to==='r:'+me.role);
const ago=t=>{const m=Math.round((Date.now()-new Date(t))/6e4);return m<1?'just now':m<60?m+' min ago':new Date(t).toLocaleString()};
function readAll(){mine().forEach(n=>n.r=1);save();ui.nb=0;R()}
function bar(){const l=mine(),u=l.filter(n=>!n.r);let h='';
if(u.length)h+=`<div class="nbar">🔔 <span>${esc(u[0].msg)} <small>· ${ago(u[0].t)}</small></span><button onclick="readAll()">${u.length>1?'Mark all read ('+u.length+')':'Dismiss'}</button></div>`;
if(ui.nb)h+=`<div class="card"><b>Notifications</b>${l.slice(0,15).map(n=>`<div class="ni ${n.r?'':'un'}">${esc(n.msg)}<small>${ago(n.t)}</small></div>`).join('')||'<p class="mu">No notifications yet.</p>'}</div>`;return h}
function prof(){const u=me,c=u.role=='customer',d=u.role=='delivery';
return`<div class="card" style="max-width:520px"><h3 style="margin-top:0">My profile</h3><form onsubmit="saveProf(event)" class="auth" style="margin:0;max-width:none"><label class="mu">Full name</label><input name="name" value="${esc(u.name)}" required><label class="mu">Phone</label><input name="phone" value="${esc(u.phone||'')}">${c?`<label class="mu">Saved delivery address</label><textarea name="addr" rows="3" style="width:100%;margin-bottom:10px">${esc(u.addr||'')}</textarea>`:''}${d?`<label class="mu">Vehicle number</label><input name="veh" value="${esc(u.veh||'')}">`:''}<label class="mu">New password (leave blank to keep)</label><input name="pass" type="password"><button class="b">Save profile</button></form><p class="mu" style="font-size:13px;margin-bottom:0">Username: ${esc(u.user)} · Role: ${u.role}</p></div>`+(u.role=='admin'?`<div class="card" style="max-width:520px"><h3 style="margin-top:0">Data backup</h3><p class="mu">Users, products, orders and coupons are saved automatically in this browser. Export a backup file to keep a copy or move the data to another computer.</p><button class="b" onclick="expo()">⬇ Export data</button> <label class="b o" style="display:inline-block">⬆ Import<input type="file" accept=".json" hidden onchange="impo(this)"></label></div>`:'')}
function saveProf(e){e.preventDefault();const f=e.target;me.name=f.name.value.trim();me.phone=f.phone.value.trim();if(f.addr)me.addr=f.addr.value.trim();if(f.veh)me.veh=f.veh.value.trim();if(f.pass.value){if(f.pass.value.length<4)return toast('Password needs 4+ characters');me.pass=f.pass.value}save();toast('Profile saved');R()}
function expo(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(db,null,1)],{type:'application/json'}));a.download='freshcart-data.json';a.click()}
function impo(i){const f=i.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.users||!d.products)throw 0;db=d;db.notes=db.notes||[];save();me=db.users.find(u=>u.id==me.id)||null;toast('Data imported');R()}catch(x){toast('Invalid backup file')}};r.readAsText(f)}
window.addEventListener('storage',e=>{if(e.key!=K||!me)return;try{db=JSON.parse(e.newValue)||db;db.notes=db.notes||[]}catch(x){return}
me=db.users.find(u=>u.id==me.id);if(!me)return logout();R(1);const u=mine().filter(n=>!n.r);if(u.length)toast('🔔 '+u[0].msg)});
/* ---- AI assistants (separate per role, run offline on the store data) ---- */
const AIN={customer:'Shopping Assistant',admin:'Store Analyst',delivery:'Delivery Helper'};
const AIS={customer:['Track my order','Active coupons','Recommend something','What is in my cart?'],admin:['Sales summary','Low stock items','Pending orders','Top selling product'],delivery:['My next delivery','How many deliveries today?','How to update status?']};
const act=o=>!['Delivered','Cancelled'].includes(o.status);
function ai(q){const t=q.toLowerCase(),has=(...w)=>w.some(x=>t.includes(x)),r=me.role,num=(t.match(/\d{4}/)||[])[0],L=a=>a.join('<br>');
const pm=db.products.filter(p=>p.n.toLowerCase().split(' ').some(w=>w.length>3&&t.includes(w)));
const pinfo=()=>L(pm.slice(0,4).map(p=>`${p.e} <b>${esc(p.n)}</b> – ${inr(p.p)} · ${p.s>0?p.s+' in stock':'out of stock'}`));
if(/^(hi|hello|hey|help)\b/.test(t))return'I can help with: '+AIS[r].join(', ').toLowerCase()+'.';
if(r=='customer'){const mo=db.orders.filter(o=>o.uid==me.id);
 if(pm.length&&has('price','cost','much','stock','have','available','sell'))return pinfo();
 if(has('track','where','status','order','deliver')){let l=num?mo.filter(o=>o.id==num):mo.filter(act);if(!l.length)l=mo.slice(0,1);if(!l.length)return'You have no orders yet. Browse the Shop and place your first order!';
  return l.map(o=>L([`<b>Order #${o.id}</b> – ${o.status}`,`${o.items.length} item(s) · ${inr(o.total)} · ${o.slot}`,o.driver?'🛵 '+esc(du(o.driver).name):'Waiting for a delivery partner'])).join('<hr>')+'<br><small>Live tracking is in My Orders.</small>'}
 if(has('coupon','discount','offer','promo','code'))return'Active coupons:<br>'+(L(db.coupons.filter(c=>c.on).map(c=>`<b>${esc(c.code)}</b> – ${c.pct}% off above ${inr(c.min)}`))||'None right now.');
 if(has('recommend','suggest','popular','what should')){const bc=new Set(mo.filter(o=>o.status!='Cancelled').flatMap(o=>o.items.map(i=>i.c))),rc=db.products.filter(p=>p.s>0&&(!bc.size||bc.has(p.c))).slice(0,4);return(bc.size?'Based on your past orders you may like:<br>':'Popular picks:<br>')+L(rc.map(p=>`${p.e} ${esc(p.n)} – ${inr(p.p)}`))}
 if(has('cart','basket')){const k=Object.keys(ui.cart);if(!k.length)return'Your cart is empty.';const x=tot();return L(k.map(i=>`${pid(i).e} ${esc(pid(i).n)} ×${ui.cart[i]}`))+`<br><b>Total ${inr(x.total)}</b> (discount ${inr(x.disc)}, delivery ${x.fee?inr(x.fee):'free'})`}
 if(has('cancel'))return'You can cancel from My Orders while the status is "Placed". After packing it cannot be cancelled.';
 if(has('fee','charge','free','slot','time'))return'Delivery is free above ₹500, otherwise ₹40. Slots: '+SLOTS.join(', ')+'.';
 if(pm.length)return pinfo()}
if(r=='admin'){const ok=db.orders.filter(o=>o.status!='Cancelled'),rev=ok.reduce((a,o)=>a+o.total,0),ds=ok.reduce((a,o)=>a+o.disc,0);
 if(has('sale','revenue','earn','income','summary'))return L([`💰 Total sales: <b>${inr(rev)}</b> from ${ok.length} orders`,`🏷 Discounts given: ${inr(ds)}`,`📈 Average order: ${inr(ok.length?rev/ok.length:0)}`,`⏳ Pending: ${db.orders.filter(o=>o.status=='Placed').length} · Cancelled: ${db.orders.length-ok.length}`]);
 if(has('stock','inventory','low','restock')){const l=db.products.filter(p=>p.s<10);return l.length?'Low stock:<br>'+L(l.map(p=>`⚠ ${esc(p.n)} – ${p.s} left`)):'All products are well stocked.'}
 if(has('pending','new order','unassigned','assign')){const l=db.orders.filter(o=>o.status=='Placed'||(act(o)&&!o.driver));return l.length?L(l.map(o=>`#${o.id} ${esc(o.cn)} – ${o.status}${o.driver?'':' (no delivery person)'}`)):'No pending or unassigned orders.'}
 if(has('top','best','popular','selling')){const m={};ok.forEach(o=>o.items.forEach(i=>m[i.n]=(m[i.n]||0)+i.q));const e=Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,3);return e.length?'Top sellers:<br>'+L(e.map(x=>`${esc(x[0])} – ${x[1]} sold`)):'No sales yet.'}
 if(has('coupon','discount','promo'))return L(db.coupons.map(c=>`${esc(c.code)} (${c.pct}%) – used ${db.orders.filter(o=>o.code==c.code&&o.status!='Cancelled').length}× · ${c.on?'active':'off'}`));
 if(has('customer'))return db.users.filter(u=>u.role=='customer').length+' registered customers.';
 if(has('deliver','staff','driver'))return L(db.users.filter(u=>u.role=='delivery').map(u=>`🛵 ${esc(u.name)} – ${db.orders.filter(o=>o.driver==u.id&&act(o)).length} active, ${db.orders.filter(o=>o.driver==u.id&&o.status=='Delivered').length} delivered`))}
if(r=='delivery'){const l=db.orders.filter(o=>o.driver==me.id),a=l.filter(act);
 if(has('update','how to','how do'))return'Open <b>My Deliveries</b>. Once the store packs an order tap "Pick up – Out for delivery", then "Mark delivered" after handing over the groceries. The customer is notified automatically.';
 if(has('how many','count','completed','done','today'))return`You have <b>${a.length}</b> active and <b>${l.filter(o=>o.status=='Delivered').length}</b> completed deliveries.`;
 if(has('next','task','current','pending','address','where','order')){const x=num?l.find(o=>o.id==num):a[0];if(!x)return'No active deliveries assigned to you right now.';return L([`<b>Order #${x.id}</b> – ${x.status}`,`👤 ${esc(x.cn)}${x.ph?' · 📞 '+esc(x.ph):''}`,`📍 ${esc(x.addr)}`,`🕒 ${x.slot} · 💵 ${inr(x.total)}`])}}
return'Sorry, I did not get that. Try: '+AIS[r].join(' · ')}
function aiR(){const el=$('#ai');el.dataset.r=me?me.role:'';if(!me){el.innerHTML='';return}const r=me.role,m=ui.chat[r];
el.innerHTML=`<button class="aib" onclick="ui.ai=!ui.ai;aiR()" title="${AIN[r]}">${ui.ai?'✕':'🤖'}</button>`+(ui.ai?`<div class="aip"><div class="aih">🤖 ${AIN[r]}</div><div class="aim" id="aim">${m.length?m.map(x=>`<div class="m ${x[0]}">${x[1]}</div>`).join(''):`<div class="m b">Hi ${esc(me.name.split(' ')[0])}! I am your ${AIN[r].toLowerCase()}. Pick a question below or type your own.</div>`}</div><div class="aic">${AIS[r].map(s=>`<button class="chip" onclick="aiAsk('${s}')">${s}</button>`).join('')}</div><form onsubmit="aiSend(event)" class="row" style="margin:0;padding:8px"><input id="aiq" placeholder="Type your question…" style="flex:1;min-width:0" autocomplete="off"><button class="b">Send</button></form></div>`:'');
const a=$('#aim');if(a)a.scrollTop=a.scrollHeight;const i=$('#aiq');if(i)i.focus()}
function aiSend(e){e.preventDefault();const v=$('#aiq').value.trim();if(v)aiAsk(v)}
function aiAsk(q){ui.chat[me.role].push(['u',esc(q)],['b',ai(q)]);aiR()}
document.body.insertAdjacentHTML('beforeend','<div id="ai"></div>');
function R(keep){for(const id in ui.cart)if(!pid(id))delete ui.cart[id];
if(!me){$('#app').innerHTML=authView();if($('#ai').dataset.r)aiR();return}
const n=Object.values(ui.cart).reduce((a,b)=>a+b,0),pf=['prof','👤 Profile'];let h,body;
if(me.role=='customer'){h=nav([['shop','Shop'],['cart','Cart'],['orders','My Orders'],pf],n);body={shop,cart,orders:myOrders,prof}[ui.tab]()}
else if(me.role=='admin'){h=nav([['dash','Dashboard'],['orders','Orders'],['products','Inventory'],['coupons','Discounts'],['cust','Customers'],['staff','Delivery Staff'],pf]);body={dash,orders:aOrders,products:aProds,coupons:aCoupons,cust:aCust,staff:aStaff,prof}[ui.tab]()}
else{h=nav([['tasks','My Deliveries'],pf]);body=(ui.tab=='prof'?prof:tasks)()}
const y=window.scrollY;$('#app').innerHTML=h+'<main>'+bar()+body+'</main>';
if(keep){const q=$('#q');if(q){q.focus();q.setSelectionRange(q.value.length,q.value.length)}window.scrollTo(0,y)}
if($('#ai').dataset.r!=me.role)aiR()}

R();
