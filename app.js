const ids = ["thousands","hundreds","tens","units"];
const selects = ids.map(id => document.getElementById(id));
const amountEl = document.getElementById("amount");
const wordsEl = document.getElementById("amountWords");
const messageEl = document.getElementById("message");
const centButtons = [...document.querySelectorAll(".cent")];
let cents = 0;
let history = [];

selects.forEach(select => {
  for (let n=0;n<=9;n++) {
    const option=document.createElement("option");
    option.value=String(n); option.textContent=String(n);
    select.appendChild(option);
  }
  select.addEventListener("change", () => { saveHistory(); render(); });
});

function getValueInCents(){
  const digits=selects.map(s=>Number(s.value));
  const reais=digits.reduce((sum,n)=>sum*10+n,0);
  return reais*100+cents;
}
function formatBRL(value){
  return (value/100).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
}
function render(){
  const value=getValueInCents();
  amountEl.textContent=formatBRL(value);
  wordsEl.textContent=value===0?"Escolha os algarismos abaixo":"Valor pronto para copiar";
}
function saveHistory(){
  history.push({digits:selects.map(s=>s.value),cents});
  if(history.length>30) history.shift();
}
function setCents(value){
  saveHistory(); cents=value;
  centButtons.forEach(btn=>btn.classList.toggle("active",Number(btn.dataset.cents)===cents));
  render();
}
centButtons.forEach(btn=>btn.addEventListener("click",()=>setCents(Number(btn.dataset.cents))));
document.getElementById("undo").addEventListener("click",()=>{
  const previous=history.pop();
  if(!previous){showMessage("Não há alteração para desfazer.");return;}
  selects.forEach((s,i)=>s.value=previous.digits[i]);
  cents=previous.cents;
  centButtons.forEach(btn=>btn.classList.toggle("active",Number(btn.dataset.cents)===cents));
  render(); showMessage("Última alteração desfeita.");
});
document.getElementById("clear").addEventListener("click",()=>{
  saveHistory(); selects.forEach(s=>s.value="0"); cents=0;
  centButtons.forEach(btn=>btn.classList.toggle("active",Number(btn.dataset.cents)===0));
  render(); showMessage("Valor zerado.");
});
document.getElementById("copy").addEventListener("click",async()=>{
  const value=formatBRL(getValueInCents());
  try{
    await navigator.clipboard.writeText(value);
    showMessage("Valor "+value+" copiado!");
  }catch(e){
    const area=document.createElement("textarea"); area.value=value;
    document.body.appendChild(area); area.select();
    const ok=document.execCommand("copy"); area.remove();
    showMessage(ok?"Valor "+value+" copiado!":"Não foi possível copiar. Selecione o valor manualmente.");
  }
});
function showMessage(text){messageEl.textContent=text;}
function updateConnection(){
  const el=document.getElementById("connection");
  el.textContent=navigator.onLine?"Online":"Offline";
  el.classList.toggle("offline",!navigator.onLine);
}
window.addEventListener("online",updateConnection);
window.addEventListener("offline",updateConnection);
updateConnection(); render();

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>{
    navigator.serviceWorker.register("./service-worker.js").catch(()=>showMessage("Modo offline ainda não foi ativado neste navegador."));
  });
}