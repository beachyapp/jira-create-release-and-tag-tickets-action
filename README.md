# Create new version in JIRA and tag issues

This action creates a new version in JIRA, and tags all the issues in with the new version by issue keys

## Inputs

## `tag`

**Required** The new fix version you want to create in JIRA. It's usually reflective of the tag name in git.

## `description`

Description of the new fix version.

## `issue-keys`

An array of issue keys you want to tag with the new fix version.

## `jira-user-email`

**Required** JIRA user email

## `jira-api-token`

**Required** JIRA API token

## `jira-base-url`

**Required** JIRA base URL

## Output

## `notes`

Release notes grouped by issue status (similar to JIRA release notes)

## Example usage

```
- name: Find JIRA issue keys by commits
  id: issue-key-from-commits
  uses: beachyapp/jira-get-issue-key-action@v0.1
  ....
  ....
- name: Create JIRA fix version and tag issue tickets
  id: jira-version
  uses: beachyapp/jira-create-release-and-tag-tickets-action@v0.1
  with:
    tag: "v1.0.1"
    description: Created by ${{ github.actor }}
    issue-keys: ${{steps.issue-key-from-commits.outputs.keys}}
    jira-user-email: ${{ secrets.JIRA_USER_EMAIL }}
    jira-api-token: ${{ secrets.JIRA_API_TOKEN }}
    jira-base-url: ${{ secrets.JIRA_BASE_URL }}
- name: Print Release Notes`'
  run: echo ${{steps.jira-version.outputs.notes}}
```

## NOTE:

This assumes all tickets belong to the same project. For example, you can not have an array of issue tickets from multiple projects. Release versions in JIRA are created per project basis. 
