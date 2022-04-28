const core = require('@actions/core');
var JiraApi = require('jira-client');

try {
  const newVersion = core.getInput('tag');
  const description = core.getInput('description');
  let issueKeys = core.getInput('issue-keys');
  const jiraBaseUrl = core.getInput('jira-base-url');
  const jiraUserEmail = core.getInput('jira-user-email');
  const jiraApiToken = core.getInput('jira-api-token');
  const jira = new JiraApi({
    protocol: 'https',
    host: jiraBaseUrl.replace(/(^\w+:|^)\/\//, ''),
    username: jiraUserEmail,
    password: jiraApiToken,
    apiVersion: '3',
    strictSSL: true
  });

  if(!issueKeys || issueKeys.length === 0 || JSON.parse(issueKeys).length == 0)
    throw 'No issueKeys found';
  
  issueKeys = JSON.parse(issueKeys);

  async function setVersion(projectId) {
    let versionId = 0;
    // get all versions - to check if the new version exists
    const versions = await jira.getVersions(projectId);
    await versions.map(v => { 
      if(v.name == newVersion)
        versionId = v.id;
    });
    // if the new version does not exist, create one
    if(versionId == 0){
      const body = {
        "name": newVersion, 
        "description": description, 
        "projectId": projectId
      };
      console.info(body)
      const newVersions = await jira.createVersion(body);
      versionId = newVersions.id;
    }
  }

  async function getIssues(issueKeys){
    issues = [];
    for (let i = 0; i < issueKeys.length; i++) {
      try {
        const issue = await jira.findIssue(issueKeys[i]);
        await issues.push(issue);
      } catch(e) {
        console.log(e.message);
      }
    }
    return issues;
  }

  async function updateIssuesWithFixVersion(issues){
    const updateField = {
      update: { fixVersions: [ {"add" : {"name" : newVersion}} ] 
    }};
    for (let i = 0; i < issues.length; i++) {
      await jira.updateIssue(issues[i].id, updateField);
    }
  }

  async function createReleaseNote(issues){
    let releaseNoteMap = {};
    let releaseNote = [];
    // group all tickets by ticket status
    for (let i = 0; i < issues.length; i++) {
      let list = releaseNoteMap[issues[i].fields.issuetype.name];
      if(!list) list = [];
      await list.push(`[${issues[i].key}] ${issues[i].fields.summary}`);
      releaseNoteMap[issues[i].fields.issuetype.name] = list;
    }
    // prettify
    releaseNote.push("");
    releaseNote.push(`# RELEASE NOTES / PROJECT [${issues[0].fields.project.name.toUpperCase()}] / VERSION [${newVersion.toUpperCase()}]`);
    for (var key in releaseNoteMap) {
      releaseNote.push("");
      releaseNote.push(`### ${key.toUpperCase()}`);
      releaseNote.push(releaseNoteMap[key].join("\n"));
    }
    releaseNote.push("");
    return releaseNote.join("\n");
  }

  if(!issueKeys || issueKeys.length == 0)
    throw 'No issueKeys found';

  // make sure keys are unique
  issueKeys = [...new Set(issueKeys)];

  getIssues(issueKeys).then(async issues => {
    await setVersion(issues[0].fields.project.id);
    await updateIssuesWithFixVersion(issues);
    await createReleaseNote(issues).then(releaseNotes => {
      releaseNotes = releaseNotes.replace(/"/g, '\\\"').replace(/'/g, "`");
      console.info(releaseNotes);
      core.setOutput("notes", releaseNotes);
    });
  });

} catch (error) {
  core.setFailed(error);
}
