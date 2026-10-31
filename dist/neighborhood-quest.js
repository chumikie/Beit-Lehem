/* V2.11 — friendships grow over fictional days, not real people depicted. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.RoncadorNeighborhoodQuest = api;
})(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';
  const IDS = ['damiao','lucia','bia'];
  function progress(living) {return IDS.filter(id=>(Number(living?.people?.[id]?.bond)||0)>=2).length;}
  function unlocked(living) {return progress(living)===IDS.length;}
  function next(living, residents=[]) {
    const unfinished=IDS.filter(id=>(Number(living?.people?.[id]?.bond)||0)<2&&living?.people?.[id]?.lastConversationDay!==living?.day);
    if(!unfinished.length)return null;
    return unfinished.find(id=>residents.some(p=>p.id===id))||unfinished[0];
  }
  return{IDS,progress,unlocked,next};
});
