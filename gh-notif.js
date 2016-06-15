$(() => {
  chrome.storage.sync.get({
    mentionText: '',
    paToken: ''
  }, (settings) => {
    const { mentionText } = settings;
    const { paToken } = settings;

    if (mentionText.length === 0 || paToken.length === 0) {
      alert('Please set up both your Github Auth and @username in the settings.');
      return;
    }

    const octo = new Octokat({
      token: paToken
    });
    octo.zen.read((err, message) => {
      if (err) { throw new Error(err); }
      console.log(message);
    });

    fetchNotificationItems().forEach((item) => {
      if (item === null) { return; }

      let request = octo.repos(item.repoName)
      if (item.itemType === 'pull') {
        request = request.pulls(item.itemId);
      } else {
        request = request.issues(item.itemId);
      }

      checkIfItemHasMention(item, mentionText, request);
    });
  });
});

function fetchNotificationItems() {
  const pullRequests = $('li.pull-request-notification a').toArray();
  const issues = $('li.issue-notification a').toArray();
  return pullRequests.concat(issues).map((notifLinkTag) => {
    const hrefInfo = notifLinkTag.href.match(/https:\/\/github.com\/([^\/]+\/[^\/]+)\/(pull|issues)\/(\d+)/);
    if (hrefInfo === null) { return null; }
    return {
      repoName: hrefInfo[1],
      itemType: hrefInfo[2],
      itemId: hrefInfo[3],
      nodeRef: notifLinkTag
    };
  });
}

function checkIfItemHasMention(item, mentionText, request) {
  request.fetch((err, val) => {
    if (err) { return; }
    console.log('checking PR body');
    if (val.body && val.body.match(new RegExp(mentionText))) {
      item.nodeRef.parentElement.parentElement.classList.add("notification-item--mentioned");
    } else {
      request.comments.fetch((err, val) => {
        if (err) { return; }
        console.log('checking comment bodies');
        val.forEach((comment) => {
          if (comment.body && comment.body.match(new RegExp(mentionText))) {
            item.nodeRef.parentElement.parentElement.classList.add("notification-item--mentioned");
          }
        });
      });
    }
  });
}
