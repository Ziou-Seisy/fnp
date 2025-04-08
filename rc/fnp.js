var FnFileSys = {
	read: function(path, callback) {
		fetch(path).then(response => response.text()).then((text)=>{
			callback(text);
		})
	}
}
var Fno_Interpreter = {
	interpreter: function(v = "") {
		let r = {}
		v.split("\n").forEach(line => {
			if(line[0]!='-')return;
			let i = line.indexOf(' ');
			if(i<=0){
				r[line.substring(1)] = true;
				return;
			}
			r[line.substring(1, i)] = line.substring(i+1);
		})
		return r
	},
	interpreter_array: function(v = "") {
		let r = []
		v.split("\n").forEach(line => {
			if(line[0]!='-')return;
			let i = line.indexOf(' ')
			if(i<=0){
				r.push({
					key: line.substring(1),
					val: true
				})
				return;
			}
			r.push({
				key: line.substring(1, i),
				val: line.substring(i+1)
			})
			return;
		})
		return r
	},
}
var Fna_Interpreter = {
	splitOnce: function (str, c){
		let p = str.indexOf(c)
		return [str.slice(0,p),str.slice(p+1)]
	},
	make_itis_object : (x) => {
		return x?.constructor === Object? x : {}
	},
	interpreter: function(text = "", error=()=>{})  {
		let obj = {
			opt : [
				{
					$:""
				}
			],
			text : text,
			lnk: {},
			err: []
		}
		obj.ptr = 0
		text.split('\n').forEach((x) => {
			let r = Fna_Interpreter.splitOnce(x,' ')
			if(r[0]==""){
				return;
			}
			else if(r[0] == '#'){
				obj.ptr++;
				obj.opt[obj.ptr] = {}//Fna_Interpreter.make_itis_object(obj.opt[r[1]])
				obj.opt[obj.ptr].$ = r[1]
			}
			else if(r[0] == '>'){
				obj.lnk[r[1]] = obj.ptr
			}
			else if(r[0][0] == '-'){
				obj.opt[obj.ptr][r[0].substring(1)] = r[1]
			}
			else {
				obj.err.push({
					ptr : obj.ptr,
					key: r[0],
					val: r[1]
				})
			}
		});
		if(obj.err.length){
			error(null, obj.err)
		}
		return obj
	}
}	
var FnpCompilerDefine = {
	sign:[
		{type: "H1",beg: "\r# ",end: '\n'},
		{type: "H2",beg: "\r## ",end: '\n'},
		{type: "H3",beg: "\r### ",end: '\n'},
		{type: "H4",beg: "\r#### ",end: '\n'},
		{type: "H5",beg: "\r##### ",end: '\n'},
		{type: "H6",beg: "\r###### ",end: '\n'},
		{type: "H1",beg: "\r#1 ",end: '\n'},
		{type: "H2",beg: "\r#2 ",end: '\n'},
		{type: "H3",beg: "\r#3 ",end: '\n'},
		{type: "H4",beg: "\r#4 ",end: '\n'},
		{type: "H5",beg: "\r#5 ",end: '\n'},
		{type: "H6",beg: "\r#6 ",end: '\n'},
		{type: "Hp",beg: "\r#p ",end: '\n'},
		{type: "Tspan",beg: "%{",end: '}%'},
		{type: "l",beg: "\\l",end: ';'},

		{type: "Hol",beg: "\r#ol:",end: '\n'},
		{type: "HolD",beg: "\r#ol+:",end: '\n'},
		{type: "Hol2",beg: "\r	#ol:",end: '\n'},
		{type: "HolD2",beg: "\r	#ol+:",end: '\n'},
		{type: "Hol3",beg: "\r		#ol:",end: '\n'},
		{type: "HolD3",beg: "\r		#ol+:",end: '\n'},
		
		{type: "code_mul",beg: "\r```",end: '```\n'},
		{type: "code_once",beg: "`",end: '`'},
		{type: "code_once",beg: "@{",end: '}@'},
		
		{type: "color",beg: "\\C{",end: '}\\C'},
		{type: "bkcolor",beg: "\\BK{",end: '}\\BK'},
		{type: "color",beg: "\\col{",end: '}\\col'},
		{type: "color",beg: "\\color{",end: '}\\color'},
		{type: "bkcolor",beg: "\\bkc{",end: '}\\bkc'},
		{type: "bkcolor",beg: "\\bkcolor{",end: '}\\bkcolor'},
		{type: "bkcolor",beg: "\\backgroundcolor{",end: '}\\backgroundcolor'},
		
		{type: "a_id_at",beg: "\\id:",end: ';'},
		{type: "a_id_to",beg: "\\to{",end: '}\\to'},
		{type: "a_",beg: "\\a{",end: '}\\a'},
		{type: "go",beg: "\\go{",end: '}\\go'},
		{type: "goto",beg: "\\goto{",end: '}\\goto'},
		{type: "goback",beg: "\\goback{",end: '}\\goback'},
		
		{type: "cite",beg: "\\cite{",end: '}\\cite'},
		{type: "q",beg: "\\q{",end: '}\\q'},
		{type: "bq",beg: "\r#bq:",end: '\n'},
		{type: "ubq",beg: "\r#ubq:",end: '\n'},
		{type: "download",beg: "\\download{",end: '}\\download'},
		{type: "download",beg: "\\D{",end: '}\\D'},
		{type: "downloadpage",beg: "\\Dp{",end: '}\\Dp'},
		
		{type: "ico",beg: "\\ico:{",end: '};'},
		{type: "icoB",beg: "\\icoB:{",end: '};'},
		{type: "img",beg: "\\img:{",end: '};'},
		{type: "img_",beg: "\r#Img:",end: '\n'},
		
		{type: "line",beg: "\r#line",end: '\n'},
		{type: "cm",beg: "\r#cm ",end: '\n'},
		{type: "cm",beg: "\\cm{",end: '}\\cm'},
		{type: "cm",beg: "\r#cm.beg\n",end: '\r#cm.end\n'},
		{type: "cm_",beg: "\r#CM ",end: '\n'},
		{type: "cm_",beg: "\\CM{",end: '}\\CM'},
		{type: "cm_",beg: "\r#CM.beg\n",end: '\r#CM.end\n'},
		{type: "cm_",beg: "\r·",end: '\n'},
		
		{type: "box",beg: "\r#box.beg\n",end: '\r#box.end\n'},
		{type: "details",beg: "\r#details.beg ",end: '\r#details.end\n'},
		{type: "detailsB",beg: "\r#detailsB.beg ",end: '\r#detailsB.end\n'},
		{type: "detailsB",beg: "\r#detailsBd.beg ",end: '\r#detailsBd.end\n'},
		{type: "novel",beg: "\r#novel.beg\n",end: '\r#novel.end\n'},
		
		{type: "iframe",beg: "\r#iframe ",end: '\n'},
		
		{type: "d1",beg: "\r- ",end: '\n'},
		{type: "c1",beg: "\r* ",end: '\n'},
		{type: "a1",beg: "\r+ ",end: '\n'},
		{type: "n1",beg: "\r= ",end: '\n'},
		
		{type: "d2",beg: "\r	- ",end: '\n'},
		{type: "c2",beg: "\r	* ",end: '\n'},
		{type: "a2",beg: "\r	+ ",end: '\n'},
		{type: "n2",beg: "\r	= ",end: '\n'},
		
		{type: "d2",beg: "\r-- ",end: '\n'},
		{type: "c2",beg: "\r** ",end: '\n'},
		{type: "a2",beg: "\r++ ",end: '\n'},
		{type: "n2",beg: "\r== ",end: '\n'},
		
		{type: "d3",beg: "\r		-",end: '\n'},
		{type: "c3",beg: "\r		*",end: '\n'},
		{type: "a3",beg: "\r		+",end: '\n'},
		{type: "n3",beg: "\r		=",end: '\n'},
		{type: "d3",beg: "\r--- ",end: '\n'},
		{type: "c3",beg: "\r*** ",end: '\n'},
		{type: "a3",beg: "\r+++ ",end: '\n'},
		{type: "n3",beg: "\r=== ",end: '\n'},
		
		{type: "u",beg: "___{",end: '}___'},
		{type: "u",beg: "\\u{",end: '}\\u'},
		{type: "no_u",beg: "\\!u{",end: '}\\!u'},
		{type: "b",beg: "__{",end: '}__'},
		{type: "b",beg: "**{",end: '}**'},
		{type: "b",beg: "\\b{",end: '}\\b'},
		{type: "i",beg: "_{",end: '}_'},
		{type: "i",beg: "*{",end: '}*'},
		{type: "i",beg: "\\i{",end: '}\\i'},
		{type: "d",beg: "~~{",end: '}~~'},
		{type: "d",beg: "\\d{",end: '}\\d'},
		{type: "d",beg: "\\s{",end: '}\\s'},
		{type: "bold",beg: "\\bold{",end: '}\\bold'},
		{type: "bold",beg: "\\B{",end: '}\\B'},
		
		{type: "center",beg: "\r#center ",end: '\n'},
		
		{type: "light",beg: "\\l{",end: '}\\l'},
		{type: "lightlight",beg: "\\l+{",end: '}\\l+'},
		{type: "lighthalf",beg: "\\l-{",end: '}\\l-'},
		
		{type: "ruby",beg: "\\ruby{",end: '}\\ruby'},
		{type: "ruby",beg: "\\Y{",end: '}\\Y'},
		
		{type: "del",beg: "\r#del ",end: '\n'},
		{type: "ins",beg: "\r#ins ",end: '\n'},
		{type: "Tdel",beg: "\\del{",end: '}\\del'},
		{type: "Tins",beg: "\\ins{",end: '}\\ins'},
		{type: "Tdel",beg: "-{",end: '}-'},
		{type: "Tins",beg: "+{",end: '}+'},
		
		{type: "abbr",beg: "\\abbr{",end: '}\\abbr'},
		{type: "ot",beg: "\\ot{",end: '}\\ot'},
		
		{type: "mark",beg: "\\mark{",end: '}\\mark'},
		{type: "em",beg: "\\em{",end: '}\\em'},
		
		{type: "redline",beg: "\\redline{",end: '}\\redline'},
		{type: "yellowline",beg: "\\yellowline{",end: '}\\yellowline'},
		{type: "greenline",beg: "\\greenline{",end: '}\\greenline'},
		{type: "blueline",beg: "\\blueline{",end: '}\\blueline'},
		{type: "skyline",beg: "\\skyline{",end: '}\\skyline'},
		{type: "waveline",beg: "\\waveline{",end: '}\\waveline'},
		
		{type: "small",beg: "\\small{",end: '}\\small'},
		{type: "sup",beg: "\\sup{",end: '}\\sup'},
		{type: "sub",beg: "\\sub{",end: '}\\sub'},
		{type: "sup",beg: "\\up{",end: '}\\up'},
		{type: "sub",beg: "\\down{",end: '}\\down'},
		{type: "sup",beg: "^{",end: '}^'},
		{type: "sub",beg: "~{",end: '}~'},
		
		{type: "bdo_ltr",beg: "\\bdo{ltr|",end: '}\\bdo'},
		{type: "bdo_rtl",beg: "\\bdo{rtl|",end: '}\\bdo'},
		{type: "bdo_utb",beg: "\\bdo{utb|",end: '}\\bdo'},
		{type: "bdo_btu",beg: "\\bdo{btu|",end: '}\\bdo'},
		{type: "bdo_utbl",beg: "\\bdo{utbl|",end: '}\\bdo'},
		{type: "bdo_btur",beg: "\\bdo{btur|",end: '}\\bdo'},
		
		{type: "figure_img",beg: "\r#figure_img.beg\n",end: '\r#figure_img.end\n'},
		{type: "Tfigure_img",beg: "\r\\figure_img.beg\n",end: '\r\\figure_img.end\n'},
		
		{type: "Haudio",beg: "\r#audio.beg\n",end: '\r#audio.end\n'},
		{type: "Hvideo",beg: "\r#video.beg\n",end: '\r#video.end\n'},
		
		{type: "Htable",beg: "\r#table.beg\n",end: '\r#table.end\n'},
		
		{type: "HDoubleColumns",beg: "\r#DoubleColumns.beg\n",end: '\r#DoubleColumns.end\n'},
		{type: "HDoubleColumnsL",beg: "\r#DoubleColumnsL.beg\n",end: '\r#DoubleColumnsL.end\n'},
		
		{type: "Htemplate",beg: "\r#template.beg ",end: '\r#template.end\n'},
		{type: "HtemplateUse",beg: "\r#template_use.beg\n",end: '\r#template_use.end\n'},
		{type: "HtemplateUseFna",beg: "\r#template_use_fna.beg\n",end: '\r#template_use_fna.end\n'},
		{type: "HtemplateUseFnaRead",beg:"\r#template_use_fna_read ",end: '\n'},
			
		{type: "Hsay",beg: "\r#say ",end: '\n'},
		{type: "OT",beg: "\r@T ",end: '\n'},
		
		{type: "import",beg: "\r@import ",end: '\n'},
		{type: "include",beg: "\r@include ",end: '\n'},
		
		{type:"count_chars_only",beg: "\\count_chars_only{",end:"}\\count_chars_only"},
		
		
		{type:"OTitle",beg: "\r@Title ",end:"\n"},
		{type:"OIcon",beg: "\r@Icon ",end:"\n"},
		{type:"ODec",beg: "\r@Description ",end:"\n"},
	],
	toObj:{
		H1: ["@Basic"],
		H2: ["@Basic"],
		H3: ["@Basic"],
		H4: ["@Basic"],
		H5: ["@Basic"],
		H6: ["@Basic"],
		Hp: ["@Basic"],
		l:["@TextS"],
		
		Hol: ["@TupleF", " ", 2, 0],
		HolD: ["@TupleF", " ", 2, 0],
		Hol2: ["@TupleF", " ", 2, 0],
		HolD2: ["@TupleF", " ", 2, 0],
		Hol3: ["@TupleF", " ", 2, 0],
		HolD3: ["@TupleF", " ", 2, 0],
		
		code_mul:["@PairExL","\n\r"," ","code_&{text}"," ","code_mul1"],
		code_once:["@Text"],
		
		color: ["@Pair","|"],
		bkcolor: ["@Pair","|"],
		
		a_id_at: ["@Text"],
		a_id_to: ["@Pair","|"],
		a_: ["@TupleF","|",3],
		go: ["@Pair","|"],
		goto: ["@Tuple","|",3],
		goback: ["@Pair","|"],
		
		cite: ["@Basic"],
		q: ["@Basic"],
		bq: ["@Pair"," "],
		ubq: ["@TupleF"," ",3],
		download: ["@Pair","|"],
		downloadpage: ["@Pair","|"],
		
		ico: ["@TupleF", "|",2,2],
		icoB: ["@TupleF", "|", 3,3],
		img: ["@Pair", "|"],
		img_: ["@Pair", " "],
		
		line: ["@Clear"],
		cm:["@Text"],
		cm_:["@Text"],
		
		box: ["@Basic"],
		details:["@TupleF", "\n", 2, 0],
		detailsB:["@TupleF", "\n", 2, 0],
		novel: ["@Basic"],
		
		iframe: ["@Tuple", " ", 4],
		
		d1: ["@Basic"],
		c1: ["@Basic"],
		a1: ["@Basic"],
		n1: ["@Basic"],
		d2: ["@Basic"],
		c2: ["@Basic"],
		a2: ["@Basic"],
		n2: ["@Basic"],
		d3: ["@Basic"],
		c3: ["@Basic"],
		a3: ["@Basic"],
		n3: ["@Basic"],
		
		b: ["@Basic"],
		i: ["@Basic"],
		d: ["@Basic"],
		u: ["@Basic"],
		no_u: ["@Basic"],
		bold: ["@Basic"],
		
		center: ["@Basic"],
		
		light: ["@Basic"],
		lightlight: ["@Basic"],
		lighthalf: ["@Basic"],
		
		ruby: ["@Pair", "|"],
		
		del: ["@Basic"],
		ins: ["@Basic"],
		Tdel: ["@Basic"],
		Tins: ["@Basic"],
		
		abbr: ["@Pair", "|"],
		ot: ["@Pair", "|"],
		
		mark: ["@Basic"],
		em: ["@Basic"],
		
		redline: ["@Basic"],
		yellowline: ["@Basic"],
		greenline: ["@Basic"],
		blueline: ["@Basic"],
		skyline: ["@Basic"],
		waveline: ["@Pair","|"],
		
		small: ["@Basic"],
		sup: ["@Basic"],
		sub: ["@Basic"],
		
		bdo_ltr: ["@Basic"],
		bdo_rtl: ["@Basic"],
		bdo_utb: ["@Basic"],
		bdo_btu: ["@Basic"],
		bdo_utbl: ["@Basic"],
		bdo_btur: ["@Basic"],
		
		figure_img:["@Fno"],
		Tfigure_img:["@Fno"],
		
		Haudio:["@Fno"],
		Hvideo:["@Fno"],
		
		Htable:["@Funcs",["@Fna"],["@FillTable"]],
		
		HDoubleColumns: ["@TupleF","\r#DoubleColumns.mid\n",2,0],
		HDoubleColumnsL: ["@TupleF","\r#DoubleColumnsL.mid\n",2,0],
		
		Htemplate:["@TupleF", "\n", 2, 2],
		HtemplateUse:["@Fno"],
		HtemplateUseFna:["@Fna"],
		HtemplateUseFnaRead:["@TupleF"," ",2,2],
		
		Hsay: ["@Pair", " "],
		OT: ["@Tuple", " ",3],
		
		import:["@TextS"],
		include:["@TextS"],
		
		count_chars_only:["@TupleF", "|", 2, 0],
		
		OTitle: ["@TextS"],
		OIcon: ["@TextS"],
		ODec: ["@TextS"],
	}
}
function FnpCompiler(FnpCompilerDef = FnpCompilerDefine){
	function array_back(array){
		return array[array.length - 1]
	}
	function min_index(text = '', array = [], i = 0) {
		let ia = array.map(v => [text.indexOf(v.beg, i), v])
		let ib = ia.filter(v => v[0] >= i)
		let ic = ib.reduce((acc, val) => (acc[0] < val[0] || (acc[0] == val[0] && (acc[1].lv ?? 0) > (val[1].lv ?? 0)) ?acc : val), i)
		if(!Array.isArray(ic)){
			return;
		}
		let [bi, v] = ic
		if (!v) return {sign:undefined, inb:i, ine:text.length, outb:i, oute:text.length}
		let inb = bi + v.beg.length
		let ine = text.indexOf(v.end, inb)
		return {sign: v, inb:inb, ine:ine, outb:bi, oute:ine+v.end.length}
	}
	function find_nesting(text='', box){
		let r = []
		let v = box.sign;
		let ine = box.ine;
		let oute = box.oute
		let fd = box.ine - v.end.length
		let num = 0
		while(box.outb <= fd){
			if(ine == -1){
				console.error("Fnp > 语法需要成对出现：", v, "num:",num, "arg:",ine,oute,fd,box.inb,box.ine)
				return;
			}
			let outb = text.lastIndexOf(v.beg, fd)
			let inb = outb + v.beg.length
			r.push({
				sign:v,
				inb:inb,
				ine:ine,
				outb:outb,
				oute:oute,
				text:text.substring(inb,ine)
			})
			ine = text.indexOf(v.end, oute)
			oute = ine + v.end.length
			fd = outb-v.end.length
			num++;
			if(num > 50){
				console.error("Fnp > 嵌套太多：",v)
				return r;
			}
		}
		if(!r.length){
			console.error("Fnp > 意外！嵌套检索器意外出错", box,1,text.substring(box.inb, box.ine),2,fd,text.substring(box.outb, box.inb),"num",num)
		}
		return r
	}
	function FnpCompiler_(){console.error("Fnp > 意外！FnpCompiler_声明而未定义")}
	function first_box(text = '', array = [], i = 0) {
		let bp = min_index(text, array, i);
		if(typeof bp !== 'object'){
			return 0;
		}
		let gp = find_nesting(text, bp);
		if(!Array.isArray(gp)){
			console.error("Fnp > 意外！find_nesting未返回数组：",gp)
			return undefined;
		}
		let gpr = gp.filter(x=>typeof x !== 'obj');
		if(!Array.isArray(gpr) || !gpr.length){
			console.error("Fnp > 意外！find_nesting未返回有效数组：", gp, gpr)
			return undefined;
		}
		return array_back(gpr)
	}
	function last_box(text, i, pi){
		return {
			type: {type: '@Text', beg: undefined, end: undefined},
			has : text.substring(i, pi),
			box: {
				outb: i,
				inb: i,
				ine: pi,
				oute: pi,
			}
		}
	}
	function once_has_df_rc(FnpCompilerDef){
		function split_numdef(text="", c=' ', num=undefined){
			let r = text.split(c)
			if(r.length<=num)return r;
			return [...r.slice(0, num-1), r.slice(num-1).join(c)]
		}
		var DF = {
			basic:(text)=>{
				return FnpCompiler_(text)
			}
		}
		var df = {
			"@Text": () => (text => text),
			"@TextS": () => (text => [text]),
			"@Clear":() => (() => null),
			"@Basic":() => DF.basic,
			"@Pair":(c=' ') => (text)=>{let i = text.indexOf(c); return [text.substring(0, i),DF.basic(text.substring(i + 1))]},
			"@PairDF":(c=' ') => (text)=>{let i = text.indexOf(c); return [DF.basic(text.substring(0, i)),DF.basic(text.substring(i + 1))]},
			"@Tuple":(c=' ', num = undefined) => (text="")=>split_numdef(text, c, num),
			"@TupleF":(c=' ', num = undefined, beg = 1) => (text="")=>split_numdef(text, c, num).map((v,i)=>(i<beg)?v:DF.basic(v)),
			"@PairExL":(c,c2,d,j,d_) => (text)=>{
				let i = text.indexOf(c);
				let r = [text.substring(0, i),text.substring(i + 1)];
				if(!c2)return r;
				if(r[0] && r.length>=2){
					if(!d || !j)return r;
					return [r[0].split(c2).map(x => d.replace('&{text}',x)).join(j), r[1]]
				}
				if(!d_)return r;
				r = [d_, r[1]]
				return r;
			},
			"@Fno":()=> (text)=>{return {obj: Fno_Interpreter.interpreter(text.replaceAll("\r",""))}},
			"@Fna":()=> (text)=>{
				let fna = Fna_Interpreter.interpreter(text.replaceAll("\r","").replace(/&gt;/g, '>'))
				if(fna.err.length)console.error("Fnp > fna语法出错", fna.err)
				return {obj: fna.opt.filter(o => o.$!="")};
			},
			"@Funcs":(...funcs)=>{
				let rf = []
				for (var i = 0; i < funcs.length; i++) {
					let f = funcs[i]
					if(typeof df[f[0]] === "function") rf.push(df[f[0]](...f.slice(1))??(()=>{}))
					else console.error("Fnp > 意外！@Funcs链出错", f[0], ' is not a function in df.obj.', df)
				}
				//console.log("Funcs",funcs,df,rf)
				return function(text){
					let r = text
					for (let i = 0; i < rf.length; i++) {
						r = rf[i]?.(r)
					}
					return r;
				}
			},
			"@FillTable":()=>(fna_)=>{
				//console.log("Fna",fna_)
				let fna = fna_.obj
				let fna00 = ""
				let col = (function(){
					let r = []
					for (let k in fna[0]) {
						if(!(!isNaN(parseFloat(k)) && isFinite(k)))continue;
						if(k==0){
							fna00 = fna[0][k]
						}
						else r[k-1] = fna[0][k]
					}
					return r
				})()
				let line = (l)=>{
					return [l.$,...col.map((v)=>{
						return l[v]??""
					})]
				}
				let r$ = {
					name: fna[0].$
				}
				let table = (function(){
					return fna.map((v, i)=>{
						if(v.$=="$"){
							for (let k in v) {
								if(v[k]!='$')r$[k]=v[k]
							}
							return undefined
						}
						if(i==0)return [fna00, ...col]
						return line(v)
					}).filter(x => Array.isArray(x))
				})()
				//console.log("ta",table,r$)
				return {obj:{
					table:table,
					$:r$
				}}
			},
			"@V":(index, func, ...c)=>(d)=>{
				let f = func
				let df = c[c.length-1]
				let F = df?.toObj?.[f?.[0]]?.(...f.slice(1), undefined, df)??(()=>{})
				//console.log(F, f, d?.[index-1], F(d?.[index-1]))
				return F(d?.[index-1])
			}
		}
		FnpCompilerDef.tObjF = {}
		for (let k in FnpCompilerDef.toObj) {
			let func = FnpCompilerDef.toObj[k]
			FnpCompilerDef.tObjF[k] = df[func[0]](...func.slice(1))
		}
	}
	once_has_df_rc(FnpCompilerDef)
	function once_has(p, tObjF){
		/*let tobj = tObj[p.sign.type];
		if(!Array.isArray(tobj)){
			console.error("!!@", p.sign)
			return {
				error: p.text
			}
		}
		if(tobj[0] == '@Basic')return FnpCompiler_(p.text)
		else return {
			text:p.text
		}*/
		let tf = tObjF[p.sign.type];
		if(typeof tf !== 'function'){
			console.error("Fnp > 意外！tObjF不包含：", p.sign, tf)
			return {
				error: p.text
			}
		}
		return tf(p.text)
	}
	function once(text = '', array = [], tObjF, i = 0){
		let p = first_box(text, array, i)
		if(typeof p !=='object')return p;
		return {
			type: p.sign,
			has : once_has(p, tObjF),
			box: {
				outb: p.outb,
				inb: p.inb,
				ine: p.ine,
				oute: p.oute,
			}
		}
	}
	function FnpCompiler_(text){
		let i = 0;
		let r = []
		let num = 0;
		while(i!=-1&&i<text.length){
			//console.log(1, i, [text])
			let g = once(text, FnpCompilerDef.sign, FnpCompilerDef.tObjF, i);
			if(typeof g !== 'object'){
				//console.log('？',[g, i, text.substring(i)])
				//r.push["End"];
				r.push({
					type: {type:"@Text"},
					has: text.substring(i)
				})
				break;
			}
			let lg = last_box(text, i, g.box.outb)
			i = g.box.oute
			if(lg.has.length)r.push(lg)
			r.push(g)
			if(num>1000){
				console.error("Fnp > 意外！Fnp翻译器递归过多")
				return;
			}
			num++;
		}
		return {
			text: text,
			objs: r
		}
	}
	function resetObj1(obj){
		let r = []
		if(!("has" in obj)){
			for(let k in obj){
				if(k != 'text' && k!= 'objs'){
					console.error("Fnp > 意外！获取了一个不正常数据，出现除text和objs项外的项：", obj)
					return;
				}
			}
			if(Array.isArray(obj.objs) && obj.objs.length){
				return obj.objs.map(v=>resetObj1(v))
			}
			if("text" in obj){
				return obj.text;
			}
			console.error("Fnp > 意外！获取了一个不正常数据，没有有效text和objs项：")
			return;
		}
		if(obj.has === null){
			return {
				type: obj.type.type
			}
		}
		if(typeof obj.has === 'string'){
			return {
				text: obj.has,
				type: obj.type.type
			}
		}
		if(Array.isArray(obj.has)){
			return {
				args: obj.has.map(v=>{
					if(typeof v === 'object')return resetObj1(v)
					if(typeof v === 'string')return v;
					console.error("Fnp > 意外！获取了一个不正常数据，不是字符串或对象：",v)
					return v
				}),
				type: obj.type.type
			}
		}
		if(typeof obj.has !== 'object'){
			console.error("Fnp > 意外！获取了一个不正常数据，不是对象：", obj.has, obj);
			return;
		}
		if(("obj" in obj.has)){
			return {
				obj: obj.has.obj,
				type: obj.type.type
			}
		}
		if(!("objs" in obj.has)){
			if(typeof obj.has.text !== 'string'){
				console.error("Fnp > 意外！获取了一个不正常数据，不是字符串：", obj.has.text, '/', obj)
				return;
			}
			return {
				text: obj.has.text,
				type: obj.type.type
			}
		}
		if(!Array.isArray(obj.has.objs)){
			console.error("Fnp > 意外！获取了一个不正常数据，不是数组：", obj.has.objs, obj)
			return;
		}
		if(!obj.has.objs.length){
			return {
				has: [{
					has: [obj.has.text],
					type: "@Text"
				}],
				type: obj.type.type
			}
		}
		for (var i = 0; i < obj.has.objs.length; i++) {
			r.push(resetObj(obj.has.objs[i]))
		}
		return {
			has: r,
			type: obj.type.type
		}
	}
	function resetObj(obj){
		let r = resetObj1(obj)
		//resetObj2(obj)
		return r
	}
	return (text_old, ft_bool = true)=>{
		let ft = ft_bool?`\r${text_old.replace(/\r\n/g, '\u0001').replace(/\n/g, '\u0001').replace(/\r/g, '\u0001').replace(/\\\u0001/g, '').replace(/\u0001/g, '\n\r')}\n`:text_old
		let r = FnpCompiler_(ft)
		let ro = {
			box:{outb: 0, inb: 0, ine: ft.length, oute: ft.length},
			has:r,
			type:{type: '@Document', beg: undefined, end: undefined}
		}
		//console.log(1, ro)
		let rr = resetObj(ro)
		//console.log(rr)
		return rr
	}
}
function Fnp_Open (path,obj){
	let r = [window.location.origin,window.location.pathname,'?fnp=',path]
	for (let k in obj) {
		r.push('&');r.push(k);r.push('=');r.push(obj[k])
	}
	window.location.href = r.join('')
}
var rset = function(){console.error("Fnp > 意外！rset声明而未定义")}
var FnpInterpreterDefine = {
	toHTML:{
		"@Document":["#Element","div","Fnp_Document"],
		"@Text":["#Text"],
		
		H1: ["#Element","h1","Fnp_H1"],
		H2: ["#Element","h2","Fnp_H2"],
		H3: ["#Element","h3","Fnp_H3"],
		H4: ["#Element","h4","Fnp_H4"],
		H5: ["#Element","h5","Fnp_H5"],
		H6: ["#Element","h6","Fnp_H6"],
		Hp: ["#Element","p","Fnp_Hp"],
		Tspan: ["#Element","span","Fnp_Tspan"],
		l: ["#ElementArray","span","Fnp_Tl",{},{t:{t:'',i:1,my:true}},0],
		
		Hol: ["#ElementNesting",[["#ElementArray","div","Hol_arg1",{},{},1],["#ElementArray","div","Hol_text",{},{},2]],["#ElementArray","div","Hol"]],
		HolD: ["#ElementNesting",[["#ElementArray","div","HolD_arg1",{},{},1],["#ElementArray","div","HolD_text",{},{},2]],["#ElementArray","div","HolD"]],
		Hol2: ["#ElementNesting",[["#ElementArray","div","Hol_arg1",{},{},1],["#ElementArray","div","Hol_text",{},{},2]],["#ElementArray","div","Hol"],["#Element","li","li_s",{},false],["#Element","ul","ul_",{},false]],
		HolD2: ["#ElementNesting",[["#ElementArray","div","HolD_arg1",{},{},1],["#ElementArray","div","HolD_text",{},{},2]],["#ElementArray","div","HolD"],["#Element","li","li_s",{},false],["#Element","ul","ul_",{},false]],
		Hol3: ["#ElementNesting",[["#ElementArray","div","Hol_arg1",{},{},1],["#ElementArray","div","Hol_text",{},{},2]],["#ElementArray","div","Hol"],["#Element","li","li_s",{},false],["#Element","ul","ul_",{},false],["#Element","li","li_s",{},false],["#Element","ul","ul_",{},false]],
		HolD3: ["#ElementNesting",[["#ElementArray","div","HolD_arg1",{},{},1],["#ElementArray","div","HolD_text",{},{},2]],["#ElementArray","div","HolD"],["#Element","li","li_s",{},false],["#Element","ul","ul_",{},false],["#Element","li","li_s",{},false],["#Element","ul","ul_",{},false]],
		
		code_mul:["#ElementNesting",["#ElementArray","code","Hcode",{},{},2,1],["#ElementArray","pre","code_mul",{},{className:{t:"&{text}",i:1}}]],
		code_once:["#ElementNesting",["#Element","code","Tcode",{},{}],["#Element","span","code_once",{},false]],
		
		color: ["#ElementArray","span","Tcolor",{},{style: {o: {color: {t:"&{text}", i:1}}}}, 2],
		bkcolor: ["#ElementArray","span","Tbkcolor",{},{style: {o: {backgroundColor: {t:"&{text}", i:1}}}}, 2],
		
		a_id_at: ["#ElementOnlyArgNotInner","span","a_id_at",{},{id:{t:"fnp_id_at_&{text}",i:1}}],
		a_id_to: ["#ElementArray","span","fnp_a_id_to Tto",{},{to_id:{t:"",i:1,my:true}},2],
		a_: ["#ElementArray","a","T_a",{},{href:{t:"&{text}",i:1}},2],
		//go: ["@ElementArray","<span class=\"fnp_a_id_to fnp_a_go_to\" onclick=\"Fnp_Open?.(\'&{1}\')\">&{2}</span>"],
		//goback: ["@ElementArray","<span class=\"fnp_a_id_to fnp_a_go_to\" onclick=\"Fnp_Back?.(\'&{1}\')\">&{2}</span>"],
		go: ["#ElementArray","span","fnp_a_id_to fnp_a_go_to Tgo",{},{fnp:{t:"",i:1,my:true}},2],
		goto: ["#ElementArray","span","fnp_a_id_to fnp_a_go_to Tgoto",{},{fnp:{t:"",i:1,my:true},to_id:{t:"",i:2,my:true}},3],
		goback: ["#ElementArray","span","fnp_a_id_to fnp_a_go_to Tgoback",{},{goback:{t:"",i:1,my:true}},2],
		
		cite: ["#Element","cite", "Hcite"],
		q: ["#Element","q","Hq"],
		//bq: ["@ElementArray","<div><blockquote cite=\"&{1}\"><p>&{2}</p></blockquote></div>"],
		//ubq: ["@ElementArray","<div><blockquote cite=\"&{1}\"><p>&{3}</p></blockquote><p>&{2}</p></div>"],
		bq: ["#ElementNesting",["#ElementArray","p","Hbq_in",{},{},2],["#ElementArray","blockquote","Hbq",{},{cite:{t:"&{text}",i:1}},0],["#Element","div","Hbq_b",{},false]],
		ubq: ["#ElementNesting",["#ElementArray","p","Hubq_in",{},{},3],[["#ElementArray","blockquote","Hubq",{},{cite:{t:"&{text}",i:1}},0],["#ElementArray","p","Hubqp",{},{},2]],["#Element","div","Hubq_b",{},false]],
		
		download: ["#ElementArray","a","Tdownload",{download:""}, {href:{t:"&{rc}/&{text}",i:1}},2],
		downloadpage: ["#ElementArray","a","Tdownloadpage",{download:""}, {href:{t:"&{page}/&{text}",i:1}},2],
		
		//ico: ["@ElementArray","<span class=\"img_i_sp\"><img src=\"&{rc}/&{1}\" alt=\"&{2}\" class=\"img_i un-select\" draggable=\"false\"/></span>"],
		//icoB: ["@ElementArray","<span class=\"img_i_sp\"><img src=\"&{rc}/&{1}\" alt=\"&{2}\" class=\"img_i un-select\" draggable=\"false\" style=\"border: &{3} 1px solid; border-radius: 0.4em\"/></span>"],
		ico: ["#ElementNesting",["#ElementArray","img","img_i un-select",{draggable:false},{src:{t:"&{rc}/&{text}",i:1}, alt:2}],["#ElementArray","span","img_i_sp"]],
		icoB: ["#ElementNesting",["#ElementArray","img","img_i un-select TicoB",{draggable:false},{src:{t:"&{rc}/&{text}",i:1}, alt:2, style:{o:{borderColor:3}}}],["#ElementArray","span","img_i_sp"]],
		
		
		img: ["#ElementArray","img", "Timg", {}, {src:{t:"&{rc}/&{text}",i:1},alt:{t:"text",i:2}},0],
		img_: ["#ElementArray","img","img_w", {}, {src:{t:"&{rc}/&{text}",i:1},alt:{t:"text",i:2}},0],
		
		line: ["#Element","hr","Hline"],
		cm:["#Comment"],
		cm_:["#Clear"],
		
		box: ["#Element","div","fnp_user_box"],
		//details:["@ElementArray","<details><summary>&{1}</summary>&{2}</details>"],
		//detailsB:["@ElementArray","<details class=\"detailsBd\"><summary>&{1}</summary>&{2}</details>"],
		details:["#ElementNesting",["#ElementArray","summary","Tdetails_summary",{},{},1],["#ElementArray","details","Tdetails",{},{},2]],
		detailsB:["#ElementNesting",["#ElementArray","summary","TdetailsB_summary",{},{},1],["#ElementArray","details","TdetailsB detailsBd",{},{},2]],
		novel:["#Element","div","Bnovel"],
		
		iframe: ["#ElementArray","iframe","Hiframe",{},{src:{t:"&{rc}/&{text}",i:1},title:2,height:4,width:3},0],
		
		//d1: ["@Element","<ul class=\"ul_d\"><li>&{text}</li></ul>"],
		d1: ["#ElementNesting",["#Element","li","Tli",{}],["#Element","ul","ul_d",{},false]],
		c1: ["#ElementNesting",["#Element","li","Tli",{}],["#Element","ul","ul_c",{},false]],
		a1: ["#ElementNesting",["#Element","li","Tli",{}],["#Element","ul","ul_a",{},false]],
		n1: ["#ElementNesting",["#Element","li","Tli",{}],["#Element","ul","ul_n",{},false]],
		//d2: ["@Element","<ul><li class=\"li_s\"><ul class=\"ul_d\"><li>&{text}</li></ul></li></ul>"],
		d2: ["#ElementNesting",["#Element","li","Tli",{}],["#Element","ul","ul_d",{},false],["#Element","li","li_s",{},false],["#Element","ul","ul_",{},false]],
		c2: ["#ElementNesting",["#Element","li","Tli",{}],["#Element","ul","ul_c",{},false],["#Element","li","li_s",{},false],["#Element","ul","ul_",{},false]],
		a2: ["#ElementNesting",["#Element","li","Tli",{}],["#Element","ul","ul_a",{},false],["#Element","li","li_s",{},false],["#Element","ul","ul_",{},false]],
		n2: ["#ElementNesting",["#Element","li","Tli",{}],["#Element","ul","ul_n",{},false],["#Element","li","li_s",{},false],["#Element","ul","ul_",{},false]],
		//d3: ["@Element","<ul><li class=\"li_s\"><ul><li class=\"li_s\"><ul class=\"ul_d\"><li>&{text}</li></ul></li></ul></li></ul>"],
		d3: ["#ElementNesting",["#Element","li","Tli",{}],["#Element","ul","ul_d",{},false],["#Element","li","li_s",{},false],["#Element","ul","ul_",{},false],["#Element","li","li_s",{},false],["#Element","ul","ul_",{},false]],
		c3: ["#ElementNesting",["#Element","li","Tli",{}],["#Element","ul","ul_c",{},false],["#Element","li","li_s",{},false],["#Element","ul","ul_",{},false],["#Element","li","li_s",{},false],["#Element","ul","ul_",{},false]],
		a3: ["#ElementNesting",["#Element","li","Tli",{}],["#Element","ul","ul_a",{},false],["#Element","li","li_s",{},false],["#Element","ul","ul_",{},false],["#Element","li","li_s",{},false],["#Element","ul","ul_",{},false]],
		n3: ["#ElementNesting",["#Element","li","Tli",{}],["#Element","ul","ul_n",{},false],["#Element","li","li_s",{},false],["#Element","ul","ul_",{},false],["#Element","li","li_s",{},false],["#Element","ul","ul_",{},false]],
		
		b: ["#Element","b","Tb"],
		i: ["#Element","i","Ti"],
		d: ["#Element","s","Ts"],
		u: ["#Element","span","text_underline"],
		no_u: ["#Element","span","text_no_underline"],
		bold: ["#Element","span","text_bold"],
		
		center: ["#Element","center","text_center"],
		
		light: ["#Element","span","Tlight"],
		lightlight: ["#Element","span","Tlightlight"],
		lighthalf: ["#Element","span","Tlighthalf"],
		
		//ruby: ["@ElementArray","<ruby>&{2}<rp class=\"un-select\">(</rp><rt class=\"un-select\">&{1}</rt><rp class=\"un-select\">)</rp></ruby>"],
		ruby: ["#ElementNesting",[["#Element","rp","un-select",{},"("],["#ElementArray","rt","Hruby_rt un-select",{},{},1],["#Element","rp","un-select",{},")"]],["#ElementArray","ruby","Hruby",{},{},2]],
		
		del: ["#Element","del","Hdel"],
		ins: ["#Element","ins","Hins"],
		Tdel: ["#Element","del","Tdel"],
		Tins: ["#Element","ins","Tins"],
		
		
		abbr: ["#ElementArray","abbr","abbr",{},{title:{t:"&{text}",i:1}},2],
		ot: ["#ElementArray","abbr","abbr_ot",{},{title:{t:"&{text}",i:1}},2],
		
		mark: ["#Element","mark","Tmark"],
		em: ["#Element","em","Tem"],
		
		redline: ["#Element","span","text_redline"],
		yellowline: ["#Element","span","text_yellowline"],
		greenline: ["#Element","span","text_greenline"],
		blueline: ["#Element","span","text_blueline"],
		skyline: ["#Element","span","text_skyline"],
		waveline: ["#ElementArray","span","text_waveline",{},{style:{o:{textDecorationColor:{t:"&{text}",i:1}}}},2],
		
		small: ["#Element","small","Tsmall"],
		sup: ["#Element","sup","Tsup"],
		sub: ["#Element","sub","Tsub"],
		
		bdo_ltr: ["#Element","bdo","Tbdo_ltr",{dir:"ltr"}],
		bdo_rtl: ["#Element","bdo","Tbdo_rtl",{dir:"rtl"}],
		//do_utb: ["@Element","<span style=\"writing-mode:vertical-rl;\"><bdo dir=\"ltr\">&{text}</bdo></span>"],
		//bdo_btu: ["@Element","<span style=\"writing-mode:vertical-lr;\"><bdo dir=\"rtl\">&{text}</bdo></span>"],
		bdo_utb: ["#ElementNesting",["#Element","bdo","Tbdo_utb_i",{dir:"ltr"}],["#Element","span","Tbdo_utb",{},0]],
		bdo_btu: ["#ElementNesting",["#Element","bdo","Tbdo_btu_i",{dir:"rtl"}],["#Element","span","Tbdo_btu",{},0]],
		bdo_utbl: ["#ElementNesting",["#Element","bdo","Tbdo_utbl_i",{dir:"ltr"}],["#Element","span","Tbdo_utbl",{},0]],
		bdo_btur: ["#ElementNesting",["#Element","bdo","Tbdo_btur_i",{dir:"rtl"}],["#Element","span","Tbdo_btur",{},0]],
		
		//figure_img:["@ElementKvP","<figure class=\"figure_img\" style=\"&{width}\"><img src=\"&{rc}/&{src}\" alt=\"&{alt}\" /><figcaption>&{title}</figcaption></figure>",{width:{replace:"width: &{text};", empty:""}}],
		figure_img:["#ElementNesting",[["#ElementObj","img","figure_img_img",{},{src:{t:"&{rc}/&{text}",k:"src"},alt:"alt"}],["#ElementObj","figcaption","figure_img_figcaption",{},{},"title"]],["#ElementObj","figure","figure_img",{},{style:{o:{width:"width"}}},0]],
		Tfigure_img:["#ElementNesting",[["#ElementObj","img","Tfigure_img_img",{},{src:{t:"&{rc}/&{text}",k:"src"},alt:"alt"}],["#ElementObj","figcaption","Tfigure_img_figcaption",{},{},"title"]],["#ElementObj","figure","Tfigure_img",{},{style:{o:{width:"width"}}},0]],
		
		Haudio:["#ElementObj","audio","Haudio",{},true,"alt"],
		//Hvideo:["#ElementKvP","<video class=\"Hvideo\" &{k-v}>&{track}&{alt}</video>", {alt:0, track:{replace: "<track default kind=\"&{3}\" srclang=\"&{2}\" src=\"&{1}\" />", empty:"", func:["@Split"," "]}}],
		Hvideo:["#ElementNesting",["#ElementObj","track","Hvideotrack Frp",{default:"default", rep:["src srclang kind"],split:[" "]},{val:{t:"",k:"track",my:true}},0],["#ElementObj","video","Hvideo",{},true,0]],
		
		Htable:['#ElementHTML','div','Htable',{},["@Table","<table><caption style=\"&{1}\">&{2}</caption>&{table}</table>",{"1":{key: "caption",empty: "caption-side:top;",replace:"caption-side:&{text};",sp:{"none":'display:none;'}},"2":{key:"name"}},{block:"<thead><tr>&{text}</tr></thead>",once:"<th scope=\"col\">&{text}</th>"},{block:"<tbody>&{text}</tbody>",line:"<tr>&{text}</tr>",beg:"<th scope=\"row\">&{text}</th>",once:"<td>&{text}</td>",}]],
	
		//HDoubleColumns: ["@ElementArray","<div class=\"HDoubleColumns\"><div class=\"HDoubleColumns_arg1\">&{1}</div><div class=\"HDoubleColumns_arg1\">&{2}</div></div>"],
		//HDoubleColumnsL: ["@ElementArray","<div class=\"HDoubleColumnsL\"><div class=\"HDoubleColumnsL_arg1\">&{1}</div><div class=\"HDoubleColumnsL_arg1\">&{2}</div></div>"],
		HDoubleColumns: ["#ElementNesting",[["#ElementArray","div","HDoubleColumns_arg1",{},{},1],["#ElementArray","div","HDoubleColumns_arg2",{},{},2]],["#Element","div","HDoubleColumns",{},false]],
		HDoubleColumnsL: ["#ElementNesting",[["#ElementArray","div","HDoubleColumnsL_arg1",{},{},1],["#ElementArray","div","HDoubleColumnsL_arg2",{},{},2]],["#Element","div","HDoubleColumnsL",{},false]],
		
		Htemplate:["#Save","template"],
		HtemplateUse:["#ElementObj","div","HtemplateUse",{lazy: [true]},1,0],
		HtemplateUseFna:["#ElementObj","div","HtemplateUseFna",{lazy: [true]},1,0],
		HtemplateUseFnaRead:["#ElementArray","div","HtemplateUseFnaRead",{base:["&{page}"]},{mod:{t:"",i:1,my:true},fna:{t:"",i:2,my:true}},0],
		
		//Hsay: ["@ElementArray","<div class=\"Hsay\"><div class=\"Hsay_1\">&{1}</div><div class=\"Hsay_2\">&{2}</div></div>"],
		Hsay: ["#ElementNesting",[["#ElementArray","div","Hsay_1",{},{},1],["#ElementArray","div","Hsay_2",{},{},2]],["#Element","div","Hsay",{},0]],
		OT: ["#ElementArray",'div','OT',{},{rep:{t:"",i:1,my:true},type:{t:"",i:2,my:true},text:{t:"",i:3}},0],
		//import:["@Element","<div style=\"display:none;\" class=\"import_fnp\" src=\"&{text}\"> </div>"],
		import: ["#ElementArray",'div','Oimport OincludeA',{base:["&{page}"]},{fnp:{t:"",i:1,my:true}},0],
		include: ["#ElementArray",'div','Oinclude OincludeA',{base:["&{page}"]},{fnp:{t:"",i:1,my:true}},0],
		
		count_chars_only:["#ElementNesting",[["#ElementArray","span","count_chars_only_beg",{},{},1],["#ElementArray","span","count_chars_only_mid",{},{},0],["#ElementArray","span","count_chars_only_end",{},{},2]],["#ElementArray","span","count_chars_only",{},{},0]],
		
		OTitle: ["#ElementArray","div","OTitle",{},{title:1},0],
		OIcon: ["#ElementArray","div","OIcon",{},{src:{t:"&{rc}/&{text}",i:1,my:true}},0],
		ODec: ["#ElementArray","div","ODec",{},{dec:{t:"&{rc}/&{text}",i:1,my:true}},0],
	},
	toHTML_rset:[
		{
			className:"Fnp_Tl",
			func:(vb=document.body)=>{
				let t = vb.getAttribute('t')
				vb.innerHTML = (()=>{
					switch(t){
						case "b":return '&nbsp;';
						case "B":return '&emsp;';
						default:return `&${t};`
					}
				})()
			}
		},
		{
			className:"Tto",
			func:(vb=document.body)=>{
				vb.addEventListener('click',()=>{
					let to_id = vb.getAttribute('to_id')
					let p = document.getElementById(`fnp_id_at_${to_id}`)
					if(typeof p !== 'object' || !p){
						console.error('Fnp > 意外！获取了一个不正常数据，不是对象：', p, vb)
						return
					}
					if(typeof p.scrollIntoView === 'function'){
						p.scrollIntoView();
						//let urlParams = new URLSearchParams(window.location.search)
						//urlParams.set('to', to_id)
						//console.log(urlParams)
						let url = new URL(window.location.href)
						let urlParams = new URLSearchParams(url.search)
						urlParams.set('to', to_id)
						url.search = urlParams.toString()
						window.history.pushState({}, '', url);
					}
					else {
						console.error('Fnp > 意外！获取了一个不正常数据，不是函数：', p.scrollIntoView, p, vb)
					}
				})
			}
		},
		{
			className:"Tgoto",
			func:(vb=document.body)=>{
				vb.addEventListener('click',()=>{
					let path = vb.getAttribute('fnp')
					let to = vb.getAttribute('to_id')
					Fnp_Open(path, {to: to})
				})
			}
		},
		{
			className:"Tgo",
			func:(vb=document.body)=>{
				vb.addEventListener('click',()=>{
					let path = vb.getAttribute('fnp')
					Fnp_Open(path)
				})
			}
		},
		{
			className:"Tgoback",
			func:(vb=document.body)=>{
				vb.addEventListener('click',()=>{
					let i = vb.getAttribute('goback')
					if(typeof i !== 'number' || i<=0){
						console.error('Fnp > 意外！获取了一个不正常数据，不是数值或不是正整数：', i, vb)
					}
					window.history.go(-i);
				})
			}
		},
		{
			className:"Hcode",
			func:(vb=document.body)=>{
				//console.log([vb, vb.innerText,vb.textContent])
				//Array.from(vb.getElementsByTagName('br')).forEach((v,i)=>{if(i&1||!i)v.remove()})
				if(vb.innerHTML[0]=='\n')vb.innerHTML = vb.innerHTML.substring(1)
				vb.innerHTML = vb.innerHTML.replaceAll('\\;','')
			}
		},
		{
			className:"code_fno",
			func:(vb=document.body)=>{
				let v = vb.getElementsByTagName('code')[0]
				let r = Fno_Interpreter.interpreter_array(v.innerHTML.replaceAll('<br>','\n').replaceAll('<br/>','\n'))
				let t = {}
				let rh = r.reverse().map(i => {
					if (!t.hasOwnProperty(i.key)) {
						t[i.key] = i.val
						return `<div class="fno_key">-${i.key}</div> <div class="fno_val">${i.val}</div> `
					}
					return `<div class="fno_key fno_warn">-${i.key}</div> <div class="fno_val">${i.val}</div> `
				}).reverse()
				v.innerHTML = `${rh.join('\n')}`
			}
		},
		{
			className:"code_fna",
			func:(vb=document.body)=>{
				let v = vb.getElementsByTagName('code')[0]
				let obj = Fna_Interpreter.interpreter(v.innerHTML.replaceAll('<br>','\n').replaceAll('<br/>','\n'))
				let r = obj.opt
				let g = i => {
						return `<div class="fna_key">-${i.key}</div> <div class="fno_val">${i.val}</div> `
				}
				let f = o => {
					if(!o){
						return ""
					}
					let rr = []
					for (let k in o) {
						if(k=='$')continue;
						rr.push(g({
							key: k,
							val: o[k]
						}))
					}
					let rrr = rr.join('<br/>')
					if(rrr!="")return `<br/>${rrr}`
					return ""
				}
				let rh = []
				for (let i = 0; i < r.length; i++) {
					if(r[i].$=="")continue;
					rh.push(`<div class="fna_name"># ${r[i].$}</div>${f(r[i])}<br/>`)
				}
				v.innerHTML = `${rh.join('<br/>')}`
			}
		},
		{
			className:"OTitle",
			func:(vb=document.body)=>{
				let title = vb.getAttribute('title')
				document.title = title;//console.log(title)
			}
		},{
			className:"OIcon",
			func:(vb=document.body)=>{
				let src = vb.getAttribute('src')
				let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
				link.rel = 'icon';
				link.href = src;
				document.getElementsByTagName('head')[0].appendChild(link);
			}
		},{
			className:"ODec",
			func:(vb=document.body)=>{
				let dec = vb.getAttribute('dec')
				let ele = document.querySelector("meta[name*='description']") || document.createElement('meta');
				ele.name = 'description';
				ele.content = dec;
				document.getElementsByTagName('head')[0].appendChild(ele);
			}
		},{
			className:"Frp",
			func:(vb=document.body)=>{
				let rep = vb.getAttribute('rep')
				let split = vb.getAttribute('split')
				let val = vb.getAttribute('val')
				let reps = rep.split(split)
				let vals = val.split(split)
				vals.forEach((v,i)=>vb.setAttribute(reps[i],v))
			}
		},
		{
			className:"HtemplateUse",
			func:(vb=document.body)=>{
				//console.log(vb)
				let fno = vb.saved
				let tmp_ = fno['@']
				//console.log(vb,fno,tmp_,fnp_user['template'])
				if(typeof fnp_user['template'] !== 'object'){
					if(vb.getAttribute('lazy'))return 1;
					console.error("fnp > 模板存储区不存在（且非lazy语法）:",tmp_,'template',fnp_user['template'])
				}
				if(!(tmp_ in fnp_user['template'])){
					if(vb.getAttribute('lazy'))return 1;
					console.error("fnp > 模板不存在（且非lazy语法）:",tmp_,fnp_user['template'])
				}
				let tmp = fnp_user['template'][tmp_]
				for (let k in fno) {
					let kr = `&{${k}}`
					tmp = tmp.replaceAll(kr, fno[k])
				}
				let cobj = fnp_user.fnp.compiler(tmp,0)
				let ele = fnp_user.fnp.interpreter(cobj)
				ele.main.className = "HtemplateUse_Doc"
				vb.appendChild(ele.main)
				vb.setAttribute("rset_used","true")
				Array.from(document.getElementsByClassName('Fnp_Document')).forEach(v => rset(v))
				//console.log(fno,tmp,cobj,ele)
			}
		},
		{
			className:"HtemplateUseFna",
			func:(vb=document.body)=>{
				let fna = vb.saved
				let $_ = fna.filter(v=>v['$']=='$')[0]
				let tmp_ = $_['@']
				if(typeof fnp_user['template'] !== 'object'){
					if(vb.getAttribute('lazy'))return 1;
					console.error("fnp > 模板存储区不存在（且非lazy语法）:",tmp_,'template',fnp_user['template'])
				}
				if(!(tmp_ in fnp_user['template'])){
					if(vb.getAttribute('lazy'))return 1;
					console.error("fnp > 模板不存在（且非lazy语法）:",tmp_,fnp_user['template'])
				}
				let tmp = fnp_user['template'][tmp_]
				let r = fna.filter(v=>v['$']!='$').map(fno=>{
					let r = tmp;
					for (let k in fno) {
						let kr = `&{${k}}`
						r = r.replaceAll(kr, fno[k])
					}
					let cobj = fnp_user.fnp.compiler(r,0)
					let ele = fnp_user.fnp.interpreter(cobj)
					ele.main.className = "HtemplateUseFna_Doc"
					return ele.main
				})
				r.forEach(v => vb.appendChild(v))
				vb.setAttribute("rset_used","true")
				Array.from(document.getElementsByClassName('Fnp_Document')).forEach(v => rset(v))
				//console.log(fna,$_,tmp_,tmp,r)
			}
		},
		{
			className:"HtemplateUseFnaRead",
			func:(()=>{
				return (vb=document.body)=>{
					let base = vb.getAttribute('base')
					let mod = vb.getAttribute('mod')
					let fna_ = vb.getAttribute('fna')
					let tmp_ = mod
					if(typeof fnp_user['template'] !== 'object'){
						if(vb.getAttribute('lazy'))return 1;
						console.error("fnp > 模板存储区不存在（且非lazy语法）:",tmp_,'template',fnp_user['template'])
					}
					if(!(tmp_ in fnp_user['template'])){
						if(vb.getAttribute('lazy'))return 1;
						console.error("fnp > 模板不存在（且非lazy语法）:",tmp_,fnp_user['template'])
					}
					let tmp = fnp_user['template'][tmp_]
					let fna_src = base? `${base}/${fna_}.fna` : `${fna_}.fna`;
					FnFileSys.read(fna_src, (text)=>{
						let fna = Fna_Interpreter.interpreter(text).opt.filter(v=>v.$)
						let eles = fna.map(fno=>{
							let r = tmp;
							for (let k in fno) {
								let kr = `&{${k}}`
								r = r.replaceAll(kr, fno[k])
							}
							let cobj = fnp_user.fnp.compiler(r,0)
							let ele = fnp_user.fnp.interpreter(cobj)
							ele.main.className = "HtemplateUseFna_Doc"
							return ele.main
						})
						eles.forEach(v=>vb.appendChild(v))
						vb.setAttribute("rset_used","true")
						Array.from(document.getElementsByClassName('Fnp_Document')).forEach(v => rset(v))
					})
				}
			})()
		},
		{
			className:"OT",
			func:(vb=document.body)=>{
				let rep = vb.getAttribute('rep')
				let text = vb.text
				let type = vb.getAttribute('type')
				setTimeout(()=>{
					Array.from(document.getElementsByClassName("Bnovel")).forEach(v=>{
						Array.from(v.getElementsByClassName('FnpText')).forEach(p => {
							let sp = p.innerHTML.replaceAll('<br>','\n').replaceAll('<br/>','\n').split(new RegExp(`(${rep})`, "g"))
							let r = sp.map(v=>{
								if(v!=rep){
									let ele = document.createElement('span')
									ele.className = 'FnpText'
									ele.innerText = v
									return ele
								}else{
									let ele = document.createElement('span')
									ele.className = `FnpText_OT FnpText_OT_${type}`
									ele.innerText = v
									ele.setAttribute('title_', text)
									let elea = document.createElement('div')
									elea.className = `FnpText_OT_o FnpText_OT_${type}_o`
									elea.elea = 1
									elea.innerText = text
									elea.style.display = 'none'
									ele.appendChild(elea)
									ele.addEventListener('click',(e)=>{
										if (e.target.elea)return;
										//console.log(elea.style.display,elea.style.display=='none')
										if(elea.style.display!='none'){
											elea.style.display = 'none'
											return;
										}
										elea.style.display = 'block'
										//console.log(elea.style.display)
										let ci = elea.getBoundingClientRect()
										//let lv = ci.left - width
										//console.log(ci,elea,elea.style)
										if(ci.x < 0){
											//console.log(ci,elea,elea.style)
											elea.animate(
											  [
											    { transform: `translate(${'0'}, 0)` }
											  ],
											  { duration: 0, fill: 'forwards' }
											);
										}else if(ci.right > window.innerWidth){
											//console.log(ci,elea,elea.style,window.innerWidth)
											elea.animate(
											  [
											    { transform: `translate(${'-100%'}, 0)` }
											  ],
											  { duration: 0, fill: 'forwards' }
											);
										}
									})
									return ele
								}
							})
							p.className = 'FnpText_d'
							p.innerHTML = ''
							r.forEach(x => p.appendChild(x))
							//console.log(p,p.innerHTML,rep,vb,type,text,sp,r)
						})
					})
				},100)
			}
		},{
			className:"count_chars_only",
			func:(vb=document.body)=>{
				setTimeout(()=>{
					let cnt = 0;
					Array.from(document.getElementsByClassName("Bnovel")).forEach(v=>{
						Array.from(v.getElementsByClassName('FnpText')).forEach(p => {
							cnt += p.innerText.trim().length
						})
						Array.from(v.getElementsByClassName('FnpText_OT')).forEach(p => {
							cnt += p.innerText.trim().length
						})
					})
					vb.getElementsByClassName('count_chars_only_mid')[0].innerHTML = cnt
					vb.style.display = 'inline'
				},200)
			}
		},{
			className:"OincludeA",
			func:(vb=document.body)=>{
				let fnp_ = vb.getAttribute('fnp')
				let base = vb.getAttribute('base')
				let fnp_src = base? `${base}/${fnp_}.fnp` : `${fnp_}.fnp`;
				FnFileSys.read(fnp_src, (text)=>{
					let cobj = fnp_user.fnp.compiler(text)
					let eles = fnp_user.fnp.interpreter(cobj)
					let ele = eles.main
					ele.className = "OincludeA_Doc"
					vb.appendChild(ele)
					//rset()
					//console.log()
					Array.from(document.getElementsByClassName('Fnp_Document')).forEach(v => rset(v))
				})
			}
		}
	]
}
var fnp_template = {}//unused
var fnp_user = {}
function FnpInterpreter(setting={}, FnpInterpreterDef = FnpInterpreterDefine, doctype = "toHTML"){
	let DF = {
		path_reset:function(text = ""){
			if(typeof text === 'string')return text.replace(/\&\{page\}/g,setting.pages).replace(/\&\{rc\}/g,setting.rc)
			return text
			//console.error("!@#$#scx",text)
		},
	}
	if(!(doctype in FnpInterpreterDef)){
		return console.error(`Fnp > 意外！获取了一个不正常数据，没有：${doctype}项：`, FnpInterpreterDef)
	}
	function Interpreter(){console.error("Fnp > 意外！Interpreter声明而未定义")}
	function fset(FnpInterpreterDef, doctype){
		FnpInterpreterDef[`${doctype}F`] = {}
		let p = FnpInterpreterDef[doctype]
		let r = FnpInterpreterDef[`${doctype}F`]
		var df = {
			"@Text":() => (text => text.replaceAll(/\n/g, '<br/>')),
			"@Clear":() => (() => ''),
			"@Console":() => (obj)=>{
				console.log(obj);
				return ''
			},
			"@Element":(HTML)=>((text)=>DF.path_reset(HTML.replaceAll('&{text}', text))),
			"@ElementArray":(HTML)=>((array)=>{let r = HTML;array.forEach((text, index) => r = r.replaceAll(`&{${index+1}}`, text));return DF.path_reset(r);}),
			"@ElementKv":(HTML, rep)=>((obj)=>{
				let r = HTML;
				for (let k in obj) {
					let v = obj?.[k]
					if(rep?.[k])v = v? rep?.[k].replace?.replaceAll("&{text}",v):rep?.[k].empty;
					r = r.replaceAll(`&{${k}}`,v)
				}
				return DF.path_reset(r);
			}),
			"@ElementKvP":(HTML, rep)=>((obj)=>{
				let kvs = []
				let r = HTML
				for (let k in obj) {
					let v = obj?.[k]
					if(k in rep){
						if(rep[k]){
							if(v){
								if(rep[k].func){
									let rpobj = DF.tool[rep[k].func[0]](v, ...rep[k].func.slice(1))
									v = rep[k].replace
									for (let K in rpobj) {
										let V = rpobj[K]
										v = v.replaceAll(`&{${K}}`,V);
										
									}
									
								}else{
									v = rep[k].replace?.replaceAll("&{text}",v);
								}
							}
							else{
								v = rep[k].empty;
							}
						}
						r = r.replaceAll(`&{${k}}`,v)
					}else{
						if(v!="~") kvs.push(`${k}="${v}"`)
					}
				}
				r = r.replaceAll(`&{k-v}`,kvs.join(' '))
				return DF.path_reset(r);
			}),
			"@Table":(HTML_Box, rep_Box, head_Box, line_Box)=>(obj)=>{
				//let obj = objo.obj
				//console.log(obj);
				let rHTML = HTML_Box
				for (let it in rep_Box) {
					let p = rep_Box[it]
					let rp = obj?.$?.[p.key]??p.empty??""
					if(p.sp&&rp in p.sp){
						rp = p.sp?.[rp]
					}else if(p.replace){
						rp = p.replace.replaceAll(`&{text}`, rp)
					}
					rHTML = rHTML.replaceAll(`&{${it}}`, rp)
				}
				let head = (function(){
					let r = obj.table?.[0].map(v=>head_Box.once.replace('&{text}',v))
					return head_Box.block.replace('&{text}',r?.join(''))
				})()
				let line = function(i){
					let r = obj.table[i].map((v,i)=>{
						if(i==0)return line_Box.beg.replace('&{text}',v)
						return line_Box.once.replace('&{text}',v)
					})
					return line_Box.line.replace('&{text}',r.join(''))
				}
				let body = (function(){
					let r = obj.table?.map((_,i)=>{
						if(i==0)return undefined
						return line(i)
					}).filter(x => typeof x === 'string')
					return line_Box.block.replace('&{text}',r?.join(''))
				})()
				return rHTML.replace('&{table}',[head,body].join(''))
			},
			"@Template":()=>([name, HTML])=>{
				fnp_template[name] = HTML
				return ""
			},
			"@TemplateUseFno":()=>(fno)=>{
				let html = fnp_template[fno?.['@']];
				if(!html){
					return `Fnp模板${fno?.['@']}无效。`
				}
				for (let k in fno) {
					let v = fno[k]
					html = html.replaceAll(`&amp;{${k}}`, v)
				}
				return DF.basic(html)
			},
			"@TemplateUseFna":()=>(fna)=>{
				let Mod = ""
				let Modname = ""
				return fna.map((v)=>{
					if(v?.$ == '$'){
						Modname = v?.["@"] ?? ""
						Mod = fnp_template[Modname];
						if(!Mod){
							return `Fnp模板${Modname}无效。`
						}
						return ""
					}else{
						if(!Mod){
							return `Fnp模板${Modname}无效。`
						}
						let html = Mod
						for (let k in v) {
							let v1 = v[k]
							html = html.replaceAll(`&amp;{${k}}`, v1)
						}
						return DF.basic(html)
					}
				}).join('')
			},
			"#Element":(tag, className, obj={}, inner=true)=>(content=[])=>{
				let ele = document.createElement(tag)
				ele.className = className
				for(let k in obj){
					ele[k] = obj[k]
				}
				if(!inner)return ele;
				if(typeof inner === 'string'){
					ele.inner = inner;
					return ele;
				}
				if(typeof content === 'string'){
					ele.innerText = content
					return ele;
				}
				content.forEach(v=>{
					if(typeof v !== 'object'){
						console.error("Fnp > 解释器意外！不是对象", [v, content])
						return
					}
					if(v === null)return;
					if(typeof v.nodeType === 'number'){
						ele.appendChild(v)
						return
					}
					console.error("Fnp > 解释器意外！不是页面Node对象", v)
				})
				return ele
			},
			"#Text":()=>(text)=>{
				function rf(text=""){
					return text.replaceAll('\n\r','\u0001').replaceAll('\n','\u0001').replaceAll('\r','').replaceAll('\u0001','\r\n')
				}
				let ele = document.createElement('span')
				ele.className = 'FnpText'
				if(typeof text === 'string') ele.innerText = rf(text)
				else if(Array.isArray(text)) ele.innerText = text.map(rf).join('')
				else console.error("Fnp > 解释器意外！不是字符串或数组", text)
				return ele
			},
			"#ElementArray":(tag, className, obj={}, objRep={}, text_i=0,text_pos=0)=>(arg)=>{
				try{
					var ele = document.createElement(tag)
				}catch(e){
					return console.error("Fnp > 解释器意外！document.createElement(tag)出错，tag:",tag)
				}
				ele.className = className
				for(let k in obj){
					if(Array.isArray(obj[k])) ele.setAttribute(k, DF.path_reset(obj[k][0]))
					else ele[k] = DF.path_reset(obj[k])
				}
				function rq(ele, objRep, b = []){
					for(let k in objRep){
						//console.log(11, arg, [objRep[k].i-1], k)
						if(typeof objRep[k] === 'number'){
							if(objRep[k] > arg.length){
								console.error('Fnp > 意外！objRep[k] > arg.length',objRep[k],arg.length,objRep,arg,tag)
								continue;
							}
							ele[k] = DF.path_reset(arg[objRep[k]-1])
							continue
						}
						if(typeof objRep[k] !== 'object'){
							return console.error("Fnp > 意外！不是对象", objRep[k],objRep)
						}
						if(typeof objRep[k].o === 'object'){
							if(typeof ele[k] !== 'object')ele[k] = {}
							rq(ele[k], objRep[k].o, [k,...b])
							continue
						}
						if(typeof objRep[k].i !== 'number'){
							return console.error("Fnp > 意外！不是数值", objRep[k].i, objRep[k], objRep)
						}
						if(typeof objRep[k].t !== 'string'){
							return console.error("Fnp > 意外！不是字符串", objRep[k].t, objRep)
						}
						if(objRep[k].i > arg.length){
							console.error('Fnp > 意外！objRep[k].i > arg.length',objRep[k].i,arg.length)
							continue;
						}
						let val = (objRep[k].t === '')? arg[objRep[k].i-1]:DF.path_reset(objRep[k].t.replaceAll('&{text}',arg[objRep[k].i-1]))
						if(!objRep[k].my){
							ele[k] = val
						}
						else {
							//console.log(k,val,arg[objRep[k].i-1])
							ele.setAttribute(k, val)
						}
					}
				}
				rq(ele, objRep)
				if(text_i<=0 || !text_i){
					return ele
				}
				if(Array.isArray(arg[text_i-1])){
					let content = arg[text_i-1].map(Interpreter);
					//console.log(888,content,arg[text_i-1])
					try{
						content.forEach(v => ele.appendChild(v))
					}
					catch(e){
						console.error("Fnp > 意外！content.forEach(v => ele.appendChild(v))出错", content)
					}
				}
				else if(typeof arg[text_i-1] === 'string'){
					if(text_pos == 0)ele.innerText = arg[text_i-1]
					else if(text_pos == 1){
						ele.innerHTML = arg[text_i-1].replaceAll('\n\r','<br/>')
					}
				}
				else console.error("Fnp > 意外！不是数组或字符串", arg, arg[text_i-1],text_i)
				return ele
			},
			"#ElementOnlyArgNotInner":(tag, className, obj={}, objRep={})=>{
				let f = df['#ElementArray'](tag, className, obj, objRep, 0)
				return (v)=>{
					let va = [v]
					//console.log(54,va,f(va), objRep,f(va).id)
					return f(va)
				}
			},
			"#Comment":()=>(content)=>{
				return document.createComment(content)
			},
			"#Clear":()=>()=>{
				return null
			},
			"#ElementNesting":(...arr)=>(arg)=>{
				function fsg(arr){
					if(typeof arr[0] === 'string'){
						let f = df[arr[0]]
						if(typeof f !== 'function'){
							console.error('Fnp > 意外！不是函数',f,arg)
							return;
						}
						return f(...arr.slice(1))(arg)
					}
					if(Array.isArray(arr[0])){
						return arr.map(v => fsg(v))
					}
				}
				//console.log(7,arr,arg,)
				let vss = fsg(arr)
				let os = vss[0]
				for (var i = 1; i < vss.length; i++) {
					let v = (Array.isArray(vss[i]))?vss[i][0]:vss[i];
					//console.log(4456,v,os)
					if(Array.isArray(os))os.forEach(x=>v.appendChild(x))
					else v.appendChild(os)
					os = vss[i]
				}
				return os
			},
			"#ElementObj":(tag, className, obj={}, objRep={}, text_i=0)=>(arg)=>{
				try{
					var ele = document.createElement(tag)
				}catch(e){
					return console.error("Fnp > 解释器意外！document.createElement(tag)出错，tag:",tag)
				}
				ele.className = className
				for(let k in obj){
					if(Array.isArray(obj[k])) ele.setAttribute(k, obj[k][0])
					else ele[k] = obj[k]
				}
				function rq(ele, objRep, b = []){
					for(let k in objRep){
						if(typeof objRep[k] === 'string'){
							ele[k] = DF.path_reset(arg[objRep[k]])
							continue
						}
						if(typeof objRep[k] !== 'object'){
							return console.error("Fnp > 意外！不是对象", objRep[k],objRep)
						}
						if(typeof objRep[k].o === 'object'){
							if(typeof ele[k] !== 'object')ele[k] = {}
							rq(ele[k], objRep[k].o, [k,...b])
							continue
						}
						if(typeof objRep[k].k !== 'string'){
							return console.error("Fnp > 意外！不是字符串", objRep[k].k, objRep[k], objRep)
						}
						if(typeof objRep[k].t !== 'string'){
							return console.error("Fnp > 意外！不是字符串", objRep[k].t, objRep)
						}
						let val = (objRep[k].t === '')? arg[objRep[k].k]:DF.path_reset(objRep[k].t.replaceAll('&{text}',arg[objRep[k].k]))
						if(!objRep[k].my){
							ele[k] = val
						}
						else {
							//console.log(k,val,arg[objRep[k].i-1])
							ele.setAttribute(k, val)
						}
					}
				}
				if(typeof objRep === 'object')rq(ele, objRep)
				else if(typeof objRep === 'boolean'){
					for (let k in arg) {
						let val = arg[k]
						if(val == '~')continue;
						if(!objRep){
							ele[k] = val
						}
						else {
							//console.log(k,val,arg[objRep[k].i-1])
							let kk = k;
							if(kk=='@')kk='__at__'
							ele.setAttribute(kk, val)
						}
					}
				}
				else if(typeof objRep === 'number'){
					if(objRep == 1){
						ele.saved = arg
					}else{
						return console.error("Fnp > 意外！未定义objRep==", objRep)
					}
				}
				if(!text_i || text_i === ''){
					return ele
				}
				if(Array.isArray(arg[text_i])){
					let content = arg[text_i].map(Interpreter);
					try{
						content.forEach(v => ele.appendChild(v))
					}
					catch(e){
						console.error("Fnp > 意外！content.forEach(v => ele.appendChild(v))出错", content)
					}
				}
				else if(typeof arg[text_i] === 'string'){
					ele.innerText = arg[text_i]
				}
				else console.error("Fnp > 意外！不是数组或字符串", arg, arg[text_i],text_i)
				return ele
			},
			'#ElementHTML':(tag,className,obj,func)=>(...a)=>{
				let html = df[func[0]](...func.slice(1))(...a)
				try{
					var ele = document.createElement(tag)
				}catch(e){
					return console.error("Fnp > 解释器意外！document.createElement(tag)出错，tag:",tag)
				}
				ele.className = className
				for(let k in obj){
					if(Array.isArray(obj[k])) ele.setAttribute(k, obj[k][0])
					else ele[k] = obj[k]
				}
				ele.innerHTML = html;
				//console.log(ele,a,func[0],df[func[0]](...func.slice(1))(...a))
				return ele
			},
			'#Save':(type)=>(a)=>{
				if(!(type in fnp_user)) fnp_user[type] = {}
				if(typeof fnp_user[type] !== 'object'){
					console.error("Fnp > #Save正在修改一个已存在且不符合要求的属性：",type,fnp_user)
					return;
				}
				fnp_user[type][a[0]] = a[1]
				//console.log(fnp_user,a)
				return null
			}
		}
		for (let k in p) {
			let func = p[k]
			if(typeof df[func[0]]!=='function'){
				console.error('Fnp > 意外！不是函数',p,k,p[k],df)
				continue;
			}
			r[k] = df[func[0]](...func.slice(1))
		}
		return r;
	}
	let DFf = fset(FnpInterpreterDef, doctype);
	function Interpreter(obj){
		if(typeof obj === 'string'){
			return obj
		}
		if(typeof obj !== 'object'){
			console.error("Fnp > 意外！不是对象", obj)
			return
		}
		let f = DFf[obj.type]
		if(typeof f !== 'function'){
			console.error("Fnp > 意外！不是函数", f, obj)
			return
		}
		if(Array.isArray(obj.has)){
			let arg = obj.has.map(v => Interpreter(v))
			//console.log(474, obj,[arg,f])
			return f(arg)
		}
		if(typeof obj.text === 'string'){
			return f(obj.text)
		}
		if('args' in obj){
			return f(obj.args)
		}
		if('obj' in obj){
			return f(obj.obj)
		}
		for(let k in obj){
			if(k != 'type'){
				console.error("Fnp > 意外！存在除type项外项", obj)
				return ""
			}
		}
		return f()
	}
	rset = function(ele=document.body, FnpInterpreterDefp = FnpInterpreterDef, doctypep = doctype){
		let rs = FnpInterpreterDefp[`${doctypep}_rset`]
		if(!Array.isArray(rs)) return;
		rs.forEach(fo => {
			Array.from(ele.getElementsByClassName(fo.className)).filter(v=>{
				let used = v.getAttribute('rset_used')
				//console.log(v,used)
				return !used
			}).forEach(v=>{
				let r = fo.func(v)
				if(!r)v.setAttribute('rset_used',true)
			})
		})
		if(ele.lastElementChild.className == 'FnpText'){
			let p = ele.lastElementChild.lastElementChild
			if(typeof p === 'object' && p !== null && p.tagName == 'BR')p.remove()
		}
	}
	return (obj)=>{
		//console.log(DFf)
		//console.log(obj)
		let r = Interpreter(obj)
		rset(r, FnpInterpreterDef, doctype)
		//console.log([r])
		return {
			main: r
		}
	}
}
function Fnp(FnpSetting){
	if(typeof FnpSetting.pages !== "string") return console.error("Fnp> 请传入字符串pages项即.fnp文件目录路径。")
	if(typeof FnpSetting.index !== "string" || FnpSetting.index == "") return console.error("Fnp> 请传入字符串index项即默认.fnp文件。")
	if(typeof FnpSetting.box !== "object") return console.error("Fnp> 请传入对象box项即需更新元素。")
	if(typeof FnpSetting.box.main !== "object") return console.error("Fnp> 请传入元素对象box.main项即主要需更新元素。")
	fnp_user.FnpSetting = FnpSetting
	
	function make_page_path(path){
		return FnpSetting.pages==""?path : `${FnpSetting.pages}/${path}.fnp`
	}
	function make_element(fnpHTMLs){
		if(typeof fnpHTMLs !== "object")return console.error("Fnp> make_element参数非对象。", [fnpHTMLs])
		for (let k in FnpSetting.box) {
			if(Array.isArray(fnpHTMLs[k])){fnpHTMLs[k].forEach(v => FnpSetting.box[k].appendChild(v));continue;}
			if(typeof fnpHTMLs[k] === "object"){
				FnpSetting.box[k].appendChild(fnpHTMLs[k]);
				FnpSetting.box[k].className = [FnpSetting.box[k].className,'Fnp_Document_Box'].filter(v=>v).join(' ')
				continue;
			}
			console.error(`Fnp> make_element参数${k}项非对象或数组。`,fnpHTMLs[k])
		}
	}
	var fnpCompiler = FnpCompiler()
	var fnpInterpreter = FnpInterpreter(FnpSetting)
	function Fnp_Open_Page(path,callback){
		FnFileSys.read(make_page_path(path), (text)=>{
			if(!text){
				for (let k in FnpSetting.box) {
					if(typeof FnpSetting.box[k] !== 'object')continue;
					FnpSetting.box[k].innerHTML = `<center><b>404 Not Found</b></center><center><small>[Fnp] 意外情况：无法读取文件\`${path}\`或文件内容为空.</small></center>`
				}
				console.error(`* Fnp > 意外情况：无法读取文件\`${path}\`或文件内容为空.`)
				return;
			}
			let fnpObj = fnpCompiler(text)
			let fnpHTMLs = fnpInterpreter(fnpObj)
			make_element(fnpHTMLs)
			callback()
		})
	}
	let return_ = {
		compiler:fnpCompiler,
		interpreter:fnpInterpreter,
		run:()=>{
			let urlParams = new URLSearchParams(window.location.search);
			let page = urlParams.get('fnp');
			let to_id = urlParams.get('to');
			let lazy = urlParams.get('lazy')
			function callback(){
				if(to_id){
					let p = document.getElementById(`fnp_id_at_${to_id}`)
					if(typeof p !== 'object' || !p || lazy){
						setTimeout(()=>{
							p = document.getElementById(`fnp_id_at_${to_id}`)
							if(typeof p !== 'object' || !p){
								console.error('Fnp > 意外！获取了一个不正常数据，不是对象：', p, to_id)
								return;
							}
							if(typeof p.scrollIntoView === 'function')p.scrollIntoView();
							else {
								console.error('Fnp > 意外！获取了一个不正常数据，不是函数：', p.scrollIntoView, p, to_id)
							}
						},1000)
						return
					}
					if(typeof p.scrollIntoView === 'function')p.scrollIntoView();
					else {
						console.error('Fnp > 意外！获取了一个不正常数据，不是函数：', p.scrollIntoView, p, to_id)
					}
				}
			}
			if(page) Fnp_Open_Page(page,callback);
			else Fnp_Open_Page(FnpSetting.index,callback);
		}
	}
	fnp_user.fnp = return_
	return return_
}