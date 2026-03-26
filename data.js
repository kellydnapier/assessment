// ═══════════════ SHARED ═══════════════
function switchTab(name){
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('tab-'+name).classList.add('active');
  document.querySelector('[data-tab="'+name+'"]').classList.add('active');
}
function uc(cb,lbl){document.getElementById(lbl).classList.toggle('checked',cb.checked);}
function setToggle(fld,val,btn){
  document.getElementById(fld).value=val;
  btn.closest('.tw').querySelectorAll('.tb').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
}
function showEl(id,vis){const el=document.getElementById(id);if(el)el.style.display=vis?'block':'none';}
function gv(id){const el=document.getElementById(id);return el?el.value.trim():'';}
function isChk(id){const el=document.getElementById(id);return el?el.checked:false;}
function getCheckedVals(ids){return ids.map(id=>document.getElementById(id)).filter(el=>el&&el.checked).map(el=>el.value);}
function list(arr){
  if(!arr.length)return'';
  if(arr.length===1)return arr[0];
  if(arr.length===2)return arr[0]+' and '+arr[1];
  return arr.slice(0,-1).join(', ')+', and '+arr[arr.length-1];
}
function getP(gender){
  return gender==='female'
    ?{sub:'she',obj:'her',pos:'her',ref:'herself',Sub:'She',Obj:'Her',Pos:'Her'}
    :{sub:'he',obj:'him',pos:'his',ref:'himself',Sub:'He',Obj:'Him',Pos:'His'};
}
function setProvType(prefix,type,btn){
  document.getElementById(prefix+'-provtype').value=type;
  btn.closest('.tw').querySelectorAll('.tb').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  showEl(prefix+'-spec-fields',type==='specialist');
  showEl(prefix+'-pcp-fields',type==='pcp');
}
function buildHosp(system,val,n,mo,yr,rsn){
  if(val==='no')return`Member has had no ${system}-related hospitalizations in the past 12 months. `;
  const num=n||'[number]';
  const dt=(mo&&yr)?` in ${mo} ${yr}`:'';
  const r=rsn?` for ${rsn}`:'';
  if(num==='1'||num===1)return`Member had 1 ${system}-related hospitalization in the past 12 months${dt}${r}. `;
  return`Member has had ${num} ${system}-related hospitalizations in the past 12 months, most recently${dt}${r}. `;
}
function copyNote(txtId,btnId){
  navigator.clipboard.writeText(document.getElementById(txtId).textContent).then(()=>{
    const btn=document.getElementById(btnId);
    btn.textContent='Copied!';btn.classList.add('copied');
    setTimeout(()=>{btn.textContent='Copy';btn.classList.remove('copied');},2500);
  });
}

const C_BLOOD_THINNERS=new Set(['warfarin','apixaban (Eliquis)','rivaroxaban (Xarelto)','dabigatran (Pradaxa)','clopidogrel (Plavix)']);

// ═══════════════ CARDIAC ═══════════════
function cDx(){
  const map={
    'c-htn':'c-bp-sec','c-afib':'c-afib-sec','c-pad':'c-pad-sec',
    'c-cm':'c-cm-sec','c-vhd':'c-vhd-sec','c-ppm':'c-ppm-sec',
    'c-mi':'c-mi-sec','c-stroke':'c-stroke-sec','c-dvt':'c-dvt-sec'
  };
  Object.entries(map).forEach(([cb,sec])=>showEl(sec,isChk(cb)));
}
function handleWarfarin(){showEl('c-war-sub',isChk('cm-war'));}

function generateCardiac(){
  const p=getP(gv('c-gender'));
  const dxIds=['c-htn','c-hld','c-chf','c-cad','c-afib','c-pad','c-cm','c-vhd','c-ppm','c-mi','c-stroke','c-dvt'];
  const dx=getCheckedVals(dxIds);
  const htn=isChk('c-htn'),chf=isChk('c-chf'),afib=isChk('c-afib'),pad=isChk('c-pad');
  const cm=isChk('c-cm'),vhd=isChk('c-vhd'),ppm=isChk('c-ppm'),mi=isChk('c-mi');
  const stroke=isChk('c-stroke'),dvt=isChk('c-dvt');

  const medIds=['cm-nif','cm-fur','cm-iso','cm-hyd','cm-min','cm-car','cm-met','cm-lis','cm-aml','cm-ato','cm-ros','cm-asp','cm-spi','cm-dig','cm-ami','cm-war','cm-eli','cm-xar','cm-pra','cm-clo'];
  let meds=getCheckedVals(medIds);
  const otherM=gv('cm-other');
  if(otherM)meds=meds.concat(otherM.split(',').map(m=>m.trim()).filter(Boolean));
  const btMeds=meds.filter(m=>C_BLOOD_THINNERS.has(m));
  const regMeds=meds.filter(m=>!C_BLOOD_THINNERS.has(m));

  const provType=gv('c-provtype'),provName=gv('c-provname'),practice=gv('c-practice'),referral=gv('c-referral');
  const hospVal=gv('c-hosp'),hospN=gv('c-hosp-n'),hospMo=gv('c-hosp-mo'),hospYr=gv('c-hosp-yr'),hospRsn=gv('c-hosp-reason');
  const bpFreq=gv('c-bp-freq'),bpLog=gv('c-bplog'),bpLo=gv('c-bp-lo'),bpHi=gv('c-bp-hi');
  const sxVal=gv('c-sx'),sxDet=gv('c-sx-det');
  const advVal=gv('c-adv'),advDet=gv('c-adv-det');
  const bmi=parseFloat(gv('c-bmi'))||0,exer=gv('c-ex');

  let n='';

  // Opening
  if(dx.length){
    if(provType==='specialist'&&provName&&practice){
      n+=`Member has ${list(dx)} and sees ${provName} at ${practice} for management of ${p.pos} cardiac conditions. `;
    } else if(provType==='specialist'){
      n+=`Member has ${list(dx)} and sees a cardiologist for management of ${p.pos} cardiac conditions. `;
    } else {
      n+=`Member has ${list(dx)} and ${p.pos} cardiac conditions are managed by ${p.pos} primary care provider. `;
    }
  }

  // Hospitalization
  n+=buildHosp('cardiac',hospVal,hospN,hospMo,hospYr,hospRsn);

  // BP monitoring
  if(htn){
    if(bpFreq==='not at all'){
      n+=`Member states ${p.sub} does not monitor ${p.pos} blood pressure and does not keep a log. `;
    } else {
      n+=`Member states ${p.sub} takes ${p.pos} blood pressure ${bpFreq}`;
      n+=bpLog==='no'?` but does not keep a log. `:` and keeps a log. `;
    }
    if(bpLo&&bpHi)n+=`${p.Sub} reports a blood pressure range of ${bpLo}-${bpHi}. `;
  }

  // Symptoms
  n+=sxVal==='yes'
    ?`Member denies any chest pain, nausea, vomiting, loss of consciousness, headache, or altered mental status. `
    :`Member reports ${sxDet||'[symptom details]'}. `;

  // BP education
  if(htn||chf)n+=`CM provided education to member on the importance of daily blood pressure monitoring, keeping a log, and checking BP before taking blood pressure medications. `;

  // Regular med education (one sentence, ≤8 adverse effects)
  if(regMeds.length){
    n+=`CM provided education on ${list(regMeds)}, including proper medication administration and adverse effects to monitor for including dizziness, nausea, vomiting, fatigue, headache, bradycardia, peripheral edema, and electrolyte imbalance. `;
    if(regMeds.length>2&&htn){
      n+=`CM emphasized the importance of daily blood pressure monitoring due to member's use of multiple antihypertensive medications and the increased risk of hypotensive episodes. `;
    }
  }

  // Blood thinner education
  if(btMeds.length){
    n+=`CM provided anticoagulation education on ${list(btMeds)}, including bleeding precautions, fall risk reduction, signs of increased bruising or prolonged bleeding, and when to seek emergency care. `;
    if(btMeds.includes('warfarin')){
      const inrV=gv('c-inr'),inrT=gv('c-inr-range');
      if(inrV)n+=`CM reviewed the importance of consistent INR monitoring. Member's last INR was ${inrV}, which is ${inrT==='yes'?'within':'outside of'} therapeutic range. `;
    }
  }

  // CHF education (given — not future intent)
  if(chf){
    n+=`CM provided education to member on monitoring for CHF exacerbation, encouraging member to weigh ${p.ref} daily and report weight gain of 2-3 pounds in a day or 5 pounds in a week to ${p.pos} provider. CM also educated member on s/sx of CHF exacerbation such as worsening shortness of breath with exertion and increased swelling in the ankles, legs, and/or abdomen. `;
  }

  // Adverse effects
  n+=advVal==='yes'
    ?`Member denies any adverse effects from medication. `
    :`Member reports ${advDet||'[adverse effect details]'}. `;
  n+=`Member verbalized understanding of all education provided. `;

  // BMI (only if > 25)
  if(bmi>25){
    n+=`Member has a BMI of ${bmi} and ${exer==='yes'?'exercises regularly':'does not exercise on a regular basis'}. `;
    n+=`CM educated member on the benefits that weight loss and regular exercise can have on ${p.pos} cardiac health as well as ${p.pos} overall health. `;
    n+=`CM encouraged member to adhere to a heart-healthy diet by limiting sodium and fat intake while opting for more vegetables and lean proteins. `;
  }

  // AFib
  if(afib){
    const ctrl=gv('c-afib-ctrl'),ac=gv('c-afib-ac'),acMed=gv('c-anticoag');
    n+=`Member's AFib is ${ctrl}. `;
    if(ac==='yes'){
      n+=`Member is currently on anticoagulation therapy with ${acMed}. CM reinforced anticoagulation education including bleeding precautions, fall risk reduction, and when to seek emergency care. `;
    }
    n+=`CM provided education on stroke risk associated with AFib and reviewed s/sx of stroke including facial drooping, arm weakness, speech difficulty, and the importance of calling 911 immediately. `;
  }

  // PAD
  if(pad){
    if(gv('c-claud')==='yes')n+=`Member reports claudication symptoms with exertion. `;
    n+=`CM provided education on PAD including foot and wound care and s/sx to monitor for such as leg pain with walking, cold extremities, color changes in the lower extremities, and non-healing sores. `;
    if(gv('c-wounds')==='yes')n+=`Member has non-healing wounds noted. CM reinforced the importance of prompt provider notification and proper wound care. `;
    if(gv('c-smoke')==='yes')n+=`CM provided smoking cessation education and encouraged member to discuss cessation resources with ${p.pos} provider. `;
  }

  // Cardiomyopathy
  if(cm){
    const cmT=gv('c-cmtype'),efK=gv('c-ef'),efP=gv('c-ef-pct');
    n+=`Member has ${cmT} cardiomyopathy. `;
    if(efK==='yes'&&efP){
      n+=`Member's ejection fraction is ${efP}%. `;
      if(parseInt(efP)<40)n+=`CM provided education on reduced ejection fraction and the importance of medication adherence, fluid restriction, and activity modification. `;
    }
  }

  // Valvular
  if(vhd){
    const valve=gv('c-valve'),vt=gv('c-vtype'),vrep=gv('c-vrep'),vrepT=gv('c-vreptype');
    n+=`Member has ${valve} valve ${vt}. `;
    if(vrep==='yes'){
      n+=`Member has a history of ${vrepT} valve replacement. `;
      if(vrepT==='mechanical')n+=`CM reinforced anticoagulation education related to ${p.pos} mechanical valve. `;
    }
    n+=`CM provided education on s/sx of valvular disease including shortness of breath, fatigue, dizziness, palpitations, and lower extremity swelling. `;
  }

  // PPM/ICD
  if(ppm){
    const dt=gv('c-devtype'),dc=gv('c-devchk');
    n+=`Member has a ${dt}. CM provided device precautions education including avoidance of strong magnetic fields, MRI restrictions, and avoidance of heavy equipment near the device. `;
    if(dt==='ICD'||dt==='CRT-D')n+=`CM educated member on what to do in the event the device fires and the importance of seeking emergency care if the device fires more than once. `;
    if(dc==='no')n+=`Member's device check is not current. CM encouraged member to schedule a device check with ${p.pos} cardiologist promptly. `;
  }

  // MI
  if(mi){
    const mTm=gv('c-mi-time'),pmi=gv('c-postmi');
    n+=`Member has a history of myocardial infarction${mTm?' ('+mTm+')':''}. CM provided education on s/sx of recurrent MI and the importance of calling 911 immediately for chest pain, shortness of breath, jaw pain, arm pain, or other cardiac symptoms. `;
    if(pmi==='yes'){
      n+=`CM emphasized the importance of adherence to ${p.pos} post-MI medication regimen. `;
    } else {
      n+=`CM noted that member is not current on post-MI medications and encouraged ${p.obj} to discuss this with ${p.pos} provider. `;
    }
  }

  // Stroke/TIA
  if(stroke){
    const st=gv('c-stroktype'),def=gv('c-deficits'),defD=gv('c-def-det');
    n+=`Member has a history of ${st}. `;
    if(def==='yes'&&defD)n+=`Member has residual deficits including ${defD}. `;
    n+=`CM provided FAST education (Face drooping, Arm weakness, Speech difficulty, Time to call 911) and reinforced the importance of seeking immediate emergency care with any onset of stroke symptoms. `;
  }

  // DVT/PE
  if(dvt){
    const dst=gv('c-dvtst'),dac=gv('c-dvtac');
    n+=`Member has a ${dst} DVT/PE. `;
    if(dac==='yes')n+=`CM provided anticoagulation education including bleeding precautions and the importance of medication adherence. `;
    n+=`CM educated member on s/sx of DVT/PE including leg swelling, leg pain or tenderness, sudden shortness of breath, and chest pain, and the importance of seeking emergency care immediately. `;
  }

  // Universal s/sx review
  n+=`CM reviewed s/sx that require provider notification and which s/sx require immediate emergency assistance, such as chest pain, shortness of breath, dizziness, loss of consciousness, and altered mental status. Member verbalized understanding of all teachings. `;

  // Educational materials & community resources
  if(isChk('c-dash'))n+=`CM to provide member with educational materials regarding the DASH diet. `;
  if(isChk('c-hhclass'))n+=`CM referred member to the Heart Healthy Lifestyle Class offered by Dignity Health. `;

  // PCP referral to cardiologist
  if(provType==='pcp'){
    if(referral==='accepted')n+=`CM offered assistance in obtaining a referral to a cardiologist for specialized cardiac management. Member accepted. CM will follow up. `;
    else if(referral==='declined')n+=`CM offered assistance in obtaining a referral to a cardiologist for specialized cardiac management. Member declined at this time. `;
  }

  n+=`Case manager to follow up with member to provide continued education and assistance regarding ongoing plan of care.`;

  document.getElementById('c-out-txt').textContent=n;
  const os=document.getElementById('c-out-sec');
  os.style.display='block';
  os.scrollIntoView({behavior:'smooth',block:'start'});
}


// ═══════════════ PULMONARY ═══════════════
function pDx(){
  showEl('p-osa-sub',isChk('p-osa'));
  showEl('p-cpap-sec',isChk('p-osa'));
}

function generatePulmonary(){
  const p=getP(gv('p-gender'));
  const dxIds=['p-copd','p-asthma','p-osa','p-vf','p-phtn','p-pf','p-bronch','p-ild','p-pna','p-pe','p-tb'];
  const dx=getCheckedVals(dxIds);
  const copd=isChk('p-copd'),asthma=isChk('p-asthma'),osa=isChk('p-osa'),vf=isChk('p-vf');
  const phtn=isChk('p-phtn'),pf=isChk('p-pf');
  const somnolence=gv('p-somnolence');

  const medIds=['pm-alb','pm-spi','pm-adv','pm-sym','pm-atr','pm-mon','pm-rof','pm-pred','pm-az','pm-theo','pm-mod','pm-lev','pm-dup'];
  let meds=getCheckedVals(medIds);
  const otherM=gv('pm-other');
  if(otherM)meds=meds.concat(otherM.split(',').map(m=>m.trim()).filter(Boolean));

  const provType=gv('p-provtype'),provName=gv('p-provname'),practice=gv('p-practice'),referral=gv('p-referral');
  const hospVal=gv('p-hosp'),hospN=gv('p-hosp-n'),hospMo=gv('p-hosp-mo'),hospYr=gv('p-hosp-yr'),hospRsn=gv('p-hosp-reason');
  const o2chk=gv('p-o2chk'),o2freq=gv('p-o2freq'),o2lo=gv('p-o2-lo'),o2hi=gv('p-o2-hi'),o2log=gv('p-o2log');
  const sob=gv('p-sob'),supO2=gv('p-supO2'),inhaler=gv('p-inhaler'),neb=gv('p-neb');
  const cpap=gv('p-cpap');
  const smoke=gv('p-smoke'),smokeAmt=gv('p-smoke-amt'),cessation=gv('p-cessation');
  const sxVal=gv('p-sx'),sxDet=gv('p-sx-det');
  const advVal=gv('p-adv'),advDet=gv('p-adv-det');
  const bmi=parseFloat(gv('p-bmi'))||0;

  let n='';

  // Opening
  if(dx.length){
    const dxLabel=osa&&somnolence==='yes'
      ?list(dx.filter(d=>d!=='Obstructive Sleep Apnea (OSA)').concat(['Obstructive Sleep Apnea (OSA) as well as daytime somnolence r/t OSA']))
      :list(dx);
    if(provType==='specialist'&&provName&&practice){
      n+=`Member has ${dxLabel} and sees ${provName} at ${practice} for management of ${p.pos} pulmonary conditions. `;
    } else if(provType==='specialist'){
      n+=`Member has ${dxLabel} and sees a pulmonologist for management of ${p.pos} pulmonary conditions. `;
    } else {
      n+=`Member has ${dxLabel}. Member's pulmonary conditions are managed by ${p.pos} primary care provider and ${p.sub} does not see a pulmonologist. `;
    }
  }

  // Hospitalization
  n+=buildHosp('pulmonary',hospVal,hospN,hospMo,hospYr,hospRsn);

  // O2 monitoring
  if(o2chk==='yes'){
    n+=`Member does check ${p.pos} O2 saturation levels ${o2freq}`;
    if(o2lo&&o2hi)n+=` and reports a range of ${o2lo}-${o2hi}%`;
    n+=`. `;
    if(o2log==='no')n+=`CM encouraged member to continue with monitoring and recommended starting a log to monitor ${p.pos} O2 trends. `;
  } else {
    n+=`Member does not check ${p.pos} O2 saturation levels at home. CM provided education on the importance of monitoring O2 levels on a regular basis and encouraged member to begin monitoring and keeping a log. `;
  }

  // SOB
  if(sob==='exertion')n+=`Member reports shortness of breath upon exertion only. `;
  else if(sob==='rest')n+=`Member reports shortness of breath at rest. `;

  // Supplemental O2
  n+=supO2==='yes'
    ?`Member requires supplemental oxygen. `
    :`Member states ${p.sub} does not require supplemental oxygen. `;

  // Inhaler / nebulizer
  n+=inhaler==='yes'
    ?`Member states ${p.sub} is compliant with inhaler usage. `
    :`Member states ${p.sub} is non-compliant with inhaler usage. `;
  if(neb==='yes')n+=`Member utilizes a nebulizer for medication administration. `;

  // Symptoms
  n+=sxVal==='yes'
    ?`Member denies nausea, vomiting, dizziness, altered mental state, loss of consciousness, or chest pain. `
    :`Member reports ${sxDet||'[symptom details]'}. `;

  // COPD/Asthma education
  if(copd&&asthma){
    n+=`Case manager educated member about COPD and asthma triggers, how to avoid them, and the proper use of member's inhaler. `;
  } else if(copd){
    n+=`Case manager educated member about COPD triggers, how to avoid them, and reinforced proper inhaler usage. `;
  } else if(asthma){
    n+=`Case manager educated member about asthma triggers, how to avoid them, and reinforced proper inhaler usage. `;
  }
  if(neb==='yes')n+=`CM reinforced proper nebulizer technique. `;

  // Valley Fever
  if(vf)n+=`CM reinforced education on Valley Fever prevention including staying indoors during windy weather, wearing N95 masks while working outdoors, and avoiding dusty areas. `;

  // OSA/CPAP
  if(osa){
    if(cpap==='compliant'){
      n+=`Member states ${p.sub} is compliant with CPAP usage. CM reinforced proper CPAP usage to reduce nighttime awakenings and encouraged member to follow a consistent sleep schedule to promote restful, uninterrupted sleep. `;
    } else if(cpap==='non-compliant'){
      n+=`Member states ${p.sub} is non-compliant with CPAP usage. CM reinforced proper CPAP usage to reduce nighttime awakenings and encouraged member to follow a consistent sleep schedule to promote restful, uninterrupted sleep${somnolence==='yes'?' and decrease episodes of daytime somnolence':''}. `;
    } else {
      n+=`Member does not currently have a CPAP. CM discussed the benefits of CPAP therapy for OSA management and encouraged member to follow up with ${p.pos} provider regarding obtaining one. `;
    }
    if(bmi>25)n+=`CM discussed the negative effects obesity has in contributing to OSA and encouraged member to take steps toward weight reduction and management. `;
  }

  // Pulmonary Hypertension
  if(phtn)n+=`CM provided education on pulmonary hypertension including s/sx of worsening disease such as progressive shortness of breath, dizziness, syncope, and lower extremity swelling, and reinforced the importance of medication adherence and regular follow up. `;

  // Pulmonary Fibrosis
  if(pf)n+=`CM provided education on the chronic and progressive nature of pulmonary fibrosis, the importance of routine pulmonary follow up, supplemental oxygen use as needed, and pulmonary rehabilitation. `;

  // Smoking
  if(smoke==='yes'){
    n+=smokeAmt?`Member is a current smoker of ${smokeAmt}. `:`Member is a current smoker. `;
    n+=`Education was given on the negative effects smoking has on the respiratory system and member was encouraged to quit. `;
    if(cessation==='accepted'){
      n+=`CM offered member information about the Smoking Cessation benefit available through ${p.pos} health plan. Member accepted and will be connected with cessation resources. `;
    } else if(cessation==='declined'){
      n+=`CM offered member information about the Smoking Cessation benefit available through ${p.pos} health plan. Member declined at this time. `;
    }
  }

  // BMI (non-OSA context, only if > 25)
  if(bmi>25&&!osa){
    n+=`CM educated member on the benefits that weight reduction and regular exercise can have on ${p.pos} pulmonary health as well as ${p.pos} overall health. `;
  }

  // Medication education (one sentence)
  if(meds.length){
    n+=`CM provided education on ${list(meds)}, including proper medication administration and adverse effects to monitor for including dry mouth, throat irritation, tremor, tachycardia, nausea, headache, dizziness, and cough. `;
  }

  // Adverse effects
  n+=advVal==='yes'
    ?`Member denies any adverse effects from medication. `
    :`Member reports ${advDet||'[adverse effect details]'}. `;

  // Vaccines
  n+=`Member was encouraged to get annual flu and pneumococcal vaccines to reduce the risk of respiratory infections. `;

  // S/sx review
  n+=`CM provided education on s/sx that require provider notification and s/sx that require immediate emergency medical assistance, including worsening shortness of breath, chest pain, dizziness, severe wheezing, and altered mental status. Member verbalized understanding of all teachings. `;

  // Pulmonologist referral (PCP managed)
  if(provType==='pcp'){
    if(referral==='accepted')n+=`Case manager offered assistance in obtaining a referral to see a pulmonologist for routine lung examinations and follow up. Member accepted. CM will follow up. `;
    else if(referral==='declined')n+=`Case manager offered assistance in obtaining a referral to see a pulmonologist for routine lung examinations and follow up. Member declined at this time. `;
  }

  // Better Breathers Club
  if(isChk('p-bbc'))n+=`Case manager referred member to online resources such as the Better Breathers Club provided by the American Lung Association. `;

  n+=`Case manager will follow up and provide continued education and assistance as needed.`;

  document.getElementById('p-out-txt').textContent=n;
  const os=document.getElementById('p-out-sec');
  os.style.display='block';
  os.scrollIntoView({behavior:'smooth',block:'start'});
}


// ═══════════════ ENDOCRINE ═══════════════
function eDx(){
  const hasDM=isChk('e-dm2')||isChk('e-dm1');
  showEl('e-bs-sec',hasDM);
  showEl('e-epi-sec',hasDM);
  showEl('e-hpth-sub',isChk('e-hpth'));
}

function generateEndocrine(){
  const p=getP(gv('e-gender'));
  const dxIds=['e-dm2','e-dm1','e-hpth','e-hypo','e-hyper','e-adrenal','e-cushings','e-osteo','e-meta'];
  const dx=getCheckedVals(dxIds);
  const hasDM=isChk('e-dm2')||isChk('e-dm1');
  const hpth=isChk('e-hpth'),hypo=isChk('e-hypo'),hyper=isChk('e-hyper');
  const osteo=isChk('e-osteo'),adrenal=isChk('e-adrenal');

  const medIds=['em-met','em-gli','em-glim','em-lan','em-hum','em-nov','em-jan','em-jar','em-oze','em-tru','em-vic','em-far','em-lev','em-cin','em-ale'];
  let meds=getCheckedVals(medIds);
  const otherM=gv('em-other');
  if(otherM)meds=meds.concat(otherM.split(',').map(m=>m.trim()).filter(Boolean));

  const INSULINS=new Set(['insulin glargine (Lantus)','insulin lispro (Humalog)','insulin aspart (Novolog)']);
  const insulinMeds=meds.filter(m=>INSULINS.has(m));
  const otherMeds=meds.filter(m=>!INSULINS.has(m));

  const provType=gv('e-provtype'),provName=gv('e-provname'),practice=gv('e-practice'),referral=gv('e-referral');
  const hospVal=gv('e-hosp'),hospN=gv('e-hosp-n'),hospMo=gv('e-hosp-mo'),hospYr=gv('e-hosp-yr'),hospRsn=gv('e-hosp-reason');
  const cgm=gv('e-cgm'),cgmType=gv('e-cgm-type'),cgmRef=gv('e-cgm-refst');
  const bschk=gv('e-bschk'),bslog=gv('e-bslog'),bsLo=gv('e-bs-lo'),bsHi=gv('e-bs-hi');
  const a1c=gv('e-a1c'),a1cMo=gv('e-a1c-mo'),a1cYr=gv('e-a1c-yr');
  const hypoEpi=gv('e-hypoepi'),hyperEpi=gv('e-hyperepi');
  const sxVal=gv('e-sx'),sxDet=gv('e-sx-det');
  const advVal=gv('e-adv'),advDet=gv('e-adv-det');
  const bmi=parseFloat(gv('e-bmi'))||0;
  const hpthType=gv('e-hpth-type');

  let n='';

  // Opening
  if(dx.length){
    if(provType==='specialist'&&provName&&practice){
      n+=`Member has ${list(dx)} and sees ${provName} at ${practice}. `;
    } else if(provType==='specialist'){
      n+=`Member has ${list(dx)} and is followed by an endocrinologist. `;
    } else {
      n+=`Member has ${list(dx)}, ${dx.length===1?'which is':'both of which are'} managed by ${p.pos} primary care provider. `;
    }
  }

  // Hospitalization
  n+=buildHosp('endocrine',hospVal,hospN,hospMo,hospYr,hospRsn);

  // Blood sugar monitoring
  if(hasDM){
    if(cgm==='yes'){
      const cgmLabel=cgmType?cgmType+' CGM':'CGM';
      n+=`Member has a ${cgmLabel}`;
      if(bsLo&&bsHi)n+=` and reports a blood sugar range of ${bsLo}-${bsHi}`;
      n+=`. `;
    } else if(bschk==='yes'){
      n+=`Member does check blood sugars at home`;
      n+=bslog==='no'?` but does not keep a log. `:` and keeps a log. `;
      if(bsLo&&bsHi)n+=`${p.Sub} reports a range of ${bsLo}-${bsHi}. `;
    } else {
      n+=`Member does not check blood sugars at home. `;
    }
    // A1c
    if(a1c){
      const dtStr=a1cMo&&a1cYr?` in ${a1cMo} ${a1cYr}`:a1cYr?` in ${a1cYr}`:'';
      n+=`Member's most recent A1c was ${a1c}${dtStr}. `;
    }
  }

  // Symptoms
  n+=sxVal==='yes'
    ?`Member denies any s/sx such as excessive thirst, hunger, polyuria, or weight gain. `
    :`Member reports ${sxDet||'[symptom details]'}. `;

  // Diabetes education
  if(hasDM)n+=`CM provided education to member on the importance of blood sugar monitoring, keeping a log, and adhering to a diabetic diet, which includes choosing lean proteins, vegetables, and quality carbohydrates while avoiding sugars and simple carbohydrates. Education on hypoglycemia precautions was provided to member. `;

  // Hyperparathyroidism dietary education
  if(hpth)n+=`CM provided dietary education related to ${hpthType} hyperparathyroidism and encouraged a reduction in the consumption of high phosphate foods such as dairy, chocolate, soda, and nuts. `;

  // Hypothyroidism
  if(hypo)n+=`CM provided education on hypothyroidism including the importance of medication adherence, s/sx of undertreated hypothyroidism such as fatigue, weight gain, cold intolerance, and constipation, and the importance of routine lab monitoring. `;

  // Hyperthyroidism
  if(hyper)n+=`CM provided education on hyperthyroidism including s/sx such as palpitations, heat intolerance, unintended weight loss, and tremor, and reinforced the importance of medication adherence and regular thyroid function monitoring. `;

  // Adrenal Insufficiency
  if(adrenal)n+=`CM provided education on adrenal insufficiency including the importance of medication adherence, stress dosing instructions, s/sx of adrenal crisis, and the importance of wearing medical identification. `;

  // Osteoporosis
  if(osteo)n+=`CM provided education on osteoporosis including fall prevention strategies, weight-bearing exercise, adequate calcium and vitamin D intake, and medication adherence. `;

  // Non-insulin med education
  if(otherMeds.length)n+=`CM provided education on ${list(otherMeds)}, including proper medication administration and adverse effects to monitor for including hypoglycemia, nausea, vomiting, diarrhea, abdominal pain, dizziness, headache, and fatigue. `;

  // Insulin education (separate paragraph)
  if(insulinMeds.length)n+=`CM provided education on ${list(insulinMeds)}, including proper injection technique, rotation of injection sites, storage requirements, and the increased risk of hypoglycemic episodes. `;

  // Hypo/Hyperglycemic episodes
  if(hypoEpi==='yes'&&hyperEpi==='yes'){
    n+=`Member reports both hypoglycemic and hyperglycemic episodes. CM reinforced hypoglycemia precautions and management including the rule of 15 and when to seek emergency care, and provided education on hyperglycemia management and the importance of blood sugar monitoring and medication adherence. `;
  } else if(hypoEpi==='yes'){
    n+=`Member reports hypoglycemic episodes. CM reinforced hypoglycemia precautions and management including the rule of 15 and when to seek emergency care. `;
  } else if(hyperEpi==='yes'){
    n+=`Member reports hyperglycemic episodes. CM provided education on s/sx of hyperglycemia and the importance of blood sugar monitoring and medication adherence. `;
  } else if(hasDM){
    n+=`Member denies any hypoglycemic or hyperglycemic episodes. `;
  }

  // Adverse effects
  n+=advVal==='yes'
    ?`Member denies any adverse effects from medication. `
    :`Member reports ${advDet||'[adverse effect details]'}. `;

  // CGM referral
  if(hasDM&&cgm==='no'){
    if(cgmRef==='accepted')n+=`CM educated member on the benefits of a CGM and offered to assist in obtaining a referral for one. Member accepted assistance. `;
    else if(cgmRef==='declined')n+=`CM educated member on the benefits of a CGM and offered to assist in obtaining a referral for one. Member declined at this time. `;
  }

  // BMI (only if > 25)
  if(bmi>25){
    const conds=dx.length?list(dx.slice(0,2)):'chronic conditions';
    n+=`CM encouraged weight reduction and management and educated member on the benefits it could have with managing ${p.pos} ${conds}, as well as ${p.pos} overall health. `;
  }

  // S/sx review
  n+=`CM reviewed the s/sx that require provider notification and which s/sx require emergency medical assistance such as confusion, altered mental status, blurred vision, seizures, nausea and vomiting, and loss of consciousness. Member verbalized understanding of all teachings. `;

  // Endocrinologist referral (PCP managed)
  if(provType==='pcp'){
    if(referral==='accepted')n+=`CM offered to assist member in obtaining a referral to an endocrinologist for specialized care and monitoring. Member accepted. CM will follow up. `;
    else if(referral==='declined')n+=`CM offered to assist member in obtaining a referral to an endocrinologist for specialized care and monitoring. Member declined, stating ${p.sub} is content with ${p.pos} primary care provider managing ${p.pos} conditions. `;
  }

  // Nutritionist
  if(isChk('e-nutri'))n+=`Due to member's multiple chronic conditions with contradictory dietary needs, CM will offer assistance in obtaining a referral for a nutritionist to assist member in creating a customized diet plan. `;

  // Educational materials & community resources
  const eduRes=[],comRes=[];
  if(isChk('e-dfh'))eduRes.push('Diabetes Food Hub');
  if(isChk('e-ss'))comRes.push('Silver Sneakers');
  if(isChk('e-deep'))comRes.push('the Diabetes Empowerment Education Program (DEEP)');
  if(eduRes.length)n+=`CM to provide member with educational resources such as ${list(eduRes)}. `;
  if(comRes.length)n+=`CM referred member to ${list(comRes)}. `;

  n+=`Case manager to follow up and provide member with education and assistance as needed throughout ongoing plan of care.`;

  document.getElementById('e-out-txt').textContent=n;
  const os=document.getElementById('e-out-sec');
  os.style.display='block';
  os.scrollIntoView({behavior:'smooth',block:'start'});
}


// ═══════════════ RENAL ═══════════════
function rDx(){
  const ckd=isChk('r-ckd'),esrd=isChk('r-esrd'),prostate=isChk('r-prostate');
  showEl('r-egfr-sec',ckd||esrd);
  showEl('r-dialysis-sec',esrd);
  showEl('r-incont-sec',prostate);
}

function generateRenal(){
  const p=getP(gv('r-gender'));
  const dxIds=['r-ckd','r-esrd','r-bph','r-stones','r-pkd','r-gn','r-ns','r-ruti','r-prostate','r-ras'];
  const dx=getCheckedVals(dxIds);
  const ckd=isChk('r-ckd'),esrd=isChk('r-esrd'),bph=isChk('r-bph');
  const stones=isChk('r-stones'),pkd=isChk('r-pkd'),gn=isChk('r-gn'),ns=isChk('r-ns');
  const ruti=isChk('r-ruti'),prostate=isChk('r-prostate'),ras=isChk('r-ras');

  const medIds=['rm-tam','rm-fin','rm-oxy','rm-ker','rm-jar','rm-far','rm-sev','rm-cal','rm-epo','rm-sod','rm-sol','rm-allo'];
  let meds=getCheckedVals(medIds);
  const otherM=gv('rm-other');
  if(otherM)meds=meds.concat(otherM.split(',').map(m=>m.trim()).filter(Boolean));

  const provType=gv('r-provtype'),provName=gv('r-provname'),practice=gv('r-practice'),referral=gv('r-referral');
  const hospVal=gv('r-hosp'),hospN=gv('r-hosp-n'),hospMo=gv('r-hosp-mo'),hospYr=gv('r-hosp-yr'),hospRsn=gv('r-hosp-reason');
  const egfr=gv('r-egfr'),egfrMo=gv('r-egfr-mo'),egfrYr=gv('r-egfr-yr');
  const dialysis=gv('r-dialysis'),dialType=gv('r-dial-type'),dialFreq=gv('r-dial-freq'),dialFac=gv('r-dial-fac'),dialAccess=gv('r-dial-access');
  const incont=gv('r-incont'),foley=gv('r-foley');
  const sxVal=gv('r-sx'),sxDet=gv('r-sx-det');
  const advVal=gv('r-adv'),advDet=gv('r-adv-det');

  let n='';

  // Opening
  if(dx.length){
    if(provType==='specialist'&&provName&&practice){
      n+=`Member has ${list(dx)} and sees ${provName} at ${practice} for management of ${p.pos} renal/urogenital conditions. `;
    } else if(provType==='specialist'&&provName){
      n+=`Member has ${list(dx)} and sees ${provName} for management of ${p.pos} renal/urogenital conditions. `;
    } else if(provType==='specialist'){
      n+=`Member has ${list(dx)} and sees a nephrologist for management of ${p.pos} renal/urogenital conditions. `;
    } else {
      n+=`Member has ${list(dx)} and ${p.pos} renal conditions are managed by ${p.pos} primary care provider. `;
    }
  }

  // Hospitalization
  n+=buildHosp('renal/urogenital',hospVal,hospN,hospMo,hospYr,hospRsn);

  // eGFR
  if((ckd||esrd)&&egfr){
    const dtStr=egfrMo&&egfrYr?` in ${egfrMo} ${egfrYr}`:egfrYr?` in ${egfrYr}`:'';
    n+=`Member's most recent eGFR was ${egfr}${dtStr}. `;
  }

  // Dialysis
  if(esrd){
    if(dialysis==='yes'){
      const facStr=dialFac?` at ${dialFac}`:'';
      const freqStr=dialFreq?` ${dialFreq}`:'';
      n+=`Member currently goes to${facStr} for ${dialType}${freqStr}. `;
      if(dialAccess)n+=`Member's dialysis access is via ${dialAccess}. `;
      n+=`CM provided education on the importance of adhering to ${p.pos} dialysis schedule and the risks of missing appointments. `;
    } else {
      n+=`Member is not currently on dialysis. `;
    }
  }

  // Incontinence / catheter
  if(prostate){
    if(incont==='yes')n+=`Due to member's surgical history, ${p.sub} is incontinent of bladder. CM educated on the importance of frequent brief changes and proper cleaning to prevent UTIs. `;
    if(foley==='yes')n+=`Member currently has a foley catheter. CM provided education on proper catheter care and s/sx of infection including fever, cloudy or foul-smelling urine, and discomfort. `;
  }

  // Symptoms
  n+=sxVal==='yes'
    ?`Member denies any urinary retention, abdominal pain, discomfort upon urination, blood in urine, nausea, or vomiting. `
    :`Member reports ${sxDet||'[symptom details]'}. `;

  // Medication education
  if(meds.length){
    n+=`CM provided education on ${list(meds)}, including proper medication administration and adverse effects to monitor for including nausea, vomiting, dizziness, polyuria, dehydration, abdominal pain, and hypotension. `;
  }

  // Adverse effects
  n+=advVal==='yes'
    ?`Member denies any adverse effects from medication. `
    :`Member reports ${advDet||'[adverse effect details]'}. `;

  // CKD-specific dietary education
  if(ckd||esrd){
    n+=`Member was educated on the importance of monitoring and amending ${p.pos} diet and to severely limit foods which are high in sodium, phosphorous, and potassium such as processed/fast food, dairy, processed meats, bananas, potatoes, avocados, and tomatoes. CM encouraged member to incorporate more fruits and vegetables, whole grains, and lean meats into ${p.pos} diet. `;
  }

  // BPH education
  if(bph)n+=`CM provided education on BPH management including medication adherence, monitoring for urinary retention, and the importance of regular urological follow up. `;

  // Kidney stones education
  if(stones)n+=`CM provided education on kidney stone prevention including the importance of adequate hydration, dietary modifications to limit oxalate-rich foods and excess sodium, and s/sx of recurrence including severe flank pain, hematuria, and nausea. `;

  // PKD education
  if(pkd)n+=`CM provided education on polycystic kidney disease including the importance of blood pressure management, adequate hydration, and routine renal function monitoring. `;

  // Glomerulonephritis
  if(gn)n+=`CM provided education on glomerulonephritis including the importance of monitoring blood pressure, adhering to a low-sodium diet, watching for signs of fluid retention, and keeping up with routine lab work. `;

  // Nephrotic Syndrome
  if(ns)n+=`CM provided education on nephrotic syndrome including monitoring for edema, adhering to a low-sodium and low-fat diet, and the importance of medication adherence and routine follow up. `;

  // Recurrent UTIs
  if(ruti)n+=`CM provided education on UTI prevention including adequate hydration, proper hygiene, s/sx of UTI such as frequency, urgency, dysuria, and cloudy or foul-smelling urine, and when to seek medical attention. `;

  // Renal Artery Stenosis
  if(ras)n+=`CM provided education on renal artery stenosis including the importance of blood pressure management, medication adherence, and monitoring for worsening renal function. `;

  // Jardiance/Farxiga CKD benefit
  if((ckd||esrd)&&(isChk('rm-jar')||isChk('rm-far'))){
    const sglt2=isChk('rm-jar')?'Jardiance':'Farxiga';
    n+=`CM provided education on ${sglt2} and its effects in slowing the progression of CKD in addition to managing diabetes. `;
  }

  // S/sx review
  n+=`CM reviewed the s/sx that require provider notification and which s/sx require emergency medical assistance including nausea, vomiting, loss of appetite, SOB, AMS, loss of consciousness${bph||prostate?', discomfort upon urination, and blood in urine':''}. Member verbalized understanding of all teachings. `;

  // Referrals
  if(provType==='pcp'){
    if(referral==='neph-accepted')n+=`CM offered assistance in obtaining a referral to a nephrologist for focused treatment and monitoring. Member accepted. CM will follow up. `;
    else if(referral==='neph-declined')n+=`CM offered assistance in obtaining a referral to a nephrologist for focused treatment and monitoring. Member declined at this time. `;
    else if(referral==='uro-accepted')n+=`CM offered assistance in obtaining a referral to a urologist for management of ${p.pos} urogenital conditions. Member accepted. CM will follow up. `;
    else if(referral==='uro-declined')n+=`CM offered assistance in obtaining a referral to a urologist for management of ${p.pos} urogenital conditions. Member declined at this time. `;
  }

  if(isChk('r-nutri'))n+=`Due to member's multiple chronic conditions with contradictory dietary needs, CM will offer assistance in obtaining a referral for a nutritionist to assist member in creating a customized diet plan. `;
  if(isChk('r-nephref'))n+=`Case manager will offer a referral to a nephrologist for more focused treatment and monitoring of ${p.pos} CKD. `;

  // Educational materials
  const eduRes=[];
  if(isChk('r-davita'))eduRes.push('the Davita Kidney Smart program: a no cost, online and in-person kidney class that educates individuals on kidney disease and health management');
  if(isChk('r-aakp'))eduRes.push('online resources such as the American Association of Kidney Patients');
  if(eduRes.length)n+=`CM to provide member with educational resources such as ${list(eduRes)}. `;

  n+=`Case manager to follow up and provide member with continued education and assistance as needed throughout ongoing plan of care.`;

  document.getElementById('r-out-txt').textContent=n;
  const os=document.getElementById('r-out-sec');
  os.style.display='block';
  os.scrollIntoView({behavior:'smooth',block:'start'});
}


// ═══════════════ NEUROLOGICAL ═══════════════
function nDx(){
  showEl('n-cva-sec',isChk('n-cva'));
}

function generateNeuro(){
  const p=getP(gv('n-gender'));
  const dxIds=['n-cva','n-tia','n-epi','n-park','n-ms','n-dem','n-cocmen','n-neuro','n-mig','n-shunt'];
  const dx=getCheckedVals(dxIds);
  const cva=isChk('n-cva'),tia=isChk('n-tia'),epi=isChk('n-epi'),park=isChk('n-park');
  const ms=isChk('n-ms'),dem=isChk('n-dem'),cocmen=isChk('n-cocmen');
  const neuro=isChk('n-neuro'),mig=isChk('n-mig'),shunt=isChk('n-shunt');

  const medIds=['nm-lev','nm-carb','nm-gab','nm-preg','nm-top','nm-cbz','nm-don','nm-mem','nm-fluc','nm-bac','nm-riz','nm-suma'];
  let meds=getCheckedVals(medIds);
  const otherM=gv('nm-other');
  if(otherM)meds=meds.concat(otherM.split(',').map(m=>m.trim()).filter(Boolean));

  const provType=gv('n-provtype'),provName=gv('n-provname'),practice=gv('n-practice'),referral=gv('n-referral');
  const hospVal=gv('n-hosp'),hospN=gv('n-hosp-n'),hospMo=gv('n-hosp-mo'),hospYr=gv('n-hosp-yr'),hospRsn=gv('n-hosp-reason');
  const deficits=gv('n-deficits'),defDet=gv('n-def-det');
  const adl=gv('n-adl'),assist=gv('n-assist');
  const sxVal=gv('n-sx'),sxDet=gv('n-sx-det');
  const advVal=gv('n-adv'),advDet=gv('n-adv-det');

  let n='';

  // Opening
  if(dx.length){
    if(provType==='specialist'&&provName&&practice){
      n+=`Member has ${list(dx)} and sees ${provName} at ${practice} for management of ${p.pos} neurological conditions. `;
    } else if(provType==='specialist'&&provName){
      n+=`Member has ${list(dx)} and sees ${provName} for management of ${p.pos} neurological conditions. `;
    } else if(provType==='specialist'){
      n+=`Member has ${list(dx)} and sees a neurologist for management of ${p.pos} neurological conditions. `;
    } else {
      n+=`Member has ${list(dx)} and ${p.pos} neurological conditions are managed by ${p.pos} primary care provider. `;
    }
  }

  // Hospitalization
  n+=buildHosp('neurological',hospVal,hospN,hospMo,hospYr,hospRsn);

  // CVA details
  if(cva){
    if(deficits==='yes'&&defDet){
      n+=`After member's most recent CVA, ${p.sub} stated ${p.sub} had ${defDet}. `;
    }
  }

  // Mobility / ADLs
  if(adl==='yes'){
    n+=`Member is still able to independently perform ADLs`;
    if(assist!=='none')n+=` and ambulates with ${assist}`;
    n+=`. `;
  } else {
    n+=`Member requires assistance with ADLs`;
    if(assist!=='none')n+=` and ambulates with ${assist}`;
    n+=`. `;
  }

  // Symptoms
  n+=sxVal==='yes'
    ?`Member denies headache, nausea, abdominal pain, diarrhea, dizziness, or altered mental status. `
    :`Member reports ${sxDet||'[symptom details]'}. `;

  // Medication education
  if(meds.length){
    n+=`CM provided education on ${list(meds)}, including proper medication administration and adverse effects to monitor for including dizziness, drowsiness, nausea, headache, fatigue, tremor, and GI upset. `;
  }

  // Adverse effects
  n+=advVal==='yes'
    ?`Member denies any adverse effects from medication. `
    :`Member reports ${advDet||'[adverse effect details]'}. `;

  // CVA / TIA education
  if(cva||tia){
    n+=`CM encouraged member to follow up with neurologist to manage ${p.pos} affected extremities and ongoing neurological care. `;
    n+=`CM provided FAST education (Face drooping, Arm weakness, Speech difficulty, Time to call 911) and reinforced the importance of seeking immediate emergency care with any onset of stroke symptoms. `;
  }

  // Epilepsy
  if(epi)n+=`CM provided education on seizure disorder including the importance of medication adherence, seizure precautions, avoiding known triggers such as sleep deprivation, alcohol, and excessive stress, and the importance of not driving if seizures are uncontrolled. CM educated member on what to do during a seizure and when to seek emergency care. `;

  // Parkinson's
  if(park)n+=`CM provided education on Parkinson's Disease including the importance of medication adherence and timing, s/sx of disease progression such as increased tremor, rigidity, bradykinesia, and gait instability, and fall prevention strategies. `;

  // MS
  if(ms)n+=`CM provided education on Multiple Sclerosis including the importance of medication adherence, s/sx of relapse such as new or worsening numbness, vision changes, weakness, and balance problems, and the importance of regular follow up with ${p.pos} neurologist. `;

  // Dementia / Alzheimer's
  if(dem)n+=`CM provided education on Alzheimer's Disease/Dementia including safety precautions, wandering prevention, maintaining a structured routine, the importance of caregiver support, and the importance of medication adherence. `;

  // Cocci Meningitis
  if(cocmen)n+=`CM provided education on Coccidioidomycosis Meningitis including the importance of adherence to antibiotic/antifungal therapy as prescribed and the risks of the condition worsening through non-adherence. `;

  // VP Shunt
  if(shunt)n+=`CM provided education on VP Shunt including s/sx of shunt malfunction such as headache, nausea, vomiting, vision changes, altered mental status, and the importance of seeking emergency care immediately if these symptoms develop. `;

  // Neuropathy
  if(neuro)n+=`CM provided education on neuropathy including fall prevention strategies, proper foot care, s/sx of worsening neuropathy such as increased numbness, tingling, or burning, and the importance of medication adherence and blood sugar management if applicable. `;

  // Migraines
  if(mig)n+=`CM provided education on migraine management including identifying and avoiding triggers, the importance of medication adherence, and when to seek emergency care for headache with sudden onset, worst headache of life, or neurological deficits. `;

  // Fall/safety precautions (if assistive device or deficits)
  if(assist!=='none'||deficits==='yes'||(cva&&deficits==='yes')){
    n+=`CM reviewed fall and safety precautions such as using assistive devices to ambulate, proper transferring techniques when moving from the bed to the chair, and using grab bars in areas such as the bathroom and bedroom. `;
  }

  // S/sx review
  n+=`CM reviewed which s/sx require provider notification and which s/sx require emergency medical assistance including fall with injury, loss of consciousness, altered mental state, nausea, vomiting, and dizziness. Member verbalized understanding of all education given. `;

  // PCP referral to neurologist
  if(provType==='pcp'){
    if(referral==='accepted')n+=`CM offered assistance in obtaining a referral to a neurologist for specialized management. Member accepted. CM will follow up. `;
    else if(referral==='declined')n+=`CM offered assistance in obtaining a referral to a neurologist for specialized management. Member declined at this time. `;
  }

  n+=`CM to follow up with member and provide education and assistance as needed throughout ongoing plan of care.`;

  document.getElementById('n-out-txt').textContent=n;
  const os=document.getElementById('n-out-sec');
  os.style.display='block';
  os.scrollIntoView({behavior:'smooth',block:'start'});
}


// ═══════════════ GASTROINTESTINAL ═══════════════
function generateGI(){
  const p=getP(gv('gi-gender'));
  const dxIds=['gi-gerd','gi-crohn','gi-uc','gi-divert','gi-ibs','gi-cirr','gi-hep','gi-panc','gi-cel','gi-gib','gi-pud'];
  const dx=getCheckedVals(dxIds);
  const gerd=isChk('gi-gerd'),crohn=isChk('gi-crohn'),uc2=isChk('gi-uc'),divert=isChk('gi-divert');
  const ibs=isChk('gi-ibs'),cirr=isChk('gi-cirr'),hep=isChk('gi-hep');
  const panc=isChk('gi-panc'),cel=isChk('gi-cel'),gib=isChk('gi-gib'),pud=isChk('gi-pud');

  const medIds=['gim-ome','gim-pan','gim-fam','gim-dic','gim-cre','gim-dip','gim-mes','gim-sul','gim-suc','gim-reg','gim-mir','gim-hum','gim-urs','gim-lac'];
  let meds=getCheckedVals(medIds);
  const otherM=gv('gim-other');
  if(otherM)meds=meds.concat(otherM.split(',').map(m=>m.trim()).filter(Boolean));

  const provType=gv('gi-provtype'),provName=gv('gi-provname'),practice=gv('gi-practice'),referral=gv('gi-referral');
  const hospVal=gv('gi-hosp'),hospN=gv('gi-hosp-n'),hospMo=gv('gi-hosp-mo'),hospYr=gv('gi-hosp-yr'),hospRsn=gv('gi-hosp-reason');
  const giIssues=gv('gi-issues'),giDet=gv('gi-issues-det');
  const advVal=gv('gi-adv'),advDet=gv('gi-adv-det');
  const bmi=parseFloat(gv('gi-bmi'))||0;

  let n='';

  // Opening
  if(dx.length){
    if(provType==='specialist'&&provName&&practice){
      n+=`Member has ${list(dx)} and sees ${provName} at ${practice} for management of ${p.pos} gastrointestinal conditions. `;
    } else if(provType==='specialist'&&provName){
      n+=`Member has ${list(dx)} and sees ${provName} for management of ${p.pos} gastrointestinal conditions. `;
    } else if(provType==='specialist'){
      n+=`Member has ${list(dx)} and sees a gastroenterologist for management of ${p.pos} gastrointestinal conditions. `;
    } else {
      n+=`Member has ${list(dx)} and ${p.pos} gastrointestinal conditions are managed by ${p.pos} primary care provider. `;
    }
  }

  // Hospitalization
  n+=buildHosp('GI',hospVal,hospN,hospMo,hospYr,hospRsn);

  // Current GI status
  if(giIssues==='no'){
    n+=`Member states ${p.sub} does not have any current gastrointestinal issues and ${p.pos} conditions are managed well with medication. `;
  } else {
    n+=`Member reports ${giDet||'current GI issues'}. `;
  }

  // Medication education
  if(meds.length){
    n+=`Member is currently taking ${list(meds)} to manage ${p.pos} GI conditions. CM provided education on proper medication administration and adverse effects to monitor for including nausea, vomiting, diarrhea, constipation, abdominal pain, dizziness, headache, and dry mouth. `;
  }

  // Adverse effects
  n+=advVal==='yes'
    ?`Member denies any adverse effects from medication. `
    :`Member reports ${advDet||'[adverse effect details]'}. `;

  // GERD dietary education
  if(gerd)n+=`CM reinforced dietary education on foods member should avoid that could agitate ${p.pos} GERD, such as foods high in fat, spicy foods, caffeine, alcohol, and carbonated beverages. CM also educated member on lifestyle modifications including elevating the head of the bed, avoiding eating within 2-3 hours of lying down, and maintaining a healthy weight. `;

  // Crohn's education
  if(crohn)n+=`CM provided education on Crohn's Disease including the importance of medication adherence, dietary modifications to avoid trigger foods, monitoring for flare-ups, and the importance of regular follow up with ${p.pos} gastroenterologist. `;

  // Ulcerative Colitis education
  if(uc2)n+=`CM provided education on Ulcerative Colitis including the importance of medication adherence, dietary modifications during flare-ups, hydration, and recognizing s/sx of flare such as increased bloody diarrhea, abdominal cramping, and urgency. `;

  // Diverticulitis education
  if(divert)n+=`CM provided education on diverticulitis/diverticulosis including the importance of a high-fiber diet when not in acute flare, adequate hydration, and recognizing s/sx of acute diverticulitis including fever, sudden or increased abdominal pain, persistent diarrhea, and tenderness in the abdomen. `;

  // IBS education
  if(ibs)n+=`CM provided education on IBS management including identifying and avoiding trigger foods, stress management techniques, the importance of a balanced diet with adequate fiber, and when to notify ${p.pos} provider of worsening symptoms. `;

  // Cirrhosis education
  if(cirr)n+=`CM provided education on cirrhosis including the importance of alcohol avoidance, a low-sodium diet to manage fluid retention, medication adherence, and s/sx of decompensation such as jaundice, ascites, confusion, and GI bleeding. `;

  // Hepatitis education
  if(hep)n+=`CM provided education on hepatitis including the importance of medication adherence, avoiding alcohol and hepatotoxic medications, routine liver function monitoring, and transmission prevention. `;

  // Pancreatitis education
  if(panc)n+=`CM provided education on pancreatitis including the importance of alcohol avoidance, adhering to a low-fat diet, adequate hydration, and recognizing s/sx of acute pancreatitis such as severe epigastric pain radiating to the back, nausea, and vomiting. `;

  // Celiac Disease education
  if(cel)n+=`CM provided education on Celiac Disease including the importance of adhering to a strict gluten-free diet, reading food labels carefully, awareness of cross-contamination, and the importance of routine nutritional monitoring. `;

  // GI Bleed education
  if(gib)n+=`CM provided education on GI bleed precautions including monitoring for signs of recurrent bleeding such as black/tarry stools, bloody stools, hematemesis, dizziness, and weakness, and the importance of seeking emergency care immediately. `;

  // PUD education
  if(pud)n+=`CM provided education on peptic ulcer disease including medication adherence, avoiding NSAIDs and alcohol, the importance of H. pylori treatment if applicable, and s/sx of complications including worsening abdominal pain, nausea, vomiting, and signs of GI bleeding. `;

  // BMI (only if > 25)
  if(bmi>25){
    n+=`CM encouraged weight reduction and management and educated member on the benefits it could have with managing ${p.pos} gastrointestinal conditions, as well as ${p.pos} overall health. `;
  }

  // S/sx review
  n+=`CM reviewed s/sx that require provider notification and which s/sx require immediate emergency assistance such as fever, SOB, black/tarry/bloody stools, excessive foul smelling diarrhea, blurred vision, tachycardia, and urinary retention. Member verbalized understanding of all teachings. `;

  // PCP referral to GI specialist
  if(provType==='pcp'){
    if(referral==='accepted')n+=`CM offered assistance in obtaining a referral to a gastroenterologist for specialized management. Member accepted. CM will follow up. `;
    else if(referral==='declined')n+=`CM offered assistance in obtaining a referral to a gastroenterologist for specialized management. Member declined at this time. `;
  }

  // Nutritionist
  if(isChk('gi-nutri'))n+=`Due to member's multiple chronic conditions with contradictory dietary needs, CM will offer assistance in obtaining a referral for a nutritionist to assist member in creating a customized diet plan. `;

  n+=`Case manager to follow up with member and offer ongoing education and assistance as needed.`;

  document.getElementById('gi-out-txt').textContent=n;
  const os=document.getElementById('gi-out-sec');
  os.style.display='block';
  os.scrollIntoView({behavior:'smooth',block:'start'});
}


// ═══════════════ MUSCULOSKELETAL ═══════════════
function mskDx(){
  showEl('msk-jr-sec',isChk('msk-jr'));
  showEl('msk-fx-sec',isChk('msk-fx'));
}

function generateMSK(){
  const p=getP(gv('msk-gender'));
  const dxIds=['msk-oa','msk-ra','msk-djd','msk-ddd','msk-gout','msk-fibro','msk-sten','msk-hern','msk-jr','msk-fx','msk-osteo'];
  const dx=getCheckedVals(dxIds);
  const oa=isChk('msk-oa'),ra=isChk('msk-ra'),djd=isChk('msk-djd'),ddd=isChk('msk-ddd');
  const gout=isChk('msk-gout'),fibro=isChk('msk-fibro'),sten=isChk('msk-sten'),hern=isChk('msk-hern');
  const jr=isChk('msk-jr'),fx=isChk('msk-fx'),osteo=isChk('msk-osteo');

  const medIds=['mskm-norco','mskm-tram','mskm-oxy','mskm-mel','mskm-ibu','mskm-nap','mskm-cyc','mskm-meth','mskm-gab','mskm-mtx','mskm-hcq','mskm-allo','mskm-col','mskm-ale','mskm-hum','mskm-dul'];
  let meds=getCheckedVals(medIds);
  const otherM=gv('mskm-other');
  if(otherM)meds=meds.concat(otherM.split(',').map(m=>m.trim()).filter(Boolean));

  const OPIOIDS=new Set(['hydrocodone/acetaminophen (Norco)','tramadol','oxycodone']);
  const opioidMeds=meds.filter(m=>OPIOIDS.has(m));
  const nonOpioidMeds=meds.filter(m=>!OPIOIDS.has(m));

  const provType=gv('msk-provtype'),provName=gv('msk-provname'),practice=gv('msk-practice'),referral=gv('msk-referral');
  const hospVal=gv('msk-hosp'),hospN=gv('msk-hosp-n'),hospMo=gv('msk-hosp-mo'),hospYr=gv('msk-hosp-yr'),hospRsn=gv('msk-hosp-reason');
  const painLoc=gv('msk-pain-loc'),painMgmt=gv('msk-pain-mgmt');
  const surg=gv('msk-surg');
  const adl=gv('msk-adl'),assist=gv('msk-assist');
  const advVal=gv('msk-adv'),advDet=gv('msk-adv-det');
  const bmi=parseFloat(gv('msk-bmi'))||0;
  const dme=gv('msk-dme'),dmeDet=gv('msk-dme-det');

  let n='';

  // Opening
  if(dx.length){
    if(provType==='specialist'&&provName&&practice){
      n+=`Member has ${list(dx)} and sees ${provName} at ${practice} for management of ${p.pos} musculoskeletal conditions. `;
    } else if(provType==='specialist'&&provName){
      n+=`Member has ${list(dx)} and sees ${provName}. `;
    } else if(provType==='specialist'){
      n+=`Member has ${list(dx)} and sees a specialist for management of ${p.pos} musculoskeletal conditions. `;
    } else {
      n+=`Member has ${list(dx)} and ${p.pos} musculoskeletal conditions are managed by ${p.pos} primary care provider. `;
    }
  }

  // Hospitalization
  n+=buildHosp('musculoskeletal',hospVal,hospN,hospMo,hospYr,hospRsn);

  // Pain assessment
  if(painLoc)n+=`Member states ${p.pos} pain is mostly allocated in ${p.pos} ${painLoc} and is managed with ${painMgmt}. `;

  // Surgical intervention
  if(surg==='planned'){
    n+=`Member states that ${p.sub} and ${p.pos} provider have exhausted all conservative measures for pain management and, at ${p.pos} most recent appointment, have begun the process for surgical intervention. `;
  } else if(surg==='completed'){
    n+=`Member has completed surgical intervention for ${p.pos} musculoskeletal condition. `;
  }

  // Joint replacement details
  if(jr){
    const jrJoint=gv('msk-jr-joint'),jrTime=gv('msk-jr-time');
    if(jrJoint)n+=`Member has a history of ${jrJoint} joint replacement${jrTime?' ('+jrTime+')':''}. `;
  }

  // Fracture details
  if(fx){
    const fxLoc=gv('msk-fx-loc'),fxTime=gv('msk-fx-time');
    if(fxLoc)n+=`Member has a history of ${fxLoc} fracture${fxTime?' ('+fxTime+')':''}. `;
  }

  // Mobility / ADLs
  if(adl==='yes'){
    n+=`Member is still able to independently perform ADLs`;
    if(assist!=='none')n+=` and ambulates with ${assist}`;
    n+=`. `;
  } else {
    n+=`Member requires assistance with ADLs`;
    if(assist!=='none')n+=` and ambulates with ${assist}`;
    n+=`. `;
  }

  // Opioid medication education
  if(opioidMeds.length){
    n+=`CM reviewed proper medication administration for ${list(opioidMeds)} and emphasized the importance of adhering to the prescribed frequency due to the risks of respiratory depression. `;
  }

  // Non-opioid medication education
  if(nonOpioidMeds.length){
    n+=`CM provided education on ${list(nonOpioidMeds)}, including proper medication administration and adverse effects to monitor for including nausea, vomiting, dizziness, GI upset, drowsiness, and fatigue. `;
  }

  // Adverse effects
  n+=advVal==='yes'
    ?`Member denies any s/sx of adverse effects including loss of consciousness, nausea, vomiting, dizziness, altered mental state, chest pain, and shortness of breath. `
    :`Member reports ${advDet||'[adverse effect details]'}. `;

  // Condition-specific education
  if(oa||djd)n+=`CM provided education on osteoarthritis/degenerative joint disease including joint protection strategies, the benefits of low-impact exercise, and the importance of maintaining a healthy weight to reduce stress on joints. `;
  if(ra)n+=`CM provided education on rheumatoid arthritis including the importance of medication adherence, recognizing signs of flare-up such as increased joint swelling, pain, and stiffness, and the importance of regular follow up with ${p.pos} rheumatologist. `;
  if(ddd||sten||hern)n+=`CM provided education on spinal conditions including proper body mechanics, the importance of core strengthening, and activity modification to avoid exacerbating symptoms. `;
  if(gout)n+=`CM provided education on gout management including dietary modifications to limit purine-rich foods such as red meat, organ meats, shellfish, and alcohol, adequate hydration, and medication adherence to prevent flare-ups. `;
  if(fibro)n+=`CM provided education on fibromyalgia management including the importance of medication adherence, regular low-impact exercise, sleep hygiene, stress management, and recognizing flare triggers. `;
  if(osteo)n+=`CM provided education on osteoporosis including fall prevention strategies, weight-bearing exercise, adequate calcium and vitamin D intake, and medication adherence. `;

  // BMI
  if(bmi>25){
    n+=`CM reinforced the benefits that weight loss could have for member in managing ${p.pos} pain by taking stress off of ${p.pos} joints. `;
  }

  // Fall precautions
  n+=`CM reinforced fall precautions with member including resting when member is feeling increased joint pain and maintaining a clear and uncluttered living space. `;

  // S/sx review
  n+=`CM reviewed which s/sx require provider notification and which s/sx require emergency medical assistance including fall with injury, loss of consciousness, altered mental state, nausea, vomiting, and dizziness. Member verbalized understanding of all teachings. `;

  // DME
  if(dme==='denied')n+=`CM inquired about DME member may require and member denied the need for any at time of assessment. `;
  else if(dme==='needs')n+=`CM inquired about DME needs and member expressed the need for ${dmeDet||'[DME details]'}. CM will assist member in obtaining requested DME. `;

  // PT referral
  if(isChk('msk-pt'))n+=`CM offered a referral for physical therapy to assist member in improving mobility and managing pain. `;

  // PCP referral
  if(provType==='pcp'){
    if(referral==='ortho-accepted')n+=`CM offered assistance in obtaining a referral to an orthopedic specialist. Member accepted. CM will follow up. `;
    else if(referral==='ortho-declined')n+=`CM offered assistance in obtaining a referral to an orthopedic specialist. Member declined at this time. `;
    else if(referral==='pain-accepted')n+=`CM offered assistance in obtaining a referral to pain management. Member accepted. CM will follow up. `;
    else if(referral==='pain-declined')n+=`CM offered assistance in obtaining a referral to pain management. Member declined at this time. `;
    else if(referral==='rheum-accepted')n+=`CM offered assistance in obtaining a referral to a rheumatologist. Member accepted. CM will follow up. `;
    else if(referral==='rheum-declined')n+=`CM offered assistance in obtaining a referral to a rheumatologist. Member declined at this time. `;
  }

  n+=`Case manager to follow up with member and provide education and assistance as needed throughout ongoing plan of care.`;

  document.getElementById('msk-out-txt').textContent=n;
  const os=document.getElementById('msk-out-sec');
  os.style.display='block';
  os.scrollIntoView({behavior:'smooth',block:'start'});
}


// ═══════════════ HEMATOLOGIC ═══════════════
function hDx(){
  const hasAnemia=isChk('h-ida')||isChk('h-b12')||isChk('h-acd');
  showEl('h-labs-sec',hasAnemia);
}

function generateHeme(){
  const p=getP(gv('h-gender'));
  const dxIds=['h-ida','h-b12','h-acd','h-scd','h-tcp','h-dvt','h-clot','h-poly','h-mds','h-hemo'];
  const dx=getCheckedVals(dxIds);
  const ida=isChk('h-ida'),b12=isChk('h-b12'),acd=isChk('h-acd'),scd=isChk('h-scd');
  const tcp=isChk('h-tcp'),dvt=isChk('h-dvt'),clot=isChk('h-clot');
  const poly=isChk('h-poly'),mds=isChk('h-mds'),hemo=isChk('h-hemo');
  const hasAnemia=ida||b12||acd;

  const medIds=['hm-fe','hm-b12','hm-fol','hm-hyd','hm-epo','hm-war','hm-eli','hm-xar','hm-enox','hm-clo'];
  let meds=getCheckedVals(medIds);
  const otherM=gv('hm-other');
  if(otherM)meds=meds.concat(otherM.split(',').map(m=>m.trim()).filter(Boolean));

  const H_BLOOD_THINNERS=new Set(['warfarin','apixaban (Eliquis)','rivaroxaban (Xarelto)','enoxaparin (Lovenox)','clopidogrel (Plavix)']);
  const btMeds=meds.filter(m=>H_BLOOD_THINNERS.has(m));
  const regMeds=meds.filter(m=>!H_BLOOD_THINNERS.has(m));

  const provType=gv('h-provtype'),provName=gv('h-provname'),practice=gv('h-practice'),referral=gv('h-referral');
  const hospVal=gv('h-hosp'),hospN=gv('h-hosp-n'),hospMo=gv('h-hosp-mo'),hospYr=gv('h-hosp-yr'),hospRsn=gv('h-hosp-reason');
  const hgb=gv('h-hgb'),labMo=gv('h-lab-mo'),labYr=gv('h-lab-yr');
  const transfusion=gv('h-transfusion');
  const sxVal=gv('h-sx'),sxDet=gv('h-sx-det');
  const advVal=gv('h-adv'),advDet=gv('h-adv-det');

  let n='';

  // Opening
  if(dx.length){
    if(provType==='specialist'&&provName&&practice){
      n+=`Member has ${list(dx)} and sees ${provName} at ${practice} for management of ${p.pos} hematologic conditions. `;
    } else if(provType==='specialist'&&provName){
      n+=`Member has ${list(dx)} and sees ${provName} for management of ${p.pos} hematologic conditions. `;
    } else if(provType==='specialist'){
      n+=`Member has ${list(dx)} and sees a hematologist for management of ${p.pos} hematologic conditions. `;
    } else {
      n+=`Member has ${list(dx)} and ${p.pos} hematologic conditions are managed by ${p.pos} primary care provider. `;
    }
  }

  // Hospitalization
  n+=buildHosp('hematologic',hospVal,hospN,hospMo,hospYr,hospRsn);

  // Labs
  if(hasAnemia&&hgb){
    const dtStr=labMo&&labYr?` in ${labMo} ${labYr}`:labYr?` in ${labYr}`:'';
    n+=`Member's most recent hemoglobin was ${hgb}${dtStr}. `;
  }
  if(hasAnemia&&transfusion==='yes')n+=`Member has a history of blood transfusions. `;

  // Symptoms
  n+=sxVal==='yes'
    ?`Member denies fatigue, dizziness, shortness of breath, easy bruising, prolonged bleeding, or pallor. `
    :`Member reports ${sxDet||'[symptom details]'}. `;

  // Regular med education
  if(regMeds.length){
    n+=`CM provided education on ${list(regMeds)}, including proper medication administration and adverse effects to monitor for including nausea, constipation, GI upset, headache, dizziness, and fatigue. `;
  }

  // Blood thinner education
  if(btMeds.length){
    n+=`CM provided anticoagulation education on ${list(btMeds)}, including bleeding precautions, fall risk reduction, signs of increased bruising or prolonged bleeding, and when to seek emergency care. `;
  }

  // Adverse effects
  n+=advVal==='yes'
    ?`Member denies any adverse effects from medication. `
    :`Member reports ${advDet||'[adverse effect details]'}. `;

  // Condition-specific education
  if(ida)n+=`CM provided education on iron deficiency anemia including the importance of iron supplementation, incorporating iron-rich foods such as red meat, spinach, beans, and fortified cereals, and taking iron with vitamin C to improve absorption. CM advised member to avoid taking iron supplements with calcium, dairy, coffee, or tea. `;
  if(b12)n+=`CM provided education on B12/folate deficiency anemia including the importance of supplementation adherence, incorporating B12-rich foods such as meat, fish, eggs, and fortified cereals, and the importance of routine lab monitoring. `;
  if(acd)n+=`CM provided education on anemia of chronic disease including the importance of managing the underlying chronic condition, medication adherence, and routine lab monitoring. `;
  if(scd)n+=`CM provided education on sickle cell disease including hydration, avoiding temperature extremes, recognizing signs of sickle cell crisis such as severe pain, fever, and SOB, and the importance of seeking emergency care during a crisis. `;
  if(tcp)n+=`CM provided education on thrombocytopenia including bleeding precautions, avoiding activities with high risk of injury, monitoring for signs of bleeding such as petechiae, easy bruising, and gum bleeding, and the importance of routine lab monitoring. `;
  if(dvt||clot)n+=`CM provided education on DVT/PE and clotting disorders including the importance of anticoagulation adherence, recognizing s/sx of DVT such as leg swelling, pain, and warmth, and s/sx of PE such as sudden SOB, chest pain, and tachycardia, and the importance of seeking emergency care immediately. `;
  if(poly)n+=`CM provided education on Polycythemia Vera including the importance of medication adherence, adequate hydration, recognizing s/sx of complications such as headache, dizziness, visual changes, and itching, and the importance of routine blood draws and follow up. `;
  if(mds)n+=`CM provided education on Myelodysplastic Syndrome including the importance of routine lab monitoring, infection prevention, recognizing s/sx of worsening cytopenias such as fatigue, infection, and bleeding, and medication adherence. `;
  if(hemo)n+=`CM provided education on hemophilia including bleeding precautions, avoiding contact sports and activities with high risk of injury, proper first aid for bleeding episodes, and the importance of carrying medical identification. `;

  // S/sx review
  n+=`CM reviewed s/sx that require provider notification and which s/sx require emergency medical assistance including severe fatigue, dizziness, shortness of breath, chest pain, uncontrolled bleeding, signs of infection, and altered mental status. Member verbalized understanding of all teachings. `;

  // PCP referral
  if(provType==='pcp'){
    if(referral==='accepted')n+=`CM offered assistance in obtaining a referral to a hematologist for specialized management. Member accepted. CM will follow up. `;
    else if(referral==='declined')n+=`CM offered assistance in obtaining a referral to a hematologist for specialized management. Member declined at this time. `;
  }

  n+=`Case manager to follow up and provide member with continued education and assistance as needed throughout ongoing plan of care.`;

  document.getElementById('h-out-txt').textContent=n;
  const os=document.getElementById('h-out-sec');
  os.style.display='block';
  os.scrollIntoView({behavior:'smooth',block:'start'});
}


// ═══════════════ INTEGUMENTARY ═══════════════
function iDx(){
  const hasSkinCancer=isChk('i-bcc')||isChk('i-scc')||isChk('i-mel');
  showEl('i-surg-sec',hasSkinCancer);
}

function generateInteg(){
  const p=getP(gv('i-gender'));
  const dxIds=['i-bcc','i-scc','i-mel','i-psor','i-ecz','i-rosa','i-actinic','i-shingles'];
  const dx=getCheckedVals(dxIds);
  const bcc=isChk('i-bcc'),scc=isChk('i-scc'),mel=isChk('i-mel');
  const psor=isChk('i-psor'),ecz=isChk('i-ecz'),rosa=isChk('i-rosa');
  const actinic=isChk('i-actinic'),shingles=isChk('i-shingles');
  const hasSkinCancer=bcc||scc||mel;

  const medIds=['im-imi','im-flu','im-tac','im-clo','im-tri','im-mtx','im-hum','im-dup','im-val','im-acyc'];
  let meds=getCheckedVals(medIds);
  const otherM=gv('im-other');
  if(otherM)meds=meds.concat(otherM.split(',').map(m=>m.trim()).filter(Boolean));

  const provType=gv('i-provtype'),provName=gv('i-provname'),practice=gv('i-practice'),referral=gv('i-referral');
  const hospVal=gv('i-hosp'),hospN=gv('i-hosp-n'),hospMo=gv('i-hosp-mo'),hospYr=gv('i-hosp-yr'),hospRsn=gv('i-hosp-reason');
  const surghx=gv('i-surghx'),surgType=gv('i-surg-type'),surgLoc=gv('i-surg-loc'),surgDate=gv('i-surg-date');
  const fu=gv('i-fu'),fuDate=gv('i-fu-date');
  const sxVal=gv('i-sx'),sxDet=gv('i-sx-det');
  const advVal=gv('i-adv'),advDet=gv('i-adv-det');

  let n='';

  // Opening
  if(dx.length){
    if(provType==='specialist'&&provName&&practice){
      n+=`Member has ${list(dx)} and is being treated by ${provName} at ${practice}. `;
    } else if(provType==='specialist'&&provName){
      n+=`Member has ${list(dx)} and is being treated by ${provName}. `;
    } else if(provType==='specialist'){
      n+=`Member has ${list(dx)} and sees a dermatologist for management of ${p.pos} integumentary conditions. `;
    } else {
      n+=`Member has ${list(dx)} and ${p.pos} integumentary conditions are managed by ${p.pos} primary care provider. `;
    }
  }

  // Hospitalization
  n+=buildHosp('integumentary',hospVal,hospN,hospMo,hospYr,hospRsn);

  // Surgical history
  if(hasSkinCancer&&surghx==='yes'){
    const locStr=surgLoc?` to ${p.pos} ${surgLoc}`:'';
    const dtStr=surgDate?` in ${surgDate}`:'';
    n+=`Member had ${surgType}${locStr}${dtStr}`;
    if(fu==='yes'&&fuDate)n+=` and is scheduled for follow up ${fuDate}`;
    n+=`. `;
    n+=`CM reviewed proper care of surgical site and emphasized the importance of avoiding sunlight and monitoring the site for s/sx of infection. `;
  }

  // Symptoms
  n+=sxVal==='yes'
    ?`Member denies any s/sx of infection to surgical site and is compliant with skin care as ordered by ${p.pos} provider. `
    :`Member reports ${sxDet||'[symptom details]'}. `;

  // Medication education
  if(meds.length){
    n+=`CM provided education on ${list(meds)}, including proper medication administration and adverse effects to monitor for including skin irritation, redness, burning, itching, nausea, headache, and photosensitivity. `;
  }

  // Adverse effects
  n+=advVal==='yes'
    ?`Member denies any adverse effects from medication. `
    :`Member reports ${advDet||'[adverse effect details]'}. `;

  // Skin cancer education
  if(hasSkinCancer){
    n+=`CM provided education to member on proper skin care to prevent further occurrences of skin cancer including wearing protective clothing while outside, using sunscreen with a minimum SPF of 30, and avoiding tanning beds and long exposures to sunlight. `;
    n+=`CM also stressed the importance of annual checkups with ${p.pos} dermatologist due to ${p.pos} history of skin cancer, as well as self checks on a regular basis. Member was encouraged to immediately see ${p.pos} provider if, upon ${p.pos} own self skin checks, ${p.sub} encounters any new skin issues such as discoloration or bleeding spots. `;
  }

  // Psoriasis
  if(psor)n+=`CM provided education on psoriasis management including the importance of medication adherence, moisturizing regularly, avoiding known triggers such as stress, skin injuries, and certain medications, and the importance of regular follow up with ${p.pos} dermatologist. `;

  // Eczema
  if(ecz)n+=`CM provided education on eczema/atopic dermatitis management including regular moisturizing, avoiding known triggers such as harsh soaps, fragrances, and extreme temperatures, the importance of medication adherence, and when to notify ${p.pos} provider of worsening symptoms or signs of infection. `;

  // Rosacea
  if(rosa)n+=`CM provided education on rosacea management including identifying and avoiding triggers such as sun exposure, spicy foods, alcohol, and extreme temperatures, gentle skin care practices, and the importance of medication adherence. `;

  // Actinic Keratosis
  if(actinic)n+=`CM provided education on actinic keratosis including sun protection measures, the importance of regular dermatological exams due to the risk of progression to squamous cell carcinoma, and monitoring for changes in existing lesions. `;

  // Shingles
  if(shingles)n+=`CM provided education on shingles including the importance of antiviral medication adherence, pain management, avoiding contact with individuals who have not had chickenpox or the varicella vaccine, and the availability of the Shingrix vaccine to prevent recurrence. `;

  // S/sx review
  n+=`CM reviewed s/sx that require emergency assistance and which s/sx require provider notification including new, changing, or non-healing skin spots, irritation or pain at affected areas, lesions that bleed easily or profusely, and tender or painful lesions. Member verbalized understanding of all teachings. `;

  // PCP referral
  if(provType==='pcp'){
    if(referral==='accepted')n+=`CM offered assistance in obtaining a referral to a dermatologist for specialized management. Member accepted. CM will follow up. `;
    else if(referral==='declined')n+=`CM offered assistance in obtaining a referral to a dermatologist for specialized management. Member declined at this time. `;
  }

  n+=`CM to follow up with member and offer education and assistance as needed throughout plan of care.`;

  document.getElementById('i-out-txt').textContent=n;
  const os=document.getElementById('i-out-sec');
  os.style.display='block';
  os.scrollIntoView({behavior:'smooth',block:'start'});
}


// ═══════════════ BEHAVIORAL HEALTH ═══════════════
function bhDx(){
  showEl('bh-sud-sec',isChk('bh-sud'));
}

function generateBH(){
  const p=getP(gv('bh-gender'));
  const dxIds=['bh-mdd','bh-gad','bh-bpd','bh-scz','bh-ptsd','bh-sud','bh-ocd','bh-adhd','bh-panic'];
  const dx=getCheckedVals(dxIds);
  const mdd=isChk('bh-mdd'),gad=isChk('bh-gad'),bpd=isChk('bh-bpd'),scz=isChk('bh-scz');
  const ptsd=isChk('bh-ptsd'),sud=isChk('bh-sud'),ocd=isChk('bh-ocd');
  const adhd=isChk('bh-adhd'),panic=isChk('bh-panic');

  const medIds=['bhm-ser','bhm-flu','bhm-esc','bhm-cit','bhm-ven','bhm-dul','bhm-bup','bhm-bus','bhm-que','bhm-ari','bhm-ola','bhm-ris','bhm-lit','bhm-lam','bhm-val','bhm-lor','bhm-tra','bhm-mir'];
  let meds=getCheckedVals(medIds);
  const otherM=gv('bhm-other');
  if(otherM)meds=meds.concat(otherM.split(',').map(m=>m.trim()).filter(Boolean));

  const BH_ANTIPSYCHOTICS=new Set(['quetiapine (Seroquel)','aripiprazole (Abilify)','olanzapine (Zyprexa)','risperidone (Risperdal)']);
  const BH_MOOD_STABILIZERS=new Set(['lithium','lamotrigine (Lamictal)','valproic acid (Depakote)']);
  const apMeds=meds.filter(m=>BH_ANTIPSYCHOTICS.has(m));
  const msMeds=meds.filter(m=>BH_MOOD_STABILIZERS.has(m));
  const otherMedsArr=meds.filter(m=>!BH_ANTIPSYCHOTICS.has(m)&&!BH_MOOD_STABILIZERS.has(m));

  const provType=gv('bh-provtype'),provName=gv('bh-provname'),practice=gv('bh-practice'),referral=gv('bh-referral');
  const hospVal=gv('bh-hosp'),hospN=gv('bh-hosp-n'),hospMo=gv('bh-hosp-mo'),hospYr=gv('bh-hosp-yr'),hospRsn=gv('bh-hosp-reason');
  const therapy=gv('bh-therapy'),willing=gv('bh-willing');
  const substance=gv('bh-substance'),recovery=gv('bh-recovery');
  const sxVal=gv('bh-sx'),sxDet=gv('bh-sx-det');
  const advVal=gv('bh-adv'),advDet=gv('bh-adv-det');

  let n='';

  // Opening
  if(dx.length){
    if(provType==='specialist'&&provName&&practice){
      n+=`Member has ${list(dx)} and sees ${provName} at ${practice} for management of ${p.pos} behavioral health conditions. `;
    } else if(provType==='specialist'&&provName){
      n+=`Member has ${list(dx)} and sees ${provName} for management of ${p.pos} behavioral health conditions. `;
    } else if(provType==='specialist'){
      n+=`Member has ${list(dx)} and sees a behavioral health specialist for management of ${p.pos} conditions. `;
    } else {
      n+=`Member has ${list(dx)} and ${p.pos} behavioral health conditions are managed by ${p.pos} primary care provider. `;
    }
  }

  // Hospitalization
  n+=buildHosp('behavioral health',hospVal,hospN,hospMo,hospYr,hospRsn);

  // Therapy/counseling
  if(therapy==='yes'){
    n+=`Member is currently engaged in therapy/counseling. `;
  } else {
    n+=`Member is not currently in therapy or counseling. `;
    if(willing==='yes')n+=`Member expressed willingness to participate in therapy services. CM will assist member in locating an appropriate provider. `;
    else if(willing==='no')n+=`Member declined therapy services at this time. CM encouraged member to reconsider and informed ${p.obj} that assistance is available when ${p.sub} is ready. `;
  }

  // Substance use details
  if(sud){
    const subStr=substance||'[substance]';
    if(recovery==='in recovery')n+=`Member has a history of ${subStr} use and is currently in recovery. CM reinforced the importance of continued sobriety, support group attendance, and having a relapse prevention plan. `;
    else if(recovery==='actively using')n+=`Member reports active ${subStr} use. CM provided education on the health risks associated with continued use and offered resources for treatment and support. `;
    else if(recovery==='in treatment')n+=`Member is currently in treatment for ${subStr} use disorder. CM reinforced the importance of treatment adherence and offered additional support and resources. `;
  }

  // Symptoms
  n+=sxVal==='yes'
    ?`Member denies any worsening of behavioral health symptoms at this time. `
    :`Member reports ${sxDet||'[symptom details]'}. `;

  // Standard med education
  if(otherMedsArr.length){
    n+=`CM provided education on ${list(otherMedsArr)}, including proper medication administration and adverse effects to monitor for including nausea, headache, dizziness, drowsiness, insomnia, dry mouth, weight changes, and GI upset. `;
  }

  // Antipsychotic education
  if(apMeds.length){
    n+=`CM provided education on ${list(apMeds)}, including the importance of medication adherence, adverse effects to monitor for including weight gain, metabolic changes, drowsiness, tardive dyskinesia, and extrapyramidal symptoms, and the importance of not discontinuing medication abruptly without provider guidance. `;
  }

  // Mood stabilizer education
  if(msMeds.length){
    n+=`CM provided education on ${list(msMeds)}, including the importance of medication adherence, the need for routine lab monitoring, adverse effects to monitor for including GI upset, tremor, weight changes, and dizziness, and the risks of abrupt discontinuation. `;
    if(msMeds.some(m=>m==='lithium'))n+=`CM emphasized the importance of routine lithium level monitoring and adequate hydration due to the narrow therapeutic window. `;
  }

  // Adverse effects
  n+=advVal==='yes'
    ?`Member denies any adverse effects from medication. `
    :`Member reports ${advDet||'[adverse effect details]'}. `;

  // Condition-specific education
  if(mdd)n+=`CM provided education on depression including the importance of medication adherence, recognizing s/sx of worsening depression such as persistent sadness, loss of interest, sleep disturbances, and changes in appetite, and the importance of seeking help if symptoms worsen. `;
  if(gad)n+=`CM provided education on anxiety management including the importance of medication adherence, recognizing triggers, coping strategies such as deep breathing and grounding techniques, and when to seek additional support. `;
  if(bpd)n+=`CM provided education on bipolar disorder including the importance of medication adherence, recognizing s/sx of manic and depressive episodes, maintaining a consistent routine and sleep schedule, and the importance of not making significant life changes during mood episodes. `;
  if(scz)n+=`CM provided education on schizophrenia/schizoaffective disorder including the critical importance of medication adherence, recognizing early warning signs of relapse such as increased paranoia, auditory/visual hallucinations, disorganized thoughts, and social withdrawal, and the importance of a strong support system. `;
  if(ptsd)n+=`CM provided education on PTSD including the importance of medication adherence, the benefits of evidence-based therapies such as CPT and EMDR, coping strategies for managing triggers and flashbacks, and the importance of establishing a safety plan. `;
  if(ocd)n+=`CM provided education on OCD management including the importance of medication adherence, the benefits of cognitive behavioral therapy with exposure and response prevention, and coping strategies for managing intrusive thoughts. `;
  if(adhd)n+=`CM provided education on ADHD management including the importance of medication adherence, organizational strategies, routine establishment, and the importance of regular follow up. `;
  if(panic)n+=`CM provided education on panic disorder including recognizing early signs of a panic attack, coping strategies such as deep breathing and grounding techniques, the importance of medication adherence, and when to seek emergency care if symptoms are accompanied by chest pain or loss of consciousness. `;

  // CM emphasized importance of not stopping meds abruptly
  n+=`CM emphasized the importance of not discontinuing any behavioral health medications abruptly without guidance from ${p.pos} provider due to the risk of withdrawal effects and symptom relapse. `;

  // S/sx review
  n+=`CM reviewed s/sx that require provider notification and which s/sx require emergency medical assistance including worsening depression or anxiety, suicidal ideation, hallucinations, paranoia, self-harm, altered mental status, and loss of consciousness. Member verbalized understanding of all teachings. `;

  // PCP referral
  if(provType==='pcp'){
    if(referral==='psych-accepted')n+=`CM offered assistance in obtaining a referral to a psychiatrist for specialized medication management. Member accepted. CM will follow up. `;
    else if(referral==='psych-declined')n+=`CM offered assistance in obtaining a referral to a psychiatrist for specialized medication management. Member declined at this time. `;
    else if(referral==='therapy-accepted')n+=`CM offered assistance in obtaining a referral to a therapist/counselor. Member accepted. CM will follow up. `;
    else if(referral==='therapy-declined')n+=`CM offered assistance in obtaining a referral to a therapist/counselor. Member declined at this time. `;
  }

  // Community resources
  const comRes=[];
  if(isChk('bh-crisis'))comRes.push('the 988 Suicide & Crisis Lifeline');
  if(isChk('bh-nami'))comRes.push('NAMI (National Alliance on Mental Illness)');
  if(isChk('bh-aa'))comRes.push('AA/NA support groups');
  if(comRes.length)n+=`CM provided member with community resources including ${list(comRes)}. `;

  n+=`Case manager to follow up with member and provide education and assistance as needed throughout ongoing plan of care.`;

  document.getElementById('bh-out-txt').textContent=n;
  const os=document.getElementById('bh-out-sec');
  os.style.display='block';
  os.scrollIntoView({behavior:'smooth',block:'start'});
}
