setupLangFromDevpanel = async ()=>{
  let file = _.$.id('FILELANG').files[0],
      text = await file.text();

  text = applyLanguage(text);

  console.log(file.name);
  console.log(text);
  _.langs.main = JSON.parse(text);
  getLink();
};
debugWindow = ()=>{
  let devPanel = _.$.q('[devpanel]');
  if (devPanel !== null) {
    _.wins[devPanel.id].close();
    _.link.remove('dev');
    return false;
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
    _.link.add('dev');
  let win = _.win.open('DEVPANEL',
    `<h2>newHelper.js 2.1.2 BUILD ${helperBuildNum} ver ${helperStrVer}</h2>
    <p>COUNTRY: ${thisUser.cityData}</p>
    <p>UPLOAD LANG PACKET</p>
    <div style=background:black;text-align:left>
      <input type=file id=FILELANG><br>
      ${devBtn('GOLANG', `setupLangFromDevpanel()`)}
    </div>
    <p>MAIN VARIABLES</p>
    <div style=background:black;text-align:left>
      ignoreCap ${checkbox(ignoreCap, 'ignoreCap=this.checked')}<br>
      renderBeta ${checkbox(renderBeta, 'renderBeta=this.checked')}<br>
      API-ver <select style=color:black onchange=formSdata(baseApp+'server/'+this.value)>
        ${option(133)}
      </select><br>
      ${devBtn('CLOSE ALL ERRORS', `_.$.qa('[iserror]').forEach(el=>_.wins[el.id].close());`)+'<br><br>'}
    </div>
    <p>OPEN CONTENT</p>
    <div style=background:black;text-align:left>
      getCamp ${radio('openFunc','getCamp')}<br>
      getShow ${radio('openFunc','getShow')}<br>
      pageGuides ${radio('openFunc','pageGuides')}<br>
      otherProfile ${radio('openFunc','otherProfile')}<br>

      ID ${input('openFuncID')}<br>
      ${devBtn('GO', "eval(`${_.$.q('[name=openFunc]:checked').value}(${_.$.id('openFuncID').value})`)")}
    </div>`,
  'devpanel style=width:500px;height:600px');
  return win;
};