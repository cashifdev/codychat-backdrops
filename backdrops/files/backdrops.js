/*!
 * Backdrops for Codychat 10.1
 * Animated chat backgrounds that react to your mouse and finger.
 * by M Kashif (github.com/cashifdev) · see it live at chatnoregister.com
 * MIT License
 */
(function(){
	'use strict';
	if(window.Backdrops && window.Backdrops.ready){ return; }

	var TAU = Math.PI * 2;
	function rnd(a, b){ return a + Math.random() * (b - a); }
	function pick(a){ return a[Math.floor(Math.random() * a.length)]; }
	function clamp(v, a, b){ return v < a ? a : (v > b ? b : v); }
	function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
	function rgba(hex, a){
		var n = parseInt(hex.slice(1), 16);
		return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
	}
	function isPhone(){
		return !!((window.matchMedia && matchMedia('(pointer: coarse)').matches) || window.innerWidth < 760);
	}
	function calm(){ return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
	function bg(s, top, bottom){
		var g = s.ctx.createLinearGradient(0, 0, 0, s.h);
		g.addColorStop(0, top); g.addColorStop(1, bottom);
		s.ctx.fillStyle = g; s.ctx.fillRect(0, 0, s.w, s.h);
	}

	/* ======================= the four styles ======================= */
	var STYLES = {};

	/* ---- Aurora: soft colour clouds that drift and lean towards the pointer ---- */
	STYLES.aurora = {
		pal: {
			dark:  { top: '#060a1c', bottom: '#111736', c: ['#22d3ee', '#a78bfa', '#f472b6', '#34d399', '#60a5fa'], a: 0.42, glow: '#e0f2fe' },
			light: { top: '#f8faff', bottom: '#eef1ff', c: ['#67e8f9', '#c4b5fd', '#f9a8d4', '#86efac', '#93c5fd'], a: 0.5, glow: '#ffffff' }
		},
		init: function(s){
			s.blobs = [];
			var n = Math.round(5 * s.busy) + 1;
			for(var i = 0; i < n; i++){
				s.blobs.push({ x: rnd(0, s.w), y: rnd(0, s.h), vx: rnd(-14, 14), vy: rnd(-10, 10), r: rnd(0.32, 0.55) * Math.max(s.w, s.h), c: s.pal.c[i % s.pal.c.length], ph: rnd(0, TAU) });
			}
		},
		frame: function(s, t, dt){
			var x = s.ctx, p = s.pal;
			bg(s, p.top, p.bottom);
			x.globalCompositeOperation = s.dark ? 'lighter' : 'source-over';
			for(var i = 0; i < s.blobs.length; i++){
				var b = s.blobs[i];
				if(s.ptr.on){
					var dx = s.ptr.x - b.x, dy = s.ptr.y - b.y, d = Math.sqrt(dx * dx + dy * dy) + 1;
					var f = 26 * Math.min(1, 260 / d);
					b.vx += dx / d * f * dt; b.vy += dy / d * f * dt;
				}
				b.vx = clamp(b.vx * 0.995, -40, 40); b.vy = clamp(b.vy * 0.995, -40, 40);
				b.x += b.vx * dt; b.y += b.vy * dt;
				if(b.x < -b.r * 0.3 || b.x > s.w + b.r * 0.3){ b.vx *= -1; b.x = clamp(b.x, -b.r * 0.3, s.w + b.r * 0.3); }
				if(b.y < -b.r * 0.3 || b.y > s.h + b.r * 0.3){ b.vy *= -1; b.y = clamp(b.y, -b.r * 0.3, s.h + b.r * 0.3); }
				var r = b.r * (0.9 + 0.1 * Math.sin(t * 0.0006 + b.ph));
				var g = x.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
				g.addColorStop(0, rgba(b.c, p.a)); g.addColorStop(0.55, rgba(b.c, p.a * 0.35)); g.addColorStop(1, rgba(b.c, 0));
				x.fillStyle = g; x.fillRect(b.x - r, b.y - r, r * 2, r * 2);
			}
			/* the pointer glow and tap flashes */
			if(s.ptr.on){
				var gg = x.createRadialGradient(s.ptr.x, s.ptr.y, 0, s.ptr.x, s.ptr.y, 150);
				gg.addColorStop(0, rgba(p.glow, s.dark ? 0.22 : 0.6)); gg.addColorStop(1, rgba(p.glow, 0));
				x.fillStyle = gg; x.fillRect(s.ptr.x - 150, s.ptr.y - 150, 300, 300);
			}
			s.taps = s.taps.filter(function(k){
				var age = (t - k.t) / 1200; if(age > 1){ return false; }
				var rr = 30 + age * 260, c = s.pal.c[k.i % s.pal.c.length];
				var g2 = x.createRadialGradient(k.x, k.y, rr * 0.4, k.x, k.y, rr);
				g2.addColorStop(0, rgba(c, 0)); g2.addColorStop(0.8, rgba(c, 0.35 * (1 - age))); g2.addColorStop(1, rgba(c, 0));
				x.fillStyle = g2; x.fillRect(k.x - rr, k.y - rr, rr * 2, rr * 2);
				return true;
			});
			x.globalCompositeOperation = 'source-over';
		}
	};

	/* ---- Constellation: drifting stars joined by lines, reaching out to the pointer ---- */
	STYLES.stars = {
		pal: {
			dark:  { top: '#050914', bottom: '#0c1430', dot: '#c7d2fe', line: '#818cf8', hot: '#38bdf8' },
			light: { top: '#f8fafc', bottom: '#eef2ff', dot: '#475569', line: '#6366f1', hot: '#0284c7' }
		},
		init: function(s){
			s.dots = [];
			var n = clamp(Math.round(s.w * s.h / 9000 * s.busy), 24, s.phone ? 70 : 170);
			for(var i = 0; i < n; i++){
				s.dots.push({ x: rnd(0, s.w), y: rnd(0, s.h), vx: rnd(-12, 12), vy: rnd(-12, 12), r: rnd(0.8, 2.2), tw: rnd(0, TAU) });
			}
		},
		frame: function(s, t, dt){
			var x = s.ctx, p = s.pal, D = s.phone ? 95 : 115, D2 = D * D, P = 170;
			bg(s, p.top, p.bottom);
			var d = s.dots, i, j, a, b;
			/* shockwaves from taps push stars out */
			s.taps = s.taps.filter(function(k){
				var age = (t - k.t) / 900; if(age > 1){ return false; }
				if(!k.hit){
					k.hit = 1;
					for(var q = 0; q < d.length; q++){
						var ex = d[q].x - k.x, ey = d[q].y - k.y, e = Math.sqrt(ex * ex + ey * ey) + 1;
						if(e < 240){ var f = (1 - e / 240) * 260; d[q].vx += ex / e * f; d[q].vy += ey / e * f; }
					}
				}
				x.strokeStyle = rgba(p.hot, 0.5 * (1 - age)); x.lineWidth = 2;
				x.beginPath(); x.arc(k.x, k.y, 20 + age * 220, 0, TAU); x.stroke();
				return true;
			});
			for(i = 0; i < d.length; i++){
				a = d[i];
				if(s.ptr.on){
					var px = a.x - s.ptr.x, py = a.y - s.ptr.y, pd = Math.sqrt(px * px + py * py) + 1;
					if(pd < 110){ var f = (1 - pd / 110) * 140 * dt * 8; a.vx += px / pd * f; a.vy += py / pd * f; }
				}
				var sp = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
				if(sp > 14){ a.vx *= 0.96; a.vy *= 0.96; }
				a.x += a.vx * dt; a.y += a.vy * dt;
				if(a.x < 0){ a.x = 0; a.vx = Math.abs(a.vx); } else if(a.x > s.w){ a.x = s.w; a.vx = -Math.abs(a.vx); }
				if(a.y < 0){ a.y = 0; a.vy = Math.abs(a.vy); } else if(a.y > s.h){ a.y = s.h; a.vy = -Math.abs(a.vy); }
			}
			x.lineWidth = 1;
			for(i = 0; i < d.length; i++){
				a = d[i];
				for(j = i + 1; j < d.length; j++){
					b = d[j];
					var dx = a.x - b.x, dy = a.y - b.y, dd = dx * dx + dy * dy;
					if(dd < D2){
						x.strokeStyle = rgba(p.line, (1 - dd / D2) * (s.dark ? 0.38 : 0.3));
						x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke();
					}
				}
				if(s.ptr.on){
					var ux = a.x - s.ptr.x, uy = a.y - s.ptr.y, ud = Math.sqrt(ux * ux + uy * uy);
					if(ud < P){
						x.strokeStyle = rgba(p.hot, (1 - ud / P) * 0.7);
						x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(s.ptr.x, s.ptr.y); x.stroke();
					}
				}
			}
			for(i = 0; i < d.length; i++){
				a = d[i];
				x.fillStyle = rgba(p.dot, 0.55 + 0.45 * Math.sin(t * 0.002 + a.tw));
				x.beginPath(); x.arc(a.x, a.y, a.r, 0, TAU); x.fill();
			}
			if(s.ptr.on){ x.fillStyle = rgba(p.hot, 0.9); x.beginPath(); x.arc(s.ptr.x, s.ptr.y, 2.6, 0, TAU); x.fill(); }
		}
	};

	/* ---- Bubbles: bubbles float up; push them around, tap to pop ---- */
	STYLES.bubbles = {
		pal: {
			dark:  { top: '#03111f', bottom: '#0a2c47', edge: '#7dd3fc', fill: '#38bdf8', shine: '#ffffff' },
			light: { top: '#f3fbff', bottom: '#dff2fd', edge: '#0ea5e9', fill: '#7dd3fc', shine: '#ffffff' }
		},
		make: function(s, bottom){
			var r = rnd(6, s.phone ? 26 : 34);
			return { x: rnd(0, s.w), y: bottom ? s.h + r + rnd(0, 80) : rnd(0, s.h), r: r, vy: rnd(14, 40) * (40 / (r + 20)), vx: 0, ph: rnd(0, TAU) };
		},
		init: function(s){
			s.bub = []; s.drops = [];
			var n = Math.round(clamp(s.w * s.h / 22000, 10, 36) * s.busy);
			for(var i = 0; i < n; i++){ s.bub.push(this.make(s, false)); }
		},
		pop: function(s, b){
			for(var i = 0; i < 9; i++){
				var a = i / 9 * TAU;
				s.drops.push({ x: b.x + Math.cos(a) * b.r, y: b.y + Math.sin(a) * b.r, vx: Math.cos(a) * rnd(60, 140), vy: Math.sin(a) * rnd(60, 140), life: 1 });
			}
		},
		frame: function(s, t, dt){
			var x = s.ctx, p = s.pal, self = this;
			bg(s, p.top, p.bottom);
			s.taps = s.taps.filter(function(k){
				if(k.hit){ return false; }
				k.hit = 1;
				var best = -1, bd = 1e9;
				for(var q = 0; q < s.bub.length; q++){
					var ex = s.bub[q].x - k.x, ey = s.bub[q].y - k.y, e = Math.sqrt(ex * ex + ey * ey) - s.bub[q].r;
					if(e < bd){ bd = e; best = q; }
				}
				if(best >= 0 && bd < 50){ self.pop(s, s.bub[best]); s.bub[best] = self.make(s, true); }
				else { for(var m = 0; m < 3; m++){ var nb = self.make(s, false); nb.x = k.x + rnd(-20, 20); nb.y = k.y + rnd(-10, 10); nb.r = rnd(5, 14); s.bub.push(nb); } if(s.bub.length > 80){ s.bub.splice(0, 3); } }
				return false;
			});
			for(var i = 0; i < s.bub.length; i++){
				var b = s.bub[i];
				if(s.ptr.on){
					var dx = b.x - s.ptr.x, dy = b.y - s.ptr.y, d = Math.sqrt(dx * dx + dy * dy) + 1, reach = b.r + 70;
					if(d < reach){ var f = (1 - d / reach) * 900 * dt; b.vx += dx / d * f; b.y += dy / d * f * 0.08; }
				}
				b.vx *= 0.96;
				b.x += (b.vx + Math.sin(t * 0.0012 + b.ph) * 10) * dt;
				b.y -= b.vy * dt;
				if(b.y < -b.r - 10 || b.x < -60 || b.x > s.w + 60){ s.bub[i] = this.make(s, true); continue; }
				var g = x.createRadialGradient(b.x - b.r * 0.35, b.y - b.r * 0.4, b.r * 0.1, b.x, b.y, b.r);
				g.addColorStop(0, rgba(p.shine, s.dark ? 0.35 : 0.85)); g.addColorStop(0.5, rgba(p.fill, s.dark ? 0.08 : 0.12)); g.addColorStop(1, rgba(p.fill, s.dark ? 0.22 : 0.28));
				x.fillStyle = g; x.beginPath(); x.arc(b.x, b.y, b.r, 0, TAU); x.fill();
				x.strokeStyle = rgba(p.edge, s.dark ? 0.55 : 0.5); x.lineWidth = 1.2; x.stroke();
			}
			s.drops = s.drops.filter(function(o){
				o.life -= dt * 2.2; if(o.life <= 0){ return false; }
				o.x += o.vx * dt; o.y += o.vy * dt; o.vy += 160 * dt;
				x.fillStyle = rgba(p.edge, o.life * 0.8); x.beginPath(); x.arc(o.x, o.y, 2 * o.life + 0.5, 0, TAU); x.fill();
				return true;
			});
		}
	};

	/* ---- Ocean Waves: layered waves along the bottom; they swell under the pointer, taps send a ripple ---- */
	STYLES.waves = {
		pal: {
			dark:  { top: '#020617', bottom: '#0a2342', c: ['#1e40af', '#0369a1', '#0891b2', '#0ea5e9'], a: [0.55, 0.45, 0.38, 0.3], spark: '#bae6fd' },
			light: { top: '#fbfeff', bottom: '#e0f2fe', c: ['#60a5fa', '#38bdf8', '#67e8f9', '#a5f3fc'], a: [0.32, 0.3, 0.28, 0.26], spark: '#0ea5e9' }
		},
		init: function(s){
			s.lay = [];
			var n = s.busy >= 3 ? 5 : 4;
			for(var i = 0; i < n; i++){
				s.lay.push({ base: 0.64 + i * 0.08, amp: rnd(14, 26) + i * 3, len: rnd(260, 460), sp: rnd(0.25, 0.6) * (i % 2 ? -1 : 1), ph: rnd(0, TAU), c: s.pal.c[i % s.pal.c.length], a: s.pal.a[i % s.pal.a.length] });
			}
			s.sparks = [];
			for(var j = 0; j < Math.round(14 * s.busy); j++){ s.sparks.push({ x: rnd(0, s.w), y: rnd(0, s.h * 0.6), r: rnd(0.6, 1.8), ph: rnd(0, TAU) }); }
			s.ptrX = s.w / 2; s.swell = 0;
		},
		frame: function(s, t, dt){
			var x = s.ctx, p = s.pal, i;
			bg(s, p.top, p.bottom);
			for(i = 0; i < s.sparks.length; i++){
				var k = s.sparks[i];
				x.fillStyle = rgba(p.spark, (0.25 + 0.25 * Math.sin(t * 0.0015 + k.ph)) * (s.dark ? 1 : 0.7));
				x.beginPath(); x.arc(k.x, k.y + Math.sin(t * 0.0005 + k.ph) * 6, k.r, 0, TAU); x.fill();
			}
			s.swell += ((s.ptr.on ? 1 : 0) - s.swell) * Math.min(1, dt * 3);
			if(s.ptr.on){ s.ptrX += (s.ptr.x - s.ptrX) * Math.min(1, dt * 6); }
			var lift = s.ptr.on ? clamp(1 - s.ptr.y / s.h, 0, 1) : 0;
			s.taps = s.taps.filter(function(k){ return t - k.t < 2600; });
			var step = s.phone ? 10 : 6;
			for(i = 0; i < s.lay.length; i++){
				var L = s.lay[i], y0 = s.h * L.base;
				x.beginPath(); x.moveTo(0, s.h);
				for(var px = 0; px <= s.w + step; px += step){
					var y = y0 + Math.sin(px / L.len * TAU + t * 0.001 * L.sp + L.ph) * L.amp + Math.sin(px / (L.len * 0.43) + t * 0.0013 * L.sp) * L.amp * 0.35;
					var g = (px - s.ptrX) / 140;
					y -= s.swell * (20 + lift * 26) * Math.exp(-g * g) * (1 - i * 0.12);
					for(var q = 0; q < s.taps.length; q++){
						var tp = s.taps[q], age = (t - tp.t) / 1000, dist = Math.abs(px - tp.x) - age * 260;
						if(Math.abs(dist) < 90){ y -= Math.cos(dist / 90 * Math.PI / 2) * 18 * (1 - age / 2.6) * Math.sin(dist / 18 + age * 6); }
					}
					x.lineTo(px, y);
				}
				x.lineTo(s.w, s.h); x.closePath();
				var gr = x.createLinearGradient(0, y0 - L.amp * 2, 0, s.h);
				gr.addColorStop(0, rgba(L.c, L.a)); gr.addColorStop(1, rgba(L.c, L.a * 0.55));
				x.fillStyle = gr; x.fill();
			}
		}
	};

	/* ======================= one running backdrop ======================= */
	/* opts: { style, dark, busy (1-3), phone, still, host (element that receives the pointer), mini } */
	function Scene(canvas, opts){
		this.c = canvas; this.ctx = canvas.getContext('2d');
		this.o = opts; this.raf = 0; this.last = 0; this.stopped = true;
		this.ptr = { x: 0, y: 0, on: false, until: 0 }; this.taps = [];
		this.setup();
	}
	Scene.prototype.setup = function(){
		var o = this.o, st = STYLES[o.style];
		this.st = st; this.dark = !!o.dark; this.pal = st.pal[this.dark ? 'dark' : 'light'];
		this.phone = !!o.phone;
		this.busy = [0, 0.6, 1, 1.5][o.busy || 2] * (this.phone ? 0.65 : 1) * (o.mini ? 0.7 : 1);
		this.taps = [];
		this.size(true);
	};
	Scene.prototype.size = function(fresh){
		var r = this.c.getBoundingClientRect();
		var dpr = Math.min(window.devicePixelRatio || 1, this.phone ? 1.5 : 2);
		var w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
		if(!fresh && w === this.w && h === this.h){ return; }
		this.w = w; this.h = h;
		this.c.width = Math.round(w * dpr); this.c.height = Math.round(h * dpr);
		this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		this.st.init(this);
		if(this.stopped){ this.draw(performance.now(), 0); }
	};
	Scene.prototype.draw = function(t, dt){
		if(this.ptr.on && t > this.ptr.until){ this.ptr.on = false; }
		this.st.frame(this, t, dt);
	};
	Scene.prototype.loop = function(t){
		var self = this;
		if(self.stopped){ return; }
		if(!self.c.isConnected){ unmount(self); return; }
		self.raf = requestAnimationFrame(function(n){ self.loop(n); });
		var min = self.o.fps30 ? 32 : 0;
		if(self.last && t - self.last < min){ return; }
		var dt = self.last ? Math.min(0.05, (t - self.last) / 1000) : 0.016;
		self.last = t;
		self.draw(t, dt);
	};
	Scene.prototype.start = function(){
		if(this.o.still || calm()){ this.stopped = true; this.draw(performance.now(), 0.016); return; }
		if(!this.stopped){ return; }
		this.stopped = false; this.last = 0;
		var self = this; this.raf = requestAnimationFrame(function(n){ self.loop(n); });
	};
	Scene.prototype.stop = function(){ this.stopped = true; cancelAnimationFrame(this.raf); };
	/* pointer in page coordinates; returns true when it was over this backdrop */
	Scene.prototype.point = function(cx, cy, tap){
		var r = this.c.getBoundingClientRect();
		if(cx < r.left || cx > r.right || cy < r.top || cy > r.bottom){ return false; }
		this.ptr.x = cx - r.left; this.ptr.y = cy - r.top; this.ptr.on = true;
		this.ptr.until = performance.now() + (this.phone ? 1400 : 2500);
		if(tap){ this.taps.push({ x: this.ptr.x, y: this.ptr.y, t: performance.now(), i: Math.floor(Math.random() * 5) }); if(this.taps.length > 8){ this.taps.shift(); } if(this.stopped){ this.draw(performance.now(), 0.016); } }
		return true;
	};
	Scene.prototype.leave = function(){ this.ptr.on = false; };

	/* every scene on the page hears the mouse and finger */
	var scenes = [];
	function feed(cx, cy, tap){ for(var i = 0; i < scenes.length; i++){ scenes[i].point(cx, cy, tap); } }
	function hook(){
		window.addEventListener('mousemove', function(e){ feed(e.clientX, e.clientY, false); }, { passive: true });
		window.addEventListener('mousedown', function(e){ feed(e.clientX, e.clientY, true); }, { passive: true });
		window.addEventListener('touchstart', function(e){ var t = e.touches[0]; if(t){ feed(t.clientX, t.clientY, true); } }, { passive: true });
		window.addEventListener('touchmove', function(e){ var t = e.touches[0]; if(t){ feed(t.clientX, t.clientY, false); } }, { passive: true });
		document.addEventListener('mouseleave', function(){ scenes.forEach(function(s){ s.leave(); }); });
		document.addEventListener('visibilitychange', function(){ scenes.forEach(function(s){ if(document.hidden){ s.stop(); } else if(s.c.isConnected){ s.start(); } }); });
		window.addEventListener('resize', function(){ scenes.forEach(function(s){ s.size(false); }); });
	}
	hook();

	function mount(canvas, opts){
		var s = new Scene(canvas, opts);
		scenes.push(s); s.start();
		if(window.ResizeObserver){ try { s.ro = new ResizeObserver(function(){ s.size(false); }); s.ro.observe(canvas); } catch(e){} }
		return s;
	}
	function unmount(s){
		if(!s){ return; }
		s.stop();
		if(s.ro){ try { s.ro.disconnect(); } catch(e){} }
		var i = scenes.indexOf(s); if(i >= 0){ scenes.splice(i, 1); }
	}

	window.Backdrops = { ready: true, styles: STYLES, mount: mount, unmount: unmount };

	/* ======================= the chat page ======================= */
	var C = window.BACKDROP_CFG;
	if(!C){ return; }
	var main = null, chatDark = null;
	var BY = {}; (C.list || []).forEach(function(s){ BY[s.k] = s; });

	/* is the chat theme dark? read before the backdrop makes the chat see-through */
	function themeDark(){
		if(chatDark !== null){ return chatDark; }
		var els = [document.getElementById('show_chat'), document.getElementById('chat_logs_container'), document.getElementById('container_chat'), document.body];
		for(var i = 0; i < els.length; i++){
			if(!els[i]){ continue; }
			var m = getComputedStyle(els[i]).backgroundColor.match(/[\d.]+/g);
			if(!m || (m.length > 3 && parseFloat(m[3]) === 0)){ continue; }
			chatDark = (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) < 128;
			return chatDark;
		}
		chatDark = !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
		return chatDark;
	}
	function lookDark(look){ return look === 2 || (look !== 1 && themeDark()); }
	function phoneOpts(){
		var ph = isPhone();
		return { phone: ph, still: ph && C.phone === 2, fps30: ph && C.phone === 1 };
	}
	function apply(){
		var host = document.getElementById('container_show_chat');
		if(!host){ return; }
		themeDark();
		unmount(main); main = null;
		var old = document.getElementById('bd-canvas'); if(old){ old.remove(); }
		var b = document.body.classList;
		b.remove('bd-on', 'bd-dark', 'bd-light', 'bd-flip');
		if(C.style === 'none' || !STYLES[C.style]){ return; }
		var dark = lookDark(C.look);
		var cv = document.createElement('canvas');
		cv.id = 'bd-canvas'; cv.setAttribute('aria-hidden', 'true');
		cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;display:block;z-index:0;pointer-events:none';
		host.insertBefore(cv, host.firstChild);
		b.add('bd-on', dark ? 'bd-dark' : 'bd-light');
		/* forced the other look than the chat theme: fix the text colour so messages stay readable */
		if(dark !== themeDark()){ b.add('bd-flip'); }
		var po = phoneOpts();
		main = mount(cv, { style: C.style, dark: dark, busy: C.busy, phone: po.phone, still: po.still, fps30: po.fps30 });
		setTimeout(function(){ if(main){ main.size(false); } }, 1500);
	}

	/* ---------- the picker ---------- */
	var minis = [], pickStyle = null, pickLook = null;
	function post(data, cb){
		data.token = typeof utk !== 'undefined' ? utk : '';
		jQuery.ajax({ url: C.base + 'system/action.php', type: 'POST', data: data, dataType: 'json', global: false, timeout: 8000 })
			.done(function(r){ cb(r || {}); })
			.fail(function(){ cb({ ok: 0, msg: 'Connection problem, try again.' }); });
	}
	function sheetHtml(){
		var dark = lookDark(pickLook);
		var tiles = '<button type="button" class="bd-tile bd-none' + (pickStyle === 'none' ? ' bd-sel' : '') + '" data-k="none"><span class="bd-prev"><span class="bd-off">Off</span></span><span class="bd-n">No backdrop</span><span class="bd-d">The plain chat theme</span></button>';
		(C.list || []).forEach(function(s){
			tiles += '<button type="button" class="bd-tile' + (s.k === pickStyle ? ' bd-sel' : '') + (s.ok ? '' : ' bd-lock') + '" data-k="' + esc(s.k) + '"' + (s.ok ? '' : ' aria-disabled="true"') + '>' +
				'<span class="bd-prev"><canvas data-k="' + esc(s.k) + '"></canvas>' + (s.ok ? '' : '<span class="bd-lk">🔒 ' + esc(s.who) + '</span>') + '</span>' +
				'<span class="bd-n">' + esc(s.n) + '</span><span class="bd-d">' + esc(s.t) + '</span></button>';
		});
		var looks = [[0, 'Auto'], [1, '☀️ Light'], [2, '🌙 Dark']].map(function(l){
			return '<button type="button" class="bd-chip' + (pickLook === l[0] ? ' bd-sel' : '') + '" data-l="' + l[0] + '">' + l[1] + '</button>';
		}).join('');
		var credit = C.cr ? '<div class="bd-cr">Backdrops by <a href="https://github.com/cashifdev" target="_blank" rel="noopener">M Kashif</a> · <a href="https://chatnoregister.com" target="_blank" rel="noopener">chatnoregister.com</a></div>' : '';
		return '<div class="bd-sheet" role="dialog" aria-label="Backdrops"><div class="bd-grab"></div>' +
			'<div class="bd-head"><div><div class="bd-title">✨ Backdrops</div><div class="bd-sub">An animated background for your chat. Only you see it. Move your mouse or finger over it.</div></div>' +
			'<button type="button" class="bd-x" aria-label="Close">×</button></div>' +
			'<div class="bd-label">Look</div><div class="bd-chips">' + looks + '</div>' +
			'<div class="bd-grid">' + tiles + '</div>' +
			'<button type="button" class="bd-save">Use this backdrop</button>' + credit + '</div>';
	}
	function startMinis(){
		stopMinis();
		var dark = lookDark(pickLook), po = phoneOpts();
		document.querySelectorAll('#bd-wrap .bd-prev canvas').forEach(function(cv){
			var m = mount(cv, { style: cv.getAttribute('data-k'), dark: dark, busy: C.busy, phone: po.phone, still: po.still, fps30: true, mini: true }); minis.push(m);
		});
	}
	function stopMinis(){ minis.forEach(unmount); minis = []; }
	function render(){
		var w = document.getElementById('bd-wrap'); if(!w){ return; }
		var keep = w.querySelector('.bd-sheet') ? w.querySelector('.bd-sheet').scrollTop : 0;
		w.className = 'on ' + (lookDark(pickLook) ? 'bd-sdark' : 'bd-slight');
		w.innerHTML = sheetHtml();
		w.querySelector('.bd-sheet').scrollTop = keep;
		startMinis();
	}
	function openSheet(){
		closeSheet(true);
		if(typeof hideAllMenu === 'function'){ try { hideAllMenu(); } catch(e){} }
		pickStyle = C.style; pickLook = C.look;
		var w = document.createElement('div');
		w.id = 'bd-wrap'; w.className = lookDark(pickLook) ? 'bd-sdark' : 'bd-slight';
		w.innerHTML = sheetHtml();
		document.body.appendChild(w);
		requestAnimationFrame(function(){ w.classList.add('on'); startMinis(); });
	}
	function closeSheet(now){
		stopMinis();
		var w = document.getElementById('bd-wrap'); if(!w){ return; }
		if(now === true){ w.remove(); return; }
		w.classList.remove('on'); setTimeout(function(){ w.remove(); }, 200);
	}
	function save(){
		var btn = document.querySelector('#bd-wrap .bd-save'); if(btn){ btn.disabled = true; }
		post({ act: 'save', style: pickStyle, look: pickLook }, function(r){
			if(btn){ btn.disabled = false; }
			if(!r.ok){ if(typeof callError === 'function'){ callError(r.msg || 'Not saved'); } return; }
			C.style = r.style; C.look = parseInt(r.look, 10) || 0;
			apply(); closeSheet();
			if(typeof callSaved === 'function'){ callSaved('Backdrop saved', 1); }
		});
	}
	function on(sel, ev, fn){ jQuery(document).on(ev, sel, fn); }
	function events(){
		on('#bd-wrap', 'click', function(e){ if(e.target === this){ closeSheet(); } });
		on('#bd-wrap .bd-x', 'click', function(){ closeSheet(); });
		on('#bd-wrap .bd-chip', 'click', function(){ pickLook = parseInt(this.getAttribute('data-l'), 10) || 0; render(); });
		on('#bd-wrap .bd-tile', 'click', function(){
			var k = this.getAttribute('data-k');
			if(k !== 'none' && BY[k] && !BY[k].ok){ if(typeof callError === 'function'){ callError(BY[k].who + ' can use ' + BY[k].n + '.'); } return; }
			pickStyle = k;
			document.querySelectorAll('#bd-wrap .bd-tile').forEach(function(t){ t.classList.toggle('bd-sel', t.getAttribute('data-k') === k); });
		});
		on('#bd-wrap .bd-save', 'click', save);
		jQuery(document).on('keydown', function(e){ if(e.key === 'Escape'){ closeSheet(); } });
	}
	function addButtons(){
		var icon = C.base + 'files/icon.png', call = 'Backdrops.open();';
		if(C.place !== 2 && typeof appInputMenu === 'function'){ appInputMenu(icon, call); if(typeof checkSubItem === 'function'){ checkSubItem(); } }
		if(C.place !== 1 && typeof appAppMenu === 'function'){ appAppMenu(icon, 'Backdrops', call); if(typeof leftMenuCheck === 'function'){ setTimeout(leftMenuCheck, 1200); } }
	}
	function boot(){
		if(typeof jQuery === 'undefined'){ return setTimeout(boot, 600); }
		jQuery(function(){ events(); addButtons(); apply(); });
	}
	window.Backdrops.open = openSheet;
	window.Backdrops.close = closeSheet;
	window.Backdrops.apply = apply;
	boot();
})();
