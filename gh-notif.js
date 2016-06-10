// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
$(function() {
  chrome.storage.sync.get({
    mentionText: '',
    paToken: ''
  }, function(settings) {
    let mentionText = settings.mentionText;
    let paToken = settings.paToken;

    if (mentionText.length == 0 || paToken.length == 0) {
      alert('Please set up both your Github Auth and @username in the settings.');
      return;
    }

    let octo = new Octokat({
        token: paToken
    });
    octo.zen.read(function(err, message) {
      if (err) { throw new Error(err); }
      console.log(message);
    });

    fetchNotificationItems().forEach(function(item){
      let request = octo.repos(item.repoName)
      if (item.itemType == 'pull') {
        request = request.pulls(item.itemId);
      } else {
        request = request.issues(item.itemId);
      }
      request.fetch(function(err, val){
        if (val.body && val.body.match(new RegExp(mentionText))) {
          item.nodeRef.parentElement.parentElement.classList.add("notification-item--mentioned");
        }
      });
    });
  });
});

function fetchNotificationItems() {
  let pullRequests = $('li.pull-request-notification a').toArray();
  let issues = $('li.issue-notification a').toArray();
  return pullRequests.concat(issues).map(function(notifLinkTag) {
    let hrefInfo = notifLinkTag.href.match(/https:\/\/github.com\/(\w+\/\w+)\/(pull|issues)\/(\d+)/);
    return {
      repoName: hrefInfo[1],
      itemType: hrefInfo[2],
      itemId: hrefInfo[3],
      nodeRef: notifLinkTag
    };
  });
}