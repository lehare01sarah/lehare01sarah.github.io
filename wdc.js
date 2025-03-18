(function () {
    var myConnector = tableau.makeConnector();

    // Define the schema for the data we want to return
    myConnector.getSchema = function (schemaCallback) {
        var cols = [
            { id: "key", dataType: tableau.dataTypeEnum.string },
            { id: "summary", dataType: tableau.dataTypeEnum.string },
            { id: "description", dataType: tableau.dataTypeEnum.string },
            { id: "status", dataType: tableau.dataTypeEnum.string },
            { id: "assignee", dataType: tableau.dataTypeEnum.string },
            { id: "priority", dataType: tableau.dataTypeEnum.string },
            { id: "created", dataType: tableau.dataTypeEnum.datetime }
        ];

        var tableSchema = {
            id: "jiraIssues",
            alias: "Jira Issues",
            columns: cols
        };

        schemaCallback([tableSchema]);
    };

    // Fetch the data from Jira API using user input
    myConnector.getData = function (table, doneCallback) {
        var jiraEndpoint = $("#jiraEndpoint").val();
        var username = $("#jiraUsername").val();
        var apiToken = $("#jiraApiToken").val();

        if (!jiraEndpoint || !username || !apiToken) {
            $("#status").html("<p style='color: red;'>Please fill in all fields.</p>");
            doneCallback();
            return;
        }

        // Construct the Jira API URL and Basic Auth header
        var jiraUrl = `${jiraEndpoint}/rest/api/2/search?jql=project=PROJ`;
        var auth = btoa(username + ":" + apiToken); // Basic Auth header

        $.ajax({
            url: jiraUrl,
            type: "GET",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + auth);
                xhr.setRequestHeader("Content-Type", "application/json");
            },
            success: function (response) {
                var issues = response.issues;
                var tableData = [];

                // Loop through Jira issues and populate the data array
                issues.forEach(function (issue) {
                    tableData.push({
                        "key": issue.key,
                        "summary": issue.fields.summary,
                        "description": issue.fields.description,
                        "status": issue.fields.status.name,
                        "assignee": issue.fields.assignee ? issue.fields.assignee.displayName : "Unassigned",
                        "priority": issue.fields.priority ? issue.fields.priority.name : "Medium",
                        "created": issue.fields.created
                    });
                });

                table.appendRows(tableData);
                doneCallback();
            },
            error: function (xhr, status,
