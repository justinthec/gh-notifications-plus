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
    const mentionPattern = new RegExp(mentionText, 'i');

    const octo = new Octokat({
      token: paToken
    });
    octo.zen.read((err, message) => {
      if (err) { throw new Error(err); }
      console.log(message);
    });

    fetchNotificationItems().forEach((item) => {
      if (item === null) { return; }
      const repo = octo.repos(item.repoName)
      checkIfItemHasMention(repo, item, mentionPattern);
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

function checkIfItemHasMention(repo, item, mentionPattern) {
  const issue = repo.issues(item.itemId); // Both PRs and Issues have issue comments.
  issue.fetch((err, result) => {
    if (err) { return; }
    if (result.body && result.body.match(mentionPattern)) {
      highlightItem(item);
    } else {
      issue.comments.fetch((err, result) => {
        if (err) { return; }
        for (comment of result) {
          if (comment.body && comment.body.match(mentionPattern)) {
            highlightItem(item);
            return;
          }
        }
        if (item.itemType === 'pull') {
          const diffComments = repo.pulls(item.itemId).comments;
          diffComments.fetch((err, result) => {
            if (err) { return; }
            for (comment of result) {
              if (comment.body && comment.body.match(mentionPattern)) {
                highlightItem(item);
                return;
              }
            }
          });
        }
      });
    }
  });
}

function highlightItem(item) {
  item.nodeRef.parentElement.parentElement.classList.add("notification-item--mentioned");
}
