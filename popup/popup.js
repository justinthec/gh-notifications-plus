let toastActive = false;
function triggerToast () {
  if (!toastActive) {
    toastActive = true;
    Materialize.toast('Refresh to see changes!', 4000, '', function() {
      toastActive = false
    });
  }
}

$(() => {
  chrome.storage.sync.get({
    mentionText: '',
    paToken: ''
  }, (settings) => {
    $('#mentionText').val(settings.mentionText);
    $('#paToken').val(settings.paToken);
  });

  $('#saveButton').click(() => {
    const mentionText = $('#mentionText').val();
    const paToken = $('#paToken').val();

    chrome.storage.sync.set({
      'mentionText': mentionText,
      'paToken': paToken
    }, () => {
      triggerToast();
    });
  });

  $('a.js-author-link').click((event) => {
    chrome.tabs.create({url: $(event.target).attr('href')});
    return false;
  });
});
