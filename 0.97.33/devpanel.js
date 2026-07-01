debugWindow = ()=>{
  let devPanel = $q('[devpanel]');
  if (devPanel !== null) {
    subWindows.close(devPanel.id);
    $.link.remove('dev');
    return;
  }
  function checkbox(variable, code) {
    return `<input type=checkbox ${variable ? 'checked' : ''} onchange="${code}">`;
  }
  function option(value) {
    return `<option style=color:black value=${value}>${value}</option>`;
  }
  function radio(name, value) {
    return `<input type=radio name=${name} value=${value}>`;
  }
  function input(id) {
    return `<input style=color:black id=${id}>`;
  }
  function devBtn(text, func) {
    return `<button style=color:black onclick="${func}">${text}</button>`;
  }
  if (!location.search.includes('deh'))
    $.link.add('dev');
  subWindows.open('DEVPANEL',
    `<h2>newHelper.js ${$.ver} BUILD ${helperBuildNum} ver ${helperStrVer}</h2>`+
    `<p>COUNTRY: ${thisUser.cityData}</p>`+
    `<p>UPLOAD LANG PACKET</p>`+
    `<div style=background:black;text-align:left>`+
      `<input type=file id=FILELANG><br>`+
      devBtn('GOLANG', `setupLangFromDevpanel()`)+
    `</div>`+
    `<p>MAIN VARIABLES</p>`+
    `<div style=background:black;text-align:left>`+
      `ignoreCap ${checkbox(ignoreCap, 'ignoreCap=this.checked')}<br>`+
      `renderBeta ${checkbox(renderBeta, 'renderBeta=this.checked')}<br>`+
      // `API-ver <input value=${helperBuildNum} style=color:black onchange=formSdata(this.value)>`+
      `API-ver <select style=color:black onchange=formSdata(baseApp+'server/'+this.value)>`+
        option(128)+
        option(131)+
        option(132)+
      `</select><br>`+
      devBtn('CLOSE ALL ERRORS', `$qa('[iserror]').forEach(el=>{subWindows.close(el.id);});`)+'<br><br>'+
    `</div>`+
    `<p>OPEN CONTENT</p>`+
    `<div style=background:black;text-align:left>`+
      `getCamp ${radio('openFunc','getCamp')}<br>`+
      `getShow ${radio('openFunc','getShow')}<br>`+
      `pageGuides ${radio('openFunc','pageGuides')}<br>`+
      `otherProfile ${radio('openFunc','otherProfile')}<br>`+

      `ID ${input('openFuncID')}<br>`+
      devBtn('GO', "eval(`${$q('[name=openFunc]:checked').value}(${$id('openFuncID').value})`)")+
    `</div>`,
  'devpanel style=width:500px;height:600px');
};
setupLangFromDevpanel = async ()=>{
  let file = $id('FILELANG').files[0],
      text = await file.text();

  text = applyLanguage(text);

  console.log(file.name);
  console.log(text);
  $.langs.main = JSON.parse(text);
  getLink();
};