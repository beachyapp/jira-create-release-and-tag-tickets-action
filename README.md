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
  uses: beachyapp/jira-create-release-and-tag-tickets-action@v0.2
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

## Compiling and pushing changes

Checking in your node_modules directory can cause problems. As an alternative, you can use a tool called @vercel/ncc to compile your code and modules into one file used for distribution.

Install vercel/ncc by running this command in your terminal.

`npm i -g @vercel/ncc`

Compile your index.js file.

`ncc build index.js --license licenses.txt`

You'll see a new dist/index.js file with your code and the compiled modules. You will also see an accompanying dist/licenses.txt file containing all the licenses of the node_modules you are using.

Change the main keyword in your action.yml file to use the new dist/index.js file.

`main: 'dist/index.js'`

If you already checked in your node_modules directory, remove it.

`rm -rf node_modules/*`

From your terminal, commit the updates to your action.yml, dist/index.js, and node_modules files.

```shell
git add action.yml dist/index.js node_modules/*
git commit -m "Use vercel/ncc"
git tag -a -m "My first action release" v1.1
git push --follow-tags
```
