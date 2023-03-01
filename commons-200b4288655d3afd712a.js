"use strict";(self.webpackChunkmjun_tech_note=self.webpackChunkmjun_tech_note||[]).push([[351],{8032:function(e,t,a){a.d(t,{L:function(){return g},M:function(){return C},P:function(){return v},S:function(){return F},_:function(){return o},a:function(){return l},b:function(){return d},g:function(){return u},h:function(){return s}});var r=a(7294),n=(a(2369),a(5697)),i=a.n(n);function l(){return l=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var r in a)Object.prototype.hasOwnProperty.call(a,r)&&(e[r]=a[r])}return e},l.apply(this,arguments)}function o(e,t){if(null==e)return{};var a,r,n={},i=Object.keys(e);for(r=0;r<i.length;r++)t.indexOf(a=i[r])>=0||(n[a]=e[a]);return n}const s=()=>"undefined"!=typeof HTMLImageElement&&"loading"in HTMLImageElement.prototype;function c(e,t,a){const r={};let n="gatsby-image-wrapper";return"fixed"===a?(r.width=e,r.height=t):"constrained"===a&&(n="gatsby-image-wrapper gatsby-image-wrapper-constrained"),{className:n,"data-gatsby-image-wrapper":"",style:r}}function d(e,t,a,r,n){return void 0===n&&(n={}),l({},a,{loading:r,shouldLoad:e,"data-main-image":"",style:l({},n,{opacity:t?1:0})})}function u(e,t,a,r,n,i,o,s){const c={};i&&(c.backgroundColor=i,"fixed"===a?(c.width=r,c.height=n,c.backgroundColor=i,c.position="relative"):("constrained"===a||"fullWidth"===a)&&(c.position="absolute",c.top=0,c.left=0,c.bottom=0,c.right=0)),o&&(c.objectFit=o),s&&(c.objectPosition=s);const d=l({},e,{"aria-hidden":!0,"data-placeholder-image":"",style:l({opacity:t?0:1,transition:"opacity 500ms linear"},c)});return d}const m=["children"],p=function(e){let{layout:t,width:a,height:n}=e;return"fullWidth"===t?r.createElement("div",{"aria-hidden":!0,style:{paddingTop:n/a*100+"%"}}):"constrained"===t?r.createElement("div",{style:{maxWidth:a,display:"block"}},r.createElement("img",{alt:"",role:"presentation","aria-hidden":"true",src:"data:image/svg+xml;charset=utf-8,%3Csvg%20height='"+n+"'%20width='"+a+"'%20xmlns='http://www.w3.org/2000/svg'%20version='1.1'%3E%3C/svg%3E",style:{maxWidth:"100%",display:"block",position:"static"}})):null},g=function(e){let{children:t}=e,a=o(e,m);return r.createElement(r.Fragment,null,r.createElement(p,l({},a)),t,null)},f=["src","srcSet","loading","alt","shouldLoad"],h=["fallback","sources","shouldLoad"],y=function(e){let{src:t,srcSet:a,loading:n,alt:i="",shouldLoad:s}=e,c=o(e,f);return r.createElement("img",l({},c,{decoding:"async",loading:n,src:s?t:void 0,"data-src":s?void 0:t,srcSet:s?a:void 0,"data-srcset":s?void 0:a,alt:i}))},b=function(e){let{fallback:t,sources:a=[],shouldLoad:n=!0}=e,i=o(e,h);const s=i.sizes||(null==t?void 0:t.sizes),c=r.createElement(y,l({},i,t,{sizes:s,shouldLoad:n}));return a.length?r.createElement("picture",null,a.map((e=>{let{media:t,srcSet:a,type:i}=e;return r.createElement("source",{key:t+"-"+i+"-"+a,type:i,media:t,srcSet:n?a:void 0,"data-srcset":n?void 0:a,sizes:s})})),c):c};var w;y.propTypes={src:n.string.isRequired,alt:n.string.isRequired,sizes:n.string,srcSet:n.string,shouldLoad:n.bool},b.displayName="Picture",b.propTypes={alt:n.string.isRequired,shouldLoad:n.bool,fallback:n.exact({src:n.string.isRequired,srcSet:n.string,sizes:n.string}),sources:n.arrayOf(n.oneOfType([n.exact({media:n.string.isRequired,type:n.string,sizes:n.string,srcSet:n.string.isRequired}),n.exact({media:n.string,type:n.string.isRequired,sizes:n.string,srcSet:n.string.isRequired})]))};const E=["fallback"],v=function(e){let{fallback:t}=e,a=o(e,E);return t?r.createElement(b,l({},a,{fallback:{src:t},"aria-hidden":!0,alt:""})):r.createElement("div",l({},a))};v.displayName="Placeholder",v.propTypes={fallback:n.string,sources:null==(w=b.propTypes)?void 0:w.sources,alt:function(e,t,a){return e[t]?new Error("Invalid prop `"+t+"` supplied to `"+a+"`. Validation failed."):null}};const C=function(e){return r.createElement(r.Fragment,null,r.createElement(b,l({},e)),r.createElement("noscript",null,r.createElement(b,l({},e,{shouldLoad:!0}))))};C.displayName="MainImage",C.propTypes=b.propTypes;const x=["as","className","class","style","image","loading","imgClassName","imgStyle","backgroundColor","objectFit","objectPosition"],k=["style","className"],S=e=>e.replace(/\n/g,""),L=function(e,t,a){for(var r=arguments.length,n=new Array(r>3?r-3:0),l=3;l<r;l++)n[l-3]=arguments[l];return e.alt||""===e.alt?i().string.apply(i(),[e,t,a].concat(n)):new Error('The "alt" prop is required in '+a+'. If the image is purely presentational then pass an empty string: e.g. alt="". Learn more: https://a11y-style-guide.com/style-guide/section-media.html')},N={image:i().object.isRequired,alt:L},T=["as","image","style","backgroundColor","className","class","onStartLoad","onLoad","onError"],I=["style","className"],z=new Set;let M,_;const j=function(e){let{as:t="div",image:n,style:i,backgroundColor:d,className:u,class:m,onStartLoad:p,onLoad:g,onError:f}=e,h=o(e,T);const{width:y,height:b,layout:w}=n,E=c(y,b,w),{style:v,className:C}=E,x=o(E,I),k=(0,r.useRef)(),S=(0,r.useMemo)((()=>JSON.stringify(n.images)),[n.images]);m&&(u=m);const L=function(e,t,a){let r="";return"fullWidth"===e&&(r='<div aria-hidden="true" style="padding-top: '+a/t*100+'%;"></div>'),"constrained"===e&&(r='<div style="max-width: '+t+'px; display: block;"><img alt="" role="presentation" aria-hidden="true" src="data:image/svg+xml;charset=utf-8,%3Csvg%20height=\''+a+"'%20width='"+t+"'%20xmlns='http://www.w3.org/2000/svg'%20version='1.1'%3E%3C/svg%3E\" style=\"max-width: 100%; display: block; position: static;\"></div>"),r}(w,y,b);return(0,r.useEffect)((()=>{M||(M=a.e(731).then(a.bind(a,6731)).then((e=>{let{renderImageToString:t,swapPlaceholderImage:a}=e;return _=t,{renderImageToString:t,swapPlaceholderImage:a}})));const e=k.current.querySelector("[data-gatsby-image-ssr]");if(e&&s())return e.complete?(null==p||p({wasCached:!0}),null==g||g({wasCached:!0}),setTimeout((()=>{e.removeAttribute("data-gatsby-image-ssr")}),0)):(null==p||p({wasCached:!0}),e.addEventListener("load",(function t(){e.removeEventListener("load",t),null==g||g({wasCached:!0}),setTimeout((()=>{e.removeAttribute("data-gatsby-image-ssr")}),0)}))),void z.add(S);if(_&&z.has(S))return;let t,r;return M.then((e=>{let{renderImageToString:a,swapPlaceholderImage:o}=e;k.current&&(k.current.innerHTML=a(l({isLoading:!0,isLoaded:z.has(S),image:n},h)),z.has(S)||(t=requestAnimationFrame((()=>{k.current&&(r=o(k.current,S,z,i,p,g,f))}))))})),()=>{t&&cancelAnimationFrame(t),r&&r()}}),[n]),(0,r.useLayoutEffect)((()=>{z.has(S)&&_&&(k.current.innerHTML=_(l({isLoading:z.has(S),isLoaded:z.has(S),image:n},h)),null==p||p({wasCached:!0}),null==g||g({wasCached:!0}))}),[n]),(0,r.createElement)(t,l({},x,{style:l({},v,i,{backgroundColor:d}),className:C+(u?" "+u:""),ref:k,dangerouslySetInnerHTML:{__html:L},suppressHydrationWarning:!0}))},O=(0,r.memo)((function(e){return e.image?(0,r.createElement)(j,e):null}));O.propTypes=N,O.displayName="GatsbyImage";const R=["src","__imageData","__error","width","height","aspectRatio","tracedSVGOptions","placeholder","formats","quality","transformOptions","jpgOptions","pngOptions","webpOptions","avifOptions","blurredOptions","breakpoints","outputPixelDensities"];function q(e){return function(t){let{src:a,__imageData:n,__error:i}=t,s=o(t,R);return i&&console.warn(i),n?r.createElement(e,l({image:n},s)):(console.warn("Image not loaded",a),null)}}const U=q((function(e){let{as:t="div",className:a,class:n,style:i,image:s,loading:m="lazy",imgClassName:p,imgStyle:f,backgroundColor:h,objectFit:y,objectPosition:b}=e,w=o(e,x);if(!s)return console.warn("[gatsby-plugin-image] Missing image prop"),null;n&&(a=n),f=l({objectFit:y,objectPosition:b,backgroundColor:h},f);const{width:E,height:L,layout:N,images:T,placeholder:I,backgroundColor:z}=s,M=c(E,L,N),{style:_,className:j}=M,O=o(M,k),R={fallback:void 0,sources:[]};return T.fallback&&(R.fallback=l({},T.fallback,{srcSet:T.fallback.srcSet?S(T.fallback.srcSet):void 0})),T.sources&&(R.sources=T.sources.map((e=>l({},e,{srcSet:S(e.srcSet)})))),r.createElement(t,l({},O,{style:l({},_,i,{backgroundColor:h}),className:j+(a?" "+a:"")}),r.createElement(g,{layout:N,width:E,height:L},r.createElement(v,l({},u(I,!1,N,E,L,z,y,b))),r.createElement(C,l({"data-gatsby-image-ssr":"",className:p},w,d("eager"===m,!1,R,m,f)))))})),A=function(e,t){for(var a=arguments.length,r=new Array(a>2?a-2:0),n=2;n<a;n++)r[n-2]=arguments[n];return"fullWidth"!==e.layout||"width"!==t&&"height"!==t||!e[t]?i().number.apply(i(),[e,t].concat(r)):new Error('"'+t+'" '+e[t]+" may not be passed when layout is fullWidth.")},P=new Set(["fixed","fullWidth","constrained"]),W={src:i().string.isRequired,alt:L,width:A,height:A,sizes:i().string,layout:e=>{if(void 0!==e.layout&&!P.has(e.layout))return new Error("Invalid value "+e.layout+'" provided for prop "layout". Defaulting to "constrained". Valid values are "fixed", "fullWidth" or "constrained".')}};U.displayName="StaticImage",U.propTypes=W;const F=q(O);F.displayName="StaticImage",F.propTypes=W},2369:function(e){const t=/[\p{Lu}]/u,a=/[\p{Ll}]/u,r=/^[\p{Lu}](?![\p{Lu}])/gu,n=/([\p{Alpha}\p{N}_]|$)/u,i=/[_.\- ]+/,l=new RegExp("^"+i.source),o=new RegExp(i.source+n.source,"gu"),s=new RegExp("\\d+"+n.source,"gu"),c=(e,n)=>{if("string"!=typeof e&&!Array.isArray(e))throw new TypeError("Expected the input to be `string | string[]`");if(n={pascalCase:!1,preserveConsecutiveUppercase:!1,...n},0===(e=Array.isArray(e)?e.map((e=>e.trim())).filter((e=>e.length)).join("-"):e.trim()).length)return"";const i=!1===n.locale?e=>e.toLowerCase():e=>e.toLocaleLowerCase(n.locale),c=!1===n.locale?e=>e.toUpperCase():e=>e.toLocaleUpperCase(n.locale);if(1===e.length)return n.pascalCase?c(e):i(e);return e!==i(e)&&(e=((e,r,n)=>{let i=!1,l=!1,o=!1;for(let s=0;s<e.length;s++){const c=e[s];i&&t.test(c)?(e=e.slice(0,s)+"-"+e.slice(s),i=!1,o=l,l=!0,s++):l&&o&&a.test(c)?(e=e.slice(0,s-1)+"-"+e.slice(s-1),o=l,l=!1,i=!0):(i=r(c)===c&&n(c)!==c,o=l,l=n(c)===c&&r(c)!==c)}return e})(e,i,c)),e=e.replace(l,""),e=n.preserveConsecutiveUppercase?((e,t)=>(r.lastIndex=0,e.replace(r,(e=>t(e)))))(e,i):i(e),n.pascalCase&&(e=c(e.charAt(0))+e.slice(1)),((e,t)=>(o.lastIndex=0,s.lastIndex=0,e.replace(o,((e,a)=>t(a))).replace(s,(e=>t(e)))))(e,c)};e.exports=c,e.exports.default=c},3413:function(e,t,a){a.d(t,{Z:function(){return l}});var r=a(7294),n=a(7896),i=a(1883);function l(e){let{siteTitle:t,pageTitle:a,metaDescription:l}=e;const o=(0,i.K2)("1123391092"),s=a?a+" | "+t:t,c=o.site.siteMetadata.siteUrl+"/"+o.site.siteMetadata.ogpImage,{pathname:d}=(0,n.useLocation)(),u=d?""+o.site.siteMetadata.siteUrl+d:""+o.site.siteMetadata.siteUrl;return r.createElement(r.Fragment,null,r.createElement("meta",{charset:"utf-8"}),r.createElement("title",null,s),r.createElement("meta",{name:"description",content:l}),r.createElement("meta",{property:"og:title",content:s}),r.createElement("meta",{property:"og:url",content:u}),r.createElement("meta",{property:"og:site_name",content:t}),r.createElement("meta",{property:"og:image",content:c}),r.createElement("meta",{property:"og:locale",content:"ja_JP"}),r.createElement("meta",{property:"og:description",content:l}),r.createElement("meta",{property:"og:type",content:"article"}),r.createElement("meta",{name:"twitter:card",content:"summary"}),r.createElement("meta",{name:"twitter:title",content:s}),r.createElement("meta",{name:"twitter:description",content:l}),r.createElement("meta",{name:"twitter:image",content:c}),r.createElement("link",{rel:"canonical",href:"URL"}),r.createElement("link",{rel:"icon",href:"/favicon.ico"}),r.createElement("link",{rel:"apple-touch-icon",sizes:"1024x1024",href:"/icon.png"}),r.createElement("meta",{name:"viewport",content:"width=device-width, initial-scale=1, minimum-scale=1, user-scalable=yes"}))}},170:function(e,t,a){a.d(t,{Z:function(){return y}});var r=a(7294),n=a(1883),i="toggleThemeButton-module--toggleButton--aa22b";function l(e){let{themeSwitch:t=(e=>e)}=e;return r.createElement("div",null,r.createElement("svg",{className:i,onClick:t,xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512"},r.createElement("path",{fill:"currentColor",d:"M512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256zM256 64V448C362 448 448 362 448 256C448 149.1 362 64 256 64z"})))}function o(){const{0:e,1:t}=(0,r.useState)("default");return(0,r.useEffect)((()=>{const e=window.localStorage.getItem("lightMode");t(e),"inverted"===e?document.body.classList.add("is_inverted"):document.body.classList.remove("is_inverted")}),[e]),r.createElement("nav",{role:"navigation"},r.createElement("ul",null,r.createElement("li",null,r.createElement(n.rU,{to:"/"},"Home")),r.createElement("li",null,r.createElement(n.rU,{to:"/categories/"},"Categories")),r.createElement("li",null,r.createElement(n.rU,{to:"/tags/"},"Tags")),r.createElement("li",null,r.createElement(n.rU,{to:"/about/"},"About Me")),r.createElement("li",null,r.createElement(n.rU,{to:"/rss.xml"},"Feed")),r.createElement("li",null,r.createElement(l,{themeSwitch:()=>{"default"===("inverted"===window.localStorage.getItem("lightMode")?"inverted":"default")?(window.localStorage.setItem("lightMode","inverted"),t("inverted")):(window.localStorage.setItem("lightMode","default"),t("default"))}}))))}var s="header-module--siteTitle--ac208";function c(e){const t=e.siteTitle;return r.createElement("header",{role:"banner"},r.createElement("h1",{className:s},r.createElement(n.rU,{to:"/"},t)),r.createElement(o,null))}var d=a(8032),u="profile-module--iconLink--21505",m="profile-module--profile--6df29",p="profile-module--profileDescription--6d9f0",g="profile-module--profileIcon--a7dae",f="profile-module--profileIconWrapper--ec7f8";function h(e){const t=e.author;return r.createElement("div",{className:m},r.createElement(d.S,{src:"../../images/profile-icon.png",alt:"profile image",className:f,imgClassName:g,loading:"eager",__imageData:a(2500)}),r.createElement("h3",null,t),r.createElement("p",null,r.createElement("a",{href:"https://github.com/mjun0812",className:u},r.createElement("svg",{"aria-hidden":"true",focusable:"false","data-prefix":"fab","data-icon":"github",className:"svg-inline--fa fa-github fa-w-16",role:"img",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 496 512"},r.createElement("path",{fill:"currentColor",d:"M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"}))),r.createElement("a",{href:"https://twitter.com/mjun0812",className:u},r.createElement("svg",{"aria-hidden":"true",focusable:"false","data-prefix":"fab","data-icon":"github",className:"svg-inline--fa fa-github fa-w-16",role:"img",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512"},r.createElement("path",{fill:"currentColor",d:"M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"})))),r.createElement("p",null,r.createElement("svg",{"aria-hidden":"true",focusable:"false","data-prefix":"fas","data-icon":"map-marker-alt",className:"svg-inline--fa fa-map-marker-alt fa-w-12",role:"img",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 384 512",width:"32",height:"32"},r.createElement("path",{fill:"currentColor",d:"M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"})),"Tokyo, Japan"),r.createElement("p",{className:p},"Computer VisionとWeb",r.createElement("br",null),"に興味があります"))}function y(e){let{children:t,siteTitle:a,pageTitle:n,author:i,sidebar:l,metaDescription:o}=e;return r.createElement("div",null,r.createElement(c,{siteTitle:a}),r.createElement("div",{className:"container"},r.createElement("div",{className:"sidebar"},r.createElement(h,{author:i}),l),r.createElement("div",{className:"main",style:{marginBottom:"2em"}},t)))}},2500:function(e){e.exports=JSON.parse('{"layout":"constrained","backgroundColor":"#c8d888","images":{"fallback":{"src":"/static/15ba60a9b462b90372f583a49016a90d/de250/profile-icon.png","srcSet":"/static/15ba60a9b462b90372f583a49016a90d/25ed1/profile-icon.png 90w,\\n/static/15ba60a9b462b90372f583a49016a90d/ad96b/profile-icon.png 179w,\\n/static/15ba60a9b462b90372f583a49016a90d/de250/profile-icon.png 358w","sizes":"(min-width: 358px) 358px, 100vw"},"sources":[{"srcSet":"/static/15ba60a9b462b90372f583a49016a90d/5d191/profile-icon.webp 90w,\\n/static/15ba60a9b462b90372f583a49016a90d/84361/profile-icon.webp 179w,\\n/static/15ba60a9b462b90372f583a49016a90d/3acea/profile-icon.webp 358w","type":"image/webp","sizes":"(min-width: 358px) 358px, 100vw"}]},"width":358,"height":358}')}}]);
//# sourceMappingURL=commons-200b4288655d3afd712a.js.map