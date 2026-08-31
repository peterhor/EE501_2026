(function(){
  if(window.__ee501RevealAnswers) return;
  window.__ee501RevealAnswers = true;

  const styleId = 'ee501-reveal-answer-style';
  if(!document.getElementById(styleId)){
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent =
      '.rev{display:block;margin:9px 0 0;border:1px solid var(--acc);background:transparent;color:var(--acc);' +
      'border-radius:8px;padding:5px 12px;font-size:12.5px;font-weight:600;cursor:pointer;font-family:inherit}' +
      '.rev:hover{background:var(--acc);color:var(--surface-1)}' +
      '.ans{display:block;margin:9px 0 0}' +
      '.ans[hidden]{display:none !important}';
    document.head.appendChild(style);
  }

  let answerCounter = 0;

  function nextAnswerId(){
    answerCounter += 1;
    return 'ee501-answer-' + answerCounter;
  }

  function normalizeAnswer(answer){
    if(!answer.id) answer.id = nextAnswerId();
    answer.classList.add('ans');
    answer.hidden = true;
    const style = answer.getAttribute('style');
    if(style && /^\s*color\s*:\s*var\(--text-muted\)\s*;?\s*$/i.test(style)){
      answer.removeAttribute('style');
    }
    return answer;
  }

  function makeButton(answer){
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'rev';
    button.textContent = 'Reveal answer';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', answer.id);
    return button;
  }

  function upgradeInlineQuestionAnswers(){
    document.querySelectorAll('p.q, div.q').forEach(function(question){
      if(question.querySelector('button.rev')) return;
      const children = Array.from(question.children);
      let answer = null;
      for(let i = children.length - 1; i >= 0; i -= 1){
        const child = children[i];
        const style = child.getAttribute && child.getAttribute('style');
        if(child.tagName === 'SPAN' && style && /color\s*:\s*var\(--text-muted\)/i.test(style)){
          answer = child;
          break;
        }
      }
      if(!answer) return;
      normalizeAnswer(answer);
      question.appendChild(makeButton(answer));
      question.appendChild(answer);
    });
  }

  function upgradeAnswerDetails(){
    document.querySelectorAll('details').forEach(function(details){
      const summary = details.firstElementChild;
      if(!summary || summary.tagName !== 'SUMMARY') return;
      if(summary.textContent.trim().toLowerCase() !== 'answer') return;

      let answer;
      const extraElements = Array.from(details.children).filter(function(node){ return node !== summary; });
      const hasLooseText = Array.from(details.childNodes).some(function(node){
        return node !== summary && node.nodeType === Node.TEXT_NODE && node.textContent.trim();
      });

      if(!hasLooseText && extraElements.length === 1 && extraElements[0].classList.contains('ans')){
        answer = extraElements[0];
      } else {
        answer = document.createElement('div');
        while(summary.nextSibling) answer.appendChild(summary.nextSibling);
      }

      if(!answer.textContent.trim() && !answer.children.length) return;
      normalizeAnswer(answer);
      details.replaceWith(makeButton(answer), answer);
    });
  }

  document.addEventListener('click', function(event){
    const button = event.target.closest('button.rev');
    if(!button) return;
    const answer = document.getElementById(button.getAttribute('aria-controls')) || button.nextElementSibling;
    if(!answer) return;
    const willShow = answer.hidden;
    answer.hidden = !willShow;
    button.textContent = willShow ? 'Hide answer' : 'Reveal answer';
    button.setAttribute('aria-expanded', willShow ? 'true' : 'false');
  });

  upgradeInlineQuestionAnswers();
  upgradeAnswerDetails();
})();