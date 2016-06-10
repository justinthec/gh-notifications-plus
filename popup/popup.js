var toastActive = false;
function triggerToast () {
  if (!toastActive) {
    toastActive = true;
    Materialize.toast('Refresh to see changes!', 4000, '', function() {
      toastActive = false
    });
  }
}

$(function() {
  chrome.storage.sync.get({
    mentionText: '',
    paToken: ''
  }, function(settings) {
    $('#mentionText').val(settings.mentionText);
    $('#paToken').val(settings.paToken);
  });

  $('input[name="mentionText"]').on('blur', function() {
    let mentionText = $('input[name="mentionText"').val();
    chrome.storage.sync.set({
      "mentionText": mentionText
    }, function() {
      triggerToast();
    });
  });

  $('input[name="paToken"]').on('blur', function() {
    let paToken = $('input[name="paToken"').val();
    chrome.storage.sync.set({
      "paToken": paToken 
    }, function() {
      triggerToast();
    });
  });

  $('a.js-author-link').on('click', function() {
    chrome.tabs.create({url: $(this).attr('href')});
    return false;
  });
});
