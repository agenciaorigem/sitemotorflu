(() => {
 const key='motorflu-privacy-v1';
 let consent=null;
 try{consent=JSON.parse(localStorage.getItem(key));}catch{}
 const panel=document.createElement('section');
 panel.className='cookie-panel';panel.setAttribute('aria-label','Privacidade e cookies');
 panel.innerHTML=`<h2>Privacidade e cookies</h2><p>Usamos armazenamento necessário para guardar suas preferências. Vídeos do YouTube e mapas do Google só carregam com sua autorização e podem tratar dados como endereço IP e informações do dispositivo.</p><details><summary>Configurar preferências e uso de dados</summary><p>Necessários: salvam esta escolha no navegador. Conteúdo externo: permite carregar vídeos e mapas de terceiros. Você pode mudar sua decisão a qualquer momento no rodapé. Ao entrar em contato por e-mail ou WhatsApp, seus dados são encaminhados ao canal escolhido para atendimento.</p><p>Dúvidas sobre seus dados: <a href="mailto:sac@motorflu.com.br">sac@motorflu.com.br</a>.</p><label><input type="checkbox" id="external-media-choice"> Permitir vídeos e mapas externos</label><button type="button" data-save>Salvar preferências</button></details><div class="cookie-actions"><button type="button" class="button" data-accept>Aceitar cookies</button><button type="button" class="button button-outline" data-reject>Rejeitar opcionais</button></div>`;
 document.body.append(panel);
 const checkbox=panel.querySelector('input');
 function render(){
  const allowed=consent?.external===true;checkbox.checked=allowed;
  document.querySelectorAll('iframe[data-consent-src]').forEach(frame=>{
   if(allowed){if(!frame.hasAttribute('src'))frame.src=frame.dataset.consentSrc;}
   else frame.removeAttribute('src');
   frame.hidden=!allowed;
  });
  document.querySelectorAll('.media-consent').forEach(el=>el.hidden=allowed);
  panel.hidden=consent!==null;
 }
 function save(allowed){consent={external:allowed,updated:new Date().toISOString()};try{localStorage.setItem(key,JSON.stringify(consent));}catch{}render();}
 panel.querySelector('[data-accept]').onclick=()=>save(true);
 panel.querySelector('[data-reject]').onclick=()=>save(false);
 panel.querySelector('[data-save]').onclick=()=>save(checkbox.checked);
 document.querySelectorAll('[data-allow-media]').forEach(b=>b.onclick=()=>save(true));
 document.querySelectorAll('[data-cookie-settings]').forEach(b=>b.onclick=()=>{panel.hidden=false;panel.querySelector('details').open=true;checkbox.focus();});
 render();
})();
