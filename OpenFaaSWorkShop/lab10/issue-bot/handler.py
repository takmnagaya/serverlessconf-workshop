import requests, json, os, sys
from github import Github


def handle(req):
    event_header = os.getenv("Http_X_Github_Event")

    if not event_header == "issues":
        sys.exit("Unable to handle X-GitHub-Event: " + event_header)
        return

    gateway_hostname = os.getenv("gateway_hostname", "gateway")

    payload = json.loads(req)

    if not payload["action"] == "opened":
        sys.exit("Action not supported: " + payload["action"])
        return

    # sentimentanalysis functionの呼び出し
    res = requests.post('http://' + gateway_hostname + ':8080/function/sentimentanalysis',
                        data=payload["issue"]["title"] + " " + payload["issue"]["body"])

    if res.status_code != 200:
        sys.exit("Error with sentimentanalysis, expected: %d, got: %d\n" % (200, res.status_code))

    # 環境変数から positive_threshold を読み込む
    positive_threshold = float(os.getenv("positive_threshold", "0.2"))

    polarity = res.json()['polarity']

    # ラベルを適用するためにGitHubのAPIを使う
    apply_label(polarity,
                payload["issue"]["number"],
                payload["repository"]["full_name"],
                positive_threshold)

    print("Repo: %s, issue: %s, polarity: %f" % (
    payload["repository"]["full_name"], payload["issue"]["number"], polarity))


def apply_label(polarity, issue_number, repo, positive_threshold):
    with open("/var/openfaas/secrets/auth-token","r") as authToken:
        g = Github(authToken.read())
    repo = g.get_repo(repo)
    issue = repo.get_issue(issue_number)

    has_label_positive = False
    has_label_review = False
    for label in issue.labels:
        if label == "positive":
            has_label_positive = True
        if label == "review":
            has_label_review = True

    if polarity > positive_threshold and not has_label_positive:
        issue.set_labels("positive")
    elif not has_label_review:
        issue.set_labels("review")
