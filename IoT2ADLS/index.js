var msRestAzure = require('ms-rest-azure');
var adlsManagement = require("azure-arm-datalake-store");

module.exports = function (context, eventHubMessages) {

    // to create the ADL Store Auth settings, look at: https://docs.microsoft.com/en-us/azure/data-lake-store/data-lake-store-authenticate-using-active-directory
    //var credentials = new msRestAzure.ApplicationTokenCredentials(   Applicaiton Id,                      Azure ADDirectory,            Application Key or Secret       );
    var credentials = new msRestAzure.ApplicationTokenCredentials('18422f77-57b2-42b3-99fc-5dac85da48df', 'kevinsay.scd365.net', '3rrHQzApplicationSecretKeyRemoved7xKDo=');

    // information here: https://github.com/Azure/azure-sdk-for-node/blob/master/lib/services/dataLake.Store/lib/filesystem/operations/fileSystem.js
    //var acccountClient = new adlsManagement.DataLakeStoreAccountClient(credentials,           Azure Subscription        );
    var acccountClient = new adlsManagement.DataLakeStoreAccountClient(credentials, "dc6f773e-4b13-4f8b-8d76-f34469246722");
    var filesystemClient = new adlsManagement.DataLakeStoreFileSystemClient(credentials);
    var accountName = 'buckmanpockevin';                                                // name of the ADL Store

    context.log(`JavaScript eventhub trigger function called for message array ${eventHubMessages}`);
    eventHubMessages.forEach(message => {

        // expect something like         {"deviceId": "mydevice", "data1": 12, .....}
        var filePath = '/' + message.deviceId + '/' + message.deviceId + '.txt';        // file we are writing to.  We could add a date field to the name for rolling file names
        var options = {
            appendMode: 'autocreate'
        }

        // if the file or folder does not exist, it will be created if permissions allow
        filesystemClient.fileSystem.concurrentAppend(accountName, filePath, new Buffer(JSON.stringify(message) + '\r'), options, function (err, result, request, response) {
            if (err) {
                context.error(err);
            }
        });
    });
    context.done();
};
