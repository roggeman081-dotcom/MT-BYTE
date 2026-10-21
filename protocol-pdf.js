function makeProtocolPdf(html, JsPDF) {
 const doc=new JsPDF(); let y=18;
 const clean=s=>s.replace(/<br\s*\/?[>]/gi,'; ').replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/→/g,' -> ').replace(/[✓]/g,'[X]').replace(/[✕]/g,'[ ]').replace(/[–—]/g,'-').trim();
 const line=(s,size=10)=>{doc.setFontSize(size);for(const l of doc.splitTextToSize(s,180)){if(y>278){doc.addPage();y=18;}doc.text(l,15,y);y+=size*0.48;}y+=3;};
 const re=/<(h1|h2|p|tr|figcaption)\b[^>]*>([\s\S]*?)<\/\1>|<img\b[^>]*src=["']([^"']+)["'][^>]*>/gi;let m;
 while((m=re.exec(html))){if(m[3]){doc.addPage();y=18;const info=doc.getImageProperties(m[3]);const scale=Math.min(180/info.width,235/info.height);doc.addImage(m[3],info.fileType,15,y,info.width*scale,info.height*scale);y+=info.height*scale+5;}else{let text=m[1]==='tr'?Array.from(m[2].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi),x=>clean(x[1])).join(' | '):clean(m[2]);if(text)line(text,m[1]==='h1'?17:m[1]==='h2'?13:10);}}
 const n=doc.getNumberOfPages();for(let i=1;i<=n;i++){doc.setPage(i);doc.setFontSize(8);doc.text(i+' / '+n,180,290);}return doc;
}
if(typeof module!=='undefined')module.exports=makeProtocolPdf;
